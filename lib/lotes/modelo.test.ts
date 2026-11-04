import { describe, expect, it } from "vitest";
import { listarLotes, rangoDeSuperficies } from "@/lib/territorios/loteo";
import {
  MODELO_LOTES,
  VERSION_MODELO_LOTES,
  aniosQueCubreElAporte,
  aporteDe,
  aportePrimerAnio,
  aporteTotal,
  expensaParaCubrir,
  expensasTotales,
  leccionAporte,
  leccionExpensas,
  paquetePromedio,
  parteDelDuenoDe,
  precioCasa,
  precioLote,
  precioPaquete,
} from "./modelo";

// Los valores son los de NS_Tokenomics sim/RESULTS_lot_sale.md v0.2. Las cuentas que reciben la cantidad de lotes se
// prueban con 25 y 50 (la spec); lo que sale del loteo se lee del loteo, nunca se escribe a mano.

describe("versión", () => {
  it("declara fuente, versión y fecha", () => {
    expect(VERSION_MODELO_LOTES).toEqual({
      fuente: "NS_Tokenomics doc 31 y sim/lot_sale_sim.py",
      version: "v0.2",
      fecha: "2026-11-02",
    });
  });
});

describe("precio del lote según la superficie", () => {
  it("da 15.000 con 1.430 m², 40.000 con 2.798 m² y 40.000 con 3.000 m²", () => {
    expect(precioLote(1_430)).toBe(15_000);
    expect(precioLote(2_798)).toBe(40_000);
    expect(precioLote(3_000)).toBe(40_000);
  });

  it("queda en el mínimo por debajo del rango", () => {
    expect(precioLote(100)).toBe(15_000);
  });

  it("va de forma lineal entre los extremos", () => {
    const { m2Min, m2Max } = MODELO_LOTES.precioLote;
    expect(precioLote((m2Min + m2Max) / 2)).toBe(27_500);
  });

  it("sin superficie no hay precio", () => {
    expect(precioLote(undefined)).toBeNull();
    expect(precioLote(null)).toBeNull();
    expect(precioLote(Number.NaN)).toBeNull();
  });

  it("los extremos de superficie son los del loteo vigente", () => {
    const rango = rangoDeSuperficies();
    expect(rango).not.toBeNull();
    expect(MODELO_LOTES.precioLote.m2Min).toBe(rango!.min);
    expect(MODELO_LOTES.precioLote.m2Max).toBe(rango!.max);
  });

  it("el lote más chico del loteo cuesta el mínimo y el más grande, el máximo", () => {
    const rango = rangoDeSuperficies()!;
    expect(precioLote(rango.min)).toBe(MODELO_LOTES.precioLote.min);
    expect(precioLote(rango.max)).toBe(MODELO_LOTES.precioLote.max);
  });

  it("todos los lotes del loteo tienen precio dentro del rango", () => {
    for (const l of listarLotes()) {
      const p = precioLote(l.superficieM2);
      expect(p).not.toBeNull();
      expect(p!).toBeGreaterThanOrEqual(MODELO_LOTES.precioLote.min);
      expect(p!).toBeLessThanOrEqual(MODELO_LOTES.precioLote.max);
    }
  });
});

describe("casas y paquetes", () => {
  it("las tres casas dan 90.000, 238.000 y 500.000", () => {
    expect(precioCasa("modular")).toBe(90_000);
    expect(precioCasa("familiar")).toBe(238_000);
    expect(precioCasa("amplia")).toBe(500_000);
  });

  it("el paquete es lote más casa", () => {
    const lote = listarLotes()[0];
    const solo = precioLote(lote.superficieM2)!;
    expect(precioPaquete(lote.superficieM2, "solo-lote")).toBe(solo);
    expect(precioPaquete(lote.superficieM2, "familiar")).toBe(solo + 238_000);
  });

  it("sin superficie no hay paquete", () => {
    expect(precioPaquete(undefined, "familiar")).toBeNull();
  });

  it("el paquete promedio da 152.100", () => {
    expect(paquetePromedio()).toBe(152_100);
  });

  it("el aporte es el 5 % de lo que se paga, y la parte del dueño el 20 % del lote", () => {
    expect(aporteDe(10_000)).toBe(500);
    expect(parteDelDuenoDe(10_000)).toBe(2_000);
  });
});

describe("cuentas con 25 lotes", () => {
  it("dan los valores de RESULTS_lot_sale.md v0.2", () => {
    expect(aporteTotal(25)).toBe(190_125);
    expect(aportePrimerAnio(25)).toBe(63_375);
    expect(expensasTotales(25)).toBe(30_000);
    expect(expensaParaCubrir(25)).toBe(2_880);
    expect(aniosQueCubreElAporte(25)!).toBeCloseTo(2.64, 2);
  });

  it("con 10 y 50 lotes coinciden con la tabla de la fuente", () => {
    expect(aporteTotal(10)).toBe(76_050);
    expect(aporteTotal(50)).toBe(380_250);
    expect(expensaParaCubrir(10)).toBe(7_200);
    expect(expensaParaCubrir(50)).toBe(1_440);
  });

  it("con cero lotes o menos, sin dato (null), nunca un error ni infinito", () => {
    for (const f of [aporteTotal, aportePrimerAnio, expensasTotales, expensaParaCubrir, aniosQueCubreElAporte]) {
      expect(f(0)).toBeNull();
      expect(f(-3)).toBeNull();
    }
    expect(leccionAporte(0, "es")).toBeNull();
    expect(leccionExpensas(0, "en")).toBeNull();
  });

  it("la cantidad del loteo vigente da cuentas finitas", () => {
    const n = listarLotes().length;
    expect(Number.isFinite(aporteTotal(n)!)).toBe(true);
    expect(Number.isFinite(expensaParaCubrir(n)!)).toBe(true);
  });
});

describe("lección del aporte", () => {
  it("con 25 lotes dice que no alcanza y que no se repite", () => {
    const es = leccionAporte(25, "es")!;
    expect(es).toContain("USD 190.125");
    expect(es).toContain("USD 63.375");
    expect(es).toContain("USD 72.000");
    expect(es).toContain("no alcanza");
    expect(es).toContain("no se repite");
  });

  it("con 50 lotes dice cuántos años paga y que no se repite", () => {
    const es = leccionAporte(50, "es")!;
    expect(es).toContain("USD 380.250");
    expect(es).toContain("paga 5,3 años");
    expect(es).toContain("no se repite");
    expect(es).not.toContain("no alcanza");
  });

  it("existe en inglés, con los mismos valores", () => {
    const en25 = leccionAporte(25, "en")!;
    expect(en25).toContain("USD 63.375");
    expect(en25).toContain("not enough");
    expect(en25).toContain("not repeated");
    const en50 = leccionAporte(50, "en")!;
    expect(en50).toContain("5.3 years");
    expect(en50).not.toContain("not enough");
  });
});

describe("lección de las expensas", () => {
  it("con 25 lotes dice USD 2.880 y la expensa de ejemplo USD 1.200", () => {
    const es = leccionExpensas(25, "es")!;
    expect(es).toContain("USD 2.880");
    expect(es).toContain("USD 1.200");
  });

  it("existe en inglés", () => {
    const en = leccionExpensas(25, "en")!;
    expect(en).toContain("USD 2.880");
    expect(en).toContain("USD 1.200");
    expect(en).toContain("per lot per year");
  });
});
