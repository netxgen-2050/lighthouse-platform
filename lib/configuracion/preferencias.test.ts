import { describe, expect, it } from "vitest";
import {
  atributosDeApariencia,
  formatearMonto,
  leerPreferencias,
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
    expect(p.idioma).toBe("es");
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
