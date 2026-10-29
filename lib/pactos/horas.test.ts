import { afterEach, describe, expect, it, vi } from "vitest";
import { semillasDeComunidad } from "@/lib/semillas/estado";
import { constanciaBasePuntual, leerConstanciaBase, limitesAplicados, type ConstanciaBase } from "./constancia-base";
import {
  afirmaPersona,
  agregar,
  confirmacionValida,
  confirmacionesDe,
  datosDePostulacion,
  leerConstancias,
  respuestaDeHoras,
  sobrePuntual,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import { HOUR_REF_USD } from "./datos";
import { INICIAL, conciliar, leer, reducirPuntual, type EstadoPactos } from "./estado";
import { horasDePostulacion, horasPendientes, marcarHecha, repartidoAntesDe, responderHoras, retirarHecha } from "./horas";
import { mesDe } from "./mes";
import { responderPostulacion } from "./postulacion";

const T = "2026-11-10T12:00:00.000Z";
const ANA = "prueba:persona@prueba.test";
const BETO = "prueba:beto@prueba.test";
const CATA = "prueba:cata@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const SUPER = "prueba:super@prueba.test";

const lider: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: "valle" };
const superAdmin: QuienResponde = { idPersona: SUPER, esSuperAdmin: true, tribuLider: null };
const liderAgua: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: "agua" };

type Caso = { necesidad: string; comunidad: string; holon: string; tope: [string, number] | null; total: [string, number] | null; sesion: QuienResponde };
const SOLAR: Caso = { necesidad: "valle-solar", comunidad: "valle", holon: "circulo:valle-3", tope: ["horas", 10], total: ["horas", 20], sesion: lider };
const PLOMERIA: Caso = { necesidad: "agua-plomeria", comunidad: "agua", holon: "circulo:agua-0", tope: ["semillas", 60], total: ["semillas", 150], sesion: liderAgua };
const EVENTOS_TRANSVERSAL: Caso = { necesidad: "valle-eventos", comunidad: "valle", holon: "circulo:comunicacion-comun", tope: null, total: null, sesion: superAdmin };

function topeDatos(x: [string, number] | null) {
  return x ? { unidad: x[0] as "horas" | "semillas", valor: x[1] } : null;
}

/** Postula y pre-admite a una persona. */
function preadmitida(lista: ConstanciaPacto[], persona: string, c: Caso, lidera = false): ConstanciaPacto[] {
  const con = agregar(
    lista,
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(persona),
      por: persona,
      sobre: sobrePuntual(c.necesidad, persona),
      version: 1,
      datos: datosDePostulacion({
        comunidad: c.comunidad, necesidad: c.necesidad, holon: c.holon, relacion: "miembro", rol: "otro", rolOtro: "X",
        descripcion: "Lo hago", horas: 10, fecha: "2026-11-21", tope: topeDatos(c.tope), topeTotal: topeDatos(c.total),
        nombre: persona === ANA ? "Ana" : "", iniciales: "P", proponeLider: lidera,
      }),
    },
    T,
  );
  const id = con[con.length - 1].id;
  return responderPostulacion(con, { propuestaId: id, acepta: true, sesion: c.sesion }, T).lista;
}

function marcada(lista: ConstanciaPacto[], persona: string, c: Caso, horas: number): ConstanciaPacto[] {
  const r = marcarHecha(lista, { idPersona: persona, necesidadId: c.necesidad, sobre: sobrePuntual(c.necesidad, persona), horas }, T);
  expect(r.resultado).toBe("ok");
  return r.lista;
}

function verificada(lista: ConstanciaPacto[], persona: string, c: Caso, cuando = T): ConstanciaPacto[] {
  const post = lista.find((x) => x.esquema === "pacto-propone" && x.sobre === sobrePuntual(c.necesidad, persona))!;
  const h = horasDePostulacion(lista, post.id)!;
  const r = responderHoras(lista, { propuestaHorasId: h.id, verifica: true, sesion: c.sesion }, cuando);
  expect(r.resultado).toBe("ok");
  return r.lista;
}

