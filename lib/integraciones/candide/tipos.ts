import type { Hex } from "viem";
import type { OperacionJson } from "@/lib/billetera-prueba/operacion";

/** Vocabulario de NetX, no el de Candide ni el de `abstractionkit`. */

/** Lo que devuelve el navegador al firmar con la passkey (`navigator.credentials.get`), cada campo en base64url. */
export type FirmaWebAuthn = { authenticatorData: string; clientDataJSON: string; signature: string };

export type Cuenta = { direccion: Hex; desplegada: boolean };

export type OperacionPreparada = { operacion: OperacionJson; hashAFirmar: Hex };

export type EstadoOperacion =
  | { estado: "enviada" }
  | { estado: "incluida"; hashTransaccion: Hex; uidConstancia?: Hex }
  | { estado: "fallo"; motivo: string; hashTransaccion?: Hex };

/** La constancia fuera de la cadena armada por el servidor: la passkey firma `hashAFirmar` (el hash de SafeMessage). */
export type FirmaFueraPreparada = {
  hashAFirmar: Hex;
  hashConstancia: Hex;
  uidConstancia: Hex;
  /** Hora de la constancia, en segundos, como texto decimal: el navegador la devuelve para verificar la misma. */
  tiempo: string;
  versionEas: string;
};

/**
 * Resultado de preguntarle a la Safe `isValidSignature` (EIP-1271):
 * - `valida`: devolvió `0x1626ba7e`.
 * - `no-valida`: respondió otro valor (`valorDevuelto`).
 * - `sin-eip1271`: la Safe no tiene la función (revert): su fallback handler no implementa EIP-1271.
 * - `sin-respuesta`: el nodo devolvió vacío (`0x`): no es un veredicto.
 */
export type Veredicto1271 = {
  resultado: "valida" | "no-valida" | "sin-eip1271" | "sin-respuesta";
  valorDevuelto?: string;
  fallbackHandler?: Hex;
  detalle: string;
};

/** Error con un motivo que ya se puede mostrar (sin URL ni clave). `politica` = no se mandó nada a Candide. */
export class ErrorDeCandide extends Error {
  constructor(
    mensaje: string,
    readonly tipo: "politica" | "candide" | "sin-configurar" | "entrada" | "estado" = "candide",
  ) {
    super(mensaje);
  }
}
