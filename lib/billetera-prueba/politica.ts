import { decodeFunctionData, encodeFunctionData, getAddress, parseAbi, type Hex } from "viem";
import { ABI_EAS, ABI_REGISTRO } from "./eas";
import type { Red } from "./red";

/**
 * Política de gas (design §4): el servidor solo patrocina llamadas con valor 0 a `EAS.attest` o `SchemaRegistry.register` de la
 * red configurada, como mucho dos, solas (`executeUserOp`) o en un lote de `MultiSendCallOnly` (un `delegatecall` solo a esa
 * dirección y con todas las llamadas internas normales). Todo lo demás se rechaza.
 *
 * Una excepción acotada, que la spec no preveía: en la primera operación, `abstractionkit` antepone por su cuenta dos llamadas
 * (desplegar el verificador WebAuthn de la passkey y cambiar el dueño de la Safe del firmante compartido a ese verificador). Se
 * aceptan solo si coinciden byte a byte con las que arma el servidor (`extras`) y van al principio; no cuentan para el tope de dos.
 */

const ABI_EJECUTAR = parseAbi([
  "function executeUserOp(address to, uint256 value, bytes data, uint8 operation)",
  "function executeUserOpWithErrorString(address to, uint256 value, bytes data, uint8 operation)",
]);
const ABI_MULTISEND = parseAbi(["function multiSend(bytes transactions)"]);

export type Llamada = { to: Hex; value: bigint; data: Hex; operacion: number };
export type Extra = { to: string; data: string };
export type ContextoPolitica = {
  /** La Safe que opera: si está, `attest` solo puede tener como destinataria a esa Safe. */
  safe?: string;
  /** Llamadas que `abstractionkit` antepone en la primera operación (se comparan exactas). */
  extras?: Extra[];
};
export type ResultadoPolitica = { ok: true; llamadas: Llamada[] } | { ok: false; motivo: string };

const igual = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const rechazo = (motivo: string): ResultadoPolitica => ({ ok: false, motivo });

/** Desarma el `data` de `multiSend`: [operación (1) | destino (20) | valor (32) | largo (32) | datos]. */
function desarmarMultiSend(paquete: Hex): Llamada[] | null {
  const hex = paquete.slice(2);
  const llamadas: Llamada[] = [];
  let pos = 0;
  while (pos < hex.length) {
    if (hex.length - pos < (1 + 20 + 32 + 32) * 2) return null;
    const operacion = parseInt(hex.slice(pos, pos + 2), 16);
    const to = getAddress(`0x${hex.slice(pos + 2, pos + 42)}`) as Hex;
    const value = BigInt(`0x${hex.slice(pos + 42, pos + 106)}`);
    const largo = Number(BigInt(`0x${hex.slice(pos + 106, pos + 170)}`));
    const inicio = pos + 170;
    if (!Number.isSafeInteger(largo) || inicio + largo * 2 > hex.length) return null;
    llamadas.push({ to, value, data: `0x${hex.slice(inicio, inicio + largo * 2)}` as Hex, operacion });
    pos = inicio + largo * 2;
  }
  return llamadas;
}

/** ¿Es esta una de las dos llamadas permitidas? Devuelve el motivo del rechazo, o null si pasa. */
function llamadaPermitida(l: Llamada, red: Red, safe?: string): string | null {
  if (l.operacion !== 0) return "Una llamada interna no es una llamada normal.";
  if (l.value !== 0n) return "Una llamada lleva valor.";
  try {
    if (igual(l.to, red.eas)) {
      const d = decodeFunctionData({ abi: ABI_EAS, data: l.data });
      if (d.functionName !== "attest") return "EAS: solo se permite attest.";
      if (encodeFunctionData({ abi: ABI_EAS, functionName: "attest", args: d.args }).toLowerCase() !== l.data.toLowerCase()) {
        return "attest con datos de más.";
      }
      const pedido = d.args[0];
      if (pedido.data.value !== 0n) return "attest con valor.";
      if (safe && !igual(pedido.data.recipient, safe)) return "attest a otra destinataria que la propia Safe.";
      return null;
    }
    if (igual(l.to, red.registro)) {
      const d = decodeFunctionData({ abi: ABI_REGISTRO, data: l.data });
      if (d.functionName !== "register") return "SchemaRegistry: solo se permite register.";
      if (encodeFunctionData({ abi: ABI_REGISTRO, functionName: "register", args: d.args }).toLowerCase() !== l.data.toLowerCase()) {
        return "register con datos de más.";
      }
      return null;
    }
  } catch {
    return "Datos de llamada ilegibles.";
  }
  return "Destino no permitido.";
}

export function validarPolitica(callData: string, red: Red, contexto: ContextoPolitica = {}): ResultadoPolitica {
  if (!/^0x[0-9a-fA-F]*$/.test(callData)) return rechazo("callData ilegible.");
  let externa: Llamada;
  try {
    const d = decodeFunctionData({ abi: ABI_EJECUTAR, data: callData as Hex });
    const [to, value, data, operacion] = d.args;
    externa = { to: to as Hex, value, data: data as Hex, operacion };
    // Nada de bytes sobrantes después de la llamada decodificada.
    if (
      encodeFunctionData({ abi: ABI_EJECUTAR, functionName: d.functionName, args: d.args }).toLowerCase() !== callData.toLowerCase()
    ) {
      return rechazo("callData con datos de más.");
    }
  } catch {
    return rechazo("callData ilegible.");
  }
  if (externa.value !== 0n) return rechazo("La operación lleva valor.");

  let llamadas: Llamada[];
  if (externa.operacion === 1) {
    if (!igual(externa.to, red.multiSend)) return rechazo("delegatecall a un contrato que no es el MultiSend permitido.");
    let lote: Hex;
    try {
      lote = decodeFunctionData({ abi: ABI_MULTISEND, data: externa.data }).args[0] as Hex;
    } catch {
      return rechazo("Lote ilegible.");
    }
    const desarmado = desarmarMultiSend(lote);
    if (!desarmado || desarmado.length === 0) return rechazo("Lote ilegible.");
    llamadas = desarmado;
  } else if (externa.operacion === 0) {
    llamadas = [externa];
  } else {
    return rechazo("Tipo de operación no permitido.");
  }

  // Las llamadas que antepone `abstractionkit` en la primera operación: exactas y al principio.
  const extras = contexto.extras ?? [];
  if (extras.length > 0 && llamadas.length >= extras.length) {
    const coincide = extras.every((e, i) => {
      const l = llamadas[i]!;
      return l.operacion === 0 && l.value === 0n && igual(l.to, e.to) && igual(l.data, e.data);
    });
    if (coincide) llamadas = llamadas.slice(extras.length);
  }

  if (llamadas.length === 0) return rechazo("No hay llamadas.");
  if (llamadas.length > 2) return rechazo("Más de dos llamadas.");
  for (const l of llamadas) {
    const motivo = llamadaPermitida(l, red, contexto.safe);
    if (motivo) return rechazo(motivo);
  }
  return { ok: true, llamadas };
}