function tarea(lista: ConstanciaPacto[], persona: string, c: Caso, horas: number, cuando = T): ConstanciaPacto[] {
  return verificada(marcada(preadmitida(lista, persona, c), persona, c, horas), persona, c, cuando);
}

/** El estado local de la persona con la postulación pre-admitida y marcada hecha. */
function estadoHecha(c: Caso, horas: number): EstadoPactos {
  const post = { necesidadId: c.necesidad, rol: "otro" as const, rolOtro: "X", descripcion: "Lo hago", horas: 10, fecha: "2026-11-21", tope: topeDatos(c.tope), topeTotal: topeDatos(c.total) };
  return {
    ...INICIAL,
    comunidades: { [c.comunidad]: { tiempo: leer(null).comunidades[c.comunidad]?.tiempo ?? leerTiempoInicial(), aportes: [], puntuales: [{ ...post, paso: "hecha", horasReales: horas }] } },
  };
}
function leerTiempoInicial() {
  return {
    rol: "" as const,
    rolOtro: "",
    descripcion: "",
    modalidad: "fija" as const,
    horas: 8,
    rango: { min: 0, max: 20 },
    compromisoMeses: null,
    paso: 0 as const,
    version: 0,
    historial: [],
    declaradas: {},
  };
}

describe("mes en hora de Argentina", () => {
  it("el fin de mes no se corre por UTC", () => {
    expect(mesDe("2026-12-01T01:30:00Z")).toBe("2026-11");
    expect(mesDe("2026-11-10T12:00:00Z")).toBe("2026-11");
    expect(mesDe("no es fecha")).toBe("");
  });
});

