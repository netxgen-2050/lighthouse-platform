import { HOUR_REF_USD } from "./datos";

/** Evaluación entre pares por defecto (la ronda de reconocimiento todavía no existe). */
export const EVALUACION_POR_DEFECTO = 1.0;

/** Semillas por mes = horas × valor de referencia de la hora (USD) × evaluación entre pares. No hay cobro. */
export function semillasPorMes(horas: number, evaluacion = EVALUACION_POR_DEFECTO): number {
  return Math.round(horas * HOUR_REF_USD * evaluacion);
}

/** Un aporte en plata se registra como Semillas: 1 USD = 1 Semilla de referencia. */
export function semillasDePlata(montoUsd: number): number {
  return Math.round(montoUsd);
}
