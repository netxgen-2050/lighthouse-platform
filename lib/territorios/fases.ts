import type { BilingueConOriginal } from "@/lib/idioma/tipos";

/** Las fases del Lighthouse (boceto del 29-oct-2026): 0 equipos semilla, 1 primeras comunidades, 2 barrios con tribus. */
export type Fase = 0 | 1 | 2;

/** `cuando` de la fase 2 es "sin dato": el boceto no le pone año y no se inventa uno. */
export const FASES: readonly { fase: Fase; nombre: BilingueConOriginal; cuando: BilingueConOriginal | null }[] = [
  { fase: 0, nombre: { es: "Equipos semilla", en: "Seed teams" }, cuando: { es: "hoy", en: "today" } },
  { fase: 1, nombre: { es: "Primeras comunidades", en: "First communities" }, cuando: { es: "2027", en: "2027" } },
  { fase: 2, nombre: { es: "Barrios con tribus", en: "Neighborhoods with tribes" }, cuando: null },
];

export const FASE_ACTUAL: Fase = 0;

export function esFase(x: unknown): x is Fase {
  return x === 0 || x === 1 || x === 2;
}

/**
 * Única puerta para filtrar por tiempo. Hoy compara `desde <= fase`; cuando haya capas con inicio y fin (D17)
 * se le suma `hasta` aquí, sin tocar a quien llama.
 */
export function vigenteEn(e: { desde: Fase }, fase: Fase): boolean {
  return e.desde <= fase;
}
