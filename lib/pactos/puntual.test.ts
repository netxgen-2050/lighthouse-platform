import { describe, expect, it } from "vitest";
import {
  afirmaPersona,
  agregar,
  contraparteDe,
  datosDePostulacion,
  necesidadDeSobre,
  pendientes,
  preadmitidasDe,
  revocar,
  sobreDe,
  sobreEsDe,
  sobrePuntual,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import { INICIAL, conciliar, leer, puntualCompleto, puntualDe, puntualesDe, pactosAceptados, reducirPuntual, type EstadoPactos } from "./estado";
import { constanciasDe, quitarConstanciasDe, type Almacen } from "./registro-compartido";
import { responderPostulacion } from "./postulacion";
import { buscarNecesidad } from "@/lib/tribus/necesidades";

const T = "2026-10-28T10:00:00.000Z";
const PERSONA = "prueba:persona@prueba.test";
const OTRA = "prueba:otra@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const lider: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: "valle" };

const solar = buscarNecesidad("valle-solar")!;
const eventos = buscarNecesidad("valle-eventos")!;

/** Un estado con la postulación a "Energía solar" completa y enviada. */
function enviado(descripcion = "Monto los paneles"): EstadoPactos {
  let e = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
  e = reducirPuntual(e, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { descripcion } });
  return reducirPuntual(e, { tipo: "enviarPuntual", comunidad: "valle", necesidadId: "valle-solar" });
}

function publica(lista: ConstanciaPacto[], estado: EstadoPactos, persona = PERSONA, holon = "circulo:valle-3") {
  const p = puntualDe(estado, "valle", "valle-solar")!;
  return agregar(
    lista,
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(persona),
      por: persona,
      sobre: sobrePuntual(p.necesidadId, persona),
      version: 1,
      datos: datosDePostulacion({
        comunidad: "valle",
        necesidad: p.necesidadId,
        holon,
        relacion: "miembro",
        rol: p.rol,
        rolOtro: p.rolOtro,
        descripcion: p.descripcion,
        horas: p.horas ?? 0,
        fecha: p.fecha ?? "",
        tope: p.tope,
        topeTotal: p.topeTotal,
        nombre: "Ana",
        iniciales: "A",
        proponeLider: false,
      }),
    },
    T,
  );
}

