import type { Idioma } from "@/lib/idioma/tipos";
import { numero, usd } from "@/lib/series/formato";

// Valores de EJEMPLO de la venta de lotes de Lighthouse VRN y las cuentas que se hacen con ellos (spec modelo-lotes).
// Puro: sin React ni Next. Ninguna pantalla ni diccionario escribe estos números: salen de acá.
// El dueño del modelo es NS_Tokenomics (ADR-010): si `sim/lot_sale_sim.py` cambia, se abre otro cambio con valores y versión nuevos.

export const VERSION_MODELO_LOTES = {
  fuente: "NS_Tokenomics doc 31 y sim/lot_sale_sim.py",
  version: "v0.2",
  fecha: "2026-11-02",
} as const;

export type TipoCasa = "modular" | "familiar" | "amplia";
export type OpcionCompra = "solo-lote" | TipoCasa;

export const OPCIONES_COMPRA: readonly OpcionCompra[] = ["solo-lote", "modular", "familiar", "amplia"];

export const MODELO_LOTES = {
  // USD; [NC, llamada sin registro]; lineal entre tamaños. Los extremos de superficie son los del plano de Martín
  // (21 lotes y los primeros 4, 3-nov-2026): un test comprueba que siguen siendo los de `rangoDeSuperficies()`.
  precioLote: { min: 15_000, max: 40_000, m2Min: 1_430, m2Max: 2_798 },
  // Estimación [criterio], sin presupuesto detrás; 170 m² es la referencia de Martín.
  casas: {
    modular: { m2: 90, usdPorM2: 1_000 },
    familiar: { m2: 170, usdPorM2: 1_400 },
    amplia: { m2: 250, usdPorM2: 2_000 },
  },
  // Proporción de compradores [criterio].
  mezcla: { "solo-lote": 0.4, modular: 0.3, familiar: 0.2, amplia: 0.1 },
  aporteUnico: 0.05, // proporción de lo que se paga, al bien común
  expensaAnual: 1_200, // USD por lote por año
  presupuestoComunAnual: 72_000, // USD por año
  aniosDeVenta: 3, // los lotes se venden parejo en estos años
  infraestructuraPorLote: 12_000, // USD: caminos, agua y energía
  parteDelDueno: 0.2, // proporción del precio del lote; todavía no hay acuerdo
} as const satisfies {
  precioLote: { min: number; max: number; m2Min: number; m2Max: number };
  casas: Record<TipoCasa, { m2: number; usdPorM2: number }>;
  mezcla: Record<OpcionCompra, number>;
  [k: string]: unknown;
};

const redondear = (n: number) => Math.round(n);

/** Precio del lote según su superficie: lineal del mínimo al máximo, y el extremo si está fuera del rango. Sin superficie, null. */
export function precioLote(m2: number | null | undefined): number | null {
  if (typeof m2 !== "number" || !Number.isFinite(m2)) return null;
  const { min, max, m2Min, m2Max } = MODELO_LOTES.precioLote;
  const t = Math.min(1, Math.max(0, (m2 - m2Min) / (m2Max - m2Min)));
  return redondear(min + t * (max - min));
}

export const precioCasa = (tipo: TipoCasa): number => {
  const c = MODELO_LOTES.casas[tipo];
  return c.m2 * c.usdPorM2;
};

/** Lote más casa (o solo el lote). Sin superficie, null. */
export function precioPaquete(m2: number | null | undefined, opcion: OpcionCompra): number | null {
  const lote = precioLote(m2);
  if (lote === null) return null;
  return opcion === "solo-lote" ? lote : lote + precioCasa(opcion);
}

/** Aporte único al bien común sobre lo que se paga. */
export const aporteDe = (precio: number): number => redondear(precio * MODELO_LOTES.aporteUnico);

/** Paquete promedio de la mezcla de compradores, con el lote en el medio del rango (USD 27.500). */
export function paquetePromedio(): number {
  const { min, max } = MODELO_LOTES.precioLote;
  const medio = (min + max) / 2;
  const casas = (Object.keys(MODELO_LOTES.casas) as TipoCasa[]).reduce(
    (suma, t) => suma + MODELO_LOTES.mezcla[t] * precioCasa(t),
    0,
  );
  return redondear(medio + casas);
}

const hay = (lotes: number) => Number.isFinite(lotes) && lotes > 0;

