import { describe, expect, it } from "vitest";
import { INICIAL, reducir, type Accion, type EstadoPactos } from "@/lib/pactos/estado";
import { mesAtras, mesesCumplidos, semillasDelMes, semillasVariables } from "./calculo";
import { semillasDeComunidad } from "./estado";

const PERSONA = "prueba:persona@prueba.test";
const DIC = "2026-12-10T15:00:00.000Z";
const NOV = "2026-11-15T15:00:00.000Z";

const conf = (horas: number) => ({ horas, estado: "confirmada" as const });
const decl = (horas: number) => ({ horas, estado: "declarada" as const });

describe("semillasVariables: solo lo confirmado genera Semillas", () => {
  it("antes del mínimo: Valle Solar (3 meses) con noviembre 24 h y diciembre 10 h confirmadas → 121 y 50 pendientes, 171 en total", () => {
    const r = semillasVariables({ "2026-11": conf(24), "2026-12": conf(10) }, "2026-12", 3);
    expect(r.meses.map((m) => [m.mes, m.horas, m.estado, m.semillas, m.semillasEstado])).toEqual([
      ["2026-10", null, null, null, null],
      ["2026-11", 24, "confirmada", 121, "pendientes"],
      ["2026-12", 10, "confirmada", 50, "pendientes"],
    ]);
    expect(r).toMatchObject({ pendientes: 171, recibidas: null, cumplidos: 2, compromisoMeses: 3, cumplido: false });
  });
  it("Taller Común (1 mes) con noviembre 24 h confirmadas → 121 recibidas y pendientes sin dato", () => {
    const r = semillasVariables({ "2026-11": conf(24) }, "2026-11", 1);
    expect(r.meses[2]).toMatchObject({ semillas: 121, semillasEstado: "recibidas" });
    expect(r).toMatchObject({ recibidas: 121, pendientes: null, cumplidos: 1, cumplido: true });
  });
  it("un mes confirmado con 0 h no cuenta para el mínimo ni genera Semillas", () => {
    const r = semillasVariables({ "2026-10": conf(0), "2026-11": conf(24), "2026-12": conf(10) }, "2026-12", 3);
    expect(r.cumplidos).toBe(2);
    expect(r.meses[0]).toMatchObject({ horas: 0, estado: "confirmada", semillas: null, semillasEstado: null });
    expect(r).toMatchObject({ pendientes: 171, recibidas: null });
    expect(mesesCumplidos({ "2026-10": conf(0) })).toBe(0);
  });
  it("al tercer mes confirmado con horas, los tres pasan a recibidas", () => {
    const r = semillasVariables({ "2026-10": conf(6), "2026-11": conf(24), "2026-12": conf(10) }, "2026-12", 3);
    expect(r.meses.map((m) => m.semillasEstado)).toEqual(["recibidas", "recibidas", "recibidas"]);
    expect(r).toMatchObject({ recibidas: 30 + 121 + 50, pendientes: null, cumplidos: 3, cumplido: true });
  });
  it("un cuarto mes confirmado (después del mínimo) se recibe al confirmarse", () => {
    const r = semillasVariables({ "2026-09": conf(6), "2026-10": conf(6), "2026-11": conf(24), "2026-12": conf(10) }, "2026-12", 3);
    expect(r.meses[2]).toMatchObject({ semillas: 50, semillasEstado: "recibidas" });
    expect(r.recibidas).toBe(30 + 30 + 121 + 50);
    expect(r.pendientes).toBeNull();
  });
  it("un mes declarado sin confirmar, o a revisar, no genera nada: todo sin dato", () => {
    const r = semillasVariables({ "2026-11": decl(24), "2026-10": { horas: 10, estado: "a-revisar" } }, "2026-11", 3);
    expect(r.meses[2]).toMatchObject({ horas: 24, estado: "declarada", semillas: null, semillasEstado: null });
    expect(r.meses[1]).toMatchObject({ horas: 10, estado: "a-revisar", semillas: null });
    expect(r).toMatchObject({ recibidas: null, pendientes: null, cumplidos: 0 });
  });
  it("sin declaraciones: todo sin dato", () => {
    const r = semillasVariables({}, "2026-11", 3);
    expect(r).toMatchObject({ recibidas: null, pendientes: null, cumplidos: 0 });
    expect(r.meses.every((m) => m.horas === null && m.semillas === null)).toBe(true);
  });
  it("las Semillas de un mes son round(h × valor de la hora)", () => {
    expect(semillasDelMes(24)).toBe(121);
    expect(semillasDelMes(10)).toBe(50);
    expect(semillasDelMes(0)).toBe(0);
  });
  it("los tres meses cruzan el cambio de año", () => {
    expect(mesAtras("2027-01", 2)).toBe("2026-11");
    expect(mesAtras("2026-12", 0)).toBe("2026-12");
  });
});

function aplicar(acciones: Accion[]): EstadoPactos {
  return acciones.reduce(reducir, INICIAL);
}

/** Un pacto variable aceptado con los meses dados ya en `declaradas`. */
function crudoVariable(comunidad: string, declaradas: Record<string, { horas: number; estado: string }>, ahora = "2026-10-30T12:00:00.000Z"): string {
  const e = aplicar([
    { tipo: "rol", comunidad, rol: "jardineria" },
    { tipo: "descripcion", comunidad, texto: "x" },
    { tipo: "modalidad", comunidad, modalidad: "variable" },
    { tipo: "rango", comunidad, min: 0, max: 30 },
    { tipo: "avanzar", comunidad },
    { tipo: "avanzar", comunidad, ahora },
  ]);
  const tiempo = e.comunidades[comunidad].tiempo;
  const completas = Object.fromEntries(Object.entries(declaradas).map(([mes, d]) => [mes, { ...d, propuestaId: `p-${mes}` }]));
  return JSON.stringify({ ...e, comunidades: { [comunidad]: { ...e.comunidades[comunidad], tiempo: { ...tiempo, declaradas: completas } } } });
}

