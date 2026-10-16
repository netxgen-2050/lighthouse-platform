import { describe, expect, it } from "vitest";
import {
  atributosDeApariencia,
  formatearMonto,
  leerPreferencias,
  NOTA_TIPO_DE_CAMBIO,
  notaTipoDeCambio,
  PREFERENCIAS_INICIALES,
  TIPO_DE_CAMBIO,
  tiposOcultos,
} from "./preferencias";

describe("leerPreferencias", () => {
  it("sin nada guardado o con datos dañados devuelve las iniciales", () => {
    expect(leerPreferencias(null)).toEqual(PREFERENCIAS_INICIALES);
    expect(leerPreferencias("no es json")).toEqual(PREFERENCIAS_INICIALES);
    expect(leerPreferencias("[1,2]")).toEqual(PREFERENCIAS_INICIALES);
    expect(leerPreferencias("7")).toEqual(PREFERENCIAS_INICIALES);
  });

  it("lee lo válido y descarta campo por campo lo que no sirve", () => {
    const p = leerPreferencias(
      JSON.stringify({ tema: "oscuro", texto: "enorme", moneda: "ARS", mostrarHifa: false, avisos: { rondas: false, pactos: "no" }, idioma: "en" }),
    );
    expect(p.tema).toBe("oscuro");
    expect(p.texto).toBe("normal");
    expect(p.moneda).toBe("ARS");
    expect(p.mostrarHifa).toBe(false);
    expect(p.avisos.rondas).toBe(false);
    expect(p.avisos.pactos).toBe(true);
    // El campo viejo `idioma` nunca fue una elección: se ignora.
    expect(p.idiomaElegido).toBeNull();
  });

  it("idiomaElegido: es y en valen; otro valor o ausente es null (no eligió)", () => {
    expect(leerPreferencias(JSON.stringify({ idiomaElegido: "en" })).idiomaElegido).toBe("en");
    expect(leerPreferencias(JSON.stringify({ idiomaElegido: "es" })).idiomaElegido).toBe("es");
    expect(leerPreferencias(JSON.stringify({ idiomaElegido: "fr" })).idiomaElegido).toBeNull();
    expect(leerPreferencias(JSON.stringify({ idioma: "es" })).idiomaElegido).toBeNull();
    expect(PREFERENCIAS_INICIALES.idiomaElegido).toBeNull();
  });

  it("por defecto todo está prendido, el tema es el del sistema y la moneda es USD", () => {
    expect(PREFERENCIAS_INICIALES.tema).toBe("sistema");
    expect(PREFERENCIAS_INICIALES.moneda).toBe("USD");
    expect(PREFERENCIAS_INICIALES.mostrarHifa).toBe(true);
    expect(Object.values(PREFERENCIAS_INICIALES.avisos).every(Boolean)).toBe(true);
  });
});

describe("tiposOcultos", () => {
  it("sin avisos apagados no oculta nada", () => {
    expect(tiposOcultos(PREFERENCIAS_INICIALES)).toEqual([]);
  });

  it("apagar rondas oculta el evento de ronda abierta", () => {
    const p = { ...PREFERENCIAS_INICIALES, avisos: { ...PREFERENCIAS_INICIALES.avisos, rondas: false } };
    expect(tiposOcultos(p)).toEqual(["ronda-abierta"]);
  });
});

describe("formatearMonto", () => {
  it("en USD deja el monto con punto de miles", () => {
    expect(formatearMonto(1500, "USD")).toBe("USD 1.500");
  });

  it("en ARS multiplica por el tipo de cambio de ejemplo", () => {
    expect(formatearMonto(300, "ARS")).toBe(`ARS ${String(300 * TIPO_DE_CAMBIO).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`);
    expect(formatearMonto(300, "ARS")).toBe("ARS 420.000");
  });

  it("el dato que falta no es cero", () => {
    expect(formatearMonto(null, "USD")).toBe("sin dato");
    expect(formatearMonto(undefined, "ARS")).toBe("sin dato");
    expect(formatearMonto(Number.NaN, "USD")).toBe("sin dato");
  });

  it("en inglés usa coma de miles y 'no data'", () => {
    expect(formatearMonto(1200, "USD", "en")).toBe("USD 1,200");
    expect(formatearMonto(300, "ARS", "en")).toBe("ARS 420,000");
    expect(formatearMonto(null, "USD", "en")).toBe("no data");
  });

  it("en español es idéntico a antes", () => {
    expect(formatearMonto(1200, "USD", "es")).toBe("USD 1.200");
    expect(formatearMonto(2100000 / 1400, "ARS")).toBe("ARS 2.100.000");
  });
});

describe("notaTipoDeCambio", () => {
  it("en español es la nota de siempre", () => {
    expect(NOTA_TIPO_DE_CAMBIO).toBe("Tipo de cambio de ejemplo: 1 USD = 1.400 ARS. No es una cotización real.");
    expect(notaTipoDeCambio("es")).toBe(NOTA_TIPO_DE_CAMBIO);
  });

  it("en inglés está traducida y con formato inglés", () => {
    expect(notaTipoDeCambio("en")).toBe("Sample exchange rate: 1 USD = 1,400 ARS. This is not a real quote.");
  });
});

describe("atributosDeApariencia", () => {
  it("el tema del sistema se resuelve con la preferencia del sistema", () => {
    expect(atributosDeApariencia(PREFERENCIAS_INICIALES, true)["data-tema"]).toBe("oscuro");
    expect(atributosDeApariencia(PREFERENCIAS_INICIALES, false)["data-tema"]).toBe("claro");
  });

  it("un tema elegido gana sobre el del sistema", () => {
    expect(atributosDeApariencia({ ...PREFERENCIAS_INICIALES, tema: "claro" }, true)["data-tema"]).toBe("claro");
  });

  it("texto grande y animaciones reducidas", () => {
    const a = atributosDeApariencia({ ...PREFERENCIAS_INICIALES, texto: "grande", reducirAnimaciones: true }, false);
    expect(a["data-texto"]).toBe("grande");
    expect(a["data-movimiento"]).toBe("reducido");
  });

  it("Hifa apagada se marca para ocultar el botón antes de hidratar", () => {
    expect(atributosDeApariencia(PREFERENCIAS_INICIALES, false)["data-hifa"]).toBe("visible");
    expect(atributosDeApariencia({ ...PREFERENCIAS_INICIALES, mostrarHifa: false }, false)["data-hifa"]).toBe("apagada");
  });
});
