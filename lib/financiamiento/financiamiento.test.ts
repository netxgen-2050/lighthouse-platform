import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  COMISION_DESARROLLO,
  CONSUMO_MENSUAL_USD,
  CONTRATO_DISENO_BIOPUEBLO_USD,
  META_SAFE_USD,
  SUPUESTO_CONGRESO,
  VERSIONES,
} from "./fuentes";
import { JUEGO_A, JUEGO_B, PALABRAS_QUE_NO_VAN, PROCOMUN_EN_SIMPLE } from "./juegos";
import { PALANCAS } from "./palancas";
import {
  ESCENARIOS_PLATAFORMA,
  IDS_PLATAFORMA,
  correrPlataforma,
  recaudacionPase,
  redondearComoPython,
} from "./plataforma";
import { capitalNecesario, comisionDesarrollo, usdMillones } from "./pista";
import { MONTE_CARLO, SUPUESTOS_MONTE_CARLO } from "./riesgo";
import { armarResumen } from "./resumen";

describe("fuentes", () => {
  test("cada constante tiene fuente", () => {
    for (const c of [CONSUMO_MENSUAL_USD, META_SAFE_USD, COMISION_DESARROLLO, CONTRATO_DISENO_BIOPUEBLO_USD]) {
      expect(c.fuente.trim()).toBeTruthy();
    }
    expect(CONSUMO_MENSUAL_USD.aConfirmar).toBe("Vagner");
    expect(SUPUESTO_CONGRESO).toContain("I-15");
  });
  test("el contrato de diseño no tiene monto (null, no 0)", () => {
    expect(CONTRATO_DISENO_BIOPUEBLO_USD.valor).toBeNull();
  });
  test("las tres versiones son v0.1 del 2026-10-17", () => {
    for (const v of Object.values(VERSIONES)) {
      expect(v.version).toBe("v0.1");
      expect(v.fecha).toBe("2026-10-17");
    }
  });
});

describe("plataforma", () => {
  // Fuente: NS_Tokenomics/sim/RESULTS_platform_revenue.md (v0.1, 2026-10-17). [mes, usuarios, pagan, tribus, ingreso, % consumo]
  const FILAS: Record<string, [number, number, number, number, number, number][]> = {
    bajo: [
      [12, 600, 14, 2, 245, 0.008],
      [24, 900, 17, 4, 396, 0.013],
      [36, 1200, 20, 6, 537, 0.017],
    ],
    base: [
      [12, 1220, 50, 4, 689, 0.022],
      [24, 1940, 68, 8, 1094, 0.035],
      [36, 2660, 82, 10, 1336, 0.043],
    ],
    bueno: [
      [12, 2240, 134, 6, 1569, 0.051],
      [24, 3680, 196, 12, 2483, 0.08],
      [36, 5120, 244, 16, 3157, 0.102],
    ],
  };
  const TOTALES: Record<string, [number, number]> = { bajo: [11659, 0.4], base: [31478, 1.0], bueno: [72323, 2.3] };

  for (const id of IDS_PLATAFORMA) {
    test(`${id}: las filas de los meses 12, 24 y 36`, () => {
      const r = correrPlataforma(ESCENARIOS_PLATAFORMA[id]);
      for (const [mes, usuarios, pagan, tribus, ingreso, pct] of FILAS[id]) {
        const f = r.filas[mes - 1];
        expect(f.usuarios).toBe(usuarios);
        expect(f.tribus).toBe(tribus);
        expect(Math.abs(f.pagan - pagan)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(f.ingreso - ingreso)).toBeLessThanOrEqual(0.5);
        expect(Math.abs((f.pctConsumo ?? NaN) - pct)).toBeLessThanOrEqual(0.0005);
      }
    });
    test(`${id}: el total de 36 meses`, () => {
      const r = correrPlataforma(ESCENARIOS_PLATAFORMA[id]);
      expect(Math.abs(r.total - TOTALES[id][0])).toBeLessThanOrEqual(1);
      expect(Math.abs((r.mesesCubiertos ?? NaN) - TOTALES[id][1])).toBeLessThanOrEqual(0.05);
    });
  }

  test("redondearComoPython manda la mitad al par", () => {
    expect(redondearComoPython(0.5)).toBe(0);
    expect(redondearComoPython(1.5)).toBe(2);
    expect(redondearComoPython(2.5)).toBe(2);
    expect(redondearComoPython(3.5)).toBe(4);
    expect(redondearComoPython(2.4)).toBe(2);
  });

  test("Pase Fundador: 49.500 / 96.000 / 171.000 y va al procomún", () => {
    expect(recaudacionPase("bajo")).toMatchObject({ recaudado: 49500, alcanzaMinimo: false, destino: "procomun" });
    expect(recaudacionPase("base")).toMatchObject({ recaudado: 96000, alcanzaMinimo: true });
    expect(recaudacionPase("bueno")).toMatchObject({ recaudado: 171000, alcanzaMinimo: true });
  });
});

