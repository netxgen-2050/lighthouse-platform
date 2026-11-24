import { describe, expect, test } from "vitest";
import { alComunPorAnio, ENTRADAS_DE_PARTIDA, montoALevantar, resumenObraBarrio } from "@/lib/bien-comun/barrio";
import { BARRIO } from "@/lib/bien-comun/modelo";
import { MODELO_LOTES, VERSION_MODELO_LOTES } from "@/lib/lotes/modelo";
import { listarLotes } from "@/lib/territorios/loteo";
import { estadoDeLote } from "@/lib/territorios/loteo-estados";
import { difierenLosLotes, vistaBarrioNorte } from "./norte";

describe("vista de Barrio Norte", () => {
  const v = vistaBarrioNorte();

  test("los totales por estado salen del loteo y suman los lotes del plano", () => {
    const lotes = listarLotes();
    expect(v.lotesDelPlano).toBe(lotes.length);
    expect(v.lotesPorEstado.disponible).toBe(lotes.filter((l) => estadoDeLote(l.id) === "disponible").length);
    expect(v.lotesPorEstado.reservado).toBe(lotes.filter((l) => estadoDeLote(l.id) === "reservado").length);
    expect(v.lotesPorEstado.vendido).toBe(lotes.filter((l) => estadoDeLote(l.id) === "vendido").length);
    const suma = (v.lotesPorEstado.disponible ?? 0) + (v.lotesPorEstado.reservado ?? 0) + (v.lotesPorEstado.vendido ?? 0);
    expect(suma).toBe(v.lotesDelPlano);
  });

  test("'en cuotas' es sin dato, nunca 0", () => {
    expect(v.lotesPorEstado.enCuotas).toBeNull();
  });

  test("la parte para el común, la expensa y la versión salen del módulo de lotes", () => {
    expect(v.parteParaElComun).toBe(MODELO_LOTES.aporteUnico);
    expect(v.expensa).toBe(MODELO_LOTES.expensaAnual);
    expect(v.versionModelo).toBe(VERSION_MODELO_LOTES.version);
  });

  test("avisa cuando los lotes del modelo y del plano difieren", () => {
    expect(difierenLosLotes(BARRIO.lotes.valor, v.lotesDelPlano)).toBe(BARRIO.lotes.valor !== v.lotesDelPlano);
    expect(difierenLosLotes(3, 4)).toBe(true);
    expect(difierenLosLotes(4, 4)).toBe(false);
  });
});

describe("resumenObraBarrio", () => {
  const r = resumenObraBarrio();

  test("coincide con el cálculo del barrio", () => {
    const monto = montoALevantar(ENTRADAS_DE_PARTIDA);
    expect(monto.ok).toBe(true);
    expect(r.infraestructura).toBe(monto.ok ? monto.valor : undefined);
    const comun = alComunPorAnio(ENTRADAS_DE_PARTIDA);
    expect(r.comunPorAnio).toEqual(comun.ok ? comun.filas.map((f) => f.total) : undefined);
    expect(r.lotesDelModelo).toBe(BARRIO.lotes.valor);
  });

  test("lo juntado es sin dato mientras no haya plata real", () => {
    expect(r.juntado).toBeNull();
  });

  test("con entradas inválidas todo es sin dato", () => {
    const malo = resumenObraBarrio({ ...ENTRADAS_DE_PARTIDA, ritmo: 0 });
    expect(malo.infraestructura).toBeNull();
    expect(malo.mesDevolucion).toBeNull();
    expect(malo.comunPorAnio).toEqual([]);
  });
});
