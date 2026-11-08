import { describe, expect, it } from "vitest";
import {
  AVANCE_DE_EJEMPLO,
  FARO_POR_M2,
  MONTO_MINIMO_USD,
  REPARTO,
  SUMINISTRO,
  TRAMOS,
  cotizar,
  disponiblePorTramo,
  faroDeGrupo,
  faroDeLote,
  reparto,
  totalPorTramo,
} from "./modelo";

describe("modelo del bien común", () => {
  it("el reparto suma 100 % y sus tokens suman el suministro", () => {
    expect(REPARTO.reduce((s, g) => s + g.pct, 0)).toBe(100);
    expect(reparto().reduce((s, g) => s + g.faro, 0)).toBe(SUMINISTRO);
  });

  it("los tramos suman lo que el reparto da a la venta temprana", () => {
    expect(TRAMOS.reduce((s, t) => s + t.cantidad, 0)).toBe(faroDeGrupo("venta"));
    expect(totalPorTramo()).toHaveLength(TRAMOS.length);
  });

  it("los precios de los tramos suben", () => {
    for (let i = 1; i < TRAMOS.length; i++) expect(TRAMOS[i].precio).toBeGreaterThan(TRAMOS[i - 1].precio);
  });

  it("faroDeLote usa los tokens por m² y no inventa un valor", () => {
    expect(faroDeLote(100)).toBe(100 * FARO_POR_M2);
    expect(faroDeLote(undefined)).toBeNull();
    expect(faroDeLote(0)).toBeNull();
  });

  it("cotizar parte del avance de ejemplo y se queda en el tramo 1 con un monto chico", () => {
    const c = cotizar(100);
    expect(c.ok).toBe(true);
    if (!c.ok) return;
    expect(c.tramos).toEqual([AVANCE_DE_EJEMPLO.tramo]);
    expect(c.faro).toBe(Math.floor(100 / TRAMOS[0].precio));
    expect(c.precioPromedio).toBeCloseTo(TRAMOS[0].precio, 10);
    expect(c.aporteAlTesoro).toBeCloseTo(10, 10);
  });

  it("cotizar cruza de tramo y el precio promedio queda entre los dos", () => {
    const resto = disponiblePorTramo()[0];
    const usd = resto * TRAMOS[0].precio + 1000;
    const c = cotizar(usd);
    expect(c.ok).toBe(true);
    if (!c.ok) return;
    expect(c.tramos).toEqual([0, 1]);
    expect(c.precioPromedio).toBeGreaterThan(TRAMOS[0].precio);
    expect(c.precioPromedio).toBeLessThan(TRAMOS[1].precio);
    expect(c.faro).toBe(Math.floor(resto + 1000 / TRAMOS[1].precio));
  });

  it("con un monto menor al mínimo dice monto mínimo, sin resultado", () => {
    expect(cotizar(MONTO_MINIMO_USD - 1)).toEqual({ ok: false, motivo: "monto-minimo" });
    expect(cotizar(Number.NaN)).toEqual({ ok: false, motivo: "invalido" });
  });

  it("si el monto supera todos los tramos, avisa el sobrante", () => {
    const c = cotizar(1e9);
    expect(c.ok).toBe(true);
    if (!c.ok) return;
    expect(c.tramos).toEqual([0, 1, 2, 3]);
    expect(c.sobrante).toBeGreaterThan(0);
  });
});
