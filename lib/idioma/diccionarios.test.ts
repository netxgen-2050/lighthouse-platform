import { describe, expect, test } from "vitest";
import { GLOSARIO } from "./glosario";
import { esNeutro } from "./neutros";
import { hojas } from "./recorrer";
import { DICCIONARIOS } from "./textos";

// Palabras de español que no pueden aparecer en el lado inglés (con límites de palabra aptos para acentos).
const ESPANOL = /(?<![\p{L}])(el|los|que|para|tu|tus|con|sin|más)(?![\p{L}])/iu;
const MARCAS_ESPANOL = /[¿¡ñÑ]/u;
const TUTEO = /(?<![\p{L}])(tú|tienes|puedes|quieres|eres|sabes)(?![\p{L}])/iu;

const ZONAS = Object.entries(DICCIONARIOS);

describe.each(ZONAS)("diccionario %s", (zona, dic) => {
  const es = hojas(dic.es);
  const en = hojas(dic.en);

  test("tiene los mismos textos en los dos idiomas", () => {
    expect(en.map((h) => h.ruta)).toEqual(es.map((h) => h.ruta));
  });

  test("ningún texto está vacío", () => {
    for (const h of [...es, ...en]) expect(h.valor.trim(), `${zona}.${h.ruta}`).not.toBe("");
  });

  test("ningún texto en inglés es igual al español (fuera de los neutros)", () => {
    es.forEach((h, i) => {
      const ingles = en[i].valor;
      if (ingles === h.valor) expect(esNeutro(ingles), `${zona}.${h.ruta} está sin traducir: "${ingles}"`).toBe(true);
    });
  });

  test("el lado inglés no tiene rastros de español", () => {
    for (const h of en) {
      expect(MARCAS_ESPANOL.test(h.valor), `${zona}.${h.ruta}: "${h.valor}"`).toBe(false);
      if (!esNeutro(h.valor)) expect(ESPANOL.test(h.valor), `${zona}.${h.ruta}: "${h.valor}"`).toBe(false);
    }
  });

  test("el lado español usa voseo, no tuteo", () => {
    for (const h of es) expect(TUTEO.test(h.valor), `${zona}.${h.ruta}: "${h.valor}"`).toBe(false);
  });
});

test("el detector de español reconoce lo que tiene que reconocer", () => {
  expect(ESPANOL.test("Elegí un plan para ti")).toBe(true);
  expect(ESPANOL.test("Choose a plan")).toBe(false);
  expect(ESPANOL.test("Sign in with Privy")).toBe(false);
  expect(ESPANOL.test("Sin cuenta")).toBe(true);
  expect(TUTEO.test("Tú puedes")).toBe(true);
  expect(TUTEO.test("Podés elegir")).toBe(false);
});

describe("glosario", () => {
  test("todo término tiene español e inglés", () => {
    for (const [clave, t] of Object.entries(GLOSARIO)) {
      expect(t.es.trim(), clave).not.toBe("");
      expect(t.en.trim(), clave).not.toBe("");
    }
  });

  test("lo único igual en los dos idiomas es Semillas, con su explicación", () => {
    const iguales = Object.entries(GLOSARIO).filter(([, t]) => t.es === t.en);
    expect(iguales.map(([clave]) => clave)).toEqual(["semillas"]);
    expect(GLOSARIO.semillas.explicada.en).toBe("Semillas (seeds)");
  });

  test("términos confirmados por Gus", () => {
    expect(GLOSARIO.paseFundador.en).toBe("Founder Pass");
    expect(GLOSARIO.fogon.en).toBe("Fireside");
    expect(GLOSARIO.descubrir.en).toBe("Discover");
  });
});
