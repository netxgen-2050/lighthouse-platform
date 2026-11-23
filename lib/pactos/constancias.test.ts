import { describe, expect, it } from "vitest";
import {
  afirmaComunidad,
  afirmaPersona,
  agregar,
  comunidadDeSobre,
  comunidadesQueResponde,
  datosDePropuesta,
  estaRevocada,
  leerConstancias,
  pendientes,
  pendientesParaVer,
  puedeResponder,
  respuestaDe,
  revocar,
  sobreDe,
  sobreEsDe,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";

const T = "2026-10-28T10:00:00.000Z";
const PERSONA = "prueba:persona@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const SUPER = "prueba:super@prueba.test";

function propone(lista: ConstanciaPacto[], comunidad = "valle", persona = PERSONA, datos: Record<string, string> = {}) {
  return agregar(lista, { esquema: "pacto-propone", afirma: afirmaPersona(persona), por: persona, sobre: sobreDe(comunidad, persona), version: 1, datos }, T);
}

const lider: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: "valle" };
const otraTribu: QuienResponde = { idPersona: "prueba:otro@prueba.test", esSuperAdmin: false, tribuLider: "otra" };
const comun: QuienResponde = { idPersona: "prueba:comun@prueba.test", esSuperAdmin: false, tribuLider: null };
const superAdmin: QuienResponde = { idPersona: SUPER, esSuperAdmin: true, tribuLider: null };

