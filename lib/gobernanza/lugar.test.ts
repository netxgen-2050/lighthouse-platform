import { describe, expect, it } from "vitest";
import { construirHolarquia } from "./holarquia";
import { interpretarLugar, parametrosDeLugar } from "./lugar";

const raiz = construirHolarquia("es");
const LENTES = ["estructura", "propositos", "decisiones", "desdeMi"];

describe("interpretarLugar", () => {
  it("un holón y una lente válidos se respetan", () => {
    expect(interpretarLugar(raiz, LENTES, { holon: "valle-0", lente: "propositos" })).toEqual({ focoId: "valle-0", lenteId: "propositos" });
  });
  it("ausentes: el común y la primera lente", () => {
    expect(interpretarLugar(raiz, LENTES, {})).toEqual({ focoId: raiz.id, lenteId: "estructura" });
  });
  it("un holón que no existe vuelve al común", () => {
    expect(interpretarLugar(raiz, LENTES, { holon: "no-existe" }).focoId).toBe(raiz.id);
  });
  it("una lente desconocida vuelve a la primera", () => {
    expect(interpretarLugar(raiz, LENTES, { lente: "otra" }).lenteId).toBe("estructura");
  });
  it("un texto raro vuelve al común y no se refleja", () => {
    for (const raro of ["<b>x</b>", "../", "javascript:alert(1)", ""]) {
      const l = interpretarLugar(raiz, LENTES, { holon: raro, lente: raro });
      expect(l).toEqual({ focoId: raiz.id, lenteId: "estructura" });
    }
  });
  it("un parámetro repetido usa el primero", () => {
    expect(interpretarLugar(raiz, LENTES, { holon: ["valle", "valle-0"] }).focoId).toBe("valle");
  });
  it("un id de persona o de lugar libre no es un holón: vuelve al común", () => {
    expect(interpretarLugar(raiz, LENTES, { holon: "p1" }).focoId).toBe(raiz.id);
  });
});

describe("parametrosDeLugar", () => {
  it("el común con la primera lente no escribe nada", () => {
    expect(parametrosDeLugar({ focoId: raiz.id, lenteId: "estructura" }, raiz.id, "estructura").toString()).toBe("");
  });
  it("escribe holón y lente cuando cambian", () => {
    expect(parametrosDeLugar({ focoId: "valle-0", lenteId: "propositos" }, raiz.id, "estructura").toString()).toBe("holon=valle-0&lente=propositos");
  });
});
