import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { estadoDePartida, parametrosDesde, type EstadoControles } from "./escenarios";
import { anualidad, correrSerie, porMil, tir } from "./modelo";
import type { IdEscenario, ResultadoSerie } from "./tipos";

// Filas esperadas copiadas de NS_Tokenomics/sim/RESULTS_series_waterfall.md (v0.1, 17-oct-2026).
// Columnas: año, ingresos, costos, a la Fundación, comisión de NetX, Notas, Unidades, primera pérdida, excedente al procomún.
// Tolerancias (design §7): montos ±1 USD, múltiplos ±0,01, TIR ±0,0005.
type FilaEsperada = [number, number, number, number, number, number, number, number, number];

const VINEDO: FilaEsperada[] = [
  [1, 0, 60000, 1000, 8550, 0, 0, 0, 0],
  [2, 0, 60000, 1000, 8550, 0, 0, 0, 0],
  [3, 0, 60000, 1000, 8550, 0, 0, 0, 0],
  [4, 90000, 97500, 5500, 8550, 0, 0, 0, 0],
  [5, 180000, 135000, 10000, 8550, 0, 16250, 0, 0],
  [6, 270000, 172500, 14500, 8550, 0, 74450, 0, 0],
  [7, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [8, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [9, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [10, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [11, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [12, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [13, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [14, 315000, 191250, 16750, 8550, 0, 98450, 0, 0],
  [15, 315000, 191250, 16750, 8550, 0, 411950, 153981, 123220],
];

const AGROVOLTAICA: FilaEsperada[] = [
  [1, 570000, 85000, 29700, 40000, 168000, 247300, 0, 0],
  [2, 567150, 85000, 29558, 40000, 320057, 92536, 0, 0],
  [3, 564314, 85000, 29416, 40000, 320057, 89842, 0, 0],
  [4, 561493, 85000, 29275, 40000, 320057, 87161, 0, 0],
  [5, 558685, 85000, 29134, 40000, 320057, 84494, 0, 0],
  [6, 555892, 85000, 28995, 40000, 320057, 81841, 0, 0],
  [7, 553112, 85000, 28856, 40000, 320057, 79200, 0, 0],
  [8, 550347, 85000, 28717, 40000, 320057, 76573, 0, 0],
  [9, 547595, 85000, 28580, 40000, 320057, 73959, 0, 0],
  [10, 544857, 85000, 28443, 40000, 320057, 71358, 0, 0],
  [11, 542133, 85000, 28307, 40000, 320057, 68770, 0, 0],
  [12, 539422, 85000, 28171, 40000, 320057, 66194, 0, 0],
  [13, 536725, 85000, 28036, 40000, 0, 383689, 0, 0],
  [14, 534041, 85000, 27902, 40000, 0, 381139, 0, 0],
  [15, 531371, 85000, 27769, 40000, 0, 378603, 0, 0],
  [16, 528714, 85000, 27636, 40000, 0, 376079, 0, 0],
  [17, 526071, 85000, 27504, 40000, 0, 373567, 0, 0],
  [18, 523440, 85000, 27372, 40000, 0, 192825, 178244, 0],
  [19, 520823, 85000, 27241, 40000, 0, 0, 368582, 0],
  [20, 518219, 85000, 27111, 40000, 0, 197328, 477794, 789311],
];

type Cambios = {
  decididos?: Partial<EstadoControles["decididos"]>;
  medidos?: Record<string, number>;
  supuestos?: Partial<NonNullable<EstadoControles["supuestos"]>>;
  curvaEscalada?: boolean;
};

function correr(id: IdEscenario, c: Cambios = {}): ResultadoSerie {
  const base = estadoDePartida(id);
  const estado: EstadoControles = {
    decididos: { ...base.decididos, ...c.decididos },
    medidos: { ...base.medidos, ...c.medidos },
    supuestos: { ...base.supuestos, ...c.supuestos },
    curvaEscalada: c.curvaEscalada ?? base.curvaEscalada,
  };
  const p = parametrosDesde(id, estado);
  return correrSerie(id, p.decididos, p.medidos as never, p.supuestos);
}

function filaComoLista(f: ResultadoSerie["filas"][number]): number[] {
  return [f.anio, f.ingresos, f.costos, f.aFundacion, f.comisionNetx, f.notas, f.unidades, f.primeraPerdida, f.excedenteProcomun];
}

function cercano(a: number, b: number, tolerancia: number, que: string) {
  expect(Math.abs(a - b), `${que}: ${a} vs ${b}`).toBeLessThanOrEqual(tolerancia);
}

describe("referencia: Viñedo con los valores de partida", () => {
  const r = correr("vinedo");

  test("cada fila coincide con RESULTS_series_waterfall.md (±1 USD)", () => {
    expect(r.filas).toHaveLength(VINEDO.length);
    r.filas.forEach((f, i) => {
      const obtenida = filaComoLista(f);
      VINEDO[i].forEach((esperado, j) => cercano(obtenida[j], esperado, 1, `año ${f.anio} columna ${j}`));
    });
  });

  test("totales: levanta 570.000; primera pérdida, Unidades, procomún y NetX", () => {
    expect(r.levantado).toBe(570000);
    expect(r.notas).toBeNull();
    cercano(r.primeraPerdida.pone, 85500, 1, "pone primera pérdida");
    cercano(r.primeraPerdida.recibe, 153981, 1, "recibe primera pérdida");
    cercano(r.primeraPerdida.multiplo!, 1.8, 0.01, "múltiplo primera pérdida");
    cercano(r.primeraPerdida.tir!, 0.04, 0.0005, "TIR primera pérdida");
    cercano(r.unidades.pone, 484500, 1, "pone Unidades");
    cercano(r.unidades.recibe, 1290250, 1, "recibe Unidades");
    cercano(r.unidades.multiplo!, 2.66, 0.01, "múltiplo Unidades");
    cercano(r.unidades.tir!, 0.092, 0.0005, "TIR Unidades");
    cercano(r.procomun.recibe, 306970, 1, "procomún");
    cercano(r.netx.recibe, 128250, 1, "NetX");
  });

  test("USD 1.000 en Unidades: 2.663 y 9,2 %", () => {
    const m = porMil(r.flujosUnidades);
    cercano(m.total!, 2663, 1, "total");
    cercano(m.tir!, 0.092, 0.0005, "TIR");
  });

  test("año 1 sin ventas y año 15 con el excedente", () => {
    expect(filaComoLista(r.filas[0])).toEqual([1, 0, 60000, 1000, 8550, 0, 0, 0, 0]);
    cercano(r.filas[14].unidades, 411950, 1, "Unidades año 15");
    cercano(r.filas[14].primeraPerdida, 153981, 1, "primera pérdida año 15");
    cercano(r.filas[14].excedenteProcomun, 123220, 1, "excedente año 15");
  });

  test("la reserva cubre los años 1 a 4: ninguna clase cobra y ningún pago es negativo", () => {
    for (const f of r.filas.slice(0, 4)) expect(f.unidades + f.primeraPerdida + f.notas).toBe(0);
    for (const f of r.filas) {
      for (const v of [f.notas, f.unidades, f.primeraPerdida, f.excedenteProcomun, f.aFundacion, f.comisionNetx]) {
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("referencia: Agrovoltaica con los valores de partida", () => {
  const r = correr("agrovoltaica");

  test("cada fila coincide con RESULTS_series_waterfall.md (±1 USD)", () => {
    expect(r.filas).toHaveLength(AGROVOLTAICA.length);
    r.filas.forEach((f, i) => {
      const obtenida = filaComoLista(f);
      AGROVOLTAICA[i].forEach((esperado, j) => cercano(obtenida[j], esperado, 1, `año ${f.anio} columna ${j}`));
    });
  });

  test("totales: levanta 4.000.000 y cada clase", () => {
    expect(r.levantado).toBe(4000000);
    cercano(r.notas!.pone, 2400000, 1, "pone Notas");
    cercano(r.notas!.recibe, 3688622, 1, "recibe Notas");
    cercano(r.notas!.multiplo!, 1.54, 0.01, "múltiplo Notas");
    cercano(r.notas!.tir!, 0.07, 0.0005, "TIR Notas");
    cercano(r.primeraPerdida.pone, 400000, 1, "pone primera pérdida");
    cercano(r.primeraPerdida.recibe, 1024620, 1, "recibe primera pérdida");
    cercano(r.primeraPerdida.multiplo!, 2.56, 0.01, "múltiplo primera pérdida");
    cercano(r.primeraPerdida.tir!, 0.05, 0.0005, "TIR primera pérdida");
    cercano(r.unidades.pone, 1200000, 1, "pone Unidades");
    cercano(r.unidades.recibe, 3402456, 1, "recibe Unidades");
    cercano(r.unidades.multiplo!, 2.84, 0.01, "múltiplo Unidades");
    cercano(r.unidades.tir!, 0.103, 0.0005, "TIR Unidades");
    cercano(r.procomun.recibe, 1357031, 1, "procomún");
    cercano(r.netx.recibe, 800000, 1, "NetX");
  });

  test("Notas: 168.000 el año 1, 320.057 del 2 al 12 y 0 desde el 13", () => {
    cercano(r.filas[0].notas, 168000, 1, "año 1");
    for (const f of r.filas.slice(1, 12)) cercano(f.notas, 320057, 1, `año ${f.anio}`);
    for (const f of r.filas.slice(12)) expect(f.notas).toBe(0);
  });

  test("USD 1.000 en Unidades: 2.835 y 10,3 %", () => {
    const m = porMil(r.flujosUnidades);
    cercano(m.total!, 2835, 1, "total");
    cercano(m.tir!, 0.103, 0.0005, "TIR");
  });
});

describe("escenarios de la spec", () => {
  test("cambiar el SAFU no cambia ningún flujo", () => {
    for (const id of ["vinedo", "agrovoltaica"] as const) {
      expect(correr(id, { decididos: { descuentoSafu: 40 } })).toEqual(correr(id));
    }
  });

  test("regalía 0: la Fundación recibe solo el canon (1.000 por año) en el Viñedo", () => {
    const r = correr("vinedo", { decididos: { regalia: 0 } });
    for (const f of r.filas) expect(f.aFundacion).toBe(1000);
  });

  test("comisión 0: NetX no recibe nada", () => {
    expect(correr("vinedo", { decididos: { comisionNetx: 0 } }).netx.recibe).toBe(0);
    expect(correr("agrovoltaica", { decididos: { comisionNetx: 0 } }).netx.recibe).toBe(0);
  });

  test("reparto del excedente 0: la TIR de las Unidades no supera su tope de 9 %", () => {
    const r = correr("vinedo", { decididos: { parteExcedenteUnidades: 0 } });
    expect(r.unidades.tir!).toBeLessThanOrEqual(0.09 + 1e-9);
  });

  test("rendimiento 0: la TIR de las Unidades es null", () => {
    const r = correr("vinedo", { medidos: { rendimientoMadurezTHa: 0 } });
    expect(r.unidades.tir).toBeNull();
    expect(r.unidades.recibe).toBe(0);
  });

  test("rendimiento 3,5: la cosecha escala 0, 0, 1, 2, 3 y 3,5 (se ve en los ingresos del año siguiente)", () => {
    // ingresos(t) = cosecha(t − 1) × 10 ha × 750 botellas × USD 6
    const ingresosPorT = (t: number) => t * 10 * 750 * 6;
    const escalada = correr("vinedo", { medidos: { rendimientoMadurezTHa: 3.5 } });
    [0, 0, 0, 1, 2, 3, 3.5].forEach((t, i) => cercano(escalada.filas[i].ingresos, ingresosPorT(t), 1e-6, `año ${i + 1}`));
    const sinEscalar = correr("vinedo", { medidos: { rendimientoMadurezTHa: 3.5 }, curvaEscalada: false });
    [0, 0, 0, 2, 4, 6, 3.5].forEach((t, i) => cercano(sinEscalar.filas[i].ingresos, ingresosPorT(t), 1e-6, `año ${i + 1}`));
  });

  test("múltiplo de salida 0: los años 1 a 14 son iguales y el 15 no suma salida", () => {
    const base = correr("vinedo");
    const sin = correr("vinedo", { supuestos: { multiploSalida: 0 } });
    expect(sin.filas.slice(0, 14)).toEqual(base.filas.slice(0, 14));
    expect(sin.filas[14].unidades).toBeLessThan(base.filas[14].unidades);
  });

  test("reserva 300.000: levanta 650.000", () => {
    expect(correr("vinedo", { supuestos: { reservaUsd: 300000 } }).levantado).toBe(650000);
  });

  test("Agrovoltaica con Notas 0 %: las Notas no ponen ni cobran y las Unidades ponen 90 %", () => {
    const r = correr("agrovoltaica", { supuestos: { parteNotas: 0 } });
    expect(r.notas).toEqual({ pone: 0, recibe: 0, multiplo: null, tir: null });
    cercano(r.unidades.pone, 3600000, 1e-6, "Unidades");
    for (const f of r.filas) expect(f.notas).toBe(0);
  });

  test("Viñedo sin Notas: notas es null", () => {
    expect(correr("vinedo").notas).toBeNull();
  });

  test("dos corridas iguales dan resultados idénticos", () => {
    expect(correr("agrovoltaica")).toEqual(correr("agrovoltaica"));
    expect(correr("vinedo")).toEqual(correr("vinedo"));
  });

  test("agrovoltaica muy rentable: ninguna TIR es null, aunque pase de 100 % anual", () => {
    const r = correr("agrovoltaica", {
      medidos: { costoUsdPorMw: 400000, precioEnergiaUsdMwh: 150 },
      decididos: { parteExcedenteUnidades: 50 },
    });
    for (const c of [r.notas!, r.primeraPerdida, r.unidades]) expect(c.tir, "TIR").not.toBeNull();
  });

  test("una clase que no puso nada no tiene múltiplo ni TIR", () => {
    const r = correr("vinedo", { supuestos: { partePrimeraPerdida: 0 } });
    expect(r.primeraPerdida.multiplo).toBeNull();
    expect(r.primeraPerdida.tir).toBeNull();
  });
});

describe("tir y anualidad", () => {
  test("sin cambio de signo da null", () => {
    expect(tir([-100, 0, 0])).toBeNull();
  });
  test("agregado de la plataforma: −100 y 1.000 dan 900 % anual", () => {
    expect(Math.abs(tir([-100, 1000])! - 9)).toBeLessThanOrEqual(0.0005);
  });
  test("flujos con un valor que no es número dan null", () => {
    expect(tir([-100, Number.NaN])).toBeNull();
  });
  test("las TIR de referencia no cambian con la búsqueda extendida", () => {
    expect(tir([-100, 109])!).toBeCloseTo(0.09, 6);
  });
  test("anualidad: 0 con años <= 0, capital / años con tasa 0", () => {
    expect(anualidad(1000, 0.07, 0)).toBe(0);
    expect(anualidad(1000, 0, 4)).toBe(250);
    expect(anualidad(2400000, 0.07, 11)).toBeCloseTo(320057, 0);
  });
});

test("lib/series no importa react, next ni lib/fogon", () => {
  const carpeta = __dirname;
  const fuentes = readdirSync(carpeta).filter((n) => /\.tsx?$/.test(n) && !n.endsWith(".test.ts"));
  expect(fuentes.length).toBeGreaterThan(0);
  for (const f of fuentes) {
    const texto = readFileSync(path.join(carpeta, f), "utf8");
    expect(texto, f).not.toMatch(/from\s+["'](@\/lib\/fogon|react|react-dom|next)(\/[^"']*)?["']/);
  }
});
