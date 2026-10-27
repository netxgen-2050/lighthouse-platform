import { describe, expect, it } from "vitest";
import { semillasDePlata, semillasPorMes } from "./calculo";
import { HOUR_REF_ARS, HOUR_REF_USD, pasosDelPacto, ROLES, textoDeRol, tituloDePestana, USD_ARS } from "./datos";
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

  it("cada rol, pestaña y paso tiene su texto en inglés", () => {
    for (const r of ROLES) {
      const en = textoDeRol(r, "en");
      expect(en.nombre.trim(), r.clave).not.toBe("");
      expect(en.descripcion.length, r.clave).toBeGreaterThan(10);
      expect(textoDeRol(r, "es")).toEqual({ nombre: r.nombre, descripcion: r.descripcion });
    }
    expect(textoDeRol(ROLES[0], "en").nombre).toBe("Facilitation");
    expect(tituloDePestana("plata", "en")).toBe("Join with money");
    expect(tituloDePestana("plata", "es")).toBe("Sumarte con plata");
    expect(pasosDelPacto("en")).toHaveLength(pasosDelPacto("es").length);
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

const FECHA_1 = "2026-10-16T10:00:00.000Z";
const FECHA_2 = "2026-10-17T10:00:00.000Z";
const ACEPTADO: Accion[] = [
  ...COMPLETO,
  { tipo: "avanzar", comunidad: C },
  { tipo: "avanzar", comunidad: C, ahora: FECHA_1 },
];
const CAMBIO_20H: Accion[] = [
  { tipo: "proponerCambio", comunidad: C },
  { tipo: "editarCambio", comunidad: C, cambios: { horas: 20 } },
];

describe("proponer cambios a un pacto", () => {
  it("retirar un pacto enviado lo devuelve a borrador con su contenido", () => {
    const e = aplicar([...COMPLETO, { tipo: "horas", comunidad: C, horas: 10 }, { tipo: "avanzar", comunidad: C }, { tipo: "retirar", comunidad: C }]);
    const t = deComunidad(e, C).tiempo;
    expect(t.paso).toBe(0);
    expect(t.horas).toBe(10);
    expect(t.rol).toBe("facilitacion");
    expect(t.descripcion).toBe("Facilito las asambleas");
    expect(reducir(e, { tipo: "horas", comunidad: C, horas: 12 })).not.toBe(e);
  });
  it("no se retira un borrador ni un pacto aceptado", () => {
    const borrador = aplicar(COMPLETO);
    expect(reducir(borrador, { tipo: "retirar", comunidad: C })).toBe(borrador);
    const aceptado = aplicar(ACEPTADO);
    expect(reducir(aceptado, { tipo: "retirar", comunidad: C })).toBe(aceptado);
  });
  it("la primera aceptación es la versión 1 y entra al historial con su fecha", () => {
    const t = deComunidad(aplicar(ACEPTADO), C).tiempo;
    expect(t.version).toBe(1);
    expect(t.historial).toEqual([{ version: 1, rol: "facilitacion", rolOtro: "", descripcion: "Facilito las asambleas", horas: 10, aceptado: FECHA_1 }]);
  });
  it("un pacto que nunca se aceptó no tiene versión", () => {
    expect(deComunidad(aplicar([...COMPLETO, { tipo: "avanzar", comunidad: C }]), C).tiempo.version).toBe(0);
  });
  it("proponer un cambio copia la vigente en borrador, y solo con el pacto aceptado", () => {
    const sinAceptar = aplicar([...COMPLETO, { tipo: "avanzar", comunidad: C }]);
    expect(reducir(sinAceptar, { tipo: "proponerCambio", comunidad: C })).toBe(sinAceptar);
    const e = aplicar([...ACEPTADO, { tipo: "proponerCambio", comunidad: C }]);
    expect(deComunidad(e, C).tiempo.cambio).toEqual({ rol: "facilitacion", rolOtro: "", descripcion: "Facilito las asambleas", horas: 10, paso: 0 });
    expect(reducir(e, { tipo: "proponerCambio", comunidad: C })).toBe(e);
  });
  it("el cambio no afecta lo que suma Semillas hasta que se acepta", () => {
    const enviado = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "enviarCambio", comunidad: C }]);
    expect(deComunidad(enviado, C).tiempo.cambio?.paso).toBe(1);
    expect(pactosAceptados(enviado)).toEqual([{ comunidad: C, horas: 10, rol: "facilitacion" }]);
    expect(pactosAceptados(aplicar([...ACEPTADO, ...CAMBIO_20H]))[0].horas).toBe(10);
  });
  it("aceptar el cambio sube la versión, lo vuelve vigente y lo agrega al historial", () => {
    const e = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "enviarCambio", comunidad: C }, { tipo: "aceptarCambio", comunidad: C, ahora: FECHA_2 }]);
    const t = deComunidad(e, C).tiempo;
    expect(t.version).toBe(2);
    expect(t.horas).toBe(20);
    expect(t.cambio).toBeUndefined();
    expect(t.historial.map((h) => [h.version, h.horas, h.aceptado])).toEqual([[1, 10, FECHA_1], [2, 20, FECHA_2]]);
    expect(pactosAceptados(e)[0].horas).toBe(20);
  });
  it("rechazar y descartar dejan la vigente", () => {
    const rechazado = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "enviarCambio", comunidad: C }, { tipo: "rechazarCambio", comunidad: C }]);
    expect(deComunidad(rechazado, C).tiempo.cambio).toBeUndefined();
    expect(deComunidad(rechazado, C).tiempo.horas).toBe(10);
    expect(deComunidad(rechazado, C).tiempo.version).toBe(1);
    const descartado = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "descartarCambio", comunidad: C }]);
    expect(deComunidad(descartado, C).tiempo.cambio).toBeUndefined();
    expect(deComunidad(descartado, C).tiempo.horas).toBe(10);
  });
  it("no se descarta un cambio enviado ni se rechaza uno en borrador", () => {
    const borrador = aplicar([...ACEPTADO, ...CAMBIO_20H]);
    expect(reducir(borrador, { tipo: "rechazarCambio", comunidad: C })).toBe(borrador);
    expect(reducir(borrador, { tipo: "aceptarCambio", comunidad: C })).toBe(borrador);
    const enviado = reducir(borrador, { tipo: "enviarCambio", comunidad: C });
    expect(reducir(enviado, { tipo: "descartarCambio", comunidad: C })).toBe(enviado);
    expect(reducir(enviado, { tipo: "editarCambio", comunidad: C, cambios: { horas: 30 } })).toBe(enviado);
  });
  it("un cambio incompleto no se envía", () => {
    const e = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "editarCambio", comunidad: C, cambios: { descripcion: "  " } }]);
    expect(reducir(e, { tipo: "enviarCambio", comunidad: C })).toBe(e);
  });
  it("el cambio acota las horas como un pacto nuevo", () => {
    const e = aplicar([...ACEPTADO, { tipo: "proponerCambio", comunidad: C }, { tipo: "editarCambio", comunidad: C, cambios: { horas: 1000 } }]);
    expect(deComunidad(e, C).tiempo.cambio?.horas).toBe(80);
  });
  it("lo guardado con el cambio se lee igual", () => {
    const e = aplicar([...ACEPTADO, ...CAMBIO_20H, { tipo: "enviarCambio", comunidad: C }]);
    expect(leer(JSON.stringify(e))).toEqual(e);
  });
  it("un cambio enviado incompleto vuelve a borrador al leerlo", () => {
    const e = aplicar([...ACEPTADO, { tipo: "proponerCambio", comunidad: C }]);
    const t = deComunidad(e, C).tiempo;
    const crudo = JSON.stringify({ comunidades: { [C]: { tiempo: { ...t, cambio: { ...t.cambio, descripcion: "", paso: 1 } }, aportes: [] } } });
    expect(deComunidad(leer(crudo), C).tiempo.cambio?.paso).toBe(0);
  });
  it("un cambio sin pacto aceptado se descarta al leerlo", () => {
    const crudo = JSON.stringify({ comunidades: { [C]: { tiempo: { rol: "facilitacion", descripcion: "x", horas: 10, paso: 1, cambio: { rol: "facilitacion", descripcion: "y", horas: 20, paso: 0 } }, aportes: [] } } });
    expect(deComunidad(leer(crudo), C).tiempo.cambio).toBeUndefined();
  });
  it("el historial no repite versiones ni guarda las mayores que la vigente", () => {
    const v = (version: number) => ({ version, rol: "facilitacion", rolOtro: "", descripcion: "x", horas: 10, aceptado: FECHA_1 });
    const crudo = JSON.stringify({ comunidades: { [C]: { tiempo: { ...v(2), paso: 2, version: 2, historial: [v(1), v(1), v(2), v(3)] }, aportes: [] } } });
    expect(deComunidad(leer(crudo), C).tiempo.historial.map((h) => h.version)).toEqual([1, 2]);
  });
  it("un pacto aceptado con el formato anterior se lee como versión 1 con fecha sin dato", () => {
    const crudo = JSON.stringify({ comunidades: { [C]: { tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "x", horas: 10, paso: 2 }, aportes: [] } } });
    const t = deComunidad(leer(crudo), C).tiempo;
    expect(t.version).toBe(1);
    expect(t.cambio).toBeUndefined();
    expect(t.historial).toEqual([{ version: 1, rol: "facilitacion", rolOtro: "", descripcion: "x", horas: 10, aceptado: null }]);
    expect(pactosAceptados(leer(crudo))).toHaveLength(1);
    expect(reducir(leer(crudo), { tipo: "proponerCambio", comunidad: C })).not.toBe(leer(crudo));
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
