// Guía escrita por nivel de estrellas (1 a 5) para cada dimensión. Inglés: borrador pendiente de revisión nativa.
import type { Idioma } from "@/lib/idioma/tipos";
import type { Dimension } from "./tipos";

type Niveles = [string, string, string, string, string];

export const GUIA: Record<Dimension, Record<Idioma, Niveles>> = {
  rol: {
    es: [
      "Casi no cumple con lo que se acordó para su rol.",
      "Cumple solo una parte de lo acordado o con muchas demoras.",
      "Cumple lo acordado para su rol.",
      "Cumple lo acordado y a veces va más allá.",
      "Cumple lo acordado de forma ejemplar y ayuda a que otras personas cumplan.",
    ],
    en: [
      "Barely does what was agreed for their role.",
      "Does only part of what was agreed, or with many delays.",
      "Does what was agreed for their role.",
      "Does what was agreed and sometimes goes beyond.",
      "Does what was agreed in an exemplary way and helps others do theirs.",
    ],
  },
  cultura: {
    es: [
      "Sus comportamientos suelen ir en contra de la cultura del grupo.",
      "A veces cuesta que sus comportamientos se alineen con la cultura del grupo.",
      "Sus comportamientos se alinean con la cultura del grupo.",
      "Aporta energía y apertura al grupo con frecuencia.",
      "Es una referencia de la cultura del grupo y la fortalece cada día.",
    ],
    en: [
      "Their behavior often goes against the culture of the group.",
      "Sometimes it is hard for their behavior to align with the culture of the group.",
      "Their behavior aligns with the culture of the group.",
      "Often brings energy and openness to the group.",
      "A reference for the culture of the group, strengthening it every day.",
    ],
  },
};

/** Texto de un nivel (1 a 5). */
export function guiaDeNivel(dimension: Dimension, nivel: number, idioma: Idioma): string {
  return GUIA[dimension][idioma][nivel - 1] ?? "";
}
