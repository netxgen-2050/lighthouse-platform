import { describe, expect, test } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import { DESTINOS } from "../navegacion";
import { estaTraducida, RUTAS_INTERNAS, RUTAS_PENDIENTES, rutaParaIdioma } from "./rutas";

const APP = path.resolve(__dirname, "..", "..", "app");

/** Rutas con page.* en app/ (sin route groups ni carpetas privadas); los tramos dinámicos quedan con un valor de ejemplo. */
function rutasDeApp(dir = APP, ruta = ""): string[] {
  const entradas = readdirSync(dir, { withFileTypes: true });
  const propia = entradas.some((e) => e.isFile() && /^page\.(tsx?|jsx?|mdx)$/.test(e.name)) ? [ruta || "/"] : [];
  const hijas = entradas
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .flatMap((e) => {
      const grupo = /^\(.*\)$/.test(e.name);
      const tramo = /^\[\.\.\..*\]$/.test(e.name) ? "x/y" : /^\[.*\]$/.test(e.name) ? "x" : e.name;
      return rutasDeApp(path.join(dir, e.name), grupo ? ruta : `${ruta}/${tramo}`);
    });
  return [...propia, ...hijas];
}

const esInterna = (ruta: string) => RUTAS_INTERNAS.some((r) => r.test(ruta));
const esPendiente = (ruta: string) => RUTAS_PENDIENTES.some((p) => p.ruta.test(ruta));

describe("cobertura de rutas (toda pantalla nueva nace bilingüe)", () => {
  test("cada página de app/ está traducida, es interna o espera su cambio de idioma", () => {
    const sueltas = rutasDeApp().filter((r) => !estaTraducida(r) && !esInterna(r) && !esPendiente(r));
    expect(sueltas, `Páginas sin traducir ni declaradas internas: ${sueltas.join(", ")}`).toEqual([]);
  });

  test("cada destino del rail que existe está traducido, es interno o espera su cambio de idioma", () => {
    const sueltas = DESTINOS.filter((d) => d.existe)
      .map((d) => d.href)
      .filter((r) => !estaTraducida(r) && !esInterna(r) && !esPendiente(r));
    expect(sueltas).toEqual([]);
  });

  test("una ruta no puede estar traducida y a la vez interna o pendiente", () => {
    const dobles = rutasDeApp().filter((r) => estaTraducida(r) && (esInterna(r) || esPendiente(r)));
    expect(dobles).toEqual([]);
  });

});

describe("estaTraducida", () => {
  test("el Congreso y su versión en inglés están traducidos", () => {
    expect(estaTraducida("/congreso")).toBe(true);
    expect(estaTraducida("/congreso/en")).toBe(true);
    expect(estaTraducida("/congreso/en?utm_source=x#entradas")).toBe(true);
    expect(estaTraducida("/congreso/")).toBe(true);
  });

  test("la portada y Sumarte están traducidas", () => {
    for (const ruta of ["/", "/?lang=en", "/sumarte", "/sumarte?volver=%2Fpactos", "/sumarte/"]) {
      expect(estaTraducida(ruta), ruta).toBe(true);
    }
  });

  test("las tribus, el manifiesto, la postulación y el territorio están traducidos", () => {
    for (const ruta of [
      "/tribus",
      "/tribus/",
      "/tribus/valle",
      "/tribus/valle/manifiesto",
      "/tribus/grano/postular?x=1",
      "/territorios/lighthouse",
      "/fogon",
      "/compromisos",
      "/canales",
    ]) {
      expect(estaTraducida(ruta), ruta).toBe(true);
    }
  });

  test("el perfil, Mi recorrido, la bandeja y Configuración están traducidos", () => {
    for (const ruta of ["/perfil", "/panel", "/panel/", "/bandeja", "/configuracion?x=1"]) {
      expect(estaTraducida(ruta), ruta).toBe(true);
    }
  });

  test("las consultas del Fogón están traducidas, la lista y cada consulta", () => {
    for (const ruta of ["/fogon/consultas", "/fogon/consultas/", "/fogon/consultas/u1", "/fogon/consultas/u4?x=1"]) {
      expect(estaTraducida(ruta), ruta).toBe(true);
    }
    expect(estaTraducida("/fogon/consultas/u1/otra")).toBe(false);
  });

  test("el resto todavía no", () => {
    for (const ruta of [
      "/fogon/simulador",
      "/pactos/otra",
      "/semillas/otra",
      "/pasaporte/otra",
      "/tribus/valle/otra",
      "/tribus/valle/manifiesto/mas",
      "/territorios",
      "/territorios/lighthouse/x",
      "/sumarte/otra",
      "/panel/bitacora",
      "/perfil/otra",
      "/congreso/fr",
      "/congresos",
    ]) {
      expect(estaTraducida(ruta), ruta).toBe(false);
    }
    expect(estaTraducida(null)).toBe(false);
    expect(estaTraducida("")).toBe(false);
  });
});

describe("rutaParaIdioma", () => {
  test("el Congreso cambia de dirección con el idioma", () => {
    expect(rutaParaIdioma("/congreso", "en")).toBe("/congreso/en");
    expect(rutaParaIdioma("/congreso/en", "es")).toBe("/congreso");
    expect(rutaParaIdioma("/congreso/en", "en")).toBe("/congreso/en");
  });

  test("las demás páginas conservan su dirección", () => {
    expect(rutaParaIdioma("/tribus", "en")).toBe("/tribus");
    expect(rutaParaIdioma("/sumarte?volver=%2Ftribus", "es")).toBe("/sumarte?volver=%2Ftribus");
  });
});