describe("pista", () => {
  test("capital necesario", () => {
    expect(capitalNecesario(31000, 0.015)).toBeCloseTo(24_800_000, 2);
    expect(capitalNecesario(31000, 0.01)).toBeCloseTo(37_200_000, 2);
    expect(capitalNecesario(31000, 0)).toBeNull();
    expect(capitalNecesario(31000, -0.01)).toBeNull();
    expect(capitalNecesario(null, 0.015)).toBeNull();
    expect(capitalNecesario(31000, null)).toBeNull();
    expect(capitalNecesario(31000, Number.NaN)).toBeNull();
  });
  test("comisión de desarrollo", () => {
    const c = comisionDesarrollo(4_000_000);
    expect(c?.min).toBeCloseTo(120_000, 2);
    expect(c?.max).toBeCloseTo(200_000, 2);
    expect(comisionDesarrollo(0)).toBeNull();
    expect(comisionDesarrollo(Number.NaN)).toBeNull();
    expect(comisionDesarrollo(null)).toBeNull();
  });
  test("usdMillones", () => {
    expect(usdMillones(24_800_000)).toBe("USD 24,8 M");
    expect(usdMillones(37_200_000)).toBe("USD 37,2 M");
    expect(usdMillones(null)).toBe("sin dato");
    expect(usdMillones(Number.NaN)).toBe("sin dato");
  });
});

describe("riesgo (Monte Carlo copiado, ADR-014)", () => {
  // Segunda entrada, copiada por separado de NS_Tokenomics/sim/RESULTS_series_montecarlo.md (v0.1, N = 2000, semilla 7).
  test("la tabla coincide con el RESULTS", () => {
    expect(MONTE_CARLO.vinedo.tirUnidades).toEqual({ p10: -0.026, p50: 0.084, p90: 0.108 });
    expect(MONTE_CARLO.vinedo.fundacionRecibe).toEqual({ p10: 115739, p50: 160220, p90: 1332549 });
    expect(MONTE_CARLO.vinedo.multiploPrimeraPerdida).toEqual({ p10: 0, p50: 0, p90: 1.8 });
    expect([MONTE_CARLO.vinedo.pPierden, MONTE_CARLO.vinedo.pLleganAlTope, MONTE_CARLO.vinedo.pPrimeraNoSeRecupera]).toEqual([
      0.22, 0.44, 0.6,
    ]);
    expect(MONTE_CARLO.agrovoltaica.tirUnidades).toEqual({ p10: 0.012, p50: 0.085, p90: 0.14 });
    expect(MONTE_CARLO.agrovoltaica.fundacionRecibe).toEqual({ p10: 401326, p50: 540348, p90: 5948468 });
    expect(MONTE_CARLO.agrovoltaica.multiploPrimeraPerdida).toEqual({ p10: 0, p50: 0, p90: 2.33 });
    expect([
      MONTE_CARLO.agrovoltaica.pPierden,
      MONTE_CARLO.agrovoltaica.pLleganAlTope,
      MONTE_CARLO.agrovoltaica.pPrimeraNoSeRecupera,
    ]).toEqual([0.1, 0.42, 0.61]);
  });
  test("P10 ≤ P50 ≤ P90 y probabilidades en [0, 1]", () => {
    for (const fila of Object.values(MONTE_CARLO)) {
      for (const p of [fila.tirUnidades, fila.fundacionRecibe, fila.multiploPrimeraPerdida]) {
        expect(p.p10).toBeLessThanOrEqual(p.p50);
        expect(p.p50).toBeLessThanOrEqual(p.p90);
      }
      for (const x of [fila.pPierden, fila.pLleganAlTope, fila.pPrimeraNoSeRecupera]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      }
    }
    expect(SUPUESTOS_MONTE_CARLO.vinedo).toContain("Vagner");
  });
});

