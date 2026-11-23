// Clases compartidas por las secciones de la pestaña "Modelo de financiamiento". Solo tokens del tema.
export const CARTA = "rounded-xl border border-faint bg-surface p-4 min-w-0";
export const TH = "py-1 pr-4 align-bottom text-left font-semibold";
export const TD = "py-1 pr-4 align-top";
export const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
export const H2 = "mb-3 text-xl font-semibold";
export const SECCION = "mb-8";

/** Porcentaje con signo menos tipográfico: −2,6 %. */
export function signoMenos(texto: string): string {
  return texto.replace("-", "−");
}

export function pctEntero(fraccion: number): string {
  return `${Math.round(fraccion * 100)} %`;
}
