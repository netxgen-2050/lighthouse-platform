import { describe, expect, it } from "vitest";
import { afirmaComunidad, afirmaPersona, agregar, datosDePropuesta, leerConstancias, revocar, sobreDe, type ConstanciaPacto, type QuienResponde } from "./constancias";
import {
  INICIAL,
  conciliar,
  deComunidad,
  leer,
  leerPactosConciliados,
  motivoNoDeclara,
  pactoCompleto,
  reducir,
  type Accion,
  type EstadoPactos,
} from "./estado";
import { declararMes, declaracionVigente, declaracionesParaVer, respuestaDeMes, responderMes } from "./mensual";
import { textoHorasDelPacto } from "./texto-horas";

const PERSONA = "prueba:persona@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const SUPER = "prueba:super@prueba.test";
const NOV = "2026-11-15T15:00:00.000Z";
const DIC = "2026-12-10T15:00:00.000Z";
const FIN_NOV = "2026-12-01T01:30:00.000Z"; // 22:30 del 30-nov en Argentina
const COM = "valle";

const sesionLider: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: COM };
const sesionOtraTribu: QuienResponde = { idPersona: "prueba:otra@prueba.test", esSuperAdmin: false, tribuLider: "agua" };

function aplicar(e: EstadoPactos, ...acciones: Accion[]): EstadoPactos {
  return acciones.reduce(reducir, e);
}

function borradorVariable(comunidad = COM, min = 0, max = 30): EstadoPactos {
  return aplicar(
    INICIAL,
    { tipo: "rol", comunidad, rol: "jardineria" },
    { tipo: "descripcion", comunidad, texto: "Cuido la huerta" },
    { tipo: "modalidad", comunidad, modalidad: "variable" },
    { tipo: "rango", comunidad, min, max },
  );
}

/** Un pacto variable aceptado en `comunidad`. */
function aceptadoVariable(comunidad = COM, min = 0, max = 30): EstadoPactos {
  return aplicar(borradorVariable(comunidad, min, max), { tipo: "avanzar", comunidad }, { tipo: "avanzar", comunidad, ahora: "2026-10-30T12:00:00.000Z" });
}

function conDeclaracion(e: EstadoPactos, mes: string, horas: number, propuestaId: string, ahora: string): EstadoPactos {
  return reducir(e, { tipo: "declarar", comunidad: COM, mes, horas, propuestaId, ahora });
}

describe("modalidad y rango del borrador", () => {
  it("elegir 'variable' lleva el compromiso mínimo de la comunidad", () => {
    expect(deComunidad(borradorVariable("valle"), "valle").tiempo.compromisoMeses).toBe(3);
    expect(deComunidad(borradorVariable("agua"), "agua").tiempo.compromisoMeses).toBe(2);
    expect(deComunidad(borradorVariable("taller"), "taller").tiempo.compromisoMeses).toBe(1);
  });
  it("volver a 'fija' quita el compromiso", () => {
    const e = reducir(borradorVariable(), { tipo: "modalidad", comunidad: COM, modalidad: "fija" });
    expect(deComunidad(e, COM).tiempo.compromisoMeses).toBeNull();
  });
  it("un rango al revés (o igual) no se puede enviar", () => {
    const alReves = borradorVariable(COM, 30, 10);
    expect(pactoCompleto(deComunidad(alReves, COM).tiempo)).toBe(false);
    expect(reducir(alReves, { tipo: "avanzar", comunidad: COM })).toBe(alReves);
    expect(pactoCompleto(deComunidad(borradorVariable(COM, 10, 10), COM).tiempo)).toBe(false);
  });
  it("de 0 a 30 h se puede enviar, y el rango se acota de 0 a 80 en pasos de 2", () => {
    expect(pactoCompleto(deComunidad(borradorVariable(), COM).tiempo)).toBe(true);
    const e = aplicar(borradorVariable(), { tipo: "rango", comunidad: COM, min: -5, max: 1000 });
    expect(deComunidad(e, COM).tiempo.rango).toEqual({ min: 0, max: 80 });
    const impar = aplicar(borradorVariable(), { tipo: "rango", comunidad: COM, max: 31 });
    expect(deComunidad(impar, COM).tiempo.rango.max % 2).toBe(0);
  });
  it("un pacto enviado no se edita", () => {
    const e = reducir(borradorVariable(), { tipo: "avanzar", comunidad: COM });
    expect(reducir(e, { tipo: "rango", comunidad: COM, max: 40 })).toBe(e);
    expect(reducir(e, { tipo: "modalidad", comunidad: COM, modalidad: "fija" })).toBe(e);
  });
  it("el texto de las horas: fijas o entre un mínimo y un máximo, en los dos idiomas", () => {
    const t = deComunidad(aceptadoVariable(), COM).tiempo;
    expect(textoHorasDelPacto(t, "es")).toBe("entre 0 y 30 h/mes");
    expect(textoHorasDelPacto(t, "en")).toBe("between 0 and 30 h/month");
    expect(textoHorasDelPacto({ modalidad: "fija", horas: 10, rango: t.rango }, "es")).toBe("10 h/mes");
    expect(textoHorasDelPacto({ modalidad: "fija", horas: 10, rango: t.rango }, "en")).toBe("10 h/month");
  });
});

