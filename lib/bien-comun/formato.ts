import { LOCALES, formatearNumero, sinDato } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import { NOMBRE_TOKEN } from "./modelo";

// Formatos de la simulación del bien común. Lo que falta o no es finito dice "sin dato" / "no data", nunca 0.

const finito = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

/** "18.560 FARO" (es) o "18,560 FARO" (en). */
export function faroEn(n: number | null | undefined, idioma: Idioma): string {
  if (!finito(n)) return sinDato(idioma);
  return `${formatearNumero(n, idioma)} ${NOMBRE_TOKEN}`;
}

/** "USD 0,05" (es) o "USD 0.05" (en), con los decimales que se pidan. */
export function usdConDecimales(n: number | null | undefined, idioma: Idioma, decimales = 2): string {
  if (!finito(n)) return sinDato(idioma);
  return `USD ${new Intl.NumberFormat(LOCALES[idioma], { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n)}`;
}

/** Un entero con separador de miles del idioma. */
export function enteroEn(n: number | null | undefined, idioma: Idioma): string {
  if (!finito(n)) return sinDato(idioma);
  return formatearNumero(n, idioma);
}

/** Un entero como porcentaje del reparto: 35 → "35 %" (es) o "35%" (en). */
export function porcentajeEntero(n: number, idioma: Idioma): string {
  return idioma === "en" ? `${n}%` : `${n} %`;
}
