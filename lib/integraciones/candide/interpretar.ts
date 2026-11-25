import { decodeEventLog, type Hex } from "viem";
import { ABI_EAS } from "@/lib/billetera-prueba/eas";
import type { Red } from "@/lib/billetera-prueba/red";
import type { EstadoOperacion, Veredicto1271 } from "./tipos";

/** Valor mágico de EIP-1271 (`bytes4(keccak256("isValidSignature(bytes32,bytes)"))`). Es un `bytes4`, nunca un booleano. */
export const VALOR_MAGICO_1271 = "0x1626ba7e";

const esHex = (v: unknown): v is string => typeof v === "string" && /^0x[0-9a-fA-F]*$/.test(v);

/**
 * Traduce el recibo del bundler (`eth_getUserOperationReceipt`) a nuestro estado, validando su forma. Lo que no coincide se
 * descarta: "fallo" con "respuesta inesperada de la red" (nunca "incluida" por las dudas).
 * - `null` (todavía no entró): "enviada".
 * - `success: false`: "fallo", entró en un bloque pero se revirtió.
 * - sin evento `Attested` de EAS: "incluida" sin `uidConstancia` (la página dice "sin dato"; no se inventa).
 */
export function interpretarRecibo(recibo: unknown, red: Red): EstadoOperacion {
  if (recibo === null || recibo === undefined) return { estado: "enviada" };
  const inesperada: EstadoOperacion = { estado: "fallo", motivo: "respuesta inesperada de la red" };
  if (typeof recibo !== "object") return inesperada;
  const r = recibo as Record<string, unknown>;
  if (typeof r.success !== "boolean") return inesperada;
  const interno = r.receipt;
  if (typeof interno !== "object" || interno === null) return inesperada;
  const hashTransaccion = (interno as Record<string, unknown>).transactionHash;
  if (!esHex(hashTransaccion) || hashTransaccion.length !== 66) return inesperada;
  if (!r.success) {
    return { estado: "fallo", motivo: "entró en un bloque pero se revirtió", hashTransaccion: hashTransaccion as Hex };
  }
  const logs = Array.isArray(r.logs) ? r.logs : Array.isArray((interno as Record<string, unknown>).logs) ? ((interno as Record<string, unknown>).logs as unknown[]) : [];
  let uidConstancia: Hex | undefined;
  for (const l of logs) {
    if (typeof l !== "object" || l === null) continue;
    const { address, topics, data } = l as Record<string, unknown>;
    if (typeof address !== "string" || address.toLowerCase() !== red.eas.toLowerCase()) continue;
    if (!Array.isArray(topics) || !topics.every(esHex) || !esHex(data)) continue;
    try {
      const e = decodeEventLog({ abi: ABI_EAS, data: data as Hex, topics: topics as [Hex, ...Hex[]] });
      if (e.eventName === "Attested") {
        uidConstancia = e.args.uid;
        break;
      }
    } catch {
      /* no es el evento que buscamos */
    }
  }
  return uidConstancia
    ? { estado: "incluida", hashTransaccion: hashTransaccion as Hex, uidConstancia }
    : { estado: "incluida", hashTransaccion: hashTransaccion as Hex };
}

/**
 * Traduce el resultado de `eth_call isValidSignature` (design §6). El resultado se compara con `0x1626ba7e` como `bytes4`.
 * Un `0x` vacío no es un veredicto. Un revert se distingue: con un código `GS…` de Safe es una firma rechazada; sin él, la Safe no
 * tiene la función (su fallback handler no implementa EIP-1271).
 */
export function interpretarEip1271(
  resultado: { devuelto: string } | { revert: string },
  fallbackHandler?: Hex,
): Veredicto1271 {
  if ("revert" in resultado) {
    if (/GS0\d\d/.test(resultado.revert)) {
      return { resultado: "no-valida", valorDevuelto: "revert", fallbackHandler, detalle: `La Safe rechazó la firma: ${resultado.revert}` };
    }
    return {
      resultado: "sin-eip1271",
      fallbackHandler,
      detalle: `la Safe no responde EIP-1271 (fallback handler ${fallbackHandler ?? "sin dato"})`,
    };
  }
  const v = resultado.devuelto.toLowerCase();
  if (v === "0x" || v === "") {
    return { resultado: "sin-respuesta", fallbackHandler, detalle: "sin respuesta del nodo (eth_call vacío)" };
  }
  if (v.slice(0, 10) === VALOR_MAGICO_1271) {
    return { resultado: "valida", valorDevuelto: v.slice(0, 10), fallbackHandler, detalle: "La Safe devolvió el valor mágico de EIP-1271." };
  }
  return { resultado: "no-valida", valorDevuelto: v.slice(0, 10), fallbackHandler, detalle: `La Safe devolvió ${v.slice(0, 10)} en vez de ${VALOR_MAGICO_1271}.` };
}
