import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  agregar,
  costo,
  costoReparto,
  ordenar,
  porcentajes,
  repartirPresupuesto,
  validarReparto,
  type Reglas,
} from "./motor";

const reglas: Reglas = { creditos: 100, opciones: ["a", "b", "c"], votosEnContra: false };

describe("costo", () => {
  test("tres votos cuestan 9", () => {
    expect(costo(3)).toBe(9);
    expect(costo(-3)).toBe(9);
  });
  test("reparto completo 5, 5 y 3 cuesta 59 y quedan 41", () => {
    const r = { a: 5, b: 5, c: 3 };
    expect(costoReparto(r)).toBe(59);
    expect(validarReparto(reglas, r)).toEqual({ ok: true, usados: 59, restantes: 41 });
  });
});

describe("validarReparto", () => {
  test("se pasa de los créditos", () => {
    expect(validarReparto(reglas, { a: 7, b: 7, c: 2 })).toEqual({ ok: false, motivos: ["excede-creditos"] });
  });
  test("con votos en contra apagados rechaza -2", () => {
    expect(validarReparto(reglas, { a: -2 })).toEqual({ ok: false, motivos: ["en-contra-no-permitido"] });
  });
  test("con votos en contra permitidos, -2 y 4 cuestan 20", () => {
    expect(validarReparto({ ...reglas, votosEnContra: true }, { a: -2, b: 4 })).toEqual({ ok: true, usados: 20, restantes: 80 });
  });
  test("opción ajena y no entero", () => {
    expect(validarReparto(reglas, { z: 1 })).toEqual({ ok: false, motivos: ["opcion-ajena"] });
    expect(validarReparto(reglas, { a: 1.5 })).toEqual({ ok: false, motivos: ["no-entero"] });
  });
  test("todo en 0 es válido", () => {
    expect(validarReparto(reglas, { a: 0, b: 0 })).toEqual({ ok: true, usados: 0, restantes: 100 });
    expect(validarReparto(reglas, {})).toEqual({ ok: true, usados: 0, restantes: 100 });
  });
});

describe("agregar, porcentajes y ordenar", () => {
  test("dos personas: 6/3/1 con 2, 2 y 1 personas", () => {
    const ag = agregar(["a", "b", "c"], [{ a: 4, b: 2 }, { a: 2, b: 1, c: 1 }]);
    expect(ag).toEqual([
      { opcion: "a", neto: 6, apoyos: 2, enContra: 0 },
      { opcion: "b", neto: 3, apoyos: 2, enContra: 0 },
      { opcion: "c", neto: 1, apoyos: 1, enContra: 0 },
    ]);
  });
  test("cuenta las personas en contra", () => {
    const ag = agregar(["a"], [{ a: -2 }, { a: 3 }]);
    expect(ag[0]).toEqual({ opcion: "a", neto: 1, apoyos: 1, enContra: 1 });
  });
  test("60/30/10", () => {
    expect(porcentajes(agregar(["a", "b", "c"], [{ a: 6, b: 3, c: 1 }]))).toEqual({ a: 60, b: 30, c: 10 });
  });
  test("por resto mayor suman 100", () => {
    const p = porcentajes([
      { opcion: "a", neto: 1, apoyos: 1, enContra: 0 },
      { opcion: "b", neto: 1, apoyos: 1, enContra: 0 },
      { opcion: "c", neto: 1, apoyos: 1, enContra: 0 },
    ])!;
    expect(Object.values(p).reduce((x, y) => x + y, 0)).toBe(100);
    expect(p).toEqual({ a: 34, b: 33, c: 33 });
  });
  test("neto negativo o cero muestra 0 %", () => {
    expect(porcentajes(agregar(["a", "b"], [{ a: 2, b: -1 }]))).toEqual({ a: 100, b: 0 });
  });
  test("sin votos es sin dato (null), no 0", () => {
    expect(porcentajes(agregar(["a", "b"], []))).toBeNull();
    expect(porcentajes(agregar(["a", "b"], [{ a: -1 }]))).toBeNull();
  });
  test("empate: B con más personas va antes que A", () => {
    const ordenado = ordenar([
      { opcion: "a", neto: 5, apoyos: 1, enContra: 0 },
      { opcion: "b", neto: 5, apoyos: 3, enContra: 0 },
      { opcion: "c", neto: 5, apoyos: 3, enContra: 0 },
    ]);
    expect(ordenado.map((f) => f.opcion)).toEqual(["b", "c", "a"]);
  });
});

