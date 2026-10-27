// Números con fuente del financiamiento de NetX (cambio vista-netx-financiamiento). Sin React ni Next.
// El dueño de los modelos es NS_Tokenomics (ADR-010): si cambian, se abre otro cambio con números nuevos.

export const VERSIONES = {
  capitalizacion: { fuente: "NS_Tokenomics doc 30", version: "v0.1", fecha: "2026-10-17" },
  plataforma: { fuente: "NS_Tokenomics/sim/platform_revenue_sim.py", version: "v0.1", fecha: "2026-10-17" },
  monteCarlo: { fuente: "NS_Tokenomics/sim/series_montecarlo_sim.py", version: "v0.1", fecha: "2026-10-17" },
} as const;

export type Supuesto = { valor: number | null; fuente: string; aConfirmar?: string };

/** Consumo mensual del equipo (USD). */
export const CONSUMO_MENSUAL_USD: Supuesto = {
  valor: 31000,
  fuente: "NS_Tokenomics doc 30 §2b (doc 12)",
  aConfirmar: "Vagner",
};

/** Meta del SAFE de la empresa (USD). */
export const META_SAFE_USD = {
  min: 375000,
  max: 500000,
  fuente: "doc 30 §2 (doc 12)",
  aConfirmar: "Vagner",
} as const;

/** Comisión de desarrollo: fracción del capex, una vez. */
export const COMISION_DESARROLLO = {
  min: 0.03,
  max: 0.05,
  fuente: "doc 30 §2 (parámetro)",
  aConfirmar: "Vagner",
} as const;

/** Contrato de diseño con BioPueblo: todavía no tiene monto (a cotizar). Nunca 0. */
export const CONTRATO_DISENO_BIOPUEBLO_USD: Supuesto = {
  valor: null,
  fuente: "doc 30 §2 (a cotizar)",
};

export const SUPUESTO_CONGRESO =
  "Supone el Congreso de febrero 2027 (cancelado el 23-oct-2026): falta re-correr el modelo (NS_Tokenomics I-15).";

export const A_CONFIRMAR_CON_VAGNER = "a confirmar con Vagner";
