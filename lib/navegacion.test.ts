import { readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { DESTINOS, destinosDeGrupo, destinosDisponibles, etiquetaDeDestino, GRUPOS_RAIL, tituloDeGrupo } from "./navegacion";
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
  expect(DESTINOS.map((d) => etiquetaDeDestino(d, "es"))).toEqual([
    "Inicio",
    "Territorio",
    "Lotes",
    "Sumarte",
    "Tribus",
    "Pactos",
    "Semillas",
    "Fogón",
    "Compromisos",
    "Congreso",
    "Perfil",
    "Pasaporte",
    "Mi recorrido",
    "Configuración",
    "Mis datos",
    "NetX",
    "Admin",
  ]);
});

test("los grupos del rail y del menú de la persona salen de la lista única", () => {
  const etiquetas = (g: Parameters<typeof destinosDeGrupo>[0]) => destinosDeGrupo(g).map((d) => etiquetaDeDestino(d, "es"));
  expect(GRUPOS_RAIL.map((g) => tituloDeGrupo(g.id, "es"))).toEqual(["Descubrir", "Sumarte", "Lo que viene"]);
  // Lotes está declarado con existe: false (llega con lote-ficha-y-compra): el rail todavía no lo muestra.
  expect(etiquetas("descubrir")).toEqual(["Inicio", "Territorio"]);
  expect(etiquetas("sumarte")).toEqual(["Sumarte"]);
  expect(etiquetas("viene")).toEqual(["Tribus", "Pactos", "Semillas", "Fogón"]);
  expect(etiquetas("persona")).toEqual(["Perfil", "Pasaporte", "Mi recorrido", "Configuración", "Mis datos"]);
  expect(etiquetas("interno")).toEqual(["NetX", "Admin"]);
});

test("en inglés el rail dice lo que fija el glosario, y Semillas no se traduce", () => {
  const ingles = (g: Parameters<typeof destinosDeGrupo>[0]) => destinosDeGrupo(g).map((d) => etiquetaDeDestino(d, "en"));
  expect(GRUPOS_RAIL.map((g) => tituloDeGrupo(g.id, "en"))).toEqual(["Discover", "Join", "Coming next"]);
  expect(ingles("descubrir")).toEqual(["Home", "Territory"]);
  expect(ingles("viene")).toEqual(["Tribes", "Pacts", "Semillas", "Fireside"]);
  expect(ingles("persona")).toEqual(["Profile", "Passport", "My journey", "Settings", "My data"]);
});

test("Compromisos existe pero no aparece en ningún grupo", () => {
  const compromisos = DESTINOS.find((d) => d.href === "/compromisos");
  expect(compromisos?.existe).toBe(true);
  expect(compromisos?.oculto).toBe(true);
  const grupos = ["descubrir", "viene", "sumarte", "persona", "interno"] as const;
  expect(grupos.flatMap((g) => destinosDeGrupo(g)).some((d) => d.href === "/compromisos")).toBe(false);
});

test("Congreso existe pero no aparece en ningún grupo", () => {
  const congreso = DESTINOS.find((d) => d.href === "/congreso");
  expect(congreso?.existe).toBe(true);
  expect(congreso?.oculto).toBe(true);
  const grupos = ["descubrir", "viene", "sumarte", "persona", "interno"] as const;
  expect(grupos.flatMap((g) => destinosDeGrupo(g)).some((d) => d.href === "/congreso")).toBe(false);
});

test("Lotes se declara sin existir hasta lote-ficha-y-compra", () => {
  const lotes = DESTINOS.find((d) => d.href === "/lotes");
  expect(lotes?.existe).toBe(false);
  expect(destinosDisponibles().some((d) => d.href === "/lotes")).toBe(false);
});

test("todo destino oculto existe", () => {
  expect(DESTINOS.filter((d) => d.oculto).every((d) => d.existe)).toBe(true);
});

test("ningún destino apunta a /canales", () => {
  expect(DESTINOS.some((d) => d.href.startsWith("/canales"))).toBe(false);
});

/** ¿Alguna ruta de app/ (incluidas las dinámicas, como /territorios/[id]) atiende este href? */
function atiende(href: string, rutas: string[]) {
  return rutas.some((r) => new RegExp(`^${r.replace(/\[[^\]]+\]/g, "[^/]+")}$`).test(href));
}

test("`existe` de cada destino coincide con las páginas reales de app/", () => {
  const reales = rutasDeApp();
  for (const d of DESTINOS) {
    expect(d.existe, `${d.href}: existe=${d.existe} pero app/ ${atiende(d.href, reales) ? "sí" : "no"} la tiene`).toBe(
      atiende(d.href, reales),
    );
  }
});

test("solo destinos que existen: sin la ruta /panel no se muestra Mi recorrido", () => {
  const etiquetas = destinosDisponibles().map((d) => etiquetaDeDestino(d, "es"));
  // Mientras app/ no tenga /panel; el día que exista, el test de coincidencia obliga a poner existe: true.
  expect(atiende("/panel", rutasDeApp())).toBe(etiquetas.includes("Mi recorrido"));
  expect(etiquetas).toContain("Tribus");
  expect(destinosDisponibles().every((d) => d.existe)).toBe(true);
});

test("las subrutas marcan su sección y Inicio solo la raíz", () => {
  expect(esActivo("/tribus", "/tribus/valle")).toBe(true);
  expect(esActivo("/tribus", "/tribusx")).toBe(false);
  expect(esActivo("/fogon", "/fogon/consultas")).toBe(true);
  expect(esActivo("/fogon", "/fogon/consultas/u1")).toBe(true);
  expect(esActivo("/", "/tribus")).toBe(false);
});

test("el rail marca Congreso también en la versión en inglés", () => {
  expect(esActivo("/congreso", "/congreso/en")).toBe(true);
  expect(esActivo("/congreso", "/congreso")).toBe(true);
});
