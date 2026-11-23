// Recorridos de inversores de la pestaña "Modelo de financiamiento". Funciones puras, sin React ni Next.
// Los valores de referencia de los tests vienen de NS_Tokenomics/RESULTS_series_waterfall.md ("Journey"), v0.1, 2026-10-17.

import { ESCENARIOS, estadoDePartida, parametrosDesde } from "@/lib/series/escenarios";
import { correrSerie, porMil, tir } from "@/lib/series/modelo";

function finito(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Valor a `anios` años de un `monto` con un retorno neto anual reinvertido. `null` si algo falta o el retorno es ≤ −100 %. */
export function valorFuturo(
  monto: number | null | undefined,
  retorno: number | null | undefined,
  anios: number | null | undefined,
): number | null {
  if (!finito(monto) || !finito(retorno) || !finito(anios)) return null;
  if (retorno <= -1) return null;
  const v = monto * Math.pow(1 + retorno, anios);
  return Number.isFinite(v) ? v : null;
}

/** Retorno neto anual de la Serie Madre (mezcla de las series): parámetro, no un resultado del modelo. */
export const RETORNO_SERIE_MADRE = {
  valores: [0.03, 0.06, 0.09],
  fuente: "doc 28 §7 (parámetro, mezcla de las series)",
  aConfirmar: "Vagner",
} as const;

/**
 * Camino del vino: quien pone USD 1.000 en el viñedo y toma en vino lo que cobra del año 1 al anteúltimo.
 * `flujosPorMil[0]` es el año 0 (negativo); el último índice es el año H. Botellas = suma de los años 1 a H−1 / precio;
 * plata del último año = flujo del año H. `null` si el precio no es positivo o finito, o los flujos no alcanzan.
 */
export function caminoDelVino(
  flujosPorMil: readonly number[] | null | undefined,
  precioBotella: number | null | undefined,
): { botellas: number; plataUltimoAnio: number; anioUltimo: number } | null {
  if (!finito(precioBotella) || precioBotella <= 0) return null;
  if (!flujosPorMil || flujosPorMil.length < 3 || flujosPorMil.some((f) => !finito(f))) return null;
  const H = flujosPorMil.length - 1;
  const enVino = flujosPorMil.slice(1, H).reduce((a, b) => a + b, 0);
  return { botellas: enVino / precioBotella, plataUltimoAnio: flujosPorMil[H], anioUltimo: H };
}

export type RecorridoVino = {
  /** Flujos del año 0 al último, por cada USD 1.000 puestos (año 0 negativo). */
  flujos: readonly number[];
  total: number | null;
  tir: number | null;
  anios: number;
  precioBotella: number;
  camino: ReturnType<typeof caminoDelVino>;
};

/** USD 1.000 en las Unidades del viñedo con los valores de partida. `null` si la serie no devolvió Unidades. */
export function recorridoVino(): RecorridoVino | null {
  const { decididos, medidos, supuestos } = parametrosDesde("vinedo", estadoDePartida("vinedo"));
  const r = correrSerie("vinedo", decididos, medidos, supuestos);
  const pone = -r.flujosUnidades[0];
  if (!(pone > 0)) return null;
  const flujos = r.flujosUnidades.map((v) => (v * 1000) / pone);
  const { total } = porMil(r.flujosUnidades);
  const precioBotella = ESCENARIOS.vinedo.medidos.precioVinoUsd.partida;
  return { flujos, total, tir: tir(flujos), anios: ESCENARIOS.vinedo.horizonte, precioBotella, camino: caminoDelVino(flujos, precioBotella) };
}