describe("esquemas de horas", () => {
  it("la propuesta de horas apunta a la postulación pre-admitida y afirma la persona", () => {
    const lista = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 12);
    const post = lista.find((x) => x.esquema === "pacto-propone")!;
    const h = lista.find((x) => x.esquema === "pacto-propone-horas")!;
    expect(h.afirma).toBe(afirmaPersona(ANA));
    expect(h.apuntaA).toBe(post.id);
    expect(h.datos.horas).toBe("12");
    expect(h.revocable).toBe(true);
  });

  it("horas fuera de rango o sin pre-admisión no escriben nada", () => {
    const lista = preadmitida([], ANA, SOLAR);
    for (const horas of [0, 201, 1.5, Number.NaN]) {
      const r = marcarHecha(lista, { idPersona: ANA, necesidadId: "valle-solar", sobre: sobrePuntual("valle-solar", ANA), horas }, T);
      expect(r.resultado).toBe("horas-invalidas");
      expect(r.lista).toEqual(lista);
    }
    const sinPre = marcarHecha([], { idPersona: ANA, necesidadId: "valle-solar", sobre: sobrePuntual("valle-solar", ANA), horas: 5 }, T);
    expect(sinPre.resultado).toBe("no-preadmitida");
  });

  it("la confirmación afirma el holón y copia las horas", () => {
    const lista = tarea([], ANA, SOLAR, 12);
    const conf = lista.find((x) => x.esquema === "pacto-confirma-horas")!;
    expect(conf.afirma).toBe("circulo:valle-3");
    expect(conf.por).toBe(LIDER);
    expect(conf.datos.horas).toBe("12");
    expect(confirmacionValida(lista, conf)).toBe(true);
  });

  it("nadie verifica sus propias horas; el super admin sí verifica las del líder", () => {
    const propias = marcada(preadmitida([], LIDER, { ...SOLAR, sesion: superAdmin }, true), LIDER, SOLAR, 5);
    const h = propias.find((x) => x.esquema === "pacto-propone-horas")!;
    expect(horasPendientes(propias, lider)).toEqual([]);
    expect(responderHoras(propias, { propuestaHorasId: h.id, verifica: true, sesion: lider }, T).resultado).toBe("sin-permiso");
    expect(horasPendientes(propias, superAdmin).map((x) => x.id)).toEqual([h.id]);
  });

  it("una segunda respuesta se rechaza", () => {
    const lista = tarea([], ANA, SOLAR, 10);
    const h = lista.find((x) => x.esquema === "pacto-propone-horas")!;
    const otra = responderHoras(lista, { propuestaHorasId: h.id, verifica: true, sesion: lider }, T);
    expect(otra.resultado).toBe("ya-respondida");
    expect(otra.lista).toEqual(lista);
  });

  it("pedir revisar exige motivo y no deja constancia", () => {
    const lista = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10);
    const h = lista.find((x) => x.esquema === "pacto-propone-horas")!;
    expect(responderHoras(lista, { propuestaHorasId: h.id, verifica: false, motivo: "  ", sesion: lider }, T).resultado).toBe("sin-motivo");
    const r = responderHoras(lista, { propuestaHorasId: h.id, verifica: false, motivo: "Faltó conectar el inversor", sesion: lider }, T);
    expect(r.resultado).toBe("ok");
    expect(confirmacionesDe(r.lista, "valle-solar")).toEqual([]);
  });

  it("tras pedir revisar la propuesta vieja deja de estar viva y la persona puede marcar hecha de nuevo", () => {
    const lista = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10);
    const post = lista.find((x) => x.esquema === "pacto-propone")!;
    const vieja = lista.find((x) => x.esquema === "pacto-propone-horas")!;
    expect(marcarHecha(lista, { idPersona: ANA, necesidadId: "valle-solar", sobre: vieja.sobre, horas: 8 }, T).resultado).toBe("ya-marcada");
    const revisar = responderHoras(lista, { propuestaHorasId: vieja.id, verifica: false, motivo: "Faltó conectar el inversor", sesion: lider }, T).lista;
    expect(horasDePostulacion(revisar, post.id)).toBeNull();
    const otra = marcarHecha(revisar, { idPersona: ANA, necesidadId: "valle-solar", sobre: vieja.sobre, horas: 8 }, T);
    expect(otra.resultado).toBe("ok");
    const nueva = otra.lista.filter((x) => x.esquema === "pacto-propone-horas")[1];
    expect(horasDePostulacion(otra.lista, post.id)?.id).toBe(nueva.id);
    expect(nueva.datos.horas).toBe("8");
    // El holón ve solo la nueva y la respuesta vieja no se vuelve a aplicar a ella.
    expect(horasPendientes(otra.lista, lider).map((x) => x.id)).toEqual([nueva.id]);
    expect(respuestaDeHoras(otra.lista, nueva)).toBeNull();
  });

  it("horas fuera de rango o mes inválido se ignoran al leer, sin romper el resto", () => {
    const base = { id: "p1-x", afirma: "persona:a", por: "a", sobre: "puntual:n:a", version: 1, cuando: T, revocable: true };
    const crudo = JSON.stringify([
      { ...base, id: "p1-pacto-propone-horas", esquema: "pacto-propone-horas", datos: { horas: "0" } },
      { ...base, id: "p2-pacto-propone-horas", esquema: "pacto-propone-horas", datos: { horas: "5", mes: "2026-13" } },
      { ...base, id: "p3-pacto-propone-horas", esquema: "pacto-propone-horas", datos: { horas: "5", mes: "2026-11" } },
      { ...base, id: "p4-pacto-confirma-horas", esquema: "pacto-confirma-horas", datos: { horas: "201" } },
    ]);
    expect(leerConstancias(crudo).map((c) => c.id)).toEqual(["p3-pacto-propone-horas"]);
  });
});

