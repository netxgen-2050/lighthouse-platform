import { SafeAccountV0_3_0 } from "abstractionkit";
import { keccak256, stringToHex, type Hex } from "viem";
import { direccionDeSafe } from "@/lib/billetera-prueba/cuenta";
import {
  constanciaFuera,
  hashDeLaConstanciaFuera,
  hashDeSafeMessage,
  llamadaAttest,
  llamadaRegister,
  uidDeLaConstanciaFuera,
} from "@/lib/billetera-prueba/eas";
import { operacionAJson, operacionDeJson, type OperacionJson } from "@/lib/billetera-prueba/operacion";
import { camposDeClientData, desdeBase64Url, firmaDerARS, type LlavePublica } from "@/lib/billetera-prueba/passkey";
import { extrasPrimeraOperacion } from "@/lib/billetera-prueba/cuenta";
import { validarOperacion } from "@/lib/billetera-prueba/validar-operacion";
import { BASE_SEPOLIA, type Red } from "@/lib/billetera-prueba/red";
import type { PuertoCandide } from "./puerto";
import {
  ErrorDeCandide,
  type EstadoOperacion,
  type FirmaFueraPreparada,
  type FirmaWebAuthn,
  type OperacionPreparada,
  type Veredicto1271,
} from "./tipos";

const VERSION_EAS_DE_EJEMPLO = "1.4.1-beta.3";

/**
 * Adaptador sin red. La dirección se calcula igual que en el real (es sin red); el despliegue, el registro del schema y el
 * estado de las operaciones viven en la memoria del proceso. Los hashes son de ejemplo, con forma válida. `consultarOperacion`
 * devuelve "enviada" la primera vez e "incluida" la segunda. Usa la misma política que el real.
 */
export function crearMock(red: Red = BASE_SEPOLIA): PuertoCandide {
  const desplegadas = new Set<string>();
  let schema = false;
  const operaciones = new Map<string, { consultas: number; safe: string }>();

  const clave = (d: string) => d.toLowerCase();

  return {
    estado: () => "listo",
    calcularDireccion: (l) => direccionDeSafe(l),
    estaDesplegada: async (d) => desplegadas.has(clave(d)),
    schemaRegistrado: async () => schema,

    async prepararPrimeraOperacion(l: LlavePublica): Promise<OperacionPreparada> {
      const safe = direccionDeSafe(l);
      const desplegada = desplegadas.has(clave(safe));
      const creadaEn = BigInt(Math.floor(Date.now() / 1000));
      const nuestras = [
        ...(schema ? [] : [{ to: red.registro, value: 0n, data: llamadaRegister() }]),
        { to: red.eas, value: 0n, data: llamadaAttest(safe, creadaEn) },
      ];
      const extras = desplegada ? [] : extrasPrimeraOperacion(l).map((e) => ({ to: e.to, value: 0n, data: e.data }));
      const todas = [...extras, ...nuestras];
      const callData =
        todas.length === 1
          ? SafeAccountV0_3_0.createAccountCallDataSingleTransaction(todas[0]!)
          : SafeAccountV0_3_0.createAccountCallDataBatchTransactions(todas);
      const nonce = desplegada ? 1n : 0n;
      const operacion = operacionAJson({
        sender: safe,
        nonce,
        callData,
        callGasLimit: 200_000n,
        verificationGasLimit: 500_000n,
        preVerificationGas: 60_000n,
        maxFeePerGas: 1_000_000n,
        maxPriorityFeePerGas: 1_000n,
        signature: "0x",
        factory: desplegada ? null : "0x4e1dcf7ad4e460cfd30791ccc4f9c8a4f820ec67",
        factoryData: desplegada ? null : "0x",
        paymaster: "0x0000000000000000000000000000000000000001",
        paymasterVerificationGasLimit: 100_000n,
        paymasterPostOpGasLimit: 50_000n,
        paymasterData: "0x",
      });
      const v = validarOperacion(l, { sender: safe, callData, nonce }, red);
      if (!v.ok) throw new ErrorDeCandide("La operación no cumple la política de gas", "politica");
      return { operacion, hashAFirmar: keccak256(stringToHex(callData + nonce.toString())) };
    },

    async enviarOperacion(l: LlavePublica, json: OperacionJson, firma: FirmaWebAuthn) {
      const op = operacionDeJson(json);
      if (!op) throw new ErrorDeCandide("Operación ilegible.", "entrada");
      const v = validarOperacion(l, op, red);
      if (!v.ok) {
        throw new ErrorDeCandide(v.tipo === "sender" ? v.motivo : "La operación no cumple la política de gas", v.tipo === "sender" ? "entrada" : "politica");
      }
      try {
        firmaDerARS(desdeBase64Url(firma.signature));
      } catch {
        throw new ErrorDeCandide("La firma no tiene forma válida.", "entrada");
      }
      const hash = keccak256(stringToHex(`${op.callData}:${op.nonce}:${Date.now()}`));
      operaciones.set(hash, { consultas: 0, safe: op.sender });
      return { hashOperacion: hash };
    },

    async consultarOperacion(hash: Hex): Promise<EstadoOperacion> {
      const o = operaciones.get(hash);
      if (!o) return { estado: "fallo", motivo: "Operación desconocida para el modo simulado." };
      o.consultas += 1;
      if (o.consultas < 2) return { estado: "enviada" };
      desplegadas.add(clave(o.safe));
      schema = true;
      return {
        estado: "incluida",
        hashTransaccion: keccak256(stringToHex(`tx:${hash}`)),
        uidConstancia: keccak256(stringToHex(`uid:${hash}`)),
      };
    },

    async prepararFirmaFuera(l: LlavePublica): Promise<FirmaFueraPreparada> {
      const safe = direccionDeSafe(l);
      if (!desplegadas.has(clave(safe))) throw new ErrorDeCandide("Primero hacé la primera operación", "estado");
      const tiempo = BigInt(Math.floor(Date.now() / 1000));
      const c = constanciaFuera(safe, tiempo);
      const hashConstancia = hashDeLaConstanciaFuera(red, VERSION_EAS_DE_EJEMPLO, c);
      return {
        hashAFirmar: hashDeSafeMessage(red, safe, hashConstancia),
        hashConstancia,
        uidConstancia: uidDeLaConstanciaFuera(c),
        tiempo: tiempo.toString(),
        versionEas: VERSION_EAS_DE_EJEMPLO,
      };
    },

    async verificarFirma1271(l: LlavePublica, _tiempo: bigint, firma: FirmaWebAuthn): Promise<Veredicto1271> {
      if (!desplegadas.has(clave(direccionDeSafe(l)))) throw new ErrorDeCandide("Primero hacé la primera operación", "estado");
      try {
        firmaDerARS(desdeBase64Url(firma.signature));
        camposDeClientData(new TextDecoder().decode(desdeBase64Url(firma.clientDataJSON)));
      } catch {
        return { resultado: "no-valida", valorDevuelto: "0xffffffff", detalle: "Simulado: la firma no tiene forma válida." };
      }
      return { resultado: "valida", valorDevuelto: "0x1626ba7e", detalle: "Simulado: la firma tiene forma correcta (no se habló con la Safe real)." };
    },
  };
}
