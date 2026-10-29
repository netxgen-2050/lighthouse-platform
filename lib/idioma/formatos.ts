// Fechas, números y "sin dato" según el idioma de la plataforma (español de Argentina / inglés de Estados Unidos).
import { comunes } from "./textos/comunes";
import type { Idioma } from "./tipos";

export const LOCALES: Record<Idioma, string> = { es: "es-AR", en: "en-US" };

export type EstiloFecha = "largo" | "corto" | "fecha-hora";

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Fecha en el idioma de la plataforma. Una fecha sin hora ("2026-10-15") se toma en UTC para que no corra un día según
 * la zona horaria de quien la mira. Una fecha inválida devuelve "sin dato" / "no data", nunca una fecha inventada.
 */
export function formatearFecha(iso: string, idioma: Idioma, estilo: EstiloFecha = "largo"): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return sinDato(idioma);
  const fecha = new Date(t);
  const zona = SOLO_FECHA.test(iso) ? { timeZone: "UTC" } : {};
  const opciones: Intl.DateTimeFormatOptions =
    estilo === "largo"
      ? { day: "numeric", month: "long", year: "numeric" }
      : estilo === "corto"
        ? { day: "numeric", month: "short", year: "numeric" }
        : { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat(LOCALES[idioma], { ...opciones, ...zona }).format(fecha);
}

/**
 * El mes de un "AAAA-MM" en el idioma de la plataforma ("noviembre de 2026" / "November 2026"), sin minúscula inicial forzada.
 * Un mes inválido devuelve "sin dato" / "no data".
 */
export function nombreDelMes(mes: string, idioma: Idioma): string {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(mes);
  if (!m) return sinDato(idioma);
  return new Intl.DateTimeFormat(LOCALES[idioma], { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)));
}

/** Pone la primera letra en mayúscula (para el comienzo de una frase). */
export function conMayuscula(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/** Número entero redondeado, con punto de miles en español ("1.200") y coma en inglés ("1,200"). */
export function formatearNumero(n: number, idioma: Idioma): string {
  const redondo = Math.round(n);
  if (idioma === "es") return String(redondo).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return new Intl.NumberFormat(LOCALES.en, { maximumFractionDigits: 0 }).format(redondo);
}

/** Lo que se lee cuando falta un dato: nunca cero ni un valor inventado. */
export function sinDato(idioma: Idioma): string {
  return comunes[idioma].sinDato;
}
