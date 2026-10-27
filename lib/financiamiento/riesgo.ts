// Monte Carlo copiado como tabla (ADR-014): NS_Tokenomics/sim/series_montecarlo_sim.py, v0.1, 2026-10-17, N = 2.000, semilla 7.
// No se reproduce en el navegador: el generador de Python no es reproducible bit a bit. Si se re-corre, otro cambio actualiza esto.

export type SerieRiesgo = "vinedo" | "agrovoltaica";

export type Percentiles = { p10: number; p50: number; p90: number };

export type FilaMonteCarlo = {
  /** TIR de las Unidades (fracción). */
  tirUnidades: Percentiles;
  /** Lo que recibe la Fundación (USD). */
  fundacionRecibe: Percentiles;
  /** Múltiplo de la primera pérdida. */
  multiploPrimeraPerdida: Percentiles;
  pPierden: number;
  pLleganAlTope: number;
  pPrimeraNoSeRecupera: number;
};

export const MONTE_CARLO: Record<SerieRiesgo, FilaMonteCarlo> = {
  vinedo: {
    tirUnidades: { p10: -0.026, p50: 0.084, p90: 0.108 },
    fundacionRecibe: { p10: 115739, p50: 160220, p90: 1332549 },
    multiploPrimeraPerdida: { p10: 0, p50: 0, p90: 1.8 },
    pPierden: 0.22,
    pLleganAlTope: 0.44,
    pPrimeraNoSeRecupera: 0.6,
  },
  agrovoltaica: {
    tirUnidades: { p10: 0.012, p50: 0.085, p90: 0.14 },
    fundacionRecibe: { p10: 401326, p50: 540348, p90: 5948468 },
    multiploPrimeraPerdida: { p10: 0, p50: 0, p90: 2.33 },
    pPierden: 0.1,
    pLleganAlTope: 0.42,
    pPrimeraNoSeRecupera: 0.61,
  },
};

export const FUTUROS_SIMULADOS = 2000;

/** Supuestos de incertidumbre (doc 29 §5). Todos a confirmar con Vagner. */
export const SUPUESTOS_MONTE_CARLO: Record<SerieRiesgo, string> = {
  vinedo:
    "Helada en 15 % de los años (se pierde 60 % de la cosecha), precio del vino ±20 %, costos ±15 %, rendimiento ±15 %, demora de permisos de 0 a 2 años. A confirmar con Vagner.",
  agrovoltaica:
    "Precio de la energía ±25 %, producción ±5 %, sobrecosto de 5 % ±10 %, demora de conexión de 0 a 2 años. A confirmar con Vagner.",
};