export const aporteTotal = (lotes: number): number | null =>
  hay(lotes) ? redondear(lotes * paquetePromedio() * MODELO_LOTES.aporteUnico) : null;

export const aportePrimerAnio = (lotes: number): number | null => {
  const total = aporteTotal(lotes);
  return total === null ? null : redondear(total / MODELO_LOTES.aniosDeVenta);
};

export const expensasTotales = (lotes: number): number | null =>
  hay(lotes) ? lotes * MODELO_LOTES.expensaAnual : null;

/**
 * Costo anual del bien común con el que se calcula si no se pide otro: el de la simulación de octubre. No es un
 * presupuesto: el costo real no está calculado (`lib/lotes/escenarios.ts` ofrece tres escenarios).
 */
const costoPorDefecto = MODELO_LOTES.presupuestoComunAnual;
const costoValido = (c: number) => Number.isFinite(c) && c > 0;

/** Expensa por lote y por año que cubriría sola un costo anual del bien común (por defecto, el de la simulación). */
export const expensaParaCubrir = (lotes: number, costoAnual: number = costoPorDefecto): number | null =>
  hay(lotes) && costoValido(costoAnual) ? redondear(costoAnual / lotes) : null;

export const aniosQueCubreElAporte = (lotes: number, costoAnual: number = costoPorDefecto): number | null => {
  const total = aporteTotal(lotes);
  return total === null || !costoValido(costoAnual) ? null : total / costoAnual;
};

/** Parte del dueño sobre el precio del lote. */
export const parteDelDuenoDe = (precio: number): number => redondear(precio * MODELO_LOTES.parteDelDueno);

/** Años con un decimal: "2,6" en español y "2.6" en inglés (los años son un número chico: sin miles). */
const decimal = (n: number, idioma: Idioma) => (idioma === "en" ? numero(n, 1).replace(",", ".") : numero(n, 1));

/** La lección del aporte sale de la cuenta, no de una frase fija. Con cero lotes o un costo inválido, null. */
export function leccionAporte(lotes: number, idioma: Idioma, costoAnual: number = costoPorDefecto): string | null {
  const total = aporteTotal(lotes);
  const primero = aportePrimerAnio(lotes);
  const anios = aniosQueCubreElAporte(lotes, costoAnual);
  if (total === null || primero === null || anios === null) return null;
  const { aporteUnico, aniosDeVenta } = MODELO_LOTES;
  const presupuestoComunAnual = costoAnual;
  const p = `${numero(aporteUnico * 100)} %`;
  const noAlcanza = primero < presupuestoComunAnual;
  if (idioma === "en") {
    return noAlcanza
      ? `With ${lotes} lots, the ${p} one-off contribution adds up to ${usd(total)} over ${aniosDeVenta} years of sales. In the first year ${usd(primero)} comes in: it is not enough for a common budget of ${usd(presupuestoComunAnual)} a year, and the contribution is not repeated.`
      : `With ${lotes} lots, the ${p} one-off contribution adds up to ${usd(total)}: it pays for ${decimal(anios, idioma)} years of a common budget of ${usd(presupuestoComunAnual)}, and it is not repeated.`;
  }
  return noAlcanza
    ? `Con ${lotes} lotes, el aporte único del ${p} suma ${usd(total)} en ${aniosDeVenta} años de ventas. El primer año entran ${usd(primero)}: no alcanza para un presupuesto común de ${usd(presupuestoComunAnual)} por año, y el aporte no se repite.`
    : `Con ${lotes} lotes, el aporte único del ${p} suma ${usd(total)}: paga ${decimal(anios, idioma)} años de un presupuesto común de ${usd(presupuestoComunAnual)}, y no se repite.`;
}

/** Cuánto pide por lote cubrir el presupuesto común solo con expensas, frente a la expensa de ejemplo. Con cero lotes, null. */
export function leccionExpensas(lotes: number, idioma: Idioma, costoAnual: number = costoPorDefecto): string | null {
  const necesaria = expensaParaCubrir(lotes, costoAnual);
  if (necesaria === null) return null;
  return idioma === "en"
    ? `Covering that budget with dues alone takes ${usd(necesaria)} per lot per year; the sample due is ${usd(MODELO_LOTES.expensaAnual)}.`
    : `Cubrir ese presupuesto solo con expensas pide ${usd(necesaria)} por lote al año; la expensa de ejemplo es ${usd(MODELO_LOTES.expensaAnual)}.`;
}
