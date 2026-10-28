import { describe, expect, expectTypeOf, test } from "vitest";
import { esIdioma, IDIOMAS, type Textos } from "./tipos";

const es = {
  titulo: "Hola",
  noLeidas: (n: number) => `${n} sin leer`,
  grupo: { uno: "Uno", dos: "Dos" },
  pasos: ["Primero", "Segundo"] as const,
};

describe("Textos<T>", () => {
  test("un inglés completo compila", () => {
    const en: Textos<typeof es> = {
      titulo: "Hello",
      noLeidas: (n) => `${n} unread`,
      grupo: { uno: "One", dos: "Two" },
      pasos: ["First", "Second"],
    };
    expect(en.pasos).toHaveLength(es.pasos.length);
  });

  test("falta una clave: no compila", () => {
    const en: Textos<typeof es> = {
      titulo: "Hello",
      noLeidas: (n) => `${n} unread`,
      // @ts-expect-error falta `grupo.dos`
      grupo: { uno: "One" },
      pasos: ["First", "Second"],
    };
    expect(en.titulo).toBe("Hello");
  });

  test("una tupla corta no compila", () => {
    const en: Textos<typeof es> = {
      titulo: "Hello",
      noLeidas: (n) => `${n} unread`,
      grupo: { uno: "One", dos: "Two" },
      // @ts-expect-error falta el segundo paso
      pasos: ["First"],
    };
    expect(en.pasos).toHaveLength(1);
  });

  test("una función conserva su firma", () => {
    expectTypeOf<Textos<typeof es>["noLeidas"]>().toEqualTypeOf<(n: number) => string>();
    const en: Textos<typeof es> = {
      titulo: "Hello",
      // @ts-expect-error la función pide un número, no un texto
      noLeidas: (n: string) => `${n} unread`,
      grupo: { uno: "One", dos: "Two" },
      pasos: ["First", "Second"],
    };
    expect(typeof en.noLeidas).toBe("function");
  });
});

test("los tipos de idioma vienen del Congreso", () => {
  expect(IDIOMAS).toEqual(["es", "en"]);
  expect(esIdioma("en")).toBe(true);
  expect(esIdioma("fr")).toBe(false);
});
