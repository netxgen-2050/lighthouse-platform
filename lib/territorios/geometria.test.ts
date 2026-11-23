import { describe, expect, it } from "vitest";
import type { Anillo } from "./biopueblo";
import {
  METROS_POR_GRADO_LAT,
  METROS_POR_GRADO_LNG,
  anilloDentro,
  areaM2,
  distanciaAlBordeM,
  distanciaM,
  puntoEnAnillo,
  seSuperponen,
} from "./geometria";

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

describe("superposición y superficie", () => {
  const rect = (x: number, y: number, w: number, h: number): Anillo => [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y],
  ];
  const u = 0.0001; // ~8 m en longitud, ~11 m en latitud

  it("areaM2: 32 × 42 m dan 1.344 m²", () => {
    const a = rect(-67.3, -39.1, 32 / METROS_POR_GRADO_LNG, 42 / METROS_POR_GRADO_LAT);
    expect(areaM2(a)).toBeCloseTo(1344, 3);
  });

  it("vecinos que comparten un lado no se superponen", () => {
    expect(seSuperponen(rect(0, 0, u, u), rect(u, 0, u, u))).toBe(false);
    expect(seSuperponen(rect(0, 0, u, u), rect(0, u, u, u))).toBe(false);
  });

  it("separados no se superponen; encimados, iguales o contenidos sí", () => {
    expect(seSuperponen(rect(0, 0, u, u), rect(5 * u, 0, u, u))).toBe(false);
    expect(seSuperponen(rect(0, 0, u, u), rect(u / 2, 0, u, u))).toBe(true);
    expect(seSuperponen(rect(0, 0, u, u), rect(0, 0, u, u))).toBe(true);
    expect(seSuperponen(rect(0, 0, 4 * u, 4 * u), rect(u, u, u, u))).toBe(true);
  });

  it("un vértice corrido ~10 cm no cuenta como superposición, uno corrido 2 m sí", () => {
    const diezCm = 0.1 / METROS_POR_GRADO_LNG;
    const dosMetros = 2 / METROS_POR_GRADO_LNG;
    expect(seSuperponen(rect(0, 0, u, u), rect(u - diezCm, 0, u, u))).toBe(false);
    expect(seSuperponen(rect(0, 0, u, u), rect(u - dosMetros, 0, u, u))).toBe(true);
  });

  it("anilloDentro: adentro, tocando el borde y afuera", () => {
    const grande = rect(0, 0, 10 * u, 10 * u);
    expect(anilloDentro(rect(u, u, u, u), grande)).toBe(true);
    expect(anilloDentro(rect(0, 0, u, u), grande)).toBe(true);
    expect(anilloDentro(rect(9.5 * u, u, u, u), grande)).toBe(false);
  });

  it("distanciaAlBordeM", () => {
    expect(distanciaAlBordeM([u / 2, u / 2], rect(0, 0, u, u))).toBeGreaterThan(3);
    expect(distanciaAlBordeM([0, u / 2], rect(0, 0, u, u))).toBeCloseTo(0, 6);
  });
});
