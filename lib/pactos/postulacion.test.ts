import { describe, expect, it } from "vitest";
import {
  afirmaPersona,
  agregar,
  datosDePostulacion,
  sobrePuntual,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import {
  aperturaDePostulacion,
  comunidadQueResponde,
  holonDeId,
  loAdministraHifa,
  postulacionesDeLaTribu,
  postulacionesParaVer,
  puedeResponderPostulacion,
  relacionConHolon,
  responderPostulacion,
  tribusDelHolon,
} from "./postulacion";

const T = "2026-10-28T10:00:00.000Z";
const PERSONA = "prueba:persona@prueba.test";
const LIDER = "prueba:admin@prueba.test";
const SUPER = "prueba:super@prueba.test";

const lider: QuienResponde = { idPersona: LIDER, esSuperAdmin: false, tribuLider: "valle" };
const superAdmin: QuienResponde = { idPersona: SUPER, esSuperAdmin: true, tribuLider: null };
const otraTribu: QuienResponde = { idPersona: "prueba:otro@prueba.test", esSuperAdmin: false, tribuLider: "taller" };

function postula(
  lista: ConstanciaPacto[],
  { persona = PERSONA, necesidad = "valle-solar", holon = "circulo:valle-3", comunidad = "valle", lidera = false } = {},
) {
  return agregar(
    lista,
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(persona),
      por: persona,
      sobre: sobrePuntual(necesidad, persona),
      version: 1,
      datos: datosDePostulacion({
        comunidad,
        necesidad,
        holon,
        relacion: "miembro",
        rol: "otro",
        rolOtro: "Electricidad",
        descripcion: "Monto los paneles",
        horas: 10,
        fecha: "2026-11-21",
        tope: { unidad: "horas", valor: 10 },
        topeTotal: { unidad: "horas", valor: 20 },
        nombre: "Ana",
        iniciales: "A",
        proponeLider: lidera,
      }),
    },
    T,
  );
}

describe("holones y relación", () => {
  it("reconoce los ids de holón", () => {
    expect(holonDeId("circulo:valle-3")).toEqual({ tipo: "circulo", id: "valle-3", transversal: false });
    expect(holonDeId("circulo:comunicacion-comun")).toEqual({ tipo: "circulo", id: "comunicacion-comun", transversal: true });
    expect(holonDeId("tribu:valle")).toEqual({ tipo: "tribu", id: "valle" });
    expect(holonDeId("comunidad:lighthouse")).toEqual({ tipo: "comun" });
    expect(holonDeId("circulo:no-existe")).toBeNull();
    expect(holonDeId("cualquier-cosa")).toBeNull();
  });

  it("las tribus de cada holón", () => {
    expect(tribusDelHolon({ tipo: "circulo", id: "valle-3", transversal: false })).toEqual(["valle"]);
    expect(tribusDelHolon({ tipo: "circulo", id: "comunicacion-comun", transversal: true })).toEqual(["valle", "taller"]);
    expect(tribusDelHolon({ tipo: "tribu", id: "valle" })).toEqual(["valle"]);
    expect(tribusDelHolon({ tipo: "comun" })).toEqual([]);
  });

  const valle3 = holonDeId("circulo:valle-3")!;
  const comunicacion = holonDeId("circulo:comunicacion-comun")!;

  it("miembro, aspirante y sin relación", () => {
    expect(relacionConHolon({ valle: "miembro" }, valle3)).toBe("miembro");
    expect(relacionConHolon({ valle: "pedido" }, valle3)).toBe("aspirante");
    expect(relacionConHolon({}, valle3)).toBeNull();
    expect(relacionConHolon({ semilla: "miembro" }, valle3)).toBeNull();
  });

  it("en un círculo transversal vale la membresía en cualquiera de las tribus que participan, y gana miembro", () => {
    expect(relacionConHolon({ taller: "miembro" }, comunicacion)).toBe("miembro");
    expect(relacionConHolon({ valle: "pedido", taller: "miembro" }, comunicacion)).toBe("miembro");
    expect(relacionConHolon({ valle: "pedido" }, comunicacion)).toBe("aspirante");
  });
});

