import { describe, expect, it } from "vitest";
import { geometriaDe, type Poligono } from "./geometria";

function dentro(p: [number, number], poly: Poligono): boolean {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}

describe("geometriaDe", () => {
  const g = geometriaDe("lighthouse")!;

  it("es ilustrativa y tiene 12 barrios", () => {
    expect(g.ilustrativa).toBe(true);
    expect(Object.keys(g.barrios).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("cada polígono está cerrado y dentro del contorno", () => {
    for (const poly of [g.nucleo, ...Object.values(g.barrios)]) {
      expect(poly[0]).toEqual(poly[poly.length - 1]);
      for (const punto of poly) expect(dentro(punto, g.contorno)).toBe(true);
    }
    expect(g.contorno[0]).toEqual(g.contorno[g.contorno.length - 1]);
  });

  it("territorio sin geometría devuelve undefined", () => {
    expect(geometriaDe("no-existe")).toBeUndefined();
    expect(geometriaDe("toString")).toBeUndefined();
  });
});
