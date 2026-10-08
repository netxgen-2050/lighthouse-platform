import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { estadoMedidor, FACTOR_EVALUACION, rondaCompleta, semillasTiempo } from "./calculo";
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
  });
  it("las notas no cambian el factor: es 1,0 fijo", () => {
    expect(rondaCompleta(todas(5), 2)).toBe(true);
    expect(FACTOR_EVALUACION).toBe(1);
    expect(semillasTiempo(20, 50, FACTOR_EVALUACION)).toBe(150);
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
    const tiempo = (paso: number, horas: number) => ({
      tiempo: { rol: "facilitacion", descripcion: "Facilito las asambleas", horas, paso },
      aportes: [],
    });
    const guardado = (comunidades: object) => JSON.stringify({ pestana: "tiempo", comunidades });
    expect(pactoAceptado(guardado({ lighthouse: tiempo(1, 20) }))).toBeNull();
    expect(pactoAceptado(guardado({ lighthouse: tiempo(2, 20) }))).toEqual({ horas: 20, parteSemilla: 100 });
    expect(pactoAceptado("{")).toBeNull();
  });
  it("suma las horas de los pactos aceptados de todas las comunidades; los aportes en plata no entran", () => {
    const tiempo = (paso: number, horas: number) => ({
      tiempo: { rol: "jardineria", descripcion: "Huerta", horas, paso },
      aportes: [200],
    });
    const crudo = JSON.stringify({ comunidades: { lighthouse: tiempo(2, 10), agua: tiempo(2, 6), barda: tiempo(0, 40) } });
    expect(pactoAceptado(crudo)).toEqual({ horas: 16, parteSemilla: 100 });
  });
  it("el formato anterior (un solo pacto) ya no cuenta, y las horas fuera de rango se acotan", () => {
    expect(pactoAceptado(JSON.stringify({ paso: 2, horas: 20, parteSemilla: 50 }))).toBeNull();
    const enorme = { tiempo: { rol: "facilitacion", descripcion: "x", horas: 1e9, paso: 2 }, aportes: [] };
    expect(pactoAceptado(JSON.stringify({ comunidades: { lighthouse: enorme } }))).toEqual({ horas: 80, parteSemilla: 100 });
  });
  it("el pase", () => {
    expect(paseActivo(JSON.stringify({ pase: "brote" }))).toBe("brote");
    expect(paseActivo(JSON.stringify({ pase: null }))).toBeNull();
    expect(paseActivo("x")).toBeNull();
  });
});
