import { describe, expect, it } from "vitest";
import type { Anillo } from "./biopueblo";
import { distanciaM, puntoEnAnillo } from "./geometria";

const CUADRADO: Anillo = [
  [0, 0],
  [2, 0],
  [2, 2],
  [0, 2],
  [0, 0],
];

describe("puntoEnAnillo", () => {
  it("un punto adentro da true", () => expect(puntoEnAnillo([1, 1], CUADRADO)).toBe(true));
  it("un punto afuera da false", () => {
    expect(puntoEnAnillo([3, 1], CUADRADO)).toBe(false);
    expect(puntoEnAnillo([1, -1], CUADRADO)).toBe(false);
  });
  it("un punto sobre el borde cuenta como adentro (definido y documentado)", () => {
    expect(puntoEnAnillo([2, 1], CUADRADO)).toBe(true);
    expect(puntoEnAnillo([0, 0], CUADRADO)).toBe(true);
    expect(puntoEnAnillo([1, 2], CUADRADO)).toBe(true);
  });
});

describe("distanciaM", () => {
  it("un grado de latitud son unos 111 km", () => {
    expect(distanciaM([0, 0], [0, 1])).toBeGreaterThan(110000);
    expect(distanciaM([0, 0], [0, 1])).toBeLessThan(112000);
  });
});
