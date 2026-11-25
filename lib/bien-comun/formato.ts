import { formatearNumero, sinDato } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import { NOMBRE_TOKEN } from "./modelo";

// Formatos del bien común. Lo que falta o no es finito dice "sin dato" / "no data", nunca 0.

const finito = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

/** "18.560 FARO" (es) o "18,560 FARO" (en). */
export function faroEn(n: number | null | undefined, idioma: Idioma): string {
  if (!finito(n)) return sinDato(idioma);
  return `${formatearNumero(n, idioma)} ${NOMBRE_TOKEN}`;
}

/** Un entero con separador de miles del idioma. */
export function enteroEn(n: number | null | undefined, idioma: Idioma): string {
  if (!finito(n)) return sinDato(idioma);
  return formatearNumero(n, idioma);
}
