import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

// Invertir nunca promete un rendimiento: habla de plazo y forma de devolución (spec invertir, "Sin rendimiento prometido").

const RAIZ = path.resolve(__dirname, "..", "..");
const PROHIBIDAS = /\b(?:rendimiento|APY|TIR|IRR|ganancia|profit|yield|recupero|payback|valorizaci[oó]n|appreciation)\b/i;

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

const ARCHIVOS = [
  ...archivos(path.join(RAIZ, "app", "invertir")),
  ...archivos(path.join(RAIZ, "components", "invertir")),
  ...archivos(path.join(RAIZ, "lib", "invertir")),
  path.join(RAIZ, "lib", "idioma", "textos", "invertir.ts"),
];

test("hay archivos de Invertir que vigilar", () => {
  expect(ARCHIVOS.length).toBeGreaterThan(4);
  for (const f of ARCHIVOS) expect(existsSync(f), f).toBe(true);
});

test("ningún archivo ni texto de Invertir habla de rendimiento, APY, TIR, ganancia, recupero ni valorización", () => {
  const malos = ARCHIVOS.filter((f) => PROHIBIDAS.test(readFileSync(f, "utf8"))).map((f) => path.relative(RAIZ, f));
  expect(malos).toEqual([]);
});

test("el detector atrapa las palabras prohibidas", () => {
  for (const p of ["rendimiento anual", "APY", "la TIR", "IRR", "una ganancia", "profit", "yield", "recupero", "payback", "valorización", "appreciation"]) {
    expect(PROHIBIDAS.test(p), p).toBe(true);
  }
  expect(PROHIBIDAS.test("plazo y forma de devolución")).toBe(false);
});
