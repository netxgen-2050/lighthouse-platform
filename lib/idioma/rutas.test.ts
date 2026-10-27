import { describe, expect, test } from "vitest";
import { estaTraducida, rutaParaIdioma } from "./rutas";

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

  test("el resto todavía no", () => {
    for (const ruta of [
      "/fogon/consultas",
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
