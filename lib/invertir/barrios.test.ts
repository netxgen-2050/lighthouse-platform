import { describe, expect, it } from "vitest";
import { ENTRADAS_DE_PARTIDA, cobrandoConLasCuotas, resumenObraBarrio, serieMensualDelBarrio } from "@/lib/bien-comun/barrio";
import { BARRIO } from "@/lib/bien-comun/modelo";
import { barriosEnFinanciamiento, curvaPorTrimestre } from "./barrios";

const norte = () => barriosEnFinanciamiento()[0];

describe("barriosEnFinanciamiento", () => {
  it("hoy hay un solo barrio: norte", () => {
    expect(barriosEnFinanciamiento().map((b) => b.id)).toEqual(["norte"]);
  });

  it("meta, mes de devolución y parte para el común salen del resumen de la obra y de los módulos", () => {
    const obra = resumenObraBarrio();
    expect(norte().meta).toBe(obra.infraestructura);
    expect(norte().mesDevolucion).toBe(obra.mesDevolucion);
    expect(norte().parteParaElComun).toBe(BARRIO.parteComun.valor);
    expect(norte().primaObjetivo).toBe(BARRIO.prima.valor);
  });

  it("lo juntado es nulo: no hay plata real", () => {
    expect(norte().juntado).toBeNull();
  });

  it("la curva va del mes 0 al final del horizonte y lo devuelto nunca baja", () => {
    const { curva } = norte();
    expect(curva[0].mes).toBe(0);
    expect(curva.at(-1)?.mes).toBe(BARRIO.horizonteMeses.valor);
    for (let i = 1; i < curva.length; i++) expect(curva[i].devuelto).toBeGreaterThanOrEqual(curva[i - 1].devuelto);
    expect(new Set(curva.map((p) => p.aportado)).size).toBe(1);
  });

  it("lo devuelto al final es el total recibido de cobrandoConLasCuotas", () => {
    const r = cobrandoConLasCuotas(ENTRADAS_DE_PARTIDA);
    if (!r.ok) throw new Error("ok");
    expect(norte().curva.at(-1)?.devuelto).toBeCloseTo(r.totalRecibido, 6);
  });

  it("el libro va por trimestre (mes 3, 6, …), con motivos conocidos y sin montos en cero", () => {
    const { libro } = norte();
    expect(libro.length).toBeGreaterThan(0);
    expect(libro[0].mes).toBe(3);
    for (const f of libro) {
      expect(f.mes % 3).toBe(0);
      expect(["cuotas", "devolucion", "comun"]).toContain(f.motivo);
      expect(f.monto).toBeGreaterThan(0);
    }
  });

  it("lo devuelto en el libro suma lo mismo que la curva", () => {
    const devuelto = norte().libro.filter((f) => f.motivo === "devolucion").reduce((s, f) => s + (f.monto ?? 0), 0);
    expect(devuelto).toBeCloseTo(norte().curva.at(-1)!.devuelto, 6);
  });

  it("con entradas inválidas no hay curva ni libro y la meta es nula (sin dato)", () => {
    const b = barriosEnFinanciamiento({ ...ENTRADAS_DE_PARTIDA, precioLote: -1 })[0];
    expect(b.meta).toBeNull();
    expect(b.curva).toEqual([]);
    expect(b.libro).toEqual([]);
  });

  it("curvaPorTrimestre deja los meses múltiplos de 3", () => {
    const t = curvaPorTrimestre(norte().curva);
    expect(t[0].mes).toBe(0);
    expect(t.every((p) => p.mes % 3 === 0)).toBe(true);
  });
});

describe("serieMensualDelBarrio", () => {
  it("el acumulado de la serie coincide con el total de cobrandoConLasCuotas", () => {
    const s = serieMensualDelBarrio(ENTRADAS_DE_PARTIDA);
    const r = cobrandoConLasCuotas(ENTRADAS_DE_PARTIDA);
    if (!s.ok || !r.ok) throw new Error("ok");
    expect(s.meses.at(-1)?.devueltoAcumulado).toBeCloseTo(r.totalRecibido, 6);
  });
});