const USD = 100;
const opciones = (pesos: number[], extra: Record<number, { topeCentavos?: number; pisoCentavos?: number }> = {}) =>
  pesos.map((peso, i) => ({ id: "abc"[i], peso, ...extra[i] }));

describe("repartirPresupuesto", () => {
  const monto = 10_000 * USD;

  test("proporcional sin tope ni piso", () => {
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([6, 3, 1]) });
    expect(r.partes).toEqual({ a: 600_000, b: 300_000, c: 100_000 });
    expect(r.sinAsignar).toBe(0);
    expect(r.avisos).toEqual([]);
  });
  test("tope", () => {
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([6, 3, 1], { 0: { topeCentavos: 5_000 * USD } }) });
    expect(r.partes).toEqual({ a: 500_000, b: 375_000, c: 125_000 });
    expect(r.sinAsignar).toBe(0);
  });
  test("piso", () => {
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([6, 3, 1], { 2: { pisoCentavos: 2_000 * USD } }) });
    expect(r.partes).toEqual({ a: 533_333, b: 266_667, c: 200_000 });
    expect(r.sinAsignar).toBe(0);
  });
  test("todos topados dejan USD 7.000 sin asignar", () => {
    const tope = { topeCentavos: 1_000 * USD };
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([6, 3, 1], { 0: tope, 1: tope, 2: tope }) });
    expect(r.partes).toEqual({ a: 100_000, b: 100_000, c: 100_000 });
    expect(r.sinAsignar).toBe(700_000);
  });
  test("pisos imposibles: no se aplican y avisa", () => {
    const piso = { pisoCentavos: 6_000 * USD };
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([6, 3, 1], { 1: piso, 2: piso }) });
    expect(r.avisos).toEqual(["pisos-imposibles"]);
    expect(r.partes).toEqual({ a: 600_000, b: 300_000, c: 100_000 });
  });
  test("opciones sin votos positivos reciben 0", () => {
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([3, 0, -2]) });
    expect(r.partes).toEqual({ a: 1_000_000, b: 0, c: 0 });
  });
  test("monto null: todo sin dato", () => {
    const r = repartirPresupuesto({ montoCentavos: null, opciones: opciones([6, 3, 1]) });
    expect(r.partes).toEqual({ a: null, b: null, c: null });
    expect(r.sinAsignar).toBeNull();
  });
  test("sin votos: todo sin dato, no 0", () => {
    const r = repartirPresupuesto({ montoCentavos: monto, opciones: opciones([0, 0, 0]) });
    expect(r.partes).toEqual({ a: null, b: null, c: null });
    expect(r.sinAsignar).toBeNull();
  });
  test("propiedad: las partes más lo sin asignar suman exactamente el monto", () => {
    let semilla = 12345;
    const azar = (n: number) => {
      semilla = (semilla * 1103515245 + 12345) % 2147483648;
      return semilla % n;
    };
    for (let i = 0; i < 300; i++) {
      const n = 1 + azar(6);
      const ops = Array.from({ length: n }, (_, k) => ({
        id: `o${k}`,
        peso: azar(9),
        topeCentavos: azar(3) === 0 ? azar(500_000) : undefined,
        pisoCentavos: azar(3) === 0 ? azar(100_000) : undefined,
      }));
      const montoCentavos = azar(2_000_000);
      const r = repartirPresupuesto({ montoCentavos, opciones: ops });
      if (r.sinAsignar === null) continue;
      const suma = Object.values(r.partes).reduce<number>((s, v) => s + (v ?? 0), 0);
      expect(suma + r.sinAsignar).toBe(montoCentavos);
    }
  });
});

test("lib/cuadratico no importa de lib/fogon, react ni next", () => {
  const carpeta = __dirname;
  const fuentes = readdirSync(carpeta).filter((n) => /\.tsx?$/.test(n) && !n.endsWith(".test.ts"));
  expect(fuentes.length).toBeGreaterThan(0);
  for (const f of fuentes) {
    const texto = readFileSync(path.join(carpeta, f), "utf8");
    expect(texto).not.toMatch(/from\s+["'](@\/lib\/fogon|react|react-dom|next)(\/[^"']*)?["']/);
  }
});
