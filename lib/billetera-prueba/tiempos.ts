/** Lo que no se midió se muestra así, nunca como 0. */
export const SIN_DATO = "sin dato";

/** Milisegundos → segundos con un decimal ("1,3 s"). Un tiempo ausente, negativo o no numérico es "sin dato". */
export function formatearSegundos(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0) return SIN_DATO;
  return `${(Math.round(ms / 100) / 10).toFixed(1).replace(".", ",")} s`;
}

export type Tiempos = { passkey?: number; preparar?: number; firmar?: number; inclusion?: number };

/** Suma de lo medido; si no se midió nada, "sin dato". */
export function totalDe(t: Tiempos): number | null {
  const medidos = [t.passkey, t.preparar, t.firmar, t.inclusion].filter((v): v is number => typeof v === "number" && v >= 0);
  return medidos.length === 0 ? null : medidos.reduce((a, b) => a + b, 0);
}
