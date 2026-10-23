// Tipos del idioma de la plataforma. La fuente sigue siendo la del Congreso (módulo puro y portable):
// la plataforma depende de ella y no al revés.
import type { Idioma } from "@/lib/congreso/idioma";

export { esIdioma, IDIOMAS, resolver } from "@/lib/congreso/idioma";
export type { Bilingue, Idioma } from "@/lib/congreso/idioma";

/** Un dato de ejemplo en los dos idiomas, con el idioma en que se escribió originalmente (por defecto español). */
export type BilingueConOriginal = { es: string; en?: string; original?: Idioma };

/**
 * El texto de un dato de ejemplo en el idioma pedido. En inglés, si falta la traducción (o está vacía) devuelve el
 * español: nunca devuelve vacío. Para mostrar la caída marcada ("ES") se usa `<TextoBilingue>`.
 */
export function textoEn(valor: BilingueConOriginal, idioma: Idioma): string {
  return idioma === "en" && valor.en !== undefined && valor.en.trim() !== "" ? valor.en : valor.es;
}

/**
 * Contrato del diccionario en inglés a partir del español: cada texto sigue siendo texto, cada función conserva sus
 * argumentos y devuelve texto, cada objeto se recorre y cada tupla conserva su largo. Así `const en: Textos<typeof es>`
 * no compila si falta una clave o un elemento.
 */
export type Textos<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : { [K in keyof T]: Textos<T[K]> };
