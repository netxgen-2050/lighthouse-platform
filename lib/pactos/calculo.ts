import { HOUR_REF_USD } from "./datos";

/** Evaluación entre pares por defecto (la ronda de reconocimiento todavía no existe). */
export const EVALUACION_POR_DEFECTO = 1.0;

/** Semillas por mes = horas × valor hora (USD) × parte en semilla × evaluación entre pares. */
export function semillasPorMes(horas: number, parteSemilla: number, evaluacion = EVALUACION_POR_DEFECTO): number {
  return Math.round(horas * HOUR_REF_USD * (parteSemilla / 100) * evaluacion);
}

/** Lo que se cobra en caja por mes (USD): la parte que no se aporta como semilla. */
export function cajaPorMes(horas: number, parteSemilla: number): number {
  return horas * HOUR_REF_USD * (1 - parteSemilla / 100);
}
