// Vocabulario de pantalla: un solo filtro que cambia palabras al mostrar los textos, sin tocar los diccionarios.
// 9-nov-2026: Franz no quiere la palabra "tribu" y el foco pasó a lo residencial y al bien común del Lighthouse, así que
// en pantalla se dice "comunidad" ("community"). Es un placeholder: cuando haya palabra definitiva, se cambia acá.
// Solo afecta lo que se ve: una palabra pegada a "/", "#", "=", "?", "&", "-", "_" o "." es parte de una ruta, un ancla,
// un parámetro o un id (`/tribus`, `#tribus`, `?ver=tribus`, `sala-tribu`) y no se toca.

/** Reemplazos de palabra completa. Se respeta la mayúscula inicial y el texto todo en mayúsculas. */
const REEMPLAZOS: ReadonlyArray<readonly [RegExp, string]> = [
  [/(?<![\p{L}\p{N}_\-/.#=?&])meta-tribu(?![\p{L}\p{N}_\-/])/giu, "comunidad madre"],
  [/(?<![\p{L}\p{N}_\-/.#=?&])meta-tribe(?![\p{L}\p{N}_\-/])/giu, "parent community"],
  [/(?<![\p{L}\p{N}_\-/.#=?&])tribus(?![\p{L}\p{N}_\-/])/giu, "comunidades"],
  [/(?<![\p{L}\p{N}_\-/.#=?&])tribu(?![\p{L}\p{N}_\-/])/giu, "comunidad"],
  [/(?<![\p{L}\p{N}_\-/.#=?&])tribes(?![\p{L}\p{N}_\-/])/giu, "communities"],
  [/(?<![\p{L}\p{N}_\-/.#=?&])tribe(?![\p{L}\p{N}_\-/])/giu, "community"],
];

function conCaso(original: string, nuevo: string): string {
  if (original === original.toUpperCase()) return nuevo.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return nuevo[0].toUpperCase() + nuevo.slice(1);
  return nuevo;
}

/** Aplica el vocabulario de pantalla a un texto. */
export function vocabulario(texto: string): string {
  let salida = texto;
  for (const [re, nuevo] of REEMPLAZOS) salida = salida.replace(re, (m) => conCaso(m, nuevo));
  return salida;
}

/**
 * Aplica el vocabulario a todo un diccionario: textos, listas, objetos y funciones que devuelven texto.
 * Devuelve una copia; el original queda igual.
 */
export function conVocabulario<T>(valor: T): T {
  if (typeof valor === "string") return vocabulario(valor) as T;
  if (typeof valor === "function") {
    const f = valor as unknown as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => conVocabulario(f(...args))) as unknown as T;
  }
  if (Array.isArray(valor)) return valor.map((v) => conVocabulario(v)) as T;
  if (valor !== null && typeof valor === "object" && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, conVocabulario(v)])) as T;
  }
  return valor;
}
