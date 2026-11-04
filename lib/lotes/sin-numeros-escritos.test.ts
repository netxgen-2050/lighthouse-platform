import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

// Ninguna pantalla de lotes ni su diccionario escribe un número del modelo: salen de `lib/lotes/modelo.ts` (spec modelo-lotes).

const RAIZ = path.resolve(__dirname, "..", "..");

// Valores del modelo, de la superficie de los lotes del plano y términos de la tesis de inversión que no van en estas pantallas.
const NUMEROS = ["15.000", "40.000", "238.000", "500.000", "1.200", "2.880", "72.000", "1.680", "2.798", "1.344", "152.100"];
const TERMINOS = /\b(?:SMA|111|TIR|recupero)\b/;

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

const ARCHIVOS = [
  ...archivos(path.join(RAIZ, "app", "lotes")),
  path.join(RAIZ, "lib", "idioma", "textos", "lotes.ts"),
  // La puerta "Comprar un lote" de Sumarte lee el precio del módulo del modelo.
  path.join(RAIZ, "lib", "idioma", "textos", "sumarte.ts"),
].filter(existsSync);

test("hay pantallas de lotes que vigilar", () => {
  expect(ARCHIVOS.length).toBeGreaterThan(1);
});

test("app/lotes/ y el diccionario de lotes no escriben números del modelo", () => {
  const malos = ARCHIVOS.flatMap((f) => {
    const texto = readFileSync(f, "utf8");
    return NUMEROS.filter((n) => texto.includes(n)).map((n) => `${path.relative(RAIZ, f)}: ${n}`);
  });
  expect(malos).toEqual([]);
});

test("app/lotes/ y el diccionario de lotes no hablan de SMA, TIR ni recupero", () => {
  const malos = ARCHIVOS.filter((f) => TERMINOS.test(readFileSync(f, "utf8"))).map((f) => path.relative(RAIZ, f));
  expect(malos).toEqual([]);
});
