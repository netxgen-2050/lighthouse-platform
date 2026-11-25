import { describe, expect, it } from "vitest";
import {
  afirmaComunidad,
  afirmaPersona,
  agregar,
  datosDePropuesta,
  sobreDe,
  type ConstanciaPacto,
} from "./constancias";
import {
  INICIAL,
  conciliar,
  deComunidad,
  leer,
  leerPactosConciliados,
  pactosAceptados,
  propuestasPorPublicar,
  reducir,
  type Accion,
  type EstadoPactos,
} from "./estado";

const PERSONA = "prueba:persona@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const T0 = "2026-10-28T10:00:00.000Z";
const T1 = "2026-10-28T11:00:00.000Z";

function aplicar(e: EstadoPactos, ...acciones: Accion[]): EstadoPactos {
  return acciones.reduce(reducir, e);
}

function enviado(horas = 10): EstadoPactos {
  return aplicar(
    INICIAL,
    { tipo: "rol", comunidad: "valle", rol: "jardineria" },
    { tipo: "descripcion", comunidad: "valle", texto: "Cuido la huerta" },
    { tipo: "horas", comunidad: "valle", horas },
    { tipo: "avanzar", comunidad: "valle" },
  );
}

function propone(lista: ConstanciaPacto[], estado: EstadoPactos, tipo: "nuevo" | "cambio" = "nuevo", version = 1) {
  const t = deComunidad(estado, "valle").tiempo;
  const c = tipo === "cambio" && t.cambio ? t.cambio : t;
  return agregar(
    lista,
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(PERSONA),
      por: PERSONA,
      sobre: sobreDe("valle", PERSONA),
      version,
      datos: datosDePropuesta({
        tipo,
        contenido: {
          rol: c.rol,
          rolOtro: c.rolOtro,
          descripcion: c.descripcion,
          modalidad: c.modalidad,
          horas: c.horas,
          rango: c.rango,
          compromisoMeses: c.compromisoMeses,
        },
        nombre: "Ana",
        iniciales: "A",
        proponeLider: false,
      }),
    },
    T0,
  );
}

function responde(lista: ConstanciaPacto[], esquema: "pacto-acepta" | "pacto-no-acepta", version = 1, por = LIDER) {
  const propuesta = [...lista].reverse().find((c) => c.esquema === "pacto-propone")!;
  return agregar(
    lista,
    {
      esquema,
      afirma: afirmaComunidad("valle"),
      por,
      sobre: propuesta.sobre,
      version,
      apuntaA: propuesta.id,
      datos: esquema === "pacto-no-acepta" ? { motivo: "Por ahora 16 h" } : {},
    },
    T1,
  );
}

