import { modoSimulado } from "@/lib/billetera-prueba/habilitada";
import { crearCandide } from "./candide";
import { crearMock } from "./mock";
import type { PuertoCandide } from "./puerto";

export type { PuertoCandide } from "./puerto";
export * from "./tipos";

let mock: PuertoCandide | null = null;
let real: PuertoCandide | null = null;
let avisado = false;

/**
 * Elige el adaptador: con `LH_PRUEBA_CANDIDE_SIMULADO=1`, el mock; si no, el real. Si al real le falta una URL, responde "sin
 * configurar" (no pasa solo al mock). El mock se guarda en el proceso: su estado (Safe desplegada, operaciones) vive en memoria.
 */
export function puertoCandide(env: Record<string, string | undefined> = process.env): PuertoCandide {
  if (modoSimulado(env)) {
    if (!avisado) {
      avisado = true;
      console.info("Candide: modo simulado");
    }
    return (mock ??= crearMock());
  }
  // El real lee el entorno en cada pedido de creación: es barato y evita fijar claves viejas si cambian las variables.
  real = crearCandide(env);
  return real;
}

/** Solo para los tests: olvida el estado del mock. */
export function reiniciarMock() {
  mock = null;
  avisado = false;
}
