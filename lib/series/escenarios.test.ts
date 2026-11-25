import { describe, expect, test } from "vitest";
import {
  CLAVES_DECIDIDAS,
  ESCENARIOS,
  IDS_ESCENARIOS,
  VERSION_MODELO,
  estadoDePartida,
  parametrosDesde,
} from "./escenarios";
import { correrSerie } from "./modelo";
import { convertirSafu } from "./safu";

describe("metadatos de los escenarios", () => {
  for (const id of IDS_ESCENARIOS) {
    const def = ESCENARIOS[id];
    const decididos = CLAVES_DECIDIDAS.map((k) => def.decididos[k]);
    const medidos = Object.values(def.medidos);
    const supuestos = Object.values(def.supuestos);

    test(`${id}: lo que se decide tiene quién decide; los datos y supuestos no`, () => {
      for (const m of decididos) {
        expect(m.quienDecide?.trim(), m.etiqueta).toBeTruthy();
        expect(m.fuente, m.etiqueta).toBeUndefined();
      }
      for (const m of [...medidos, ...supuestos]) expect(m.quienDecide, m.etiqueta).toBeUndefined();
    });

    test(`${id}: los datos medidos y los supuestos tienen fuente`, () => {
      for (const m of medidos) expect(m.fuente?.trim(), m.etiqueta).toBeTruthy();
      for (const m of supuestos) expect(m.fuente, m.etiqueta).toBe("Supuesto del modelo, a confirmar con Vagner");
    });

    test(`${id}: cada partida está dentro de su rango y cae en un paso`, () => {
      for (const m of [...decididos, ...medidos, ...supuestos]) {
        expect(m.partida, m.etiqueta).toBeGreaterThanOrEqual(m.min);
        expect(m.partida, m.etiqueta).toBeLessThanOrEqual(m.max);
        const pasos = (m.partida - m.min) / m.paso;
        expect(Math.abs(pasos - Math.round(pasos)), m.etiqueta).toBeLessThan(1e-9);
      }
    });

    test(`${id}: con los rangos máximos de Notas y primera pérdida las Unidades ponen al menos 10 %`, () => {
      const notas = def.supuestos.parteNotas?.max ?? 0;
      const pp = def.supuestos.partePrimeraPerdida?.max ?? 0;
      expect(100 - notas - pp).toBeGreaterThanOrEqual(10);
    });
  }

  test("el descuento del SAFU vale 0,20 en los dos escenarios", () => {
    for (const id of IDS_ESCENARIOS) {
      expect(parametrosDesde(id, estadoDePartida(id)).decididos.descuentoSafu).toBe(0.2);
    }
  });

  test("la versión del modelo es v0.1 del 2026-10-17", () => {
    expect(VERSION_MODELO).toEqual({
      fuente: "NS_Tokenomics/sim/series_waterfall_sim.py",
      version: "v0.1",
      fecha: "2026-10-17",
    });
  });

  test("los textos de quién decide y de los datos son los de la spec", () => {
    expect(ESCENARIOS.vinedo.decididos.regalia.quienDecide).toBe(
      "Consejo de la Fundación, con la Voz de la Tierra y consulta a residentes y miembros RAIZ",
    );
    expect(ESCENARIOS.agrovoltaica.medidos.precioEnergiaUsdMwh.unidad).toBe("USD por MWh");
    expect(ESCENARIOS.agrovoltaica.supuestos.multiploSalida?.partida).toBe(3);
  });

  test("el estado de partida convierte a fracciones y no cambia el SAFU en la cascada", () => {
    const { decididos, medidos, supuestos } = parametrosDesde("vinedo", estadoDePartida("vinedo"));
    expect(decididos.regalia).toBe(0.05);
    expect(decididos.comisionNetx).toBe(0.015);
    expect(supuestos.parteNotas).toBe(0);
    expect(supuestos.curvaEscalada).toBe(true);
    const base = correrSerie("vinedo", decididos, medidos, supuestos);
    const otro = correrSerie("vinedo", { ...decididos, descuentoSafu: 0.4 }, medidos, supuestos);
    expect(otro).toEqual(base);
    expect(convertirSafu(1000, decididos.descuentoSafu)).toBeCloseTo(1250, 2);
  });
});