describe("declarar las horas del mes", () => {
  const ok = (e: EstadoPactos, mes: string, horas: number, ahora: string) => motivoNoDeclara(deComunidad(e, COM).tiempo, mes, horas, ahora);

  it("dentro del rango y en el mes en curso se puede, sin crear un cambio de pacto", () => {
    const e = aceptadoVariable();
    expect(ok(e, "2026-11", 24, NOV)).toBeNull();
    const d = conDeclaracion(e, "2026-11", 24, "p1-pacto-propone-horas", NOV);
    const t = deComunidad(d, COM).tiempo;
    expect(t.declaradas["2026-11"]).toEqual({ horas: 24, estado: "declarada", propuestaId: "p1-pacto-propone-horas" });
    expect(t.cambio).toBeUndefined();
    expect(t.version).toBe(1);
  });
  it("fuera del rango no se guarda", () => {
    const e = aceptadoVariable();
    expect(ok(e, "2026-11", 40, NOV)).toBe("fuera-de-rango");
    expect(conDeclaracion(e, "2026-11", 40, "p1", NOV)).toBe(e);
    expect(ok(e, "2026-11", 7, NOV)).toBe("fuera-de-rango");
    expect(ok(e, "2026-11", 2.5, NOV)).toBe("fuera-de-rango");
  });
  it("declarar 0 es un dato", () => {
    const d = conDeclaracion(aceptadoVariable(), "2026-11", 0, "p1", NOV);
    expect(deComunidad(d, COM).tiempo.declaradas["2026-11"].horas).toBe(0);
  });
  it("no se declara un mes pasado ni uno futuro", () => {
    const e = aceptadoVariable();
    expect(ok(e, "2026-10", 10, NOV)).toBe("mes");
    expect(ok(e, "2026-12", 10, NOV)).toBe("mes");
  });
  it("corregir antes de la respuesta reemplaza la declaración del mes", () => {
    const a = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    const b = conDeclaracion(a, "2026-11", 20, "p2", NOV);
    expect(deComunidad(b, COM).tiempo.declaradas["2026-11"]).toMatchObject({ horas: 20, propuestaId: "p2", estado: "declarada" });
  });
  it("un mes confirmado no se edita", () => {
    const a = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    const c = reducir(a, { tipo: "confirmarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1" });
    expect(ok(c, "2026-11", 20, NOV)).toBe("confirmada");
    expect(conDeclaracion(c, "2026-11", 20, "p2", NOV)).toBe(c);
  });
  it("un mes pasado 'a revisar' se puede volver a declarar", () => {
    let e = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    e = reducir(e, { tipo: "revisarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1", motivo: "Fueron 20, no 24" });
    expect(deComunidad(e, COM).tiempo.declaradas["2026-11"]).toMatchObject({ estado: "a-revisar", motivo: "Fueron 20, no 24" });
    expect(ok(e, "2026-11", 20, DIC)).toBeNull();
    const de_nuevo = conDeclaracion(e, "2026-11", 20, "p2", DIC);
    expect(deComunidad(de_nuevo, COM).tiempo.declaradas["2026-11"]).toMatchObject({ estado: "declarada", horas: 20, propuestaId: "p2" });
  });
  it("con el pacto sin aceptar, o fijo, no se declara", () => {
    expect(ok(borradorVariable(), "2026-11", 10, NOV)).toBe("sin-pacto");
    const fijo = aplicar(INICIAL, { tipo: "rol", comunidad: COM, rol: "jardineria" }, { tipo: "descripcion", comunidad: COM, texto: "x" }, { tipo: "avanzar", comunidad: COM }, { tipo: "avanzar", comunidad: COM });
    expect(ok(fijo, "2026-11", 10, NOV)).toBe("sin-pacto");
  });
  it("con ahora = 30-nov 22:30 de Argentina se declara noviembre; un minuto después es diciembre", () => {
    const e = aceptadoVariable();
    expect(ok(e, "2026-11", 10, "2026-12-01T01:30:00.000Z")).toBeNull();
    expect(ok(e, "2026-12", 10, "2026-12-01T01:30:00.000Z")).toBe("mes");
    expect(ok(e, "2026-12", 10, "2026-12-01T03:30:00.000Z")).toBeNull();
  });
  it("las respuestas se aplican una sola vez y solo a la declaración vigente", () => {
    const a = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    expect(reducir(a, { tipo: "confirmarMes", comunidad: COM, mes: "2026-11", propuestaId: "otra" })).toBe(a);
    const c = reducir(a, { tipo: "confirmarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1" });
    expect(reducir(c, { tipo: "confirmarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1" })).toBe(c);
    expect(reducir(c, { tipo: "revisarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1", motivo: "x" })).toBe(c);
  });
});