describe("quién responde", () => {
  it("una tribu o su círculo lo responde la tribu; un transversal o el común, el Lighthouse", () => {
    expect(comunidadQueResponde(holonDeId("circulo:valle-3")!)).toBe("valle");
    expect(comunidadQueResponde(holonDeId("tribu:valle")!)).toBe("valle");
    expect(comunidadQueResponde(holonDeId("circulo:comunicacion-comun")!)).toBe("lighthouse");
    expect(comunidadQueResponde(holonDeId("comunidad:lighthouse")!)).toBe("lighthouse");
  });

  it("los círculos transversales los administra Hifa (simulada); los demás, personas", () => {
    expect(loAdministraHifa(holonDeId("circulo:comunicacion-comun")!)).toBe(true);
    expect(loAdministraHifa(holonDeId("circulo:valle-3")!)).toBe(false);
  });

  it("quien lidera la tribu responde la de su círculo; el super admin no (salvo la propia de quien lidera)", () => {
    const [p] = postula([]).slice(-1);
    expect(puedeResponderPostulacion(lider, p)).toBe(true);
    expect(puedeResponderPostulacion(superAdmin, p)).toBe(false);
    expect(puedeResponderPostulacion(otraTribu, p)).toBe(false);
  });

  it("un círculo transversal lo responde solo el super admin (respaldo de Hifa), no quien lidera una tribu", () => {
    const [p] = postula([], { necesidad: "valle-eventos", holon: "circulo:comunicacion-comun" }).slice(-1);
    expect(puedeResponderPostulacion(superAdmin, p)).toBe(true);
    expect(puedeResponderPostulacion(lider, p)).toBe(false);
  });

  it("nadie responde su propia postulación; la de quien lidera la responde el super admin", () => {
    const [propia] = postula([], { persona: LIDER, lidera: true }).slice(-1);
    expect(puedeResponderPostulacion(lider, propia)).toBe(false);
    expect(puedeResponderPostulacion(superAdmin, propia)).toBe(true);
    const sinMarca = postula([], { persona: LIDER, lidera: false }).slice(-1)[0];
    expect(puedeResponderPostulacion(superAdmin, sinMarca)).toBe(false);
  });

  it("una postulación sin holón conocido no la responde nadie", () => {
    const rota = postula([], { holon: "circulo:no-existe" }).slice(-1)[0];
    expect(puedeResponderPostulacion(lider, rota)).toBe(false);
    expect(puedeResponderPostulacion(superAdmin, rota)).toBe(false);
  });

  it("cada sesión ve lo que le toca y la ficha cuenta las de su tribu y sus círculos", () => {
    let lista = postula([]);
    lista = postula(lista, { persona: "prueba:otra@prueba.test", necesidad: "valle-eventos", holon: "circulo:comunicacion-comun" });
    expect(postulacionesParaVer(lista, lider)).toHaveLength(1);
    expect(postulacionesParaVer(lista, superAdmin)).toHaveLength(1);
    expect(postulacionesDeLaTribu(lista, lider, "valle")).toHaveLength(1);
    // El super admin responde la del transversal, que participa en Valle Solar y en Taller Común.
    expect(postulacionesDeLaTribu(lista, superAdmin, "taller")).toHaveLength(1);
    expect(postulacionesDeLaTribu(lista, superAdmin, "semilla")).toHaveLength(0);
  });
});

