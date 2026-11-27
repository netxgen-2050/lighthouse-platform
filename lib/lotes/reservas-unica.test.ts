import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

// Las reservas simuladas se leen y se escriben en un solo lugar del navegador: `lib/lotes/reservas.ts`, que habla con
// `/api/lotes/reservas` y `/api/lotes/estados` (`lotes-en-la-base`). Y nada vuelve a guardarlas en el navegador.

const RAIZ = path.resolve(__dirname, "..", "..");
const PERMITIDOS = new Set(["lib/lotes/reservas.ts", "lib/lotes/reservas.test.ts", "lib/lotes/reservas-unica.test.ts"]);
// Quien limpia el navegador nombra la clave vieja para BORRARLA, y la ruta de pruebas del servidor vive en `app/api`.
const SOLO_LIMPIAN = new Set(["lib/demo/importar.ts", "lib/demo/importar.test.ts"]);

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) ? [p] : [];
  });
}

const relativos = () =>
  ["app", "components", "lib"]
    .flatMap((d) => archivos(path.join(RAIZ, d)))
    .map((f) => path.relative(RAIZ, f).split(path.sep).join("/"));

/** Una llamada a las rutas de reservas o de estados (la cadena de la URL, entre comillas). */
function llamaALaApi(texto: string): boolean {
  return /["'`]\/api\/lotes\/(?:reservas|estados)/.test(texto);
}

/** Un acceso al almacenamiento (`getItem`/`setItem`/`removeItem`) cuya llamada nombra la clave vieja de reservas. */
function tocaLaClaveVieja(texto: string): boolean {
  return /\b(?:getItem|setItem|removeItem)\s*\(\s*["'`](?:u:[^"'`]*:)?lh-(?:lotes|consultas-lotes)["'`]/.test(texto);
}

test("los detectores atrapan la llamada a la API y la clave vieja", () => {
  expect(llamaALaApi('fetch("/api/lotes/reservas", {})')).toBe(true);
  expect(llamaALaApi("pedir(`/api/lotes/estados`)")).toBe(true);
  expect(llamaALaApi('fetch("/api/consentimientos")')).toBe(false);
  expect(tocaLaClaveVieja('localStorage.setItem( "lh-lotes", x)')).toBe(true);
  expect(tocaLaClaveVieja('window.localStorage.getItem("u:A:lh-consultas-lotes")')).toBe(true);
  expect(tocaLaClaveVieja("localStorage.getItem(CLAVES.membresia)")).toBe(false);
});

test("solo lib/lotes/reservas.ts (y sus tests) llaman a /api/lotes/reservas y /api/lotes/estados desde el navegador", () => {
  const malos = relativos()
    // Las rutas del servidor y sus tests son el otro extremo de esa llamada.
    .filter((rel) => !rel.startsWith("app/api/") && !PERMITIDOS.has(rel))
    .filter((rel) => llamaALaApi(readFileSync(path.join(RAIZ, rel), "utf8")));
  expect(malos).toEqual([]);
});

test("nadie lee ni escribe lh-lotes en el navegador (solo se borra, en importar.ts)", () => {
  const malos = relativos()
    .filter((rel) => !PERMITIDOS.has(rel) && !SOLO_LIMPIAN.has(rel))
    .filter((rel) => tocaLaClaveVieja(readFileSync(path.join(RAIZ, rel), "utf8")));
  expect(malos).toEqual([]);
});