describe("qué confirmación cuenta", () => {
  it("no cuenta la que afirma otro holón, la de la misma persona ni la de otras horas", () => {
    const base = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10);
    const h = base.find((x) => x.esquema === "pacto-propone-horas")!;
    const conf = (afirma: string, por: string, horas: string) =>
      agregar(base, { esquema: "pacto-confirma-horas", afirma, por, sobre: h.sobre, version: 1, apuntaA: h.id, datos: { horas } }, T);
    for (const lista of [conf("circulo:valle-1", LIDER, "10"), conf("circulo:valle-3", ANA, "10"), conf("circulo:valle-3", LIDER, "11")]) {
      expect(confirmacionesDe(lista, "valle-solar")).toEqual([]);
    }
    expect(confirmacionesDe(conf("circulo:valle-3", LIDER, "10"), "valle-solar")).toHaveLength(1);
  });

  it("no cuenta la que apunta a las horas de otra persona", () => {
    const base = marcada(preadmitida(marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10), BETO, SOLAR), BETO, SOLAR, 6);
    const hAna = base.find((x) => x.esquema === "pacto-propone-horas" && x.afirma === afirmaPersona(ANA))!;
    const lista = agregar(base, { esquema: "pacto-confirma-horas", afirma: "circulo:valle-3", por: LIDER, sobre: sobrePuntual("valle-solar", BETO), version: 1, apuntaA: hAna.id, datos: { horas: "10" } }, T);
    expect(confirmacionesDe(lista, "valle-solar")).toEqual([]);
  });

  it("un revoca posterior a una respuesta que cuenta se ignora; retirar con respuesta no escribe", () => {
    const lista = tarea([], ANA, SOLAR, 10);
    const h = lista.find((x) => x.esquema === "pacto-propone-horas")!;
    const r = retirarHecha(lista, { idPersona: ANA, propuestaHorasId: h.id }, T);
    expect(r.resultado).toBe("ya-respondida");
    expect(r.lista).toEqual(lista);
    const forzado = agregar(lista, { esquema: "revoca", afirma: h.afirma, por: ANA, sobre: h.sobre, version: 1, apuntaA: h.id }, T);
    expect(confirmacionesDe(forzado, "valle-solar")).toHaveLength(1);
  });

  it("una confirmación escrita después de retirar las horas no cuenta", () => {
    const base = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10);
    const h = base.find((x) => x.esquema === "pacto-propone-horas")!;
    const retirada = retirarHecha(base, { idPersona: ANA, propuestaHorasId: h.id }, T).lista;
    expect(horasDePostulacion(retirada, h.apuntaA!)).toBeNull();
    const tarde = agregar(retirada, { esquema: "pacto-confirma-horas", afirma: "circulo:valle-3", por: LIDER, sobre: h.sobre, version: 1, apuntaA: h.id, datos: { horas: "10" } }, T);
    expect(confirmacionesDe(tarde, "valle-solar")).toEqual([]);
  });
});

describe("círculos transversales administrados por Hifa", () => {
  it("la verificación del super admin lleva respaldoDeHifa; la de una tribu no", () => {
    const hifa = tarea([], ANA, EVENTOS_TRANSVERSAL, 5);
    expect(hifa.find((x) => x.esquema === "pacto-confirma-horas")!.datos.respaldoDeHifa).toBe("1");
    const comun = tarea([], ANA, SOLAR, 5);
    expect(comun.find((x) => x.esquema === "pacto-confirma-horas")!.datos.respaldoDeHifa).toBeUndefined();
  });
});

