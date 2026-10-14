import { describe, expect, it } from "vitest";
import { esIdioma, esNeutro, resolver } from "./idioma";

const FUENTE = {
  id: "x",
  titulo: { es: "Hola", en: "Hello" },
  voces: [
    { nombre: "Ana", afiliacion: { es: "Red", en: "Network" } },
    { nombre: "Beto", afiliacion: { es: "Sin inglés" } },
  ],
  vacio: { es: "Uno", en: "" },
  espacios: { es: "Dos", en: "   " },
};

describe("resolver", () => {
  it("en español devuelve el lado es y nada queda sin traducir", () => {
    const { valor, sinTraducir } = resolver<typeof FUENTE>(FUENTE, "es");
    expect(valor).toMatchObject({ titulo: "Hola" });
    expect(sinTraducir).toEqual([]);
  });

  it("en inglés devuelve el lado en y anota la ruta de lo que cae al español", () => {
    const { valor, sinTraducir } = resolver<Record<string, unknown>>(FUENTE, "en");
    expect(valor.titulo).toBe("Hello");
    expect((valor.voces as { afiliacion: string }[])[0].afiliacion).toBe("Network");
    expect((valor.voces as { afiliacion: string }[])[1].afiliacion).toBe("Sin inglés");
    expect(sinTraducir).toEqual(["voces.1.afiliacion", "vacio", "espacios"]);
  });

  it("un en vacío cae al español: nunca devuelve vacío", () => {
    const { valor } = resolver<Record<string, string>>(FUENTE, "en");
    expect(valor.vacio).toBe("Uno");
    expect(valor.espacios).toBe("Dos");
  });

  it("después de resolver no queda ningún objeto con las dos versiones", () => {
    for (const idioma of ["es", "en"] as const) {
      const { valor } = resolver(FUENTE, idioma);
      expect(JSON.stringify(valor)).not.toMatch(/"es":|"en":/);
    }
  });

  it("deja igual lo que no es traducible", () => {
    const { valor } = resolver<{ id: string; n: number }>({ id: "a", n: 3 }, "en");
    expect(valor).toEqual({ id: "a", n: 3 });
  });
});

describe("esIdioma", () => {
  it("acepta es y en, y nada más", () => {
    expect(esIdioma("es")).toBe(true);
    expect(esIdioma("en")).toBe(true);
    expect(esIdioma("fr")).toBe(false);
    expect(esIdioma(null)).toBe(false);
  });
});

describe("esNeutro", () => {
  it("nombres de la lista y números", () => {
    expect(esNeutro("NetX")).toBe(true);
    expect(esNeutro("10.000")).toBe(true);
    expect(esNeutro("8–9")).toBe(true);
    expect(esNeutro("Hola")).toBe(false);
  });
});
