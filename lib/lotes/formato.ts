import { sinDato } from "@/lib/idioma/formatos";
import { comunes } from "@/lib/idioma/textos/comunes";
import type { Idioma } from "@/lib/idioma/tipos";
import { numero, usd } from "@/lib/series/formato";

/** "USD 15.000"; si falta el valor, "sin dato" / "no data" según el idioma (nunca 0). */
export function usdEn(n: number | null | undefined, idioma: Idioma): string {
  return typeof n === "number" && Number.isFinite(n) ? usd(n) : sinDato(idioma);
}

/**
 * Una fracción como porcentaje: 0.0042 con un decimal → "0,4 %" (es) o "0.4%" (en); 2.61 sin decimales → "261 %" / "261%".
 * Si falta el valor, "sin dato" / "no data" (nunca 0).
 */
export function porcentajeEn(fraccion: number | null | undefined, idioma: Idioma, decimales = 0): string {
  if (typeof fraccion !== "number" || !Number.isFinite(fraccion)) return sinDato(idioma);
  // Una fracción chica que no es cero nunca se muestra como "0 %": se suman decimales hasta que se vea (0,25 % no es 0 %).
  let d = decimales;
  while (d < 3 && fraccion !== 0 && Number(Math.abs(fraccion * 100).toFixed(d)) === 0) d++;
  // Por debajo de 0,001 % ni con tres decimales se ve: se dice "menos de", nunca "0,000 %".
  if (fraccion !== 0 && Number(Math.abs(fraccion * 100).toFixed(d)) === 0) return comunes[idioma].porcentajeMinimo;
  const es = numero(fraccion * 100, d);
  if (idioma !== "en") return `${es} %`;
  const en = es.replace(/[.,]/g, (c) => (c === "." ? "," : "."));
  return `${en}%`;
}