describe("el registro de las horas de cada mes", () => {
  const declara = (lista: ConstanciaPacto[], mes = "2026-11", horas = 24, cuando = NOV) => declararMes(lista, { idPersona: PERSONA, comunidad: COM, mes, horas }, cuando);

  it("declarar escribe una pacto-propone-horas con el mes sobre el pacto de la comunidad", () => {
    const r = declara([]);
    expect(r.resultado).toBe("ok");
    expect(r.lista).toHaveLength(1);
    expect(r.lista[0]).toMatchObject({ esquema: "pacto-propone-horas", sobre: sobreDe(COM, PERSONA), afirma: afirmaPersona(PERSONA), datos: { mes: "2026-11", horas: "24" } });
  });
  it("horas inválidas o mes inválido no escriben nada", () => {
    expect(declara([], "2026-11", 41).resultado).toBe("horas-invalidas");
    expect(declara([], "2026-11", 81).resultado).toBe("horas-invalidas");
    expect(declara([], "2026-13", 10).resultado).toBe("mes-invalido");
    expect(declara([], "2026-11", 41).lista).toEqual([]);
  });
  it("corregir antes de la respuesta revoca la anterior: la tribu ve una sola declaración del mes", () => {
    const a = declara([]).lista;
    const b = declara(a, "2026-11", 20).lista;
    expect(declaracionVigente(b, PERSONA, COM, "2026-11")?.datos.horas).toBe("20");
    expect(declaracionesParaVer(b, sesionLider)).toHaveLength(1);
    expect(declaracionesParaVer(b, sesionLider)[0].h.datos.horas).toBe("20");
  });
  it("la tribu confirma: queda una confirmación con las mismas horas y el mes", () => {
    const a = declara([]).lista;
    const id = a[0].id;
    const r = responderMes(a, { declaracionId: id, confirma: true, sesion: sesionLider }, DIC);
    expect(r.resultado).toBe("ok");
    const conf = r.lista[r.lista.length - 1];
    expect(conf).toMatchObject({ esquema: "pacto-confirma-horas", afirma: afirmaComunidad(COM), por: LIDER, apuntaA: id, datos: { horas: "24", mes: "2026-11" } });
    expect(respuestaDeMes(r.lista, a[0])?.id).toBe(conf.id);
  });
  it("confirmar dos veces escribe una sola vez", () => {
    const a = declara([]).lista;
    const r = responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sesionLider }, DIC);
    const dos = responderMes(r.lista, { declaracionId: a[0].id, confirma: true, sesion: sesionLider }, DIC);
    expect(dos.resultado).toBe("ya-respondida");
    expect(dos.lista).toHaveLength(r.lista.length);
  });
  it("nadie confirma sus propias horas ni lo hace otra tribu", () => {
    const a = declara([]).lista;
    const propio: QuienResponde = { idPersona: PERSONA, esSuperAdmin: false, tribuLider: COM };
    expect(responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: propio }, DIC).resultado).toBe("sin-permiso");
    expect(responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sesionOtraTribu }, DIC).resultado).toBe("sin-permiso");
    expect(declaracionesParaVer(a, sesionOtraTribu)).toEqual([]);
    expect(declaracionesParaVer(a, propio)[0].puede).toBe(false);
  });
  it("pedir revisar exige un motivo", () => {
    const a = declara([]).lista;
    expect(responderMes(a, { declaracionId: a[0].id, confirma: false, motivo: "  ", sesion: sesionLider }, DIC).resultado).toBe("sin-motivo");
    const r = responderMes(a, { declaracionId: a[0].id, confirma: false, motivo: "Fueron 20, no 24", sesion: sesionLider }, DIC);
    expect(r.resultado).toBe("ok");
    expect(r.lista[r.lista.length - 1]).toMatchObject({ esquema: "pacto-no-acepta", datos: { motivo: "Fueron 20, no 24" } });
  });
  it("el super admin responde en el Lighthouse", () => {
    const sup: QuienResponde = { idPersona: SUPER, esSuperAdmin: true, tribuLider: null };
    const a = declararMes([], { idPersona: PERSONA, comunidad: "lighthouse", mes: "2026-11", horas: 10 }, NOV).lista;
    expect(responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sup }, DIC).resultado).toBe("ok");
    expect(responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sesionLider }, DIC).resultado).toBe("sin-permiso");
  });
  it("con la declaración ya confirmada no se corrige ni se revoca nada", () => {
    const a = declara([]).lista;
    const r = responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sesionLider }, DIC).lista;
    const otra = declara(r, "2026-11", 20);
    expect(otra.resultado).toBe("ya-respondida");
    expect(otra.lista).toHaveLength(r.length);
  });
  it("un revoca posterior a una confirmación que cuenta se ignora", () => {
    const a = declara([]).lista;
    const r = responderMes(a, { declaracionId: a[0].id, confirma: true, sesion: sesionLider }, DIC).lista;
    const revocada = agregar(r, { esquema: "revoca", afirma: afirmaPersona(PERSONA), por: PERSONA, sobre: a[0].sobre, version: 0, apuntaA: a[0].id }, DIC);
    expect(respuestaDeMes(revocada, a[0])).not.toBeNull();
    expect(declaracionVigente(revocada, PERSONA, COM, "2026-11")?.id).toBe(a[0].id);
  });
  it("una confirmación posterior al revoca de la declaración se ignora", () => {
    const a = declara([]).lista;
    const rev = revocar(a, a[0].id, PERSONA, NOV);
    const conf = agregar(rev, { esquema: "pacto-confirma-horas", afirma: afirmaComunidad(COM), por: LIDER, sobre: a[0].sobre, version: 0, apuntaA: a[0].id, datos: { horas: "24", mes: "2026-11" } }, DIC);
    expect(respuestaDeMes(conf, a[0])).toBeNull();
  });
  it("no cuenta una confirmación con otras horas, de otra comunidad o dada por la persona", () => {
    const a = declara([]).lista;
    const base = { esquema: "pacto-confirma-horas" as const, sobre: a[0].sobre, version: 0, apuntaA: a[0].id };
    const otrasHoras = agregar(a, { ...base, afirma: afirmaComunidad(COM), por: LIDER, datos: { horas: "30", mes: "2026-11" } }, DIC);
    expect(respuestaDeMes(otrasHoras, a[0])).toBeNull();
    const otraTribu = agregar(a, { ...base, afirma: afirmaComunidad("agua"), por: LIDER, datos: { horas: "24", mes: "2026-11" } }, DIC);
    expect(respuestaDeMes(otraTribu, a[0])).toBeNull();
    const propia = agregar(a, { ...base, afirma: afirmaComunidad(COM), por: PERSONA, datos: { horas: "24", mes: "2026-11" } }, DIC);
    expect(respuestaDeMes(propia, a[0])).toBeNull();
  });
  it("tras pedir revisar, la persona vuelve a declarar el mes y la tribu ve solo la nueva", () => {
    const a = declara([]).lista;
    const rev = responderMes(a, { declaracionId: a[0].id, confirma: false, motivo: "Fueron 20", sesion: sesionLider }, DIC).lista;
    const de_nuevo = declara(rev, "2026-11", 20, DIC);
    expect(de_nuevo.resultado).toBe("ok");
    const ver = declaracionesParaVer(de_nuevo.lista, sesionLider);
    expect(ver).toHaveLength(1);
    expect(ver[0].h.datos.horas).toBe("20");
  });
  it("al leer, 0 h del mes es un dato y las horas mal formadas se ignoran", () => {
    const base = { id: "p1-pacto-propone-horas", esquema: "pacto-propone-horas", afirma: afirmaPersona(PERSONA), por: PERSONA, sobre: sobreDe(COM, PERSONA), version: 0, apuntaA: null, cuando: NOV, revocable: true };
    const crudo = JSON.stringify([
      { ...base, datos: { mes: "2026-11", horas: "0" } },
      { ...base, id: "p2-x", datos: { mes: "2026-11", horas: "41" } },
      { ...base, id: "p3-x", datos: { mes: "2026-11", horas: "81" } },
      { ...base, id: "p4-x", datos: { mes: "2026-13", horas: "10" } },
      { ...base, id: "p5-x", datos: { horas: "10" } },
    ]);
    expect(leerConstancias(crudo).map((c) => c.id)).toEqual(["p1-pacto-propone-horas"]);
  });
});