describe("conciliar", () => {
  it("aceptación de un pacto nuevo: paso 2, versión 1, historial con la fecha de la constancia", () => {
    const e = enviado();
    const lista = responde(propone([], e), "pacto-acepta");
    const r = conciliar(e, lista, PERSONA);
    const t = deComunidad(r.estado, "valle").tiempo;
    expect(t.paso).toBe(2);
    expect(t.version).toBe(1);
    expect(t.historial[0].aceptado).toBe(T1);
    expect(r.aplicadas).toMatchObject([{ tipo: "acepta", comunidad: "valle", version: 1, esCambio: false }]);
    expect(pactosAceptados(r.estado)).toHaveLength(1);
  });

  it("si el estado local tiene otras horas, quedan las de la propuesta", () => {
    const e = enviado(10);
    const lista = responde(propone([], e), "pacto-acepta");
    const tocado = { ...e, comunidades: { valle: { ...e.comunidades.valle, tiempo: { ...e.comunidades.valle.tiempo, horas: 40 } } } };
    expect(deComunidad(conciliar(tocado, lista, PERSONA).estado, "valle").tiempo.horas).toBe(10);
  });

  it("aceptación de un cambio: versión 2", () => {
    const base = conciliar(enviado(10), responde(propone([], enviado(10)), "pacto-acepta"), PERSONA).estado;
    const conCambio = aplicar(
      base,
      { tipo: "proponerCambio", comunidad: "valle" },
      { tipo: "editarCambio", comunidad: "valle", cambios: { horas: 20 } },
      { tipo: "enviarCambio", comunidad: "valle" },
    );
    let lista = responde(propone([], enviado(10)), "pacto-acepta");
    lista = propone(lista, conCambio, "cambio", 2);
    lista = responde(lista, "pacto-acepta", 2);
    const t = deComunidad(conciliar(conCambio, lista, PERSONA).estado, "valle").tiempo;
    expect(t.version).toBe(2);
    expect(t.horas).toBe(20);
    expect(t.historial).toHaveLength(2);
  });

  it("no aceptación de un pacto nuevo: vuelve a borrador con el contenido y el motivo", () => {
    const e = enviado(32);
    const r = conciliar(e, responde(propone([], e), "pacto-no-acepta"), PERSONA);
    const t = deComunidad(r.estado, "valle").tiempo;
    expect(t.paso).toBe(0);
    expect(t.horas).toBe(32);
    expect(t.descripcion).toBe("Cuido la huerta");
    expect(r.estado.ultimaRespuesta).toMatchObject({ motivo: "Por ahora 16 h", comunidad: "valle" });
    expect(leer(JSON.stringify(r.estado)).ultimaRespuesta?.motivo).toBe("Por ahora 16 h");
  });

  it("no aceptación de un cambio: sigue la vigente", () => {
    const base = conciliar(enviado(10), responde(propone([], enviado(10)), "pacto-acepta"), PERSONA).estado;
    const conCambio = aplicar(
      base,
      { tipo: "proponerCambio", comunidad: "valle" },
      { tipo: "editarCambio", comunidad: "valle", cambios: { horas: 20 } },
      { tipo: "enviarCambio", comunidad: "valle" },
    );
    let lista = responde(propone([], enviado(10)), "pacto-acepta");
    lista = responde(propone(lista, conCambio, "cambio", 2), "pacto-no-acepta", 2);
    const t = deComunidad(conciliar(conCambio, lista, PERSONA).estado, "valle").tiempo;
    expect(t.version).toBe(1);
    expect(t.horas).toBe(10);
    expect(t.cambio).toBeUndefined();
  });

  it("ignora la aceptación de la misma persona y la de versión distinta", () => {
    const e = enviado();
    const propia = responde(propone([], e), "pacto-acepta", 1, PERSONA);
    expect(conciliar(e, propia, PERSONA).estado).toBe(e);
    const otraVersion = responde(propone([], e), "pacto-acepta", 3);
    expect(conciliar(e, otraVersion, PERSONA).aplicadas).toHaveLength(0);
  });

  it("conciliar dos veces da lo mismo y sin registro no cambia nada", () => {
    const e = enviado();
    const lista = responde(propone([], e), "pacto-acepta");
    const una = conciliar(e, lista, PERSONA).estado;
    expect(conciliar(una, lista, PERSONA).estado).toEqual(una);
    expect(conciliar(e, null, PERSONA).estado).toBe(e);
  });

  it("leerPactosConciliados cuenta el aceptado sin guardar", () => {
    const e = enviado();
    const lista = responde(propone([], e), "pacto-acepta");
    const conc = leerPactosConciliados(JSON.stringify(e), PERSONA, lista);
    expect(pactosAceptados(conc)).toHaveLength(1);
    expect(pactosAceptados(leerPactosConciliados(JSON.stringify(e), PERSONA, null))).toHaveLength(0);
  });
});

describe("propuestasPorPublicar", () => {
  it("publica un pacto en paso 1 sin propuesta, pero no con el registro ilegible ni si ya hay una", () => {
    const e = enviado();
    expect(propuestasPorPublicar(e, [], PERSONA)).toHaveLength(1);
    expect(propuestasPorPublicar(e, null, PERSONA)).toHaveLength(0);
    expect(propuestasPorPublicar(e, propone([], e), PERSONA)).toHaveLength(0);
  });
});
