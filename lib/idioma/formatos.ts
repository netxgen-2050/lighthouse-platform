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