describe("conciliar las horas de cada mes", () => {
  function escenario() {
    let e = aceptadoVariable();
    const r = declararMes([], { idPersona: PERSONA, comunidad: COM, mes: "2026-11", horas: 24 }, NOV);
    e = conDeclaracion(e, "2026-11", 24, r.id!, NOV);
    return { e, lista: r.lista, id: r.id! };
  }

  it("la confirmación de la tribu confirma el mes, una sola vez", () => {
    const { e, lista, id } = escenario();
    const conf = responderMes(lista, { declaracionId: id, confirma: true, sesion: sesionLider }, DIC).lista;
    const r = conciliar(e, conf, PERSONA);
    expect(deComunidad(r.estado, COM).tiempo.declaradas["2026-11"]).toMatchObject({ estado: "confirmada", horas: 24 });
    expect(r.aplicadas).toMatchObject([{ tipo: "confirma-mes", comunidad: COM, mes: "2026-11", horas: 24 }]);
    expect(conciliar(r.estado, conf, PERSONA).aplicadas).toEqual([]);
  });
  it("el pedido de revisar deja el mes 'a revisar' con el motivo", () => {
    const { e, lista, id } = escenario();
    const rev = responderMes(lista, { declaracionId: id, confirma: false, motivo: "Fueron 20, no 24", sesion: sesionLider }, DIC).lista;
    const r = conciliar(e, rev, PERSONA);
    expect(deComunidad(r.estado, COM).tiempo.declaradas["2026-11"]).toMatchObject({ estado: "a-revisar", motivo: "Fueron 20, no 24" });
    expect(r.aplicadas).toMatchObject([{ tipo: "revisa-mes", mes: "2026-11", motivo: "Fueron 20, no 24" }]);
  });
  it("sin respuesta no cambia nada, y sin registro tampoco", () => {
    const { e, lista } = escenario();
    expect(conciliar(e, lista, PERSONA).aplicadas).toEqual([]);
    expect(conciliar(e, null, PERSONA).estado).toBe(e);
  });
  it("una respuesta a una declaración revocada se ignora", () => {
    const { e, lista, id } = escenario();
    const corregida = declararMes(lista, { idPersona: PERSONA, comunidad: COM, mes: "2026-11", horas: 20 }, NOV);
    const tarde = agregar(corregida.lista, { esquema: "pacto-confirma-horas", afirma: afirmaComunidad(COM), por: LIDER, sobre: sobreDe(COM, PERSONA), version: 0, apuntaA: id, datos: { horas: "24", mes: "2026-11" } }, DIC);
    expect(conciliar(e, tarde, PERSONA).aplicadas).toEqual([]);
  });
  it("leerPactosConciliados aplica la confirmación en memoria", () => {
    const { e, lista, id } = escenario();
    const conf = responderMes(lista, { declaracionId: id, confirma: true, sesion: sesionLider }, DIC).lista;
    const t = deComunidad(leerPactosConciliados(JSON.stringify(e), PERSONA, conf, DIC), COM).tiempo;
    expect(t.declaradas["2026-11"].estado).toBe("confirmada");
  });
});

