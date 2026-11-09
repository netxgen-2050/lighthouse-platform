// Lectura del mock-up v6 (`docs/referencia/netx-tribus-mockup-v6.html`) para los tests que comparan textos copiados.
// El 9-nov-2026 la app dejó de decir "tribu" (pedido de Franz: el foco pasó a lo residencial y al bien común) y dice
// "comunidad". El mock-up es una referencia histórica y no se edita: se lee con la palabra cambiada, con las mismas
// reglas que se usaron en el código (solo dentro de textos entre comillas, nunca en ids, rutas ni claves).
// Solo para tests: usa `node:fs`.
import { readFileSync } from "node:fs";
import path from "node:path";

const MAPA: Record<string, string> = {
  tribus: "comunidades",
  tribu: "comunidad",
  tribes: "communities",
  tribe: "community",
};
const PALABRA = /(?<![\p{L}\p{N}_\-/.#])(tribus|tribu|tribes|tribe)(?![\p{L}\p{N}_\-/])/giu;
const ES_ID = /^[a-z0-9_\-/.:#?=&[\]]*$/;

function conCaso(original: string, nuevo: string): string {
  if (original === original.toUpperCase()) return nuevo.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return nuevo[0].toUpperCase() + nuevo.slice(1);
  return nuevo;
}

/** Cambia "tribu" por "comunidad" (y "meta-tribu" por "comunidad madre") en un texto, respetando mayúsculas. */
export function sinTribu(texto: string): string {
  return texto
    .replace(/([Mm])eta-tribu/g, (_, m: string) => (m === "M" ? "Comunidad madre" : "comunidad madre"))
    .replace(/([Mm])eta-tribe/g, (_, m: string) => (m === "M" ? "Parent community" : "parent community"))
    .replace(PALABRA, (m) => conCaso(m, MAPA[m.toLowerCase()]));
}

/** El mock-up v6 con "tribu" cambiado por "comunidad" dentro de cada texto entre comillas dobles. */
export function leerMockupV6(): string {
  const crudo = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");
  return crudo.replace(/"((?:[^"\\\n]|\\.)*)"/g, (todo, dentro: string) => (ES_ID.test(dentro) ? todo : `"${sinTribu(dentro)}"`));
}
