// Tipos del modelo de series del programa de fideicomisos (diseño legal B). Sin React ni Next.
// Los porcentajes del modelo van como fracción: 0.05 = 5 %.

export type IdEscenario = "vinedo" | "agrovoltaica";

/** Valores que se deciden (gobernanza). */
export type ValoresDecididos = {
  /** Sobre ingresos brutos. */
  regalia: number;
  /** USD por ha por año. */
  canonPorHa: number;
  /** Tope anual de las Unidades. */
  topeUnidades: number;
  /** Parte de las Unidades en el excedente: 0.20 → 80 % procomún · 20 % Unidades. */
  parteExcedenteUnidades: number;
  /** Anual, sobre el capital levantado. */
  comisionNetx: number;
  /** Meta anual de la primera pérdida. */
  metaPrimeraPerdida: number;
  /** Solo lo usa convertirSafu(): la cascada no lo usa. */
  descuentoSafu: number;
};

/** Datos que se miden (no se votan). Cada escenario usa los suyos. */
export type DatosMedidosVinedo = { rendimientoMadurezTHa: number; precioVinoUsd: number };
export type DatosMedidosAgrovoltaica = { costoUsdPorMw: number; precioEnergiaUsdMwh: number };
export type DatosMedidos = { vinedo: DatosMedidosVinedo; agrovoltaica: DatosMedidosAgrovoltaica };

/** Supuestos del modelo a confirmar con Vagner: se mueven, no se votan. */
export type SupuestosAjustables = {
  /** Veces la caja operativa del último año. */
  multiploSalida: number;
  /** Fracción del capital; el viñedo la deja en 0 y sin control. */
  parteNotas: number;
  /** Anual; sin control en el viñedo. */
  tasaNotas: number;
  /** Fracción del capital. */
  partePrimeraPerdida: number;
  /** Parte de lo levantado. */
  reservaUsd: number;
  /** Solo viñedo: la curva de los primeros años escala con el rendimiento en madurez. */
  curvaEscalada: boolean;
};

export type Metadato = {
  etiqueta: string;
  unidad: string;
  /** En la unidad que se muestra (un porcentaje se expresa en puntos: 5 = 5 %). */
  partida: number;
  min: number;
  max: number;
  paso: number;
  /** Solo en valores que se deciden. */
  quienDecide?: string;
  /** En datos que se miden y supuestos ajustables. */
  fuente?: string;
  /** Texto corto de ayuda debajo del control. */
  ayuda?: string;
};

export type FilaAnio = {
  anio: number;
  ingresos: number;
  costos: number;
  aFundacion: number;
  comisionNetx: number;
  notas: number;
  unidades: number;
  primeraPerdida: number;
  excedenteProcomun: number;
};

export type ResultadoClase = { pone: number; recibe: number; multiplo: number | null; tir: number | null };

export type ResultadoSerie = {
  levantado: number;
  filas: FilaAnio[];
  /** null si la serie no tiene Notas (Viñedo). */
  notas: ResultadoClase | null;
  primeraPerdida: ResultadoClase;
  unidades: ResultadoClase;
  /** Canon + regalía + excedente, todos los años. */
  procomun: { recibe: number };
  netx: { recibe: number };
  /** Año 0 negativo. */
  flujosUnidades: number[];
};