describe("cambiar de modalidad o de rango", () => {
  const propuestaDe = (e: EstadoPactos, version: number): ConstanciaPacto[] => {
    const t = deComunidad(e, COM).tiempo;
    return agregar(
      [],
      {
        esquema: "pacto-propone",
        afirma: afirmaPersona(PERSONA),
        por: PERSONA,
        sobre: sobreDe(COM, PERSONA),
        version,
        datos: datosDePropuesta({ tipo: "cambio", contenido: t.cambio!, vigente: t, nombre: "Ana", iniciales: "A", proponeLider: false }),
      },
      NOV,
    );
  };

  it("de fija a variable aceptado: versión 2 con el compromiso de la comunidad y el historial muestra la versión 1 como fija", () => {
    const fijo = aplicar(
      INICIAL,
      { tipo: "rol", comunidad: COM, rol: "jardineria" },
      { tipo: "descripcion", comunidad: COM, texto: "x" },
      { tipo: "horas", comunidad: COM, horas: 10 },
      { tipo: "avanzar", comunidad: COM },
      { tipo: "avanzar", comunidad: COM, ahora: "2026-10-30T12:00:00.000Z" },
    );
    const cambiando = aplicar(
      fijo,
      { tipo: "proponerCambio", comunidad: COM },
      { tipo: "editarCambio", comunidad: COM, cambios: { modalidad: "variable", rango: { min: 0, max: 30 } } },
      { tipo: "enviarCambio", comunidad: COM },
    );
    const cambio = deComunidad(cambiando, COM).tiempo.cambio!;
    expect(cambio).toMatchObject({ modalidad: "variable", rango: { min: 0, max: 30 }, compromisoMeses: 3, paso: 1 });
    // Mientras no se acepta, la versión vigente rige.
    expect(deComunidad(cambiando, COM).tiempo).toMatchObject({ modalidad: "fija", horas: 10, version: 1 });
    const lista = propuestaDe(cambiando, 2);
    const acepta = agregar(lista, { esquema: "pacto-acepta", afirma: afirmaComunidad(COM), por: LIDER, sobre: lista[0].sobre, version: 2, apuntaA: lista[0].id }, DIC);
    const r = conciliar(cambiando, acepta, PERSONA);
    const t = deComunidad(r.estado, COM).tiempo;
    expect(t).toMatchObject({ version: 2, modalidad: "variable", rango: { min: 0, max: 30 }, compromisoMeses: 3 });
    expect(t.historial.map((h) => [h.version, h.modalidad])).toEqual([[1, "fija"], [2, "variable"]]);
    expect(textoHorasDelPacto(t.historial[0], "es")).toBe("10 h/mes");
    expect(textoHorasDelPacto(t.historial[1], "es")).toBe("entre 0 y 30 h/mes");
  });
  it("de variable a otro rango: un cambio conserva el compromiso", () => {
    const e = aplicar(aceptadoVariable("agua"), { tipo: "proponerCambio", comunidad: "agua" }, { tipo: "editarCambio", comunidad: "agua", cambios: { rango: { min: 0, max: 40 } } });
    expect(deComunidad(e, "agua").tiempo.cambio).toMatchObject({ modalidad: "variable", rango: { min: 0, max: 40 }, compromisoMeses: 2 });
  });
  it("un cambio con rango al revés no se envía", () => {
    const e = aplicar(aceptadoVariable(), { tipo: "proponerCambio", comunidad: COM }, { tipo: "editarCambio", comunidad: COM, cambios: { rango: { min: 40, max: 10 } } });
    expect(reducir(e, { tipo: "enviarCambio", comunidad: COM })).toBe(e);
  });
  it("las declaraciones sobreviven al cambio y al pasar a fija se conserva el compromiso en el historial", () => {
    let e = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    e = reducir(e, { tipo: "confirmarMes", comunidad: COM, mes: "2026-11", propuestaId: "p1" });
    e = aplicar(e, { tipo: "proponerCambio", comunidad: COM }, { tipo: "editarCambio", comunidad: COM, cambios: { modalidad: "fija", horas: 10 } }, { tipo: "enviarCambio", comunidad: COM }, { tipo: "aceptarCambio", comunidad: COM, ahora: DIC });
    const t = deComunidad(e, COM).tiempo;
    expect(t).toMatchObject({ modalidad: "fija", compromisoMeses: null, version: 2 });
    expect(t.declaradas["2026-11"]).toMatchObject({ estado: "confirmada", horas: 24 });
    expect(t.historial[0]).toMatchObject({ modalidad: "variable", compromisoMeses: 3 });
  });
});

