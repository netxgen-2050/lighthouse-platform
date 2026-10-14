import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const RAIZ = path.resolve(__dirname, "..");
const PROHIBIDO = /#[0-9a-fA-F]{3,8}\b|\b(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d/;

// Excepciones: la hoja de tokens de NetX y la hoja del tema del Congreso (ADR-002), que tiene su propio test.
const EXCEPCIONES = [path.join("app", "globals.css"), path.join("app", "congreso", "tema-evento.css")];

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.(tsx?|css)$/.test(n) && !EXCEPCIONES.some((e) => p.endsWith(e)) ? [p] : [];
  });
}

const TODOS = [...archivos(path.join(RAIZ, "app")), ...archivos(path.join(RAIZ, "components"))];

test("app/ y components/ no usan colores sueltos fuera de globals.css y del tema del Congreso", () => {
  const malos = TODOS.filter((f) => PROHIBIDO.test(readFileSync(f, "utf8")));
  expect(malos).toEqual([]);
});

test("--evento- no aparece fuera de app/congreso/", () => {
  const malos = TODOS.filter(
    (f) => !f.startsWith(path.join(RAIZ, "app", "congreso") + path.sep) && readFileSync(f, "utf8").includes("--evento-"),
  );
  expect(malos).toEqual([]);
});
