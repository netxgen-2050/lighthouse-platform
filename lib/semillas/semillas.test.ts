import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { estadoMedidor, factorEvaluacion, rondaCompleta, semillasTiempo } from "./calculo";
import { COMPANEROS, META_SEMBRADOR } from "./datos";
import { leerRonda, paseActivo, pactoAceptado, ponerNota, RONDA_INICIAL } from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");

describe("datos del mock-up", () => {
  it("la meta y los compañeros salen de V.semillas", () => {
    expect(META_SEMBRADOR).toBe(120);
    expect(mock).toContain('meter("Semillas de tiempo en 3 meses",tot,120,"gold")');
    for (const c of COMPANEROS) expect(mock).toContain(`["${c.nombre}","${c.rol}"]`);
  });
});

describe("medidor", () => {
  it("20 h/mes al 50 % son 150 semillas en 3 meses: lista", () => {
    expect(semillasTiempo(20, 50)).toBe(150);
    expect(estadoMedidor(150)).toBe("Lista");
  });
  it("10 h/mes al 50 % son 75: en camino", () => {
    expect(semillasTiempo(10, 50)).toBe(75);
    expect(estadoMedidor(75)).toBe("En camino");
  });
  it("el factor de evaluación multiplica", () => {
    expect(semillasTiempo(20, 50, 0.5)).toBe(75);
  });
});

describe("ronda de reconocimiento", () => {
  const todas = (n: number) => ({ "0|rol": n, "0|cultura": n, "1|rol": n, "1|cultura": n });
  it("sin las cuatro notas no hay factor", () => {
    expect(rondaCompleta({ "0|rol": 3 }, 2)).toBe(false);
    expect(factorEvaluacion({ "0|rol": 3 }, 2)).toBeNull();
  });
  it("3 de 5 es neutro: 1,0; 5 de 5 sube y 1 de 5 baja", () => {
    expect(factorEvaluacion(todas(3), 2)).toBe(1);
    expect(factorEvaluacion(todas(5), 2)).toBe(1.67);
    expect(factorEvaluacion(todas(1), 2)).toBe(0.33);
  });
  it("las notas fuera de 1 a 5 se ignoran y enviada no se edita", () => {
    expect(ponerNota(RONDA_INICIAL, 0, "rol", 6)).toBe(RONDA_INICIAL);
    expect(ponerNota({ notas: {}, enviada: true }, 0, "rol", 3).notas).toEqual({});
    expect(ponerNota(RONDA_INICIAL, 0, "rol", 4).notas).toEqual({ "0|rol": 4 });
  });
  it("leer descarta lo raro", () => {
    expect(leerRonda("no es json")).toEqual(RONDA_INICIAL);
    expect(leerRonda(JSON.stringify({ notas: { "0|rol": 9, "x": 3, "1|cultura": 2 }, enviada: true }))).toEqual({
      notas: { "1|cultura": 2 },
      enviada: true,
    });
  });
});

describe("lectura de otras pantallas", () => {
  it("el pacto cuenta solo si está aceptado", () => {
    expect(pactoAceptado(null)).toBeNull();
    expect(pactoAceptado(JSON.stringify({ paso: 1, horas: 20, parteSemilla: 50 }))).toBeNull();
    expect(pactoAceptado(JSON.stringify({ paso: 2, horas: 20, parteSemilla: 50 }))).toEqual({ horas: 20, parteSemilla: 50 });
    expect(pactoAceptado("{")).toBeNull();
  });
  it("el pase", () => {
    expect(paseActivo(JSON.stringify({ pase: "brote" }))).toBe("brote");
    expect(paseActivo(JSON.stringify({ pase: null }))).toBeNull();
    expect(paseActivo("x")).toBeNull();
  });
});