describe("constancias de pactos", () => {
  it("agrega sin tocar las anteriores y con id por posición", () => {
    const a = propone([]);
    const b = propone(a, "lighthouse");
    expect(b).toHaveLength(2);
    expect(b[0]).toBe(a[0]);
    expect(b[1].id).toBe("p2-pacto-propone");
    expect(b[1].revocable).toBe(true);
  });

  it("borrar y después agregar no repite ids", () => {
    const otra = "prueba:otra@prueba.test";
    let lista = propone(propone([], "valle", PERSONA), "valle", otra);
    expect(lista.map((c) => c.id)).toEqual(["p1-pacto-propone", "p2-pacto-propone"]);
    // Se quita la primera (p. ej. borrar los datos de esa persona): queda solo p2.
    lista = lista.filter((c) => c.id !== "p1-pacto-propone");
    const nueva = propone(lista, "valle", PERSONA);
    const ids = nueva.map((c) => c.id);
    expect(ids).toEqual(["p2-pacto-propone", "p3-pacto-propone"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("una propuesta sin respuesta está pendiente", () => {
    const lista = propone([]);
    expect(pendientes(lista, ["valle"])).toHaveLength(1);
    expect(pendientes(lista, ["otra"])).toHaveLength(0);
  });

  it("aceptada o no aceptada deja de estar pendiente", () => {
    let lista = propone([]);
    lista = agregar(lista, { esquema: "pacto-acepta", afirma: afirmaComunidad("valle"), por: LIDER, sobre: lista[0].sobre, version: 1, apuntaA: lista[0].id }, T);
    expect(pendientes(lista, ["valle"])).toHaveLength(0);
    expect(respuestaDe(lista, "p1-pacto-propone")?.esquema).toBe("pacto-acepta");
    let otra = propone([]);
    otra = agregar(otra, { esquema: "pacto-no-acepta", afirma: afirmaComunidad("valle"), por: LIDER, sobre: otra[0].sobre, version: 1, apuntaA: otra[0].id, datos: { motivo: "x" } }, T);
    expect(pendientes(otra, ["valle"])).toHaveLength(0);
    expect(otra[1].revocable).toBe(false);
  });

  it("revocada deja de estar pendiente y la propuesta sigue en la lista", () => {
    const lista = revocar(propone([]), "p1-pacto-propone", PERSONA, T);
    expect(lista).toHaveLength(2);
    expect(lista[0].esquema).toBe("pacto-propone");
    expect(estaRevocada(lista, "p1-pacto-propone")).toBe(true);
    expect(pendientes(lista, ["valle"])).toHaveLength(0);
  });

  it("no se puede revocar dos veces ni revocar un revoca", () => {
    const una = revocar(propone([]), "p1-pacto-propone", PERSONA, T);
    expect(revocar(una, "p1-pacto-propone", PERSONA, T)).toHaveLength(2);
    expect(revocar(una, "p2-revoca", PERSONA, T)).toHaveLength(2);
    expect(revocar(una, "no-existe", PERSONA, T)).toHaveLength(2);
  });

  it("pendientes ignora lo que no afirma una persona", () => {
    const lista = agregar([], { esquema: "pacto-propone", afirma: "tribu:valle", por: LIDER, sobre: sobreDe("valle", PERSONA), version: 2 }, T);
    expect(pendientes(lista, ["valle"])).toHaveLength(0);
  });
});

describe("quién puede responder", () => {
  it("comunidadesQueResponde traduce la sesión", () => {
    expect(comunidadesQueResponde(lider)).toEqual(["valle"]);
    expect(comunidadesQueResponde(comun)).toEqual([]);
    expect(comunidadesQueResponde(superAdmin)).toEqual(["lighthouse"]);
  });

  it("falso para la propia persona, otra tribu y una persona común; verdadero para quien lidera", () => {
    const [p] = propone([]);
    expect(puedeResponder(lider, "valle", p)).toBe(true);
    expect(puedeResponder(otraTribu, "valle", p)).toBe(false);
    expect(puedeResponder(comun, "valle", p)).toBe(false);
    expect(puedeResponder({ ...lider, idPersona: PERSONA }, "valle", p)).toBe(false);
  });

  it("el super admin responde en lighthouse y no en una tribu común", () => {
    const [enLh] = propone([], "lighthouse");
    const [enValle] = propone([]);
    expect(puedeResponder(superAdmin, "lighthouse", enLh)).toBe(true);
    expect(puedeResponder(superAdmin, "valle", enValle)).toBe(false);
    expect(pendientesParaVer([enValle], superAdmin)).toHaveLength(0);
  });

  it("pacto propio de quien lidera: lo responde otro líder o el super admin, nunca quien lo propuso", () => {
    const [p] = propone([], "valle", LIDER, { proponeLider: "1" });
    expect(puedeResponder(lider, "valle", p)).toBe(false);
    expect(puedeResponder({ ...lider, idPersona: "prueba:otro-lider@prueba.test" }, "valle", p)).toBe(true);
    expect(puedeResponder(superAdmin, "valle", p)).toBe(true);
    expect(pendientesParaVer([p], superAdmin)).toHaveLength(1);
    expect(pendientesParaVer([p], lider)).toHaveLength(1);
  });

  it("el super admin que propone su propio pacto no lo responde", () => {
    const [p] = propone([], "lighthouse", SUPER);
    expect(puedeResponder(superAdmin, "lighthouse", p)).toBe(false);
  });
});

describe("ids con dos puntos", () => {
  it("compara el sobre sin partirlo", () => {
    const ids = ["did:privy:abc", "prueba:a@b.c"];
    for (const id of ids) {
      const sobre = sobreDe("lighthouse", id);
      expect(comunidadDeSobre(sobre)).toBe("lighthouse");
      expect(sobreEsDe(sobre, id)).toBe(true);
      expect(sobreEsDe(sobre, "abc")).toBe(false);
    }
    expect(sobreEsDe(sobreDe("valle", "did:privy:abc"), "privy:abc")).toBe(false);
  });
});

describe("leerConstancias", () => {
  it("ignora la entrada mal formada y lee el resto", () => {
    const buena = propone([])[0];
    const crudo = JSON.stringify([buena, { id: 3 }, null, "x", { ...buena, esquema: "otro" }, { ...buena, id: "p9", version: "uno" }]);
    expect(leerConstancias(crudo)).toEqual([buena]);
    expect(leerConstancias("{roto")).toEqual([]);
    expect(leerConstancias(null)).toEqual([]);
  });
});

describe("datosDePropuesta", () => {
  const contenido = {
    rol: "" as const,
    rolOtro: "",
    descripcion: "d",
    modalidad: "fija" as const,
    horas: 10,
    rango: { min: 0, max: 20 },
    compromisoMeses: null,
  };
  it("usa el nombre o, si no hay, las iniciales; nunca otra cosa", () => {
    expect(datosDePropuesta({ tipo: "nuevo", contenido, nombre: "Ana Pérez", iniciales: "AP", proponeLider: false })).toMatchObject({ nombre: "Ana Pérez" });
    const sin = datosDePropuesta({ tipo: "nuevo", contenido, nombre: "  ", iniciales: "AP", proponeLider: true });
    expect(sin.iniciales).toBe("AP");
    expect(sin.nombre).toBeUndefined();
    expect(sin.proponeLider).toBe("1");
    expect(Object.values(sin).join("|")).not.toContain("@");
  });
});
