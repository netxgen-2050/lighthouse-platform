import { readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { DESTINOS, destinosDisponibles } from "./navegacion";
import { esActivo } from "./ruta-activa";

const APP = path.resolve(__dirname, "..", "app");

/** Rutas con page.* en app/, ignorando route groups "(x)" y carpetas privadas "_x". */
function rutasDeApp(dir = APP, ruta = ""): string[] {
  const entradas = readdirSync(dir, { withFileTypes: true });
  const propia = entradas.some((e) => e.isFile() && /^page\.(tsx?|jsx?|mdx)$/.test(e.name)) ? [ruta || "/"] : [];
  const hijas = entradas
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .flatMap((e) => {
      const grupo = /^\(.*\)$/.test(e.name);
      return rutasDeApp(path.join(dir, e.name), grupo ? ruta : `${ruta}/${e.name}`);
    });
  return [...propia, ...hijas];
}

test("el orden de la lista es el de la spec", () => {
  expect(DESTINOS.map((d) => d.etiqueta)).toEqual([
    "Inicio",
    "Territorio",
    "Tribus",
    "Perfil",
    "Compromisos",
    "Congreso",
    "Sumarte",
    "Mi recorrido",
  ]);
});

test("`existe` de cada destino coincide con las páginas reales de app/", () => {
  const reales = rutasDeApp();
  for (const d of DESTINOS) {
    expect(d.existe, `${d.href}: existe=${d.existe} pero app/ ${reales.includes(d.href) ? "sí" : "no"} la tiene`).toBe(
      reales.includes(d.href),
    );
  }
});

test("solo destinos que existen: sin la ruta /panel no se muestra Mi recorrido", () => {
  const etiquetas = destinosDisponibles().map((d) => d.etiqueta);
  // Mientras app/ no tenga /panel; el día que exista, el test de coincidencia obliga a poner existe: true.
  expect(rutasDeApp().includes("/panel")).toBe(etiquetas.includes("Mi recorrido"));
  expect(etiquetas).toContain("Tribus");
  expect(destinosDisponibles().every((d) => d.existe)).toBe(true);
});

test("las subrutas marcan su sección y Inicio solo la raíz", () => {
  expect(esActivo("/tribus", "/tribus/valle")).toBe(true);
  expect(esActivo("/tribus", "/tribusx")).toBe(false);
  expect(esActivo("/", "/tribus")).toBe(false);
});
