import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buscarNodo, construirHolarquia, recorrer } from "@/lib/gobernanza/holarquia";
import { textos } from "@/lib/idioma/textos";
import { esBorrador, TERMINOS } from "@/lib/legal/terminos";
import {
  DECISIONES,
  DECISIONES_BASE,
  DECISIONES_DEL_COMUN,
  DECISIONES_DE_GOBERNANZA,
  EJEMPLOS_COMUN,
  opciones,
} from "./datos";
import { propuestaDe } from "./propuestas/ejemplos";
import {
  contar,
  decisionesDelHolon,
  decisionesVisibles,
  INICIAL,
  leer,
  llevarAlConsejo,
  motivoSinVoto,
  puedeLlevarAlConsejo,
  SIN_CONDICION,
  votar,
  votoPropio,
  type Condicion,
} from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");
const raiz = construirHolarquia("es");
const huerta = DECISIONES[0];
const presupuesto = DECISIONES[1];
const facilitador = DECISIONES[2];
// Una decisión que pide residencia: ya no hay ninguna visible, pero la regla sigue en el código.
const bomba = EJEMPLOS_COMUN[0];
const bombaResidentes = { ...bomba, ambito: "comun" as const };

describe("datos", () => {
  it("son tres decisiones: la huerta (movida a Semilla Viva), el presupuesto del Fondo Común y el facilitador", () => {
    expect(DECISIONES.map((d) => d.id)).toEqual(["huerta", "presupuesto-fondo-comun", "facilitador"]);
  });
  it("las que vienen del mock-up conservan título, lugar, regla y ⚖ copiados", () => {
    for (const d of [facilitador, ...EJEMPLOS_COMUN]) {
      expect(mock).toContain(`["${d.titulo.es}","${d.donde.es}","${d.regla.es}","${d.base}"`);
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
  it("la huerta pasó a Huerta intensiva · Semilla Viva", () => {
    expect(huerta.donde.es).toBe("Huerta intensiva · Semilla Viva");
    expect(huerta.donde.en).toBe("Intensive garden · Semilla Viva");
    expect(huerta.tribu).toBe("Semilla Viva");
    expect(huerta.holonId).toBe("semilla-1");
  });
  it("cada decisión tiene su inglés, con el español como original", () => {
    for (const d of [...DECISIONES_BASE, ...EJEMPLOS_COMUN]) {
      for (const v of [d.titulo, d.donde, d.regla]) {
        expect(v.en.trim(), d.id).not.toBe("");
        expect(v.original).toBe("es");
      }
      expect(d.titulo.en, d.id).not.toBe(d.titulo.es);
    }
  });
  it("las opciones salen del diccionario, en los dos idiomas", () => {
    expect(opciones("es").map((o) => o.etiqueta)).toEqual(["A favor", "En contra", "Abstención"]);
    expect(opciones("en").map((o) => o.etiqueta)).toEqual(["In favor", "Against", "Abstention"]);
  });
  it("ninguna decisión visible nombra a la Asamblea de residentes ni a la de beneficiarios, en ningún idioma", () => {
    const todo = JSON.stringify(DECISIONES_BASE);
    expect(todo).not.toMatch(/Asamblea de residentes|Residents' Assembly|Asamblea de beneficiarios|Beneficiaries' Assembly/);
  });
  it("los ejemplos para el común conservan las dos decisiones con su ⚖, ahora en el ámbito del común", () => {
    expect(EJEMPLOS_COMUN.map((d) => d.id)).toEqual(["bomba", "animales"]);
    expect(DECISIONES_DEL_COMUN.map((d) => d.ambito)).toEqual(["comun", "comun"]);
    expect(DECISIONES_DEL_COMUN.map((d) => d.requisito)).toEqual(["ninguno", "ninguno"]);
  });
  it("las decisiones nuevas de gobernanza son de círculo, de tribu y de consejo", () => {
    expect(DECISIONES_DE_GOBERNANZA.map((d) => d.ambito)).toEqual(["circulo", "tribu", "consejo"]);
    const consejo = DECISIONES_DE_GOBERNANZA[2];
    expect(consejo.origen).toEqual({ tribuId: "valle", aprobadaEn: "Valle Solar" });
  });
  it("no hay personas de ejemplo en los datos", () => {
    expect(JSON.stringify(DECISIONES)).not.toMatch(/Luc[ií]a|Lucas/);
  });
});

describe("cada decisión tiene su holón", () => {
  const tipoDe = (id: string) => buscarNodo(raiz, id)?.tipo;
  it("todo holonId existe en la holarquía", () => {
    for (const d of decisionesVisibles({ votos: {}, alConsejo: ["cisterna"] })) expect(buscarNodo(raiz, d.holonId), d.id).not.toBeNull();
  });
  it("el holonId de la decisión y el de su propuesta coinciden", () => {
    for (const d of DECISIONES_BASE) {
      const p = propuestaDe(d.id);
      if (p?.holonId) expect(p.holonId, d.id).toBe(d.holonId);
    }
  });
  it("el ámbito es coherente con el tipo del holón", () => {
    for (const d of DECISIONES_BASE) expect(tipoDe(d.holonId), d.id).toBe(d.ambito);
  });
  it("la copia llevada al consejo se decide en el consejo", () => {
    const e = llevarAlConsejo(INICIAL, "cisterna", { ...SIN_CONDICION, adhirio: true, lidera: "valle" });
    expect(decisionesVisibles(e).find((d) => d.id === "consejo-cisterna")?.holonId).toBe("consejo");
  });
});

describe("sin fideicomiso: el Fogón es consultivo", () => {
  it("ninguna decisión tiene ámbito fideicomiso ni pide el Pase", () => {
    for (const d of DECISIONES_BASE) {
      expect(d.ambito as string).not.toBe("fideicomiso");
      expect(d.requisito as string).not.toBe("pase");
    }
  });
  it("toda decisión con destino es del común", () => {
    for (const d of DECISIONES_BASE.filter((x) => x.destino)) expect(d.ambito).toBe("comun");
  });
  it("el presupuesto del Fondo Común está en el común con su destino y su ⚖ en borrador", () => {
    expect(presupuesto.titulo.es).toBe("Presupuesto 2027 del Fondo Común");
    expect(presupuesto.destino).toBe("consejo-fundacion");
    expect(presupuesto.holonId).toBe("lighthouse");
    expect(presupuesto.requisito).toBe("ninguno");
    expect(esBorrador(presupuesto.base)).toBe(true);
    expect(DECISIONES_BASE.some((d) => d.id === "presupuesto")).toBe(false);
  });
  it("un voto guardado en el viejo `presupuesto` no marca voto en el nuevo", () => {
    const e = leer(JSON.stringify({ votos: { presupuesto: "favor" } }));
    expect(e.votos).toEqual({});
    expect(votoPropio(e, presupuesto, { ...SIN_CONDICION, adhirio: true })).toBeUndefined();
  });
  it("recomendar no pide el Pase", () => {
    const c: Condicion = { ...SIN_CONDICION, adhirio: true };
    expect(motivoSinVoto(presupuesto, c)).toBeNull();
    expect(votar(INICIAL, "presupuesto-fondo-comun", "favor", c).votos["presupuesto-fondo-comun"]).toBe("favor");
  });
  it("el destino se lee en los dos idiomas", () => {
    expect(textos("fogon", "es").destino["consejo-fundacion"]).toBe(
      "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación",
    );
    expect(textos("fogon", "en").destino["consejo-fundacion"]).toMatch(/Foundation Council/);
  });
});

const NEUTRA: Condicion = { ...SIN_CONDICION, adhirio: true };
const exterior: Condicion = { residencia: "exterior", adhirio: true };
const argentina: Condicion = { residencia: "argentina", adhirio: true };

describe("quién puede votar (residencia cargada)", () => {
  it("con residencia en el exterior vota en tribu y común; no en una decisión que pide residentes", () => {
    expect(motivoSinVoto(huerta, exterior)).toBeNull();
    expect(motivoSinVoto(presupuesto, exterior)).toBeNull();
    expect(motivoSinVoto(bomba, exterior)).toBe("residentes");
  });
  it("el motivo se lee en los dos idiomas desde el diccionario", () => {
    expect(textos("fogon", "es").motivos).toEqual({
      manifiesto: "Para participar, adherí al manifiesto de Lighthouse VRN",
      residentes: "Solo residentes",
      sinDato: "Sin dato de tu residencia",
    });
    expect(textos("fogon", "en").motivos.residentes).toBe("Residents only");
  });
  it("con residencia en Argentina vota en todo", () => {
    for (const d of DECISIONES) expect(motivoSinVoto(d, argentina), d.id).toBeNull();
    expect(motivoSinVoto(bomba, argentina)).toBeNull();
  });
  it("sin dato de residencia vota donde no se pide y donde se pide dice que falta el dato (no asume)", () => {
    expect(motivoSinVoto(huerta, NEUTRA)).toBeNull();
    expect(motivoSinVoto(bomba, NEUTRA)).toBe("sinDato");
  });
});

describe("la adhesión al manifiesto de Lighthouse VRN va antes que todo (ADR-023)", () => {
  it("sin adhesión el motivo es 'manifiesto', en cualquier decisión", () => {
    for (const d of DECISIONES) expect(motivoSinVoto(d, { residencia: "argentina", adhirio: false }), d.id).toBe("manifiesto");
    expect(motivoSinVoto(bomba, SIN_CONDICION)).toBe("manifiesto");
  });
  it("si falta el dato no se asume que adhirió", () => {
    expect(SIN_CONDICION.adhirio).toBe(false);
  });
  it("sin adhesión, votar y llevarAlConsejo devuelven el mismo estado", () => {
    expect(votar(INICIAL, "huerta", "favor", SIN_CONDICION)).toBe(INICIAL);
    const sinAdhesionLidera: Condicion = { ...lideraValle, adhirio: false };
    expect(puedeLlevarAlConsejo(INICIAL, cisterna, sinAdhesionLidera)).toBe(false);
    expect(llevarAlConsejo(INICIAL, "cisterna", sinAdhesionLidera)).toBe(INICIAL);
  });
  it("sin adhesión no se ve un voto guardado antes, pero los votos de ejemplo siguen en el conteo", () => {
    const e = votar(INICIAL, "huerta", "favor", NEUTRA);
    expect(votoPropio(e, huerta, SIN_CONDICION)).toBeUndefined();
    expect(contar(huerta, undefined)).toEqual(huerta.votos);
  });
});

const ids = (l: readonly { id: string }[]) => l.map((d) => d.id);
const idsAdentro = (l: readonly { decision: { id: string } }[]) => l.map((x) => x.decision.id);
const idDe = (nombre: string): string => {
  let id = "";
  recorrer(raiz, (n) => {
    if ("nombre" in n && n.nombre === nombre && !id) id = n.id;
  });
  return id;
};

describe("decisionesDelHolon (lista al lado de la holarquía)", () => {
  it("Valle Solar: acá facilitador y cisterna; pasa el pedido de la bomba; la siembra está adentro, en Cuidado de la tierra", () => {
    const r = decisionesDelHolon(raiz, "valle");
    expect(ids(r.aca).sort()).toEqual(["cisterna", "facilitador"]);
    expect(ids(r.pasa)).toEqual(["consejo-bomba"]);
    expect(idsAdentro(r.adentro)).toEqual(["siembra"]);
    expect(r.adentro[0].tribu).toBeNull();
    expect(r.adentro[0].circulo).toBe("Cuidado de la tierra");
  });
  it("Cuidado de la tierra (valle-0): acá la siembra, adentro nada", () => {
    const r = decisionesDelHolon(raiz, "valle-0");
    expect(ids(r.aca)).toEqual(["siembra"]);
    expect(r.adentro).toEqual([]);
  });
  it("Tokenomics y Semillas: la regalía nace acá y se decide en el común", () => {
    const r = decisionesDelHolon(raiz, "comun-token");
    expect(ids(r.pasa)).toContain("regalia");
    expect(r.aca).toEqual([]);
  });
  it("el común: acá la bomba, los animales, la regalía y el presupuesto; adentro la siembra con su círculo y su tribu", () => {
    const r = decisionesDelHolon(raiz, "lighthouse");
    expect(ids(r.aca).sort()).toEqual(["animales", "bomba", "presupuesto-fondo-comun", "regalia"]);
    const siembra = r.adentro.find((x) => x.decision.id === "siembra")!;
    expect(siembra.tribu).toBe("Valle Solar");
    expect(siembra.circulo).not.toBe("");
  });
  it("una tribu no repite su propio nombre en la etiqueta de adentro", () => {
    const r = decisionesDelHolon(raiz, "semilla");
    const h = r.adentro.find((x) => x.decision.id === "huerta")!;
    expect(h.tribu).toBeNull();
  });
  it("un círculo sin decisiones (Compost) queda vacío en los tres grupos", () => {
    const r = decisionesDelHolon(raiz, idDe("Compost"));
    expect(r.aca).toEqual([]);
    expect(r.pasa).toEqual([]);
    expect(r.adentro).toEqual([]);
  });
  it("la copia llevada al consejo aparece en `aca` del consejo", () => {
    const e = llevarAlConsejo(INICIAL, "cisterna", { ...NEUTRA, lidera: "valle" });
    expect(ids(decisionesDelHolon(raiz, "consejo", e).aca)).toContain("consejo-cisterna");
  });
  it("un holón que no existe no rompe: solo las que lo nombran", () => {
    const r = decisionesDelHolon(raiz, "no-existe");
    expect(r.aca).toEqual([]);
    expect(r.adentro).toEqual([]);
  });
});

const lideraValle: Condicion = { residencia: undefined, adhirio: true, lidera: "valle" };
const lideraTaller: Condicion = { residencia: undefined, adhirio: true, lidera: "taller" };
const cisterna = DECISIONES_DE_GOBERNANZA[1];

describe("llevar al consejo", () => {
  it("quien lidera Valle Solar puede, y crea la copia en el consejo con su origen", () => {
    expect(puedeLlevarAlConsejo(INICIAL, cisterna, lideraValle)).toBe(true);
    const e = llevarAlConsejo(INICIAL, "cisterna", lideraValle);
    expect(e.alConsejo).toEqual(["cisterna"]);
    const copia = decisionesVisibles(e).find((d) => d.id === "consejo-cisterna")!;
    expect(copia.titulo).toBe(cisterna.titulo);
    expect(copia.origen).toEqual({ tribuId: "valle", aprobadaEn: "Valle Solar" });
    expect(copia.ambito).toBe("consejo");
    // La original sigue en la tribu.
    expect(decisionesVisibles(e).map((d) => d.id)).toContain("cisterna");
  });
  it("quien no lidera esa tribu no puede, ni quien no lidera ninguna", () => {
    expect(puedeLlevarAlConsejo(INICIAL, cisterna, lideraTaller)).toBe(false);
    expect(puedeLlevarAlConsejo(INICIAL, cisterna, NEUTRA)).toBe(false);
    expect(llevarAlConsejo(INICIAL, "cisterna", lideraTaller)).toBe(INICIAL);
    expect(llevarAlConsejo(INICIAL, "cisterna", NEUTRA)).toBe(INICIAL);
  });
  it("solo se llevan las decisiones de tribu que piden algo al común, y una sola vez", () => {
    expect(llevarAlConsejo(INICIAL, "huerta", lideraValle)).toBe(INICIAL);
    expect(llevarAlConsejo(INICIAL, "facilitador", lideraValle)).toBe(INICIAL);
    const e = llevarAlConsejo(INICIAL, "cisterna", lideraValle);
    expect(llevarAlConsejo(e, "cisterna", lideraValle)).toBe(e);
    expect(puedeLlevarAlConsejo(e, cisterna, lideraValle)).toBe(false);
    expect(decisionesVisibles(e).filter((d) => d.id === "consejo-cisterna")).toHaveLength(1);
  });
  it("se puede votar en la copia del consejo y el voto queda", () => {
    const e = llevarAlConsejo(INICIAL, "cisterna", lideraValle);
    const v = votar(e, "consejo-cisterna", "favor", NEUTRA);
    expect(v.votos["consejo-cisterna"]).toBe("favor");
    expect(v.alConsejo).toEqual(["cisterna"]);
  });
});

describe("votar", () => {
  it("suma el voto propio al conteo de ejemplo", () => {
    const e = votar(INICIAL, "huerta", "favor", NEUTRA);
    expect(contar(huerta, votoPropio(e, huerta, NEUTRA)).favor).toBe(huerta.votos.favor + 1);
    expect(contar(huerta, undefined)).toEqual(huerta.votos);
  });
  it("cambiar el voto no suma dos", () => {
    const e = votar(votar(INICIAL, "huerta", "favor", NEUTRA), "huerta", "contra", NEUTRA);
    const c = contar(huerta, votoPropio(e, huerta, NEUTRA));
    expect(c.favor).toBe(huerta.votos.favor);
    expect(c.contra).toBe(huerta.votos.contra + 1);
  });
  it("una decisión que no existe no registra nada", () => {
    expect(votar(INICIAL, "no-existe", "favor", argentina)).toBe(INICIAL);
  });
  it("el voto guardado en un ámbito donde ya no puede votar no se muestra", () => {
    const e = { votos: { bomba: "contra" as const }, alConsejo: [] };
    expect(votoPropio(e, bombaResidentes, exterior)).toBeUndefined();
    expect(votoPropio(e, bombaResidentes, argentina)).toBe("contra");
  });
});

describe("leer", () => {
  it("vacío o roto vuelve al inicial", () => {
    expect(leer(null)).toBe(INICIAL);
    expect(leer("{no")).toBe(INICIAL);
  });
  it("descarta votos inválidos y decisiones desconocidas", () => {
    const e = leer(JSON.stringify({ votos: { huerta: "favor", bomba: "ya", otra: "favor" } }));
    expect(e).toEqual({ votos: { huerta: "favor" }, alConsejo: [] });
  });
  it("un voto guardado en una decisión del común se conserva", () => {
    const e = leer(JSON.stringify({ votos: { huerta: "contra", bomba: "favor", animales: "favor" } }));
    expect(e).toEqual({ votos: { huerta: "contra", bomba: "favor", animales: "favor" }, alConsejo: [] });
  });
  it("lo guardado con personas de ejemplo (formato viejo) no pasa a quien mira", () => {
    const viejo = leer(
      JSON.stringify({ persona: "lucas", votos: { lucia: { huerta: "favor" }, lucas: { bomba: "contra" } } }),
    );
    expect(viejo).toEqual({ votos: {}, alConsejo: [] });
  });
});

describe("lo llevado al consejo se lee tolerante", () => {
  it("conserva la decisión llevada y su voto; descarta ids que no se pueden llevar", () => {
    const e = leer(JSON.stringify({ votos: { "consejo-cisterna": "favor" }, alConsejo: ["cisterna", "huerta", 7, "otra"] }));
    expect(e.alConsejo).toEqual(["cisterna"]);
    expect(e.votos).toEqual({ "consejo-cisterna": "favor" });
  });
  it("un voto en una copia que no se llevó se ignora", () => {
    expect(leer(JSON.stringify({ votos: { "consejo-cisterna": "favor" } })).votos).toEqual({});
  });
  it("alConsejo roto vuelve a vacío", () => {
    expect(leer(JSON.stringify({ votos: {}, alConsejo: "cisterna" })).alConsejo).toEqual([]);
  });
});
