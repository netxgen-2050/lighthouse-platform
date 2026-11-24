import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

// Las reservas simuladas se leen y se guardan en un solo lugar: `lib/lotes/reservas.ts` (spec mi-tierra).

const RAIZ = path.resolve(__dirname, "..", "..");
const PERMITIDOS = new Set(["lib/lotes/reservas.ts", "lib/lotes/reservas.test.ts", "lib/lotes/reservas-unica.test.ts"]);

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) ? [p] : [];
  });
}

/** Un acceso al almacenamiento (`getItem`/`setItem`/`removeItem`) cuya llamada nombra la clave de reservas. */
function tocaLaClave(texto: string): boolean {
  return /\b(?:getItem|setItem|removeItem)\s*\(\s*(?:CLAVES\.lotes|["'`](?:u:[^"'`]*:)?lh-lotes["'`])/.test(texto);
}

test("el detector atrapa la clave por CLAVES.lotes y por el literal", () => {
  expect(tocaLaClave("window.localStorage.getItem(CLAVES.lotes)")).toBe(true);
  expect(tocaLaClave('localStorage.setItem( "lh-lotes", x)')).toBe(true);
  expect(tocaLaClave("localStorage.getItem(CLAVES.membresia)")).toBe(false);
});

test("solo lib/lotes/reservas.ts (y sus tests) leen o guardan la clave de reservas", () => {
  const malos = ["app", "components", "lib"]
    .flatMap((d) => archivos(path.join(RAIZ, d)))
    .map((f) => path.relative(RAIZ, f).split(path.sep).join("/"))
    .filter((rel) => !PERMITIDOS.has(rel))
    .filter((rel) => tocaLaClave(readFileSync(path.join(RAIZ, rel), "utf8")));
  expect(malos).toEqual([]);
});
