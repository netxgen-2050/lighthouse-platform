import { describe, expect, it } from "vitest";
import { aceptaFormato, compromisoMinimoDe, esCompromisoValido, formatosDe } from "./formatos";
import { listarTribusBilingues } from "@/lib/tribus/datos";

describe("formatos de pacto por comunidad", () => {
  it("Valle Solar acepta fijo, puntual y variable", () => {
    expect(formatosDe("valle")).toEqual(["fijo", "puntual", "variable"]);
  });
  it("Barda Productiva solo acepta fijo y Monte Nuevo no acepta variable", () => {
    expect(formatosDe("barda")).toEqual(["fijo"]);
    expect(aceptaFormato("barda", "puntual")).toBe(false);
    expect(aceptaFormato("barda", "variable")).toBe(false);
    expect(aceptaFormato("monte", "variable")).toBe(false);
    expect(aceptaFormato("monte", "puntual")).toBe(true);
  });
  it("el Lighthouse acepta fijo y variable, y no puntual", () => {
    expect(formatosDe("lighthouse")).toEqual(["fijo", "variable"]);
    expect(aceptaFormato("lighthouse", "puntual")).toBe(false);
  });
  it("aceptan variable el Lighthouse, Semilla Viva, Agua Clara, Valle Solar, Taller Común, Avelan Kerum y Puerto Trueque", () => {
    for (const id of ["lighthouse", "semilla", "agua", "valle", "taller", "avelan", "puerto"]) {
      expect(aceptaFormato(id, "variable"), id).toBe(true);
    }
  });
  it("una comunidad desconocida (o un id raro) es solo fijo", () => {
    expect(formatosDe("no-existe")).toEqual(["fijo"]);
    expect(formatosDe("__proto__")).toEqual(["fijo"]);
    expect(formatosDe("constructor")).toEqual(["fijo"]);
  });
  it("todas las comunidades con necesidades aceptan fijo", () => {
    for (const t of listarTribusBilingues().filter((x) => x.estado !== "vacante")) {
      expect(aceptaFormato(t.id, "fijo"), t.id).toBe(true);
    }
  });
});

describe("compromiso mínimo por comunidad", () => {
  it("Valle Solar 3, Agua Clara 2, Taller Común 1", () => {
    expect(compromisoMinimoDe("valle")).toBe(3);
    expect(compromisoMinimoDe("agua")).toBe(2);
    expect(compromisoMinimoDe("taller")).toBe(1);
  });
  it("sin dato (o un id raro) es 3", () => {
    expect(compromisoMinimoDe("no-existe")).toBe(3);
    expect(compromisoMinimoDe("__proto__")).toBe(3);
  });
  it("solo 1, 2 y 3 son compromisos válidos", () => {
    expect([1, 2, 3].every(esCompromisoValido)).toBe(true);
    expect([0, 4, 1.5, "3", null, undefined].some(esCompromisoValido)).toBe(false);
  });
});
