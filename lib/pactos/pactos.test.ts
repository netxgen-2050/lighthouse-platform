import { describe, expect, it } from "vitest";
import { semillasDePlata, semillasPorMes } from "./calculo";
import { HOUR_REF_ARS, HOUR_REF_USD, ROLES, USD_ARS } from "./datos";
import {
  INICIAL,
  deComunidad,
  leer,
  pactoCompleto,
  pactosAceptados,
  reducir,
  totalAportes,
  type Accion,
  type EstadoPactos,
} from "./estado";

const C = "lighthouse";

function aplicar(acciones: Accion[], desde: EstadoPactos = INICIAL): EstadoPactos {
  return acciones.reduce(reducir, desde);
}

const COMPLETO: Accion[] = [
  { tipo: "rol", comunidad: C, rol: "facilitacion" },
  { tipo: "descripcion", comunidad: C, texto: "Facilito las asambleas" },
];

describe("cálculo", () => {
  it("el valor hora sale del mock-up", () => {
    expect(HOUR_REF_ARS).toBe(7049);
    expect(HOUR_REF_USD).toBeCloseTo(7049 / USD_ARS, 10);
  });
  it("las Semillas por mes son horas × valor de referencia, sin parte en caja", () => {
    expect(semillasPorMes(10)).toBe(50);
    expect(semillasPorMes(20)).toBe(101);
  });
  it("la evaluación entre pares multiplica (1,0 por defecto)", () => {
    expect(semillasPorMes(10, 0.5)).toBe(Math.round(semillasPorMes(10) / 2));
  });
  it("1 USD de aporte en plata es 1 Semilla", () => {
    expect(semillasDePlata(200)).toBe(200);
  });
});

describe("roles", () => {
  it("la lista incluye Otro y cada rol tiene descripción", () => {
    expect(ROLES.map((r) => r.nombre)).toContain("Facilitación");
    expect(ROLES.at(-1)?.clave).toBe("otro");
    for (const r of ROLES) expect(r.descripcion.length).toBeGreaterThan(10);
  });
});

describe("estado del pacto de tiempo", () => {
  it("arranca vacío, en borrador, pestaña tiempo", () => {
    expect(INICIAL.pestana).toBe("tiempo");
    expect(deComunidad(INICIAL, C).tiempo.paso).toBe(0);
    expect(deComunidad(INICIAL, C).tiempo.rol).toBe("");
  });
  it("no se envía sin rol ni descripción", () => {
    expect(aplicar([{ tipo: "avanzar", comunidad: C }]).comunidades).toEqual({});
    const soloRol = aplicar([{ tipo: "rol", comunidad: C, rol: "facilitacion" }, { tipo: "avanzar", comunidad: C }]);
    expect(deComunidad(soloRol, C).tiempo.paso).toBe(0);
  });
  it("con rol Otro hace falta el texto del rol", () => {
    const sinTexto = aplicar([...COMPLETO, { tipo: "rol", comunidad: C, rol: "otro" }]);
    expect(pactoCompleto(deComunidad(sinTexto, C).tiempo)).toBe(false);
    const conTexto = reducir(sinTexto, { tipo: "rolOtro", comunidad: C, texto: "Cocina comunitaria" });
    expect(pactoCompleto(deComunidad(conTexto, C).tiempo)).toBe(true);
  });
  it("avanza Borrador, Enviado, Aceptado y ahí se queda", () => {
    let e = aplicar([...COMPLETO, { tipo: "avanzar", comunidad: C }]);
    expect(deComunidad(e, C).tiempo.paso).toBe(1);
    e = reducir(e, { tipo: "avanzar", comunidad: C });
    expect(deComunidad(e, C).tiempo.paso).toBe(2);
    expect(reducir(e, { tipo: "avanzar", comunidad: C })).toBe(e);
  });
  it("una vez enviado no se edita", () => {
    const e = aplicar([...COMPLETO, { tipo: "avanzar", comunidad: C }]);
    expect(reducir(e, { tipo: "horas", comunidad: C, horas: 40 })).toBe(e);
    expect(reducir(e, { tipo: "descripcion", comunidad: C, texto: "otra" })).toBe(e);
  });
  it("acota las horas a los pasos del control", () => {
    expect(deComunidad(reducir(INICIAL, { tipo: "horas", comunidad: C, horas: 1000 }), C).tiempo.horas).toBe(80);
    expect(deComunidad(reducir(INICIAL, { tipo: "horas", comunidad: C, horas: 11 }), C).tiempo.horas % 2).toBe(0);
  });
  it("cada comunidad tiene su pacto", () => {
    const e = aplicar([
      ...COMPLETO,
      { tipo: "avanzar", comunidad: C },
      { tipo: "avanzar", comunidad: C },
      { tipo: "horas", comunidad: "agua", horas: 6 },
    ]);
    expect(deComunidad(e, "agua").tiempo.paso).toBe(0);
    expect(pactosAceptados(e)).toEqual([{ comunidad: C, horas: 10, rol: "facilitacion" }]);
  });
});

describe("aportes en plata", () => {
  it("se registran por comunidad y suman", () => {
    const e = aplicar([
      { tipo: "aporte", comunidad: C, montoUsd: 200 },
      { tipo: "aporte", comunidad: C, montoUsd: 50 },
    ]);
    expect(totalAportes(deComunidad(e, C))).toBe(250);
    expect(totalAportes(deComunidad(e, "agua"))).toBe(0);
  });
  it("descarta montos inválidos", () => {
    expect(reducir(INICIAL, { tipo: "aporte", comunidad: C, montoUsd: 0 })).toBe(INICIAL);
    expect(reducir(INICIAL, { tipo: "aporte", comunidad: C, montoUsd: -5 })).toBe(INICIAL);
    expect(reducir(INICIAL, { tipo: "aporte", comunidad: C, montoUsd: Number.NaN })).toBe(INICIAL);
  });
  it("un aporte en plata no es un pacto de tiempo aceptado", () => {
    expect(pactosAceptados(reducir(INICIAL, { tipo: "aporte", comunidad: C, montoUsd: 200 }))).toEqual([]);
  });
});

describe("lectura de lo guardado", () => {
  it("lee lo que escribe y descarta lo raro", () => {
    const e = aplicar([...COMPLETO, { tipo: "avanzar", comunidad: C }, { tipo: "aporte", comunidad: C, montoUsd: 200 }]);
    expect(leer(JSON.stringify(e))).toEqual(e);
    expect(leer("no es json")).toEqual(INICIAL);
    expect(leer(null)).toEqual(INICIAL);
    expect(leer(JSON.stringify([]))).toEqual(INICIAL);
  });
  it("el formato anterior (un solo pacto, con parte en semilla) se ignora", () => {
    expect(leer(JSON.stringify({ pestana: "tiempo", horas: 20, parteSemilla: 50, paso: 2 }))).toEqual(INICIAL);
  });
  it("un pacto enviado sin rol vuelve a borrador", () => {
    const crudo = JSON.stringify({ comunidades: { [C]: { tiempo: { rol: "inventado", descripcion: "x", horas: 10, paso: 2 }, aportes: [-1, 5.5, "x", 30] } } });
    const e = leer(crudo);
    expect(deComunidad(e, C).tiempo.paso).toBe(0);
    expect(deComunidad(e, C).aportes).toEqual([30]);
  });
});
