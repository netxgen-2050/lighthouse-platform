import { describe, expect, it } from "vitest";
import { listarLotes } from "@/lib/territorios/loteo";
import {
  ESCENARIOS_COSTO,
  cobertura,
  coberturaDeEscenario,
  lotesDelSector,
  parteDelSectorPrivada,
} from "./escenarios";
import { MODELO_LOTES, aportePrimerAnio } from "./modelo";

describe("escenarios de costo del bien común", () => {
  it("son tres, con nombre, fuente y costo, en español e inglés", () => {
    expect(ESCENARIOS_COSTO.map((e) => e.nombre.es)).toEqual(["Arranque", "Simulación de octubre", "Alternativa alta"]);
    for (const e of ESCENARIOS_COSTO) {
      expect(e.fuente.es.trim()).toBeTruthy();
      expect(e.fuente.en.trim()).toBeTruthy();
      expect(e.nombre.en.trim()).toBeTruthy();
      expect(e.costoAnual).toBeGreaterThan(0);
    }
  });

  it("el escenario de la simulación de octubre es el presupuesto del módulo", () => {
    expect(ESCENARIOS_COSTO[1].costoAnual).toBe(MODELO_LOTES.presupuestoComunAnual);
  });

  it("ningún texto dice 'falta' ni da una cifra de faltante", () => {
    const todo = JSON.stringify(ESCENARIOS_COSTO).toLowerCase();
    expect(todo).not.toMatch(/falta|faltan|missing|shortfall/);
  });

  it("los costos van de menor a mayor", () => {
    const c = ESCENARIOS_COSTO.map((e) => e.costoAnual);
    expect([...c].sort((a, b) => a - b)).toEqual(c);
  });
});

describe("cobertura", () => {
  it("suma el aporte repartido en los años de venta y las expensas de todos los lotes", () => {
    const lotes = lotesDelSector();
    const c = cobertura({ costoAnual: 100_000, expensa: MODELO_LOTES.expensaAnual, lotes })!;
    expect(c.aporteAnual).toBe(aportePrimerAnio(lotes));
    expect(c.expensasAnual).toBe(lotes * MODELO_LOTES.expensaAnual);
    expect(c.duranteLaVenta).toBe(c.aporteAnual + c.expensasAnual);
    expect(c.fraccionDuranteLaVenta).toBeCloseTo(c.duranteLaVenta / 100_000, 10);
  });

  it("después de la venta solo quedan las expensas: el aporte no se repite", () => {
    const c = cobertura({ costoAnual: 100_000, expensa: 1_000, lotes: 10 })!;
    expect(c.despues).toBe(10_000);
    expect(c.despues).toBeLessThan(c.duranteLaVenta);
  });

  it("el resto es cero cuando la venta cubre todo y nunca es negativo", () => {
    const c = cobertura({ costoAnual: 1, expensa: 1_000, lotes: 10 })!;
    expect(c.restoDuranteLaVenta).toBe(0);
    expect(c.restoDespues).toBe(0);
    expect(c.fraccionDespues).toBeGreaterThan(1);
  });

  it("con un dato inválido da null (sin dato), nunca cero ni NaN", () => {
    for (const malo of [
      { costoAnual: 0, expensa: 1, lotes: 1 },
      { costoAnual: -5, expensa: 1, lotes: 1 },
      { costoAnual: 10, expensa: 1, lotes: 0 },
      { costoAnual: 10, expensa: -1, lotes: 1 },
      { costoAnual: Number.NaN, expensa: 1, lotes: 1 },
      { costoAnual: 10, expensa: Number.POSITIVE_INFINITY, lotes: 1 },
    ]) {
      expect(cobertura(malo)).toBeNull();
    }
  });

  it("cada escenario se calcula con los lotes del sector norte, sin los primeros 4", () => {
    expect(lotesDelSector()).toBe(listarLotes().filter((l) => l.grupo === "norte").length);
    for (const e of ESCENARIOS_COSTO) {
      const c = coberturaDeEscenario(e.id)!;
      expect(c.costoAnual).toBe(e.costoAnual);
      expect(c.expensasAnual).toBe(lotesDelSector() * MODELO_LOTES.expensaAnual);
    }
  });

  it("cuanto más alto el costo, menos cubre la venta", () => {
    const f = ESCENARIOS_COSTO.map((e) => coberturaDeEscenario(e.id)!.fraccionDuranteLaVenta);
    expect(f[0]).toBeGreaterThan(f[1]);
    expect(f[1]).toBeGreaterThan(f[2]);
  });
});

describe("parte del 7A que es privada", () => {
  it("sale del loteo y del polígono: es una fracción chica y positiva", () => {
    const p = parteDelSectorPrivada();
    expect(p).not.toBeNull();
    expect(p!).toBeGreaterThan(0);
    expect(p!).toBeLessThan(0.01);
  });
});
