import { describe, expect, it } from "vitest";
import { hojas } from "../recorrer";
import { vision2050 } from "./vision-2050";

const PROHIBIDAS = /(?<![\p{L}])(token|tokens|inversi[oó]n|reserv[aá]|lotes?|prioridad|apreciaci[oó]n|invest\w*|reserve|lots?|priority|appreciation)(?![\p{L}])/iu;

describe("manifiesto Lighthouse 2050", () => {
  it("los dos idiomas tienen las mismas secciones y los mismos textos", () => {
    expect(hojas(vision2050.en).map((h) => h.ruta)).toEqual(hojas(vision2050.es).map((h) => h.ruta));
    expect(Object.keys(vision2050.en)).toEqual(Object.keys(vision2050.es));
    expect(vision2050.es.postal.parrafos).toHaveLength(vision2050.en.postal.parrafos.length);
    expect(vision2050.es.origen.parrafos).toHaveLength(vision2050.en.origen.parrafos.length);
    expect(vision2050.es.creemos.principios).toHaveLength(7);
    expect(vision2050.en.creemos.principios).toHaveLength(7);
    expect(vision2050.es.pedimos.parrafos).toHaveLength(vision2050.en.pedimos.parrafos.length);
  });

  it("ningún texto está vacío", () => {
    for (const idioma of ["es", "en"] as const) {
      for (const h of hojas(vision2050[idioma])) expect(h.valor.trim(), `${idioma}.${h.ruta}`).not.toBe("");
    }
  });

  it("tiene las cuatro secciones y la marca del español", () => {
    const es = vision2050.es;
    expect([es.postal.titulo, es.origen.titulo, es.creemos.titulo, es.pedimos.titulo]).toEqual([
      "Postal desde 2050",
      "De dónde venimos",
      "Lo que creemos",
      "Lo que pedimos",
    ]);
    expect(es.marca).toBe("Visión, no promesa · borrador");
    expect(es.pedimos.cierre).toBe("Lo que siembres hoy le va a dar sombra a alguien en 2050.");
  });

  it("ninguno de los dos idiomas usa copia prohibida (token, inversión, reservá, lotes, prioridad, apreciación)", () => {
    for (const idioma of ["es", "en"] as const) {
      for (const h of hojas(vision2050[idioma])) expect(PROHIBIDAS.test(h.valor), `${idioma}.${h.ruta}: "${h.valor}"`).toBe(false);
    }
  });

  it("el español usa voseo, no tuteo", () => {
    for (const h of hojas(vision2050.es)) expect(/(?<![\p{L}])(tú|tienes|puedes|quieres|eres|sabes)(?![\p{L}])/iu.test(h.valor), h.ruta).toBe(false);
  });
});
