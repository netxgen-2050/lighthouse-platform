import { describe, expect, it } from "vitest";
import { cajaPorMes, semillasPorMes } from "./calculo";
import { HOUR_REF_ARS, HOUR_REF_USD, USD_ARS } from "./datos";
import { CLAVE_PACTOS, INICIAL, leer, reducir } from "./estado";

describe("cálculo", () => {
  it("el valor hora sale del mock-up", () => {
    expect(HOUR_REF_ARS).toBe(7049);
    expect(HOUR_REF_USD).toBeCloseTo(7049 / USD_ARS, 10);
  });
  it("10 h al 50 % son 25 semillas; 20 h son el doble", () => {
    expect(semillasPorMes(10, 50)).toBe(25);
    expect(semillasPorMes(20, 50)).toBe(50);
  });
  it("la evaluación entre pares multiplica (1,0 por defecto)", () => {
    expect(semillasPorMes(10, 100, 0.5)).toBe(Math.round(semillasPorMes(10, 100) / 2));
  });
  it("la caja es lo que no se aporta como semilla", () => {
    expect(cajaPorMes(10, 100)).toBe(0);
    expect(cajaPorMes(10, 0)).toBeCloseTo(10 * HOUR_REF_USD, 10);
  });
});

describe("estado", () => {
  it("arranca en borrador, pestaña tiempo", () => {
    expect(INICIAL.paso).toBe(0);
    expect(INICIAL.pestana).toBe("tiempo");
  });
  it("avanza Borrador, En revisión, Aceptado y ahí se queda", () => {
    let e = reducir(INICIAL, { tipo: "avanzar" });
    expect(e.paso).toBe(1);
    e = reducir(e, { tipo: "avanzar" });
    expect(e.paso).toBe(2);
    expect(reducir(e, { tipo: "avanzar" }).paso).toBe(2);
  });
  it("acota horas y parte a los pasos del control", () => {
    expect(reducir(INICIAL, { tipo: "horas", horas: 1000 }).horas).toBe(80);
    expect(reducir(INICIAL, { tipo: "horas", horas: 11 }).horas % 2).toBe(0);
    expect(reducir(INICIAL, { tipo: "parte", parteSemilla: -5 }).parteSemilla).toBe(0);
  });
  it("lee lo guardado y descarta lo raro", () => {
    const e = reducir(reducir(INICIAL, { tipo: "avanzar" }), { tipo: "avanzar" });
    expect(leer(JSON.stringify(e))).toEqual(e);
    expect(leer("no es json")).toEqual(INICIAL);
    expect(leer(null)).toEqual(INICIAL);
    expect(leer(JSON.stringify({ paso: 9, horas: "x" }))).toEqual(INICIAL);
  });
  it("la clave guardada no cambia", () => {
    expect(CLAVE_PACTOS).toBe("lh-pactos");
  });
});