describe("la postulación nace de la necesidad", () => {
  it("toma título, habilidad, horas, fecha y máximos de la ficha; la descripción queda vacía", () => {
    const e = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
    expect(puntualDe(e, "valle", "valle-solar")).toEqual({
      necesidadId: "valle-solar",
      rol: "otro",
      rolOtro: "Electricidad",
      descripcion: "",
      horas: 10,
      fecha: "2026-11-21",
      tope: { unidad: "horas", valor: 10 },
      topeTotal: { unidad: "horas", valor: 20 },
      paso: "borrador",
    });
  });
  it("lo que falta queda vacío, no en 0", () => {
    const e = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: eventos });
    const p = puntualDe(e, "valle", "valle-eventos")!;
    expect(p.horas).toBeNull();
    expect(p.tope).toBeNull();
    expect(p.topeTotal).toBeNull();
    const taller = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "taller", necesidad: buscarNecesidad("taller-textil")! });
    expect(puntualDe(taller, "taller", "taller-textil")!.fecha).toBeNull();
  });
  it("no duplica", () => {
    const uno = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
    expect(reducirPuntual(uno, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar })).toBe(uno);
  });
  it("no se envía incompleto (sin descripción, sin horas o con fecha rara)", () => {
    const base = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
    const enviar = (e: EstadoPactos) => reducirPuntual(e, { tipo: "enviarPuntual", comunidad: "valle", necesidadId: "valle-solar" });
    expect(enviar(base)).toBe(base);
    const conDescripcion = reducirPuntual(base, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { descripcion: "ok" } });
    expect(puntualDe(enviar(conDescripcion), "valle", "valle-solar")!.paso).toBe("enviado");
    const sinHoras = reducirPuntual(conDescripcion, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { horas: null } });
    expect(enviar(sinHoras)).toBe(sinHoras);
    const sinFecha = reducirPuntual(conDescripcion, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { fecha: "2026-02-31" } });
    expect(puntualDe(sinFecha, "valle", "valle-solar")!.fecha).toBeNull();
    expect(enviar(sinFecha)).toBe(sinFecha);
  });
  it("las horas son enteras de 1 a 200", () => {
    const base = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
    const con = (horas: number) =>
      puntualDe(reducirPuntual(base, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { horas } }), "valle", "valle-solar")!.horas;
    expect(con(0)).toBe(1);
    expect(con(500)).toBe(200);
    expect(con(7.4)).toBe(7);
  });
  it("retirar vuelve a borrador con el contenido; descartar solo en borrador", () => {
    const e = enviado();
    const retirado = reducirPuntual(e, { tipo: "retirarPuntual", comunidad: "valle", necesidadId: "valle-solar" });
    expect(puntualDe(retirado, "valle", "valle-solar")).toMatchObject({ paso: "borrador", descripcion: "Monto los paneles", horas: 10, fecha: "2026-11-21", rol: "otro" });
    expect(reducirPuntual(e, { tipo: "descartarPuntual", comunidad: "valle", necesidadId: "valle-solar" })).toBe(e);
    expect(puntualesDe(reducirPuntual(retirado, { tipo: "descartarPuntual", comunidad: "valle", necesidadId: "valle-solar" }))).toEqual([]);
  });
  it("editar solo vale en borrador", () => {
    const e = enviado();
    expect(reducirPuntual(e, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { descripcion: "otra" } })).toBe(e);
  });
  it("cada acción fuera de su paso devuelve el mismo estado", () => {
    const borrador = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: solar });
    const contenido = puntualDe(borrador, "valle", "valle-solar")!;
    expect(reducirPuntual(borrador, { tipo: "retirarPuntual", comunidad: "valle", necesidadId: "valle-solar" })).toBe(borrador);
    expect(reducirPuntual(borrador, { tipo: "preadmitirPuntual", comunidad: "valle", necesidadId: "valle-solar", contenido })).toBe(borrador);
    expect(reducirPuntual(borrador, { tipo: "noPreadmitirPuntual", comunidad: "valle", necesidadId: "valle-solar", motivo: "x", cuando: T })).toBe(borrador);
    expect(reducirPuntual(INICIAL, { tipo: "enviarPuntual", comunidad: "valle", necesidadId: "valle-solar" })).toBe(INICIAL);
  });
  it("puntualCompleto pide rol, texto del rol Otro, descripción, horas y fecha", () => {
    const base = { rol: "otro" as const, rolOtro: "x", descripcion: "y", horas: 3, fecha: "2026-11-01" };
    expect(puntualCompleto(base)).toBe(true);
    expect(puntualCompleto({ ...base, rolOtro: " " })).toBe(false);
    expect(puntualCompleto({ ...base, rol: "" })).toBe(false);
    expect(puntualCompleto({ ...base, descripcion: " " })).toBe(false);
    expect(puntualCompleto({ ...base, horas: null })).toBe(false);
    expect(puntualCompleto({ ...base, fecha: null })).toBe(false);
  });
});