describe("constancia base", () => {
  const conf = (horas: number, cuando = "2026-11-10T12:00:00.000Z"): ConstanciaPacto => ({
    id: "p9-pacto-confirma-horas", esquema: "pacto-confirma-horas", afirma: "circulo:valle-3", por: LIDER, sobre: "puntual:valle-solar:x",
    version: 1, apuntaA: "p8", cuando, revocable: true, datos: { horas: String(horas) },
  });
  const visto = (tope: [string, number] | null, total: [string, number] | null = null) => ({
    necesidadId: "valle-solar", postulacionId: "p1-pacto-propone", fecha: "2026-11-21", tope: topeDatos(tope), topeTotal: topeDatos(total),
  });

  it("10 h dan 50 Semillas y período 2026-11; uid con prefijo ejemplo- y sin email", () => {
    const c = constanciaBasePuntual("valle", visto(null), conf(10))!;
    expect(c.datos.semillas).toBe(50);
    expect(c.datos.periodo).toBe("2026-11");
    expect(c.uid).toBe("ejemplo-base-puntual-p1-pacto-propone");
    expect(c.creada_en).toBe("2026-11-10T12:00:00.000Z");
    expect(c.datos.confirmacion).toBe("p9-pacto-confirma-horas");
    expect(JSON.stringify(c)).not.toMatch(/@|prueba:/);
  });

  it("el fin de mes en Argentina queda en noviembre", () => {
    expect(constanciaBasePuntual("valle", visto(null), conf(10, "2026-12-01T01:30:00Z"))!.datos.periodo).toBe("2026-11");
  });

  it("12 h sin máximo dan 60; con máximo de 10 h, 10 con Semillas, 2 sin, 50", () => {
    expect(constanciaBasePuntual("valle", visto(null), conf(12))!.datos.semillas).toBe(60);
    const c = constanciaBasePuntual("valle", visto(["horas", 10]), conf(12))!;
    expect([c.datos.horas_con_semillas, c.datos.horas_sin_semillas, c.datos.semillas, c.datos.tope_unidad]).toEqual([10, 2, 50, "horas"]);
  });

  it("16 h con máximo de 60 Semillas dan 11 / 5 / 60", () => {
    const c = constanciaBasePuntual("agua", visto(["semillas", 60]), conf(16))!;
    expect([c.datos.horas_con_semillas, c.datos.horas_sin_semillas, c.datos.semillas]).toEqual([11, 5, 60]);
  });

  it("el máximo total ya repartido recorta las horas con Semillas", () => {
    const c = constanciaBasePuntual("valle", visto(["horas", 10], ["horas", 20]), conf(12), { horasConSemillas: 10, semillas: 50 })!;
    expect([c.datos.horas_con_semillas, c.datos.horas_sin_semillas, c.datos.semillas, c.datos.tope_total_valor]).toEqual([10, 2, 50, 20]);
    const llena = constanciaBasePuntual("valle", visto(["horas", 10], ["horas", 20]), conf(6), { horasConSemillas: 20, semillas: 100 })!;
    expect([llena.datos.horas_con_semillas, llena.datos.horas_sin_semillas, llena.datos.semillas]).toEqual([0, 6, 0]);
  });

  it("solo se nombran los máximos que recortaron horas", () => {
    const solo = constanciaBasePuntual("valle", visto(["horas", 10], ["horas", 20]), conf(12))!;
    expect(limitesAplicados(solo)).toEqual({ persona: { unidad: "horas", valor: 10 }, total: null });
    const total = constanciaBasePuntual("valle", visto(["horas", 10], ["horas", 20]), conf(6), { horasConSemillas: 20, semillas: 100 })!;
    expect(limitesAplicados(total)).toEqual({ persona: null, total: { unidad: "horas", valor: 20 } });
    const ninguno = constanciaBasePuntual("valle", visto(["horas", 10], ["horas", 20]), conf(8))!;
    expect(limitesAplicados(ninguno)).toEqual({ persona: null, total: null });
  });

  it("dos postulaciones de la misma necesidad dan dos uid", () => {
    const a = constanciaBasePuntual("valle", { ...visto(null), postulacionId: "p1" }, conf(5))!;
    const b = constanciaBasePuntual("valle", { ...visto(null), postulacionId: "p4" }, conf(5))!;
    expect(a.uid).not.toBe(b.uid);
  });

  it("mal formada o sin horas válidas da null", () => {
    expect(leerConstanciaBase({ uid: "x" })).toBeNull();
    const c = constanciaBasePuntual("valle", visto(null), conf(10))!;
    const sinHoras = JSON.parse(JSON.stringify(c));
    delete sinHoras.datos.horas;
    expect(leerConstanciaBase(sinHoras)).toBeNull();
    expect(leerConstanciaBase({ ...c, uid: "real-1" })).toBeNull();
    expect(constanciaBasePuntual("valle", visto(null), conf(0))).toBeNull();
  });

  afterEach(() => {
    vi.doUnmock("./datos");
    vi.resetModules();
  });

  it("una constancia guardada no cambia si cambia el valor de la hora", async () => {
    const c = constanciaBasePuntual("valle", visto(null), conf(10))!;
    const guardada = JSON.stringify(c);
    vi.resetModules();
    vi.doMock("./datos", async (original) => ({ ...(await original<typeof import("./datos")>()), HOUR_REF_USD: 99 }));
    const nuevo = await import("./constancia-base");
    const leida = nuevo.leerConstanciaBase(JSON.parse(guardada)) as ConstanciaBase;
    expect(leida.datos.semillas).toBe(50);
    expect(leida.datos.valor_hora_usd).toBe(HOUR_REF_USD);
  });
});

