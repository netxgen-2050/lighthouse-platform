import { describe, expect, it } from "vitest";
import { esFase, FASE_ACTUAL, FASES, vigenteEn } from "./fases";

describe("fases", () => {
  it("la fase actual es la 0, equipos semilla, hoy", () => {
    expect(FASE_ACTUAL).toBe(0);
    const f = FASES.find((x) => x.fase === FASE_ACTUAL)!;
    expect(f.nombre.es).toBe("Equipos semilla");
    expect(f.cuando?.es).toBe("hoy");
    expect(f.cuando?.en).toBe("today");
  });

  it("la fase 2 no lleva año", () => {
    expect(FASES.find((x) => x.fase === 2)!.cuando).toBeNull();
  });

  it("vigenteEn compara desde con la fase", () => {
    expect(vigenteEn({ desde: 1 }, 0)).toBe(false);
    expect(vigenteEn({ desde: 1 }, 2)).toBe(true);
    expect(vigenteEn({ desde: 0 }, 0)).toBe(true);
  });

  it("esFase solo acepta 0, 1 y 2", () => {
    expect(esFase(3)).toBe(false);
    expect(esFase("1")).toBe(false);
    expect(esFase(null)).toBe(false);
    expect(esFase(2)).toBe(true);
  });
});
