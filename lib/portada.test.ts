import { describe, expect, it } from "vitest";
import { caminosDePortada, descripcionBarrios } from "./portada";
import { tribusDeTerritorio } from "./territorios/datos";

describe("portada", () => {
  it("devuelve los tres caminos en orden", () => {
    expect(caminosDePortada().map((c) => c.href)).toEqual([
      "/tribus",
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

  it("en inglés: singular, plural y sin datos", () => {
    expect(descripcionBarrios(1, "en")).toBe("1 neighborhood and the tribes forming it.");
    expect(descripcionBarrios(12, "en")).toBe("12 neighborhoods and the tribes forming them.");
    const sinDatos = descripcionBarrios(0, "en");
    expect(sinDatos).not.toMatch(/\d/);
    expect(sinDatos).toBe("The neighborhoods and the tribes forming them.");
  });

  it("los caminos en inglés tienen los mismos destinos y textos en inglés", () => {
    const caminos = caminosDePortada("en");
    expect(caminos.map((c) => c.href)).toEqual(["/tribus", "/perfil", "/congreso"]);
    expect(caminos.map((c) => c.titulo)).toEqual(["See the tribes", "Find my tribe", "Congress · Feb 2027"]);
  });

  it("sin datos no muestra número ni 0", () => {
    const texto = descripcionBarrios(0);
    expect(texto).not.toMatch(/\d/);
    expect(texto).toBe("Los barrios y las tribus que los están formando.");
  });
});