describe("máximo total por orden de verificación", () => {
  it("Energía solar: 10 h, 12 h y 6 h dan 50, 50 y 0 Semillas", () => {
    let lista = preadmitida(preadmitida(preadmitida([], ANA, SOLAR), BETO, SOLAR), CATA, SOLAR);
    lista = marcada(marcada(marcada(lista, ANA, SOLAR, 10), BETO, SOLAR, 12), CATA, SOLAR, 6);
    lista = verificada(lista, ANA, SOLAR, "2026-11-11T10:00:00.000Z");
    lista = verificada(lista, BETO, SOLAR, "2026-11-12T10:00:00.000Z");
    lista = verificada(lista, CATA, SOLAR, "2026-11-13T10:00:00.000Z");
    const resultados = confirmacionesDe(lista, "valle-solar").map((cf) => {
      const h = lista.find((x) => x.id === cf.apuntaA)!;
      const post = lista.find((x) => x.id === h.apuntaA)!;
      const c = constanciaBasePuntual("valle", { necesidadId: "valle-solar", postulacionId: post.id, fecha: "2026-11-21", tope: topeDatos(SOLAR.tope), topeTotal: topeDatos(SOLAR.total) }, cf, repartidoAntesDe(lista, "valle-solar", cf.id, topeDatos(SOLAR.total)))!;
      return [c.datos.horas_con_semillas, c.datos.horas_sin_semillas, c.datos.semillas];
    });
    expect(resultados).toEqual([[10, 0, 50], [10, 2, 50], [0, 6, 0]]);
  });

  it("Plomería: tres veces 16 h dan 60, 60 y 30 Semillas", () => {
    let lista = preadmitida(preadmitida(preadmitida([], ANA, PLOMERIA), BETO, PLOMERIA), CATA, PLOMERIA);
    lista = marcada(marcada(marcada(lista, ANA, PLOMERIA, 16), BETO, PLOMERIA, 16), CATA, PLOMERIA, 16);
    lista = verificada(lista, ANA, PLOMERIA, "2026-11-11T10:00:00.000Z");
    lista = verificada(lista, BETO, PLOMERIA, "2026-11-12T10:00:00.000Z");
    lista = verificada(lista, CATA, PLOMERIA, "2026-11-13T10:00:00.000Z");
    const semillas = confirmacionesDe(lista, "agua-plomeria").map((cf) => {
      const h = lista.find((x) => x.id === cf.apuntaA)!;
      const post = lista.find((x) => x.id === h.apuntaA)!;
      return constanciaBasePuntual("agua", { necesidadId: "agua-plomeria", postulacionId: post.id, fecha: "2026-12-05", tope: topeDatos(PLOMERIA.tope), topeTotal: topeDatos(PLOMERIA.total) }, cf, repartidoAntesDe(lista, "agua-plomeria", cf.id, topeDatos(PLOMERIA.total)))!.datos.semillas;
    });
    expect(semillas).toEqual([60, 60, 30]);
  });

  it("el orden es el de la verificación, no el de la postulación", () => {
    let lista = preadmitida(preadmitida([], ANA, SOLAR), BETO, SOLAR);
    lista = marcada(marcada(lista, ANA, SOLAR, 10), BETO, SOLAR, 10);
    lista = verificada(lista, BETO, SOLAR, "2026-11-11T10:00:00.000Z");
    lista = verificada(lista, ANA, SOLAR, "2026-11-12T10:00:00.000Z");
    const orden = confirmacionesDe(lista, "valle-solar").map((c) => c.sobre);
    expect(orden).toEqual([sobrePuntual("valle-solar", BETO), sobrePuntual("valle-solar", ANA)]);
  });
});

