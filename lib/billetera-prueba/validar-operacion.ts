import { direccionDeSafe, extrasPrimeraOperacion } from "./cuenta";
import type { OperacionV7 } from "./operacion";
import type { LlavePublica } from "./passkey";
import { validarPolitica } from "./politica";
import type { Red } from "./red";

export type ResultadoValidacion = { ok: true } | { ok: false; tipo: "sender" | "politica"; motivo: string };

/**
 * Lo que el servidor exige a una operación antes de pedir patrocinio y otra vez antes de enviarla: que sea de la Safe de esta
 * passkey y que cumpla la política de gas. Las llamadas extras de la primera operación solo se aceptan con nonce 0.
 */
export function validarOperacion(llave: LlavePublica, operacion: Pick<OperacionV7, "sender" | "callData" | "nonce">, red: Red): ResultadoValidacion {
  const safe = direccionDeSafe(llave);
  if (operacion.sender.toLowerCase() !== safe.toLowerCase()) {
    return { ok: false, tipo: "sender", motivo: "La operación no es de la Safe de esta passkey." };
  }
  const r = validarPolitica(operacion.callData, red, {
    safe,
    extras: operacion.nonce === 0n ? extrasPrimeraOperacion(llave) : [],
  });
  return r.ok ? { ok: true } : { ok: false, tipo: "politica", motivo: r.motivo };
}