describe("constancias de la postulación", () => {
  it("el sobre se arma completo y se reconoce sin partirlo por los dos puntos", () => {
    const sobre = sobrePuntual("valle-solar", "prueba:ana@x.test");
    expect(sobre).toBe("puntual:valle-solar:prueba:ana@x.test");
    expect(necesidadDeSobre(sobre)).toBe("valle-solar");
    expect(sobreEsDe(sobre, "prueba:ana@x.test")).toBe(true);
    // Un id que termina igual no es el mismo.
    expect(sobreEsDe(sobre, "ana@x.test")).toBe(false);
    expect(sobreEsDe(sobre, "x.test")).toBe(false);
    // Los pactos de tiempo siguen igual.
    expect(sobreEsDe(sobreDe("valle", "prueba:ana@x.test"), "prueba:ana@x.test")).toBe(true);
  });

  it("la propuesta lleva el holón, la relación y los máximos que vio el holón, y nunca el email", () => {
    const lista = publica([], enviado());
    const d = lista[0].datos;
    expect(d).toMatchObject({
      tipo: "puntual",
      comunidad: "valle",
      necesidad: "valle-solar",
      holon: "circulo:valle-3",
      relacion: "miembro",
      topeUnidad: "horas",
      topeValor: "10",
      topeTotalUnidad: "horas",
      topeTotalValor: "20",
      horas: "10",
      fecha: "2026-11-21",
    });
    expect(JSON.stringify(lista[0].datos)).not.toContain("@");
    expect(contraparteDe(lista[0])).toBe("circulo:valle-3");
  });

  it("una necesidad sin máximos deja los datos vacíos", () => {
    let e = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: eventos });
    e = reducirPuntual(e, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-eventos", cambios: { descripcion: "x", horas: 5 } });
    const p = puntualDe(e, "valle", "valle-eventos")!;
    const lista = agregar(
      [],
      {
        esquema: "pacto-propone",
        afirma: afirmaPersona(PERSONA),
        por: PERSONA,
        sobre: sobrePuntual(p.necesidadId, PERSONA),
        version: 1,
        datos: datosDePostulacion({ comunidad: "valle", necesidad: p.necesidadId, holon: "circulo:comunicacion-comun", relacion: "aspirante", rol: p.rol, rolOtro: "", descripcion: "x", horas: 5, fecha: "2026-12-19", tope: p.tope, topeTotal: p.topeTotal, nombre: "", iniciales: "A", proponeLider: false }),
      },
      T,
    );
    expect(lista[0].datos).toMatchObject({ topeUnidad: "", topeValor: "", topeTotalUnidad: "", topeTotalValor: "" });
    expect(lista[0].datos.nombre).toBeUndefined();
    expect(lista[0].datos.iniciales).toBe("A");
  });

  it("una pre-admisión del holón deja la postulación acordada; la de otra tribu, otro círculo o de la misma persona no", () => {
    const base = publica([], enviado());
    const acepta = (afirma: string, por: string) =>
      agregar(base, { esquema: "pacto-acepta", afirma, por, sobre: base[0].sobre, version: 1, apuntaA: base[0].id }, T);
    expect(preadmitidasDe(acepta("circulo:valle-3", LIDER), "valle-solar")).toHaveLength(1);
    expect(preadmitidasDe(acepta("tribu:valle", LIDER), "valle-solar")).toHaveLength(0);
    expect(preadmitidasDe(acepta("tribu:semilla", LIDER), "valle-solar")).toHaveLength(0);
    expect(preadmitidasDe(acepta("circulo:valle-1", LIDER), "valle-solar")).toHaveLength(0);
    expect(preadmitidasDe(acepta("circulo:valle-3", PERSONA), "valle-solar")).toHaveLength(0);
  });

  it("dos personas pre-admitidas en la misma necesidad quedan las dos", () => {
    let lista = publica([], enviado());
    lista = publica(lista, enviado(), OTRA);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    lista = responderPostulacion(lista, { propuestaId: lista[1].id, acepta: true, sesion: lider }, T).lista;
    expect(preadmitidasDe(lista, "valle-solar")).toHaveLength(2);
    expect(preadmitidasDe(lista, "valle-eventos")).toHaveLength(0);
  });

  it("una postulación retirada o con la pre-admisión revocada no cuenta", () => {
    let lista = publica([], enviado());
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    const aceptaId = lista[lista.length - 1].id;
    expect(preadmitidasDe(revocar(lista, aceptaId, LIDER, T), "valle-solar")).toHaveLength(0);
    expect(preadmitidasDe(revocar(lista, lista[0].id, PERSONA, T), "valle-solar")).toHaveLength(0);
  });

  it("las postulaciones no aparecen como pactos de tiempo pendientes", () => {
    const lista = publica([], enviado());
    expect(pendientes(lista, ["valle", "lighthouse"])).toHaveLength(0);
  });

  it("la descarga y el borrado miran las postulaciones de esa persona y no tocan las de otra", () => {
    let lista = publica([], enviado(), "prueba:ana@x.test");
    lista = publica(lista, enviado(), "ana@x.test");
    expect(constanciasDe(lista, "prueba:ana@x.test")).toHaveLength(1);
    let guardado = JSON.stringify(lista);
    const almacen: Almacen = {
      getItem: () => guardado,
      setItem: (_k, v) => {
        guardado = v;
      },
    };
    expect(quitarConstanciasDe("prueba:ana@x.test", almacen)).toBe(true);
    const restante = JSON.parse(guardado) as ConstanciaPacto[];
    expect(restante).toHaveLength(1);
    expect(restante[0].afirma).toBe("persona:ana@x.test");
  });
});

