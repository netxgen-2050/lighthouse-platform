import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { biencomun } from "../idioma/textos/bien-comun";

// Ningún texto de la plataforma habla de vender FARO, de su precio, de tramos ni de staking (spec token-inversor-y-coherencia).
// La única excepción es la sección "Qué cambió" de /bien-comun: la clave `cambios` de su diccionario, que cuenta lo que salió.

const RAIZ = path.resolve(__dirname, "..", "..");

/** La clave del diccionario del bien común donde estas palabras están permitidas (qué salió del modelo anterior). */
export const CLAVE_QUE_CAMBIO = "cambios";

// Palabra entera y sin distinguir mayúsculas: "mostramos" no cuenta.
const PROHIBIDAS = /\b(?:tramos?|tranches?|staking)\b|precio de FARO|FARO price|rendimiento de FARO|FARO (?:yield|return)|vender FARO|venta de FARO|sell(?:ing)? FARO/i;

function archivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) return archivos(p);
    return /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n) ? [p] : [];
  });
}

const DICCIONARIO = path.join(RAIZ, "lib", "idioma", "textos", "bien-comun.ts");

const ARCHIVOS = [
  ...archivos(path.join(RAIZ, "app")),
  ...archivos(path.join(RAIZ, "components")),
  ...archivos(path.join(RAIZ, "lib", "idioma", "textos")),
  path.join(RAIZ, "lib", "legal", "terminos.ts"),
].filter((f) => existsSync(f) && f !== DICCIONARIO);

function textosConRuta(valor: unknown, ruta = ""): [string, string][] {
  if (typeof valor === "string") return [[ruta, valor]];
  if (typeof valor === "function") return [[ruta, String(valor)]];
  if (Array.isArray(valor)) return valor.flatMap((v, i) => textosConRuta(v, `${ruta}[${i}]`));
  if (valor !== null && typeof valor === "object") {
    return Object.entries(valor).flatMap(([k, v]) => textosConRuta(v, ruta ? `${ruta}.${k}` : k));
  }
  return [];
}

const fueraDeCambios = (ruta: string) => ruta !== CLAVE_QUE_CAMBIO && !ruta.startsWith(`${CLAVE_QUE_CAMBIO}.`);

test("hay archivos que vigilar", () => {
  expect(ARCHIVOS.length).toBeGreaterThan(10);
});

test("ninguna pantalla, componente ni diccionario habla de tramos, staking ni precio de FARO", () => {
  const malos = ARCHIVOS.filter((f) => PROHIBIDAS.test(readFileSync(f, "utf8"))).map((f) => path.relative(RAIZ, f));
  expect(malos).toEqual([]);
});

test("el diccionario del bien común solo las dice en 'Qué cambió', en los dos idiomas", () => {
  const malos = (["es", "en"] as const).flatMap((i) =>
    textosConRuta(biencomun[i])
      .filter(([ruta, texto]) => fueraDeCambios(ruta) && PROHIBIDAS.test(texto))
      .map(([ruta]) => `${i}:${ruta}`),
  );
  expect(malos).toEqual([]);
});

test("el detector atrapa 'staking' y no 'mostramos'", () => {
  expect(PROHIBIDAS.test("el Staking de FARO")).toBe(true);
  expect(PROHIBIDAS.test("el precio de FARO")).toBe(true);
  expect(PROHIBIDAS.test("Selling in tranches")).toBe(true);
  expect(PROHIBIDAS.test("mostramos los lotes")).toBe(false);
});

test("'Qué cambió' sí contiene las palabras (si no, la excepción sobraría)", () => {
  const dentro = textosConRuta(biencomun.es).filter(([ruta, texto]) => !fueraDeCambios(ruta) && PROHIBIDAS.test(texto));
  expect(dentro.length).toBeGreaterThan(0);
});