describe("estado y conciliación", () => {
  it("verificar crea la constancia con las horas de la confirmación; conciliar dos veces deja una", () => {
    const lista = tarea([], ANA, SOLAR, 12);
    const estado = estadoHecha(SOLAR, 3);
    const una = conciliar(estado, lista, ANA);
    expect(una.aplicadas.map((a) => a.tipo)).toEqual(["verifica"]);
    const p = una.estado.comunidades.valle.puntuales[0];
    expect(p.paso).toBe("verificado");
    expect(p.horasReales).toBe(12);
    expect(p.constancia?.datos.horas_con_semillas).toBe(10);
    expect(p.constancia?.datos.horas_sin_semillas).toBe(2);
    expect(p.constancia?.datos.semillas).toBe(50);
    const dos = conciliar(una.estado, lista, ANA);
    expect(dos.aplicadas).toEqual([]);
    expect(dos.estado).toBe(una.estado);
  });

  it("pedir revisar vuelve a pre-admitida con el aviso y sin constancia", () => {
    const base = marcada(preadmitida([], ANA, SOLAR), ANA, SOLAR, 10);
    const h = base.find((x) => x.esquema === "pacto-propone-horas")!;
    const lista = responderHoras(base, { propuestaHorasId: h.id, verifica: false, motivo: "Faltó conectar el inversor", sesion: lider }, T).lista;
    const r = conciliar(estadoHecha(SOLAR, 10), lista, ANA);
    const p = r.estado.comunidades.valle.puntuales[0];
    expect(r.aplicadas.map((a) => a.tipo)).toEqual(["pide-revisar"]);
    expect(p.paso).toBe("preadmitido");
    expect(p.avisoRevisar?.motivo).toBe("Faltó conectar el inversor");
    expect(p.constancia).toBeUndefined();
    expect(p.horasReales).toBeUndefined();
  });

  it("cada acción fuera de su paso no cambia nada", () => {
    const hecha = estadoHecha(SOLAR, 10);
    const c = "valle";
    const n = "valle-solar";
    expect(reducirPuntual(hecha, { tipo: "marcarHecha", comunidad: c, necesidadId: n, horasReales: 5 })).toBe(hecha);
    const pre = reducirPuntual(hecha, { tipo: "retirarHecha", comunidad: c, necesidadId: n });
    expect(pre.comunidades.valle.puntuales[0].paso).toBe("preadmitido");
    expect(reducirPuntual(pre, { tipo: "retirarHecha", comunidad: c, necesidadId: n })).toBe(pre);
    expect(reducirPuntual(pre, { tipo: "pedirRevisarHoras", comunidad: c, necesidadId: n, motivo: "x", cuando: T })).toBe(pre);
    expect(reducirPuntual(pre, { tipo: "marcarHecha", comunidad: c, necesidadId: n, horasReales: 201 })).toBe(pre);
  });

  it("hecha sin horas y verificado sin constancia se corrigen al leer", () => {
    const p = estadoHecha(SOLAR, 10).comunidades.valle.puntuales[0];
    const lee = (x: object) => leer(JSON.stringify({ pestana: "tiempo", comunidades: { valle: { tiempo: leerTiempoInicial(), aportes: [], puntuales: [x] } } })).comunidades.valle.puntuales[0];
    expect(lee({ ...p, horasReales: undefined }).paso).toBe("preadmitido");
    expect(lee({ ...p, paso: "verificado" }).paso).toBe("hecha");
    expect(lee({ ...p, paso: "verificado", constancia: { uid: "x" } }).paso).toBe("hecha");
  });
});

describe("Semillas de los puntuales", () => {
  const conciliado = () => {
    const lista = tarea([], ANA, SOLAR, 10);
    return conciliar(estadoHecha(SOLAR, 10), lista, ANA).estado;
  };

  it("una constancia de 50: puntual 50 y total 50, sin pacto recurrente ni ronda", () => {
    const s = semillasDeComunidad(JSON.stringify(conciliado()), "valle", ANA, []);
    expect(s.puntual).toBe(50);
    expect(s.total).toBe(50);
    expect(s.pactoAceptado).toBe(false);
    expect(s.constancias).toHaveLength(1);
  });

  it("sin constancias, el puntual es sin dato (null), no 0", () => {
    const s = semillasDeComunidad(JSON.stringify(estadoHecha(SOLAR, 10)), "valle", ANA, []);
    expect(s.puntual).toBeNull();
    expect(s.total).toBeNull();
    expect(s.constancias).toEqual([]);
  });
});
