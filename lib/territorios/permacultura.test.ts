import { describe, expect, it } from "vitest";
import { macrolote7 } from "./biopueblo";
import {
  CAPAS_PERMACULTURA,
  SELLOS_PERMACULTURA,
  buscarElementoPermacultura,
  elementosDeCapa,
  listarElementosPermacultura,
  puntosDe,
  resumenPermacultura,
} from "./permacultura";

describe("alternativa de permacultura", () => {
  const elementos = listarElementosPermacultura();

  it("ids únicos con prefijo pc- y capas conocidas", () => {
    expect(elementos.length).toBeGreaterThan(10);
    expect(new Set(elementos.map((e) => e.id)).size).toBe(elementos.length);
    for (const e of elementos) {
      expect(e.id.startsWith("pc-"), e.id).toBe(true);
      expect(CAPAS_PERMACULTURA).toContain(e.capa);
    }
    for (const c of CAPAS_PERMACULTURA) expect(elementosDeCapa(c).length, c).toBeGreaterThan(0);
  });

  it("textos en español y en inglés, no vacíos y distintos", () => {
    for (const e of elementos) {
      for (const campo of ["nombre", "zona", "descripcion"] as const) {
        expect(e.textos.es[campo].trim(), `${e.id}.es.${campo}`).not.toBe("");
        expect(e.textos.en[campo].trim(), `${e.id}.en.${campo}`).not.toBe("");
      }
      expect(e.textos.en.descripcion, e.id).not.toBe(e.textos.es.descripcion);
    }
  });

  it("los sellos existen: primera hectárea, núcleo y 4 clusters", () => {
    expect(SELLOS_PERMACULTURA).toHaveLength(6);
    for (const id of SELLOS_PERMACULTURA) expect(buscarElementoPermacultura(id), id).toBeDefined();
    expect(buscarElementoPermacultura("no-existe")).toBeUndefined();
  });

  it("todos los puntos caen en el recuadro del Macrolote 7", () => {
    const anillo = macrolote7().anillo;
    const lng = anillo.map((p) => p[0]);
    const lat = anillo.map((p) => p[1]);
    const margen = 0.002;
    for (const e of elementos) {
      for (const [x, y] of puntosDe(e.geometria)) {
        expect(x, e.id).toBeGreaterThanOrEqual(Math.min(...lng) - margen);
        expect(x, e.id).toBeLessThanOrEqual(Math.max(...lng) + margen);
        expect(y, e.id).toBeGreaterThanOrEqual(Math.min(...lat) - margen);
        expect(y, e.id).toBeLessThanOrEqual(Math.max(...lat) + margen);
      }
    }
  });

  it("solo los polígonos tienen superficie, y nunca es 0", () => {
    for (const e of elementos) {
      const poligono = e.geometria.type === "Polygon" || e.geometria.type === "MultiPolygon";
      if (poligono) expect(e.areaHa, e.id).toBeGreaterThan(0);
      else expect(e.areaHa, e.id).toBeUndefined();
    }
    expect(buscarElementoPermacultura("pc-hectarea-1")?.areaHa).toBeCloseTo(1, 0);
  });

  it("resumen: proporción ecológica de al menos 50 % y cuenca mayor que el macrolote", () => {
    const r = resumenPermacultura();
    expect(r.proporcionEcologica).toBeGreaterThanOrEqual(50);
    expect(r.cuencaHa).toBeGreaterThan(r.totalHa ?? Infinity);
    expect(r.metodo).toMatch(/Copernicus GLO-30/);
  });
});