describe("semillasDeComunidad con un pacto de horas variables", () => {
  it("Valle Solar en diciembre: 171 pendientes, tiempo sin dato, total sin dato, y la ronda sigue habilitada", () => {
    const s = semillasDeComunidad(crudoVariable("valle", { "2026-11": conf(24), "2026-12": conf(10) }), "valle", PERSONA, [], DIC);
    expect(s.variable).toMatchObject({ pendientes: 171, recibidas: null, cumplidos: 2, compromisoMeses: 3, rango: { min: 0, max: 30 } });
    expect(s).toMatchObject({ tiempo: null, horas: null, total: null, pactoAceptado: true, variableAnterior: null });
  });
  it("Taller Común en noviembre: 121 recibidas que suman al total", () => {
    const s = semillasDeComunidad(crudoVariable("taller", { "2026-11": conf(24) }), "taller", PERSONA, [], NOV);
    expect(s.variable).toMatchObject({ recibidas: 121, pendientes: null, compromisoMeses: 1 });
    expect(s).toMatchObject({ tiempo: 121, total: 121 });
  });
  it("Agua Clara tiene un compromiso de 2 meses", () => {
    const s = semillasDeComunidad(crudoVariable("agua", { "2026-11": conf(24), "2026-12": conf(10) }), "agua", PERSONA, [], DIC);
    expect(s.variable).toMatchObject({ recibidas: 171, pendientes: null, cumplidos: 2, compromisoMeses: 2 });
  });
  it("declarado sin confirmar: no genera nada, aceptado igual", () => {
    const s = semillasDeComunidad(crudoVariable("valle", { "2026-11": decl(24) }), "valle", PERSONA, [], NOV);
    expect(s.variable).toMatchObject({ pendientes: null, recibidas: null });
    expect(s).toMatchObject({ tiempo: null, total: null, pactoAceptado: true });
  });
  it("sin declaraciones: todo sin dato y el pacto aceptado", () => {
    const s = semillasDeComunidad(crudoVariable("valle", {}), "valle", PERSONA, [], NOV);
    expect(s).toMatchObject({ tiempo: null, total: null, pactoAceptado: true });
    expect(s.variable).toMatchObject({ pendientes: null, recibidas: null });
  });
  it("las pendientes no suman al total aunque haya aportes de plata", () => {
    const e = JSON.parse(crudoVariable("valle", { "2026-11": conf(24) }));
    e.comunidades.valle.aportes = [100];
    const s = semillasDeComunidad(JSON.stringify(e), "valle", PERSONA, [], NOV);
    expect(s.variable?.pendientes).toBe(121);
    expect(s.total).toBe(100);
  });
});

describe("semillasDeComunidad con un pacto fijo", () => {
  it("sin meses confirmados queda igual que antes", () => {
    const e = aplicar([
      { tipo: "rol", comunidad: "valle", rol: "jardineria" },
      { tipo: "descripcion", comunidad: "valle", texto: "x" },
      { tipo: "horas", comunidad: "valle", horas: 10 },
      { tipo: "avanzar", comunidad: "valle" },
      { tipo: "avanzar", comunidad: "valle" },
    ]);
    const s = semillasDeComunidad(JSON.stringify(e), "valle", PERSONA, [], NOV);
    expect(s).toMatchObject({ horas: 10, tiempo: 150, total: 150, variable: null, variableAnterior: null });
  });
  it("pasar de variable (3 meses confirmados, Semillas recibidas) a fija: las recibidas siguen sumando y el fijo proyecta como hoy", () => {
    const base = JSON.parse(crudoVariable("valle", { "2026-10": conf(6), "2026-11": conf(24), "2026-12": conf(10) }));
    const t = base.comunidades.valle.tiempo;
    base.comunidades.valle.tiempo = {
      ...t,
      modalidad: "fija",
      horas: 10,
      compromisoMeses: null,
      version: 2,
      historial: [...t.historial, { ...t, version: 2, modalidad: "fija", horas: 10, compromisoMeses: null, aceptado: null, declaradas: undefined }],
    };
    const s = semillasDeComunidad(JSON.stringify(base), "valle", PERSONA, [], DIC);
    expect(s.variable).toBeNull();
    expect(s.variableAnterior).toMatchObject({ recibidas: 201, pendientes: null, cumplidos: 3, compromisoMeses: 3 });
    expect(s.tiempo).toBe(150);
    expect(s.total).toBe(150 + 201);
  });
  it("pasar de variable a fija con Semillas pendientes: no suman y esperan la validación del círculo", () => {
    const base = JSON.parse(crudoVariable("valle", { "2026-11": conf(24), "2026-12": conf(10) }));
    const t = base.comunidades.valle.tiempo;
    base.comunidades.valle.tiempo = {
      ...t,
      modalidad: "fija",
      horas: 10,
      compromisoMeses: null,
      version: 2,
      historial: [...t.historial, { ...t, version: 2, modalidad: "fija", horas: 10, compromisoMeses: null, aceptado: null, declaradas: undefined }],
    };
    const s = semillasDeComunidad(JSON.stringify(base), "valle", PERSONA, [], DIC);
    expect(s.variableAnterior).toMatchObject({ recibidas: null, pendientes: 171, cumplidos: 2, compromisoMeses: 3 });
    expect(s.total).toBe(150);
  });
});