describe("conciliar la pre-admisión", () => {
  it("pre-admitida: toma el contenido y los máximos de la propuesta que vio el holón", () => {
    const e = enviado();
    let lista = publica([], e);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    // El dato de ejemplo cambió después: vale lo que vio el holón.
    const cambiado = reducirPuntual(INICIAL, { tipo: "nuevoPuntual", comunidad: "valle", necesidad: { ...solar, tope: null } });
    const envio = reducirPuntual(
      reducirPuntual(cambiado, { tipo: "editarPuntual", comunidad: "valle", necesidadId: "valle-solar", cambios: { descripcion: "otra cosa", horas: 3 } }),
      { tipo: "enviarPuntual", comunidad: "valle", necesidadId: "valle-solar" },
    );
    const r = conciliar(envio, lista, PERSONA);
    expect(r.aplicadas).toMatchObject([{ tipo: "preadmite", necesidadId: "valle-solar", holon: "circulo:valle-3", comunidad: "valle" }]);
    expect(puntualDe(r.estado, "valle", "valle-solar")).toMatchObject({
      paso: "preadmitido",
      descripcion: "Monto los paneles",
      horas: 10,
      tope: { unidad: "horas", valor: 10 },
      topeTotal: { unidad: "horas", valor: 20 },
    });
  });

  it("no pre-admitida: vuelve a borrador con el contenido y el motivo", () => {
    const e = enviado();
    let lista = publica([], e);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: false, motivo: "Necesitamos matrícula", sesion: lider }, T).lista;
    const r = conciliar(e, lista, PERSONA);
    expect(r.aplicadas).toMatchObject([{ tipo: "no-preadmite", motivo: "Necesitamos matrícula" }]);
    expect(puntualDe(r.estado, "valle", "valle-solar")).toMatchObject({
      paso: "borrador",
      descripcion: "Monto los paneles",
      noPreadmitida: { motivo: "Necesitamos matrícula", cuando: T },
    });
  });

  it("conciliar dos veces aplica una sola vez", () => {
    const e = enviado();
    let lista = publica([], e);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    const una = conciliar(e, lista, PERSONA);
    const dos = conciliar(una.estado, lista, PERSONA);
    expect(dos.aplicadas).toHaveLength(0);
    expect(dos.estado).toBe(una.estado);
  });

  it("una respuesta de otro holón, o dada por la misma persona, no se aplica", () => {
    const e = enviado();
    const base = publica([], e);
    const mala = agregar(base, { esquema: "pacto-acepta", afirma: "tribu:valle", por: LIDER, sobre: base[0].sobre, version: 1, apuntaA: base[0].id }, T);
    expect(conciliar(e, mala, PERSONA).aplicadas).toHaveLength(0);
    const propia = agregar(base, { esquema: "pacto-acepta", afirma: "circulo:valle-3", por: PERSONA, sobre: base[0].sobre, version: 1, apuntaA: base[0].id }, T);
    expect(conciliar(e, propia, PERSONA).aplicadas).toHaveLength(0);
  });

  it("la respuesta a una postulación vieja ya retirada no se aplica a la nueva", () => {
    const e = enviado();
    let lista = publica([], e);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    lista = revocar(lista, lista[0].id, PERSONA, T);
    lista = publica(lista, e);
    expect(conciliar(e, lista, PERSONA).aplicadas).toHaveLength(0);
  });

  it("sin registro (null) no cambia nada", () => {
    const e = enviado();
    expect(conciliar(e, null, PERSONA)).toEqual({ estado: e, aplicadas: [] });
  });

  it("un puntual no se cuenta como pacto aceptado", () => {
    const e = enviado();
    let lista = publica([], e);
    lista = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).lista;
    expect(pactosAceptados(conciliar(e, lista, PERSONA).estado)).toEqual([]);
  });
});

describe("lectura de lo guardado", () => {
  it("lo guardado sin puntuales se lee con la lista vacía", () => {
    const crudo = JSON.stringify({ comunidades: { valle: { tiempo: { rol: "jardineria", rolOtro: "", descripcion: "x", horas: 10, paso: 2 }, aportes: [] } } });
    const e = leer(crudo);
    expect(e.comunidades.valle.puntuales).toEqual([]);
    expect(e.comunidades.valle.tiempo.paso).toBe(2);
  });

  it("corrige campo por campo: id raro, fecha o horas inválidas, enviado incompleto vuelve a borrador", () => {
    const crudo = JSON.stringify({
      comunidades: {
        valle: {
          tiempo: {},
          aportes: [],
          puntuales: [
            { necesidadId: "__proto__", paso: "enviado" },
            { necesidadId: "con:dospuntos" },
            { necesidadId: "valle-solar", rol: "otro", rolOtro: "x", descripcion: "y", horas: 10, fecha: "2026-11-21", paso: "preadmitido", tope: { unidad: "horas", valor: 10 }, topeTotal: { unidad: "semillas", valor: -3 } },
            { necesidadId: "valle-solar", paso: "enviado" },
            { necesidadId: "valle-eventos", rol: "coordinacion", descripcion: "z", horas: 0, fecha: "2026-02-31", paso: "enviado" },
            "basura",
          ],
        },
      },
    });
    const lista = leer(crudo).comunidades.valle.puntuales;
    expect(lista.map((p) => p.necesidadId)).toEqual(["valle-solar", "valle-eventos"]);
    expect(lista[0]).toMatchObject({ paso: "preadmitido", tope: { unidad: "horas", valor: 10 }, topeTotal: null });
    expect(lista[1]).toMatchObject({ paso: "borrador", horas: null, fecha: null });
  });
});
