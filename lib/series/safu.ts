// Conversión del SAFU. AGREGADO DE LA PLATAFORMA: no está en `series_waterfall_sim.py` (ADR-010, regla 5).
// El SAFU convierte en Unidades de la Serie Madre, que el modelo no tiene; esto es solo la aritmética del descuento.

/**
 * Unidades que recibe un monto de SAFU con un descuento: monto / (1 − descuento).
 * USD 1.000 con 20 % → USD 1.250. `null` si el descuento no está en [0, 1) o el monto no es un número finito.
 */
export function convertirSafu(monto: number, descuento: number): number | null {
  if (!Number.isFinite(monto) || !Number.isFinite(descuento)) return null;
  if (descuento < 0 || descuento >= 1) return null;
  return monto / (1 - descuento);
}
