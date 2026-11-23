import { describe, expect, test } from "vitest";
import { idiomaDelNavegador } from "./navegador";

describe("idiomaDelNavegador", () => {
  test.each([
    ["es-AR,es;q=0.9", "es"],
    ["es-ES,es;q=0.9,en;q=0.8", "es"],
    ["es", "es"],
    ["en-US", "en"],
    ["en-GB,en;q=0.9", "en"],
    ["pt-BR,pt;q=0.9,es;q=0.8", "en"],
    ["fr;q=0.5,es;q=0.8", "es"],
    ["fr-FR", "en"],
    ["*", "en"],
    ["", "en"],
    ["???;;;", "en"],
    ["es;q=0,en;q=0", "en"],
    ["en;q=0.5,es;q=0.5", "en"],
    ["es;q=0.5,en;q=0.5", "es"],
    ["ES-ar", "es"],
  ] as const)("%s → %s", (encabezado, esperado) => {
    expect(idiomaDelNavegador(encabezado)).toBe(esperado);
  });

  test("ausente es inglés", () => {
    expect(idiomaDelNavegador(null)).toBe("en");
    expect(idiomaDelNavegador(undefined)).toBe("en");
  });

  test("un encabezado larguísimo que empieza con es-AR es español sin recorrerlo entero", () => {
    const largo = `es-AR,${"en;q=0.1,".repeat(100_000)}`;
    expect(idiomaDelNavegador(largo)).toBe("es");
  });
});
