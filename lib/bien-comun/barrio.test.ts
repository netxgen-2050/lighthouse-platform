import { describe, expect, it } from "vitest";
import {
  ENTRADAS_DE_PARTIDA,
  alComunPorAnio,
  camposInvalidos,
  cobrandoConLasCuotas,
  cobrosPorMes,
  coberturaAFechaFija,
  montoALevantar,
  parteDelPresupuestoQueCubren,
  parteQueQuedaEnElFideicomiso,
  type Entradas,
} from "./barrio";

// Casos tomados de `NS_Tokenomics/sim/RESULTS_barrio_stack.md` (v0.1, 2026-11-19).
const base = ENTRADAS_DE_PARTIDA;
const con = (c: Partial<Entradas>): Entradas => ({ ...base, ...c });
const ok = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error("se esperaba ok");
  return r as Extract<T, { ok: true }>;
};

describe("barrio: cálculo fiel al simulador", () => {
  it("los valores de partida son el caso base", () => {
    expect(base).toEqual({ precioLote: 27_500, ritmo: 2, cuotas: 24, infraestructuraPorLote: 12_000, prima: 0.1 });
  });

  it("monto a levantar: 317.200", () => {
    expect(Math.round(ok(montoALevantar(base)).valor)).toBe(317_200);
  });

  it("caso base cobrando con las cuotas: mes 48, 384.382 recibidos, 8.318 sobrantes", () => {
    const r = ok(cobrandoConLasCuotas(base));
    expect(r.mes).toBe(48);
    expect(Math.round(r.totalRecibido)).toBe(384_382);
    expect(Math.round(r.sobranteFideicomiso)).toBe(8_318);
  });

  it("lotes a 40.000: mes 29", () => {
    expect(ok(cobrandoConLasCuotas(con({ precioLote: 40_000 }))).mes).toBe(29);
  });

  it("1 lote por trimestre: no cierra en el horizonte (mes null)", () => {
    expect(ok(cobrandoConLasCuotas(con({ ritmo: 1 }))).mes).toBeNull();
  });

  it("contado, 2 por trimestre, 27.500: mes 27", () => {
    expect(ok(cobrandoConLasCuotas(con({ cuotas: 0 }))).mes).toBe(27);
  });

  it("otras celdas de la tabla del simulador: 36 cuotas no cierra; 3 por trimestre y 12 cuotas, mes 24", () => {
    expect(ok(cobrandoConLasCuotas(con({ cuotas: 36 }))).mes).toBeNull();
    expect(ok(cobrandoConLasCuotas(con({ ritmo: 3, cuotas: 12 }))).mes).toBe(24);
    expect(ok(cobrandoConLasCuotas(con({ ritmo: 5, cuotas: 0, precioLote: 40_000 }))).mes).toBe(6);
  });

  it("cobertura a fecha fija: 21 % a 12 meses y 53 % a 24 (caso base)", () => {
    expect(Math.round(ok(coberturaAFechaFija(base, 12)).valor * 100)).toBe(21);
    expect(Math.round(ok(coberturaAFechaFija(base, 24)).valor * 100)).toBe(53);
  });

  it("al común, caso base: seis años como en el simulador", () => {
    const filas = ok(alComunPorAnio(base)).filas;
    expect(filas.map((f) => Math.round(f.total))).toEqual([12_700, 26_150, 34_275, 29_600, 25_750, 25_200]);
    expect(filas.map((f) => f.lotesVendidos)).toEqual([10, 18, 21, 21, 21, 21]);
    expect(filas.map((f) => Math.round(f.parteDeLosPagos))).toEqual([5_500, 9_350, 9_075, 4_400, 550, 0]);
  });

  it("la parte que queda en el fideicomiso es 0,68 y las expensas cubren el 35 % del presupuesto", () => {
    expect(parteQueQuedaEnElFideicomiso()).toBeCloseTo(0.68, 10);
    expect(Math.round(parteDelPresupuestoQueCubren() * 100)).toBe(35);
  });

  it("los cobros suman el precio de los 21 lotes en el caso base", () => {
    const pagos = ok(cobrosPorMes(base)).valor;
    expect(pagos).toHaveLength(73);
    expect(Math.round(pagos.reduce((s, x) => s + x, 0))).toBe(21 * 27_500);
  });
});

describe("barrio: entradas inválidas", () => {
  const malas: [string, Partial<Entradas>][] = [
    ["precio vacío (NaN)", { precioLote: NaN }],
    ["precio negativo", { precioLote: -1 }],
    ["precio cero", { precioLote: 0 }],
    ["ritmo cero", { ritmo: 0 }],
    ["ritmo no entero", { ritmo: 1.5 }],
    ["cuotas no enteras", { cuotas: 2.5 }],
    ["cuotas negativas", { cuotas: -1 }],
    ["infraestructura negativa", { infraestructuraPorLote: -5 }],
    ["prima negativa", { prima: -0.1 }],
    ["infinito", { precioLote: Infinity }],
  ];
  it.each(malas)("%s devuelve ok: false en todo", (_n, c) => {
    const e = con(c);
    expect(montoALevantar(e).ok).toBe(false);
    expect(cobrosPorMes(e).ok).toBe(false);
    expect(cobrandoConLasCuotas(e).ok).toBe(false);
    expect(coberturaAFechaFija(e, 12).ok).toBe(false);
    expect(alComunPorAnio(e).ok).toBe(false);
  });

  it("dice qué campo revisar", () => {
    expect(camposInvalidos(con({ precioLote: NaN, cuotas: 1.5 }))).toEqual(["precioLote", "cuotas"]);
    expect(camposInvalidos(base)).toEqual([]);
  });

  it("cuotas 0 (contado) y prima 0 son válidas", () => {
    expect(camposInvalidos(con({ cuotas: 0, prima: 0 }))).toEqual([]);
  });
});
