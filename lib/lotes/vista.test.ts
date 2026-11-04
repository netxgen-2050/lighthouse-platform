import { describe, expect, it } from "vitest";
import { listarLotes } from "@/lib/territorios/loteo";
import { vistaDeLote } from "./vista";

describe("vista satelital de un lote", () => {
  const [lote, ...resto] = listarLotes();
  const v = vistaDeLote(lote.anillo, resto.map((l) => l.anillo));
  const [izq, arriba, ancho, alto] = v.viewBox.split(" ").map(Number);

  it("usa coordenadas relativas, porque el SVG no dibuja las absolutas de Web Mercator", () => {
    expect([izq, arriba]).toEqual([0, 0]);
    for (const m of v.mosaicos) expect(Math.abs(m.x)).toBeLessThan(2000);
  });

  it("es de 16:9 y el lote entero queda adentro", () => {
    expect(ancho / alto).toBeCloseTo(16 / 9, 5);
    for (const [x, y] of v.contorno) {
      expect(x).toBeGreaterThan(izq);
      expect(x).toBeLessThan(izq + ancho);
      expect(y).toBeGreaterThan(arriba);
      expect(y).toBeLessThan(arriba + alto);
    }
  });

  it("los mosaicos cubren todo el recuadro, del servicio del mapa", () => {
    expect(Math.min(...v.mosaicos.map((m) => m.x))).toBeLessThanOrEqual(izq);
    expect(Math.max(...v.mosaicos.map((m) => m.x + m.lado))).toBeGreaterThanOrEqual(izq + ancho);
    expect(Math.min(...v.mosaicos.map((m) => m.y))).toBeLessThanOrEqual(arriba);
    expect(Math.max(...v.mosaicos.map((m) => m.y + m.lado))).toBeGreaterThanOrEqual(arriba + alto);
    for (const m of v.mosaicos) expect(m.href).toMatch(/^https:\/\/server\.arcgisonline\.com\/.+\/tile\/17\/\d+\/\d+$/);
  });

  it("solo trae los vecinos que se ven", () => {
    expect(v.vecinos.length).toBeLessThan(resto.length);
    expect(v.vecinos.length).toBeGreaterThan(0);
  });
});
