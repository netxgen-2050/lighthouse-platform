import { sinDato } from "@/lib/idioma/formatos";
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
  const es = numero(fraccion * 100, decimales);
  if (idioma !== "en") return `${es} %`;
  const en = es.replace(/[.,]/g, (c) => (c === "." ? "," : "."));
  return `${en}%`;
}
