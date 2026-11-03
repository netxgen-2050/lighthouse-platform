import { sinDato } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import { usd } from "@/lib/series/formato";

/** "USD 15.000"; si falta el valor, "sin dato" / "no data" según el idioma (nunca 0). */
export function usdEn(n: number | null | undefined, idioma: Idioma): string {
  return typeof n === "number" && Number.isFinite(n) ? usd(n) : sinDato(idioma);
}
