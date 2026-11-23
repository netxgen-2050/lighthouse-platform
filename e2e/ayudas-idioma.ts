import type { Locator, Page } from "@playwright/test";

/** Palabras de español que no pueden aparecer en una página en inglés (fuera de `lang="es"` y de `translate="no"`). */
export const PALABRAS_ESPANOL = [
  "el", "los", "las", "que", "para", "por", "tu", "tus", "con", "sin", "más", "un", "una", "del", "como", "pero",
];

/**
 * Junta el texto visible de `raiz` sin los subárboles `[lang="es"]` ni `[translate="no"]` y devuelve las coincidencias con
 * la lista de palabras en español (con límites de palabra) y con `¿ ¡ ñ`. Vacío = no hay español suelto.
 * Si la propia raíz está dentro de un `lang="es"` (o de un `translate="no"`), no hay nada que mirar.
 */
export async function textosEnEspanol(page: Page, raiz: Locator | string): Promise<string[]> {
  const locator = typeof raiz === "string" ? page.locator(raiz) : raiz;
  const cantidad = await locator.count();
  const salida: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const encontradas = await locator.nth(i).evaluate((el, palabras) => {
      if (el.closest('[lang="es"], [translate="no"]')) return [];
      const copia = el.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('[lang="es"], [translate="no"], script, style').forEach((n) => n.remove());
      // Un espacio entre nodos de texto: "Home" + "Tribes" en elementos vecinos no se pega en una palabra.
      const trozos: string[] = [];
      const recorrer = (n: Node) => {
        if (n.nodeType === Node.TEXT_NODE) trozos.push(n.textContent ?? "");
        else n.childNodes.forEach(recorrer);
      };
      recorrer(copia);
      const texto = trozos.join(" ");
      const re = new RegExp(`(?<![\\p{L}])(?:${palabras.join("|")})(?![\\p{L}])|[¿¡ñÑ]`, "giu");
      return texto.match(re) ?? [];
    }, PALABRAS_ESPANOL);
    salida.push(...encontradas);
  }
  return salida;
}