describe("juegos y palancas", () => {
  test("tienen fuente", () => {
    expect(JUEGO_A.fuente).toBeTruthy();
    expect(JUEGO_B.fuente).toBeTruthy();
    for (const p of PALANCAS) expect(p.fuente.trim()).toBeTruthy();
  });
  test("cuatro palancas con los ids esperados", () => {
    expect(PALANCAS.map((p) => p.id)).toEqual(["capital", "membresias", "primeraPerdida", "contratoDiseno"]);
  });
  test("las palancas no traen cifras", () => {
    for (const p of PALANCAS) for (const t of [p.numero, p.supuesto, p.direccion]) expect(t).not.toMatch(/\d/);
  });
  test("ningún texto usa una palabra que no va", () => {
    const textos = [
      JUEGO_A.titulo,
      JUEGO_A.idea,
      ...JUEGO_A.costos,
      JUEGO_B.titulo,
      JUEGO_B.idea,
      ...JUEGO_B.suma,
      PROCOMUN_EN_SIMPLE,
      ...PALANCAS.flatMap((p) => [p.numero, p.supuesto, p.direccion, p.fuente]),
    ].map((t) => t.toLowerCase());
    for (const t of textos) for (const palabra of PALABRAS_QUE_NO_VAN) expect(t).not.toContain(palabra.toLowerCase());
  });
  test("los juegos dicen dónde queda la tierra", () => {
    expect(JSON.stringify(JUEGO_A).toLowerCase()).toContain("la tierra se va");
    expect(JSON.stringify(JUEGO_B).toLowerCase()).toContain("la tierra queda");
  });
});

describe("armarResumen", () => {
  const r = armarResumen();
  test("viñedo", () => {
    expect(Math.abs(r.procomun.vinedo.total - 306970)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.reparto.vinedo.find((x) => x.destino === "netx")!.monto! - 128250)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.netx.gestionAnual.vinedo - 8550)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.reparto.vinedo.find((x) => x.destino === "unidades")!.monto! - 1290250)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.inversores.vinedo.multiplo! - 2.66)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(r.inversores.vinedo.tir! - 0.092)).toBeLessThanOrEqual(0.0005);
    expect(Math.abs(r.reparto.vinedo.find((x) => x.destino === "primeraPerdida")!.monto! - 153981)).toBeLessThanOrEqual(1);
    expect(r.reparto.vinedo.find((x) => x.destino === "notas")!.monto).toBeNull();
  });
  test("agrovoltaica", () => {
    expect(Math.abs(r.procomun.agrovoltaica.total - 1357031)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.reparto.agrovoltaica.find((x) => x.destino === "netx")!.monto! - 800000)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.netx.gestionAnual.agrovoltaica - 40000)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.reparto.agrovoltaica.find((x) => x.destino === "notas")!.monto! - 3688622)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.inversores.agrovoltaica.notasTir! - 0.07)).toBeLessThanOrEqual(0.0005);
    expect(Math.abs(r.reparto.agrovoltaica.find((x) => x.destino === "unidades")!.monto! - 3402456)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.inversores.agrovoltaica.multiplo! - 2.84)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(r.inversores.agrovoltaica.tir! - 0.103)).toBeLessThanOrEqual(0.0005);
    expect(r.netx.desarrolloAgrovoltaica?.min).toBeCloseTo(120000, 0);
    expect(r.netx.desarrolloAgrovoltaica?.max).toBeCloseTo(200000, 0);
  });
  test("lo incómodo", () => {
    expect(r.incomodos.primeraNoRecupera).toEqual({ vinedo: 0.6, agrovoltaica: 0.61 });
    expect(r.incomodos.contratoDiseno).toBeNull();
    expect(r.netx.contratoDiseno).toBeNull();
    expect(r.incomodos.capital15).toBeCloseTo(24_800_000, 2);
  });
  test("el Pase no suma a NetX", () => {
    expect(r.procomun.pase.base.recaudado).toBe(96000);
    expect(r.reparto.vinedo.find((x) => x.destino === "netx")!.monto!).toBeLessThan(200000);
  });
  test("es determinístico", () => {
    expect(armarResumen()).toEqual(armarResumen());
  });
});

describe("lib/financiamiento no importa react, next ni app", () => {
  const dir = __dirname;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts") && !x.endsWith(".test.ts"))) {
    test(f, () => {
      const src = readFileSync(join(dir, f), "utf8");
      expect(src).not.toMatch(/from\s+["'](react|next)(\/[^"']*)?["']/);
      expect(src).not.toMatch(/from\s+["']@\/app/);
    });
  }
});
