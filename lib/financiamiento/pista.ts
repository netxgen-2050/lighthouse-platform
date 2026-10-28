// La cuenta de la pista de NetX (doc 30): capital bajo gestión necesario y comisión de desarrollo. Funciones puras.

import { COMISION_DESARROLLO } from "./fuentes";

function finito(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Capital bajo gestión que paga el consumo solo con comisión de gestión: consumo mensual × 12 / tasa. */
export function capitalNecesario(consumoMensual: number | null, tasa: number | null): number | null {
  if (!finito(consumoMensual) || !finito(tasa) || tasa <= 0) return null;
  return (consumoMensual * 12) / tasa;
}

/** Comisión de desarrollo (3 a 5 % del capex, una vez). `null` si el capex no es un número positivo. */
export function comisionDesarrollo(capex: number | null): { min: number; max: number } | null {
  if (!finito(capex) || capex <= 0) return null;
  return { min: capex * COMISION_DESARROLLO.min, max: capex * COMISION_DESARROLLO.max };
}

/** "USD 24,8 M" (un decimal, es-AR). `null`, NaN o infinito → "sin dato". */
export function usdMillones(n: number | null | undefined): string {
  if (!finito(n)) return "sin dato";
  return `USD ${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
}
