import { describe, expect, it } from "vitest";
import { caminosDePortada, descripcionBarrios } from "./portada";
import { tribusDeTerritorio } from "./territorios/datos";

describe("portada", () => {
  it("devuelve los tres caminos en orden", () => {
    expect(caminosDePortada().map((c) => c.href)).toEqual([
      "/territorios/lighthouse",
      "/perfil",
      "/congreso",
    ]);
  });

  it("la cantidad de barrios sale de los datos", () => {
    const n = tribusDeTerritorio("lighthouse").length;
    expect(caminosDePortada()[0].descripcion).toContain(`${n} barrios`);
  });

  it("con un solo barrio usa el singular", () => {
    expect(descripcionBarrios(1)).toBe("1 barrio y las tribus que lo están formando.");
  });

  it("sin datos no muestra número ni 0", () => {
    const texto = descripcionBarrios(0);
    expect(texto).not.toMatch(/\d/);
    expect(texto).toBe("Los barrios y las tribus que los están formando.");
  });
});