describe("abrir una postulación (la URL de /pactos)", () => {
  it("un miembro y un aspirante crean el borrador", () => {
    expect(aperturaDePostulacion({ valle: "miembro" }, "valle", "valle-solar")).toMatchObject({ tipo: "crear", relacion: "miembro" });
    expect(aperturaDePostulacion({ valle: "pedido" }, "valle", "valle-solar")).toMatchObject({ tipo: "crear", relacion: "aspirante" });
  });
  it("sin relación no se crea nada y se pide sumarse como aspirante a la tribu", () => {
    expect(aperturaDePostulacion({}, "valle", "valle-solar")).toEqual({ tipo: "sin-relacion", tribu: "valle" });
  });
  it("una necesidad que no existe, de otra comunidad, tomada, hecha o de diseño sin aval no se puede tomar", () => {
    const m = { valle: "miembro", monte: "miembro", puerto: "miembro", barda: "miembro" } as const;
    expect(aperturaDePostulacion(m, "valle", "no-existe")).toEqual({ tipo: "no-se-puede" });
    expect(aperturaDePostulacion(m, "valle", "monte-bioconstruccion")).toEqual({ tipo: "no-se-puede" });
    expect(aperturaDePostulacion(m, "monte", "monte-maquinaria")).toEqual({ tipo: "no-se-puede" });
    expect(aperturaDePostulacion(m, "valle", "valle-bioconstruccion")).toEqual({ tipo: "no-se-puede" });
    expect(aperturaDePostulacion(m, "puerto", "puerto-marketing")).toEqual({ tipo: "no-se-puede" });
  });
  it("una tribu que no toma puntuales (Barda) no deja postularse", () => {
    expect(aperturaDePostulacion({ barda: "miembro" }, "barda", "barda-riego")).toEqual({ tipo: "no-se-puede" });
  });
  it("de diseño con aval sí se puede", () => {
    expect(aperturaDePostulacion({ semilla: "miembro" }, "semilla", "semilla-riego")).toMatchObject({ tipo: "crear" });
  });
  it("miembro de Taller Común se postula al círculo transversal de Valle Solar", () => {
    expect(aperturaDePostulacion({ taller: "miembro" }, "valle", "valle-eventos")).toMatchObject({ tipo: "crear", relacion: "miembro" });
  });
});

describe("responder una postulación", () => {
  it("pre-admitir afirma el holón, con quien actuó por él, y apunta a la postulación", () => {
    const lista = postula([]);
    const r = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T);
    expect(r.resultado).toBe("ok");
    const acepta = r.lista[r.lista.length - 1];
    expect(acepta).toMatchObject({ esquema: "pacto-acepta", afirma: "circulo:valle-3", por: LIDER, apuntaA: lista[0].id, sobre: lista[0].sobre });
    expect(acepta.datos.respaldoDeHifa).toBeUndefined();
  });

  it("no pre-admitir pide motivo y lo guarda cortado a 500", () => {
    const lista = postula([]);
    expect(responderPostulacion(lista, { propuestaId: lista[0].id, acepta: false, sesion: lider }, T).resultado).toBe("sin-motivo");
    expect(responderPostulacion(lista, { propuestaId: lista[0].id, acepta: false, motivo: "   ", sesion: lider }, T).resultado).toBe("sin-motivo");
    const r = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: false, motivo: "x".repeat(600), sesion: lider }, T);
    expect(r.resultado).toBe("ok");
    const no = r.lista[r.lista.length - 1];
    expect(no.esquema).toBe("pacto-no-acepta");
    expect(no.datos.motivo).toHaveLength(500);
  });

  it("una segunda respuesta a la misma postulación no se escribe", () => {
    const lista = postula([]);
    const primera = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T);
    const segunda = responderPostulacion(primera.lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T);
    expect(segunda.resultado).toBe("ya-respondida");
    expect(segunda.lista).toHaveLength(primera.lista.length);
  });

  it("pre-admitir a una persona no toca la postulación de otra", () => {
    let lista = postula([]);
    lista = postula(lista, { persona: "prueba:otra@prueba.test" });
    const r = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T);
    expect(postulacionesParaVer(r.lista, lider)).toHaveLength(1);
    const r2 = responderPostulacion(r.lista, { propuestaId: lista[1].id, acepta: true, sesion: lider }, T);
    expect(r2.resultado).toBe("ok");
  });

  it("sin permiso no se escribe; en un transversal el super admin responde y la constancia dice que es respaldo de Hifa", () => {
    const lista = postula([], { necesidad: "valle-eventos", holon: "circulo:comunicacion-comun" });
    expect(responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: lider }, T).resultado).toBe("sin-permiso");
    const r = responderPostulacion(lista, { propuestaId: lista[0].id, acepta: true, sesion: superAdmin }, T);
    expect(r.resultado).toBe("ok");
    expect(r.lista[r.lista.length - 1].datos.respaldoDeHifa).toBe("1");
    expect(r.lista[r.lista.length - 1].afirma).toBe("circulo:comunicacion-comun");
  });

  it("una postulación retirada o inexistente no se responde", () => {
    expect(responderPostulacion([], { propuestaId: "p1-pacto-propone", acepta: true, sesion: lider }, T).resultado).toBe("ya-respondida");
  });
});