describe("compatibilidad con lo guardado", () => {
  it("un pacto guardado sin modalidad se lee como 'fija' con sus horas y sin compromiso", () => {
    const crudo = JSON.stringify({ comunidades: { [COM]: { tiempo: { rol: "jardineria", rolOtro: "", descripcion: "x", horas: 10, paso: 2, version: 1 }, aportes: [] } } });
    const t = deComunidad(leer(crudo, NOV), COM).tiempo;
    expect(t).toMatchObject({ modalidad: "fija", horas: 10, compromisoMeses: null, paso: 2, version: 1, declaradas: {} });
  });
  it("lo guardado se lee igual", () => {
    const e = conDeclaracion(aceptadoVariable(), "2026-11", 24, "p1", NOV);
    expect(leer(JSON.stringify(e), NOV)).toEqual(e);
  });
  it("las declaraciones rotas se descartan sin romper el resto", () => {
    const e = aceptadoVariable();
    const t = deComunidad(e, COM).tiempo;
    const buena = { horas: 24, estado: "confirmada", propuestaId: "p1" };
    const declaradas = {
      "2026-11": buena,
      "2026-9": buena,
      "no-es-mes": buena,
      "2026-10": { ...buena, horas: 90 },
      "2026-08": { ...buena, horas: 25 },
      "2026-07": { ...buena, estado: "rara" },
      "2026-06": { ...buena, propuestaId: "" },
      "2027-01": buena,
    };
    const crudo = JSON.stringify({ comunidades: { [COM]: { tiempo: { ...t, declaradas }, aportes: [] } } });
    expect(Object.keys(deComunidad(leer(crudo, NOV), COM).tiempo.declaradas)).toEqual(["2026-11"]);
    // El mismo mes pasa a ser válido cuando el reloj llega a enero.
    expect(Object.keys(deComunidad(leer(crudo, "2027-01-15T12:00:00.000Z"), COM).tiempo.declaradas).sort()).toEqual(["2026-11", "2027-01"]);
  });
  it("una variable guardada sin compromiso toma el de la comunidad", () => {
    const t = deComunidad(aceptadoVariable("agua"), "agua").tiempo;
    const crudo = JSON.stringify({ comunidades: { agua: { tiempo: { ...t, compromisoMeses: undefined }, aportes: [] } } });
    expect(deComunidad(leer(crudo, NOV), "agua").tiempo.compromisoMeses).toBe(2);
  });
  it("la propuesta del pacto lleva modalidad, rango y compromiso, y la aceptación toma lo que la tribu vio", () => {
    const e = reducir(borradorVariable(), { tipo: "avanzar", comunidad: COM });
    const t = deComunidad(e, COM).tiempo;
    const datos = datosDePropuesta({ tipo: "nuevo", contenido: t, nombre: "Ana", iniciales: "A", proponeLider: false });
    expect(datos).toMatchObject({ modalidad: "variable", rangoMin: "0", rangoMax: "30", compromisoMeses: "3" });
    const lista = agregar([], { esquema: "pacto-propone", afirma: afirmaPersona(PERSONA), por: PERSONA, sobre: sobreDe(COM, PERSONA), version: 1, datos }, NOV);
    const acepta = agregar(lista, { esquema: "pacto-acepta", afirma: afirmaComunidad(COM), por: LIDER, sobre: lista[0].sobre, version: 1, apuntaA: lista[0].id }, DIC);
    // El estado local fue tocado después de enviar; vale lo que la tribu vio.
    const tocado = { ...e, comunidades: { [COM]: { ...e.comunidades[COM], tiempo: { ...t, rango: { min: 0, max: 80 }, compromisoMeses: 1 as const } } } };
    const r = conciliar(tocado, acepta, PERSONA);
    expect(deComunidad(r.estado, COM).tiempo).toMatchObject({ paso: 2, modalidad: "variable", rango: { min: 0, max: 30 }, compromisoMeses: 3 });
  });
  it("una aceptación con un rango que no sirve no se aplica", () => {
    const e = reducir(borradorVariable(), { tipo: "avanzar", comunidad: COM });
    const t = deComunidad(e, COM).tiempo;
    const datos = { ...datosDePropuesta({ tipo: "nuevo", contenido: t, nombre: "Ana", iniciales: "A", proponeLider: false }), rangoMin: "30", rangoMax: "10" };
    const lista = agregar([], { esquema: "pacto-propone", afirma: afirmaPersona(PERSONA), por: PERSONA, sobre: sobreDe(COM, PERSONA), version: 1, datos }, NOV);
    const acepta = agregar(lista, { esquema: "pacto-acepta", afirma: afirmaComunidad(COM), por: LIDER, sobre: lista[0].sobre, version: 1, apuntaA: lista[0].id }, DIC);
    expect(conciliar(e, acepta, PERSONA).aplicadas).toEqual([]);
  });
});

describe("fin de mes en Argentina", () => {
  it("declarar el 30-nov a las 22:30 es de noviembre", () => {
    expect(motivoNoDeclara(deComunidad(aceptadoVariable(), COM).tiempo, "2026-11", 10, FIN_NOV)).toBeNull();
  });
});
