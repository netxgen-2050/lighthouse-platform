import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { textos } from "@/lib/idioma/textos";
import { TERMINOS } from "@/lib/legal/terminos";
import {
  AMBITOS,
  ambitos,
  DECISIONES,
  DECISIONES_BASE,
  DECISIONES_DEL_COMUN,
  DECISIONES_DE_GOBERNANZA,
  EJEMPLOS_COMUN,
  opciones,
} from "./datos";
import {
  contar,
  decisionesVisibles,
  filtrar,
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
const huerta = DECISIONES[0];
const presupuesto = DECISIONES[1];
// Una decisión que pide residencia: ya no hay ninguna visible, pero la regla sigue en el código.
const bomba = EJEMPLOS_COMUN[0];

describe("datos", () => {
  it("son las tres decisiones del mock-up que quedan en el Fogón, con títulos y reglas copiados", () => {
    expect(DECISIONES).toHaveLength(3);
    for (const d of [...DECISIONES, ...EJEMPLOS_COMUN]) {
      expect(mock).toContain(`["${d.titulo.es}","${d.donde.es}","${d.regla.es}","${d.base}"`);
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
  it("cada decisión (las del mock-up, las del común y las de gobernanza) tiene su inglés, con el español como original", () => {
    for (const d of [...DECISIONES_BASE, ...EJEMPLOS_COMUN]) {
      for (const v of [d.titulo, d.donde, d.regla]) {
        expect(v.en.trim(), d.id).not.toBe("");
        expect(v.original).toBe("es");
      }
      expect(d.titulo.en, d.id).not.toBe(d.titulo.es);
    }
  });
  it("las etiquetas de ámbitos y opciones salen del diccionario, en los dos idiomas", () => {
    expect(ambitos("es").map((a) => a.etiqueta)).toEqual(["Círculo", "Tribu", "Lighthouse (el común)", "Consejo", "Fideicomiso"]);
    expect(ambitos("en").map((a) => a.etiqueta)).toEqual(["Circle", "Tribe", "Lighthouse (the commons)", "Council", "Trust"]);
    expect(opciones("es").map((o) => o.etiqueta)).toEqual(["A favor", "En contra", "Abstención"]);
    expect(opciones("en").map((o) => o.etiqueta)).toEqual(["In favor", "Against", "Abstention"]);
  });
  it("los ámbitos son Círculo, Tribu, Lighthouse (el común), Consejo y Fideicomiso, y no hay Asamblea de residentes", () => {
    expect(AMBITOS.map((a) => a.etiqueta)).toEqual(["Círculo", "Tribu", "Lighthouse (el común)", "Consejo", "Fideicomiso"]);
    expect(AMBITOS.map((a) => a.etiqueta).join()).not.toMatch(/Asamblea de residentes/);
    expect(ambitos("en").map((a) => a.etiqueta).join()).not.toMatch(/Residents' Assembly/);
  });
  it("ninguna decisión visible nombra a la Asamblea de residentes, en ningún idioma", () => {
    expect(DECISIONES_BASE.filter((d) => d.donde.es === "Asamblea de residentes" || d.donde.en === "Residents' Assembly")).toEqual([]);
  });
  it("los ejemplos para el común conservan las dos decisiones con su ⚖, ahora en el ámbito del común y sin pedir residencia", () => {
    expect(EJEMPLOS_COMUN.map((d) => d.id)).toEqual(["bomba", "animales"]);
    for (const d of EJEMPLOS_COMUN) expect(TERMINOS[d.base]).toBeDefined();
    expect(DECISIONES_DEL_COMUN.map((d) => d.ambito)).toEqual(["comun", "comun"]);
    expect(DECISIONES_DEL_COMUN.map((d) => d.requisito)).toEqual(["ninguno", "ninguno"]);
    expect(DECISIONES_DEL_COMUN.map((d) => d.titulo.es)).toEqual([
      "Usar el fondo común para la bomba solar",
      "Permitir animales de granja en las chacras",
    ]);
  });
  it("las decisiones nuevas de gobernanza son de círculo, de tribu y de consejo, con ⚖ del catálogo", () => {
    expect(DECISIONES_DE_GOBERNANZA.map((d) => d.ambito)).toEqual(["circulo", "tribu", "consejo"]);
    for (const d of DECISIONES_DE_GOBERNANZA) expect(TERMINOS[d.base]).toBeDefined();
    const consejo = DECISIONES_DE_GOBERNANZA[2];
    expect(consejo.titulo.es).toBe("Pedido de Valle Solar al Fondo Común para la bomba solar");
    expect(consejo.origen).toEqual({ tribuId: "valle", aprobadaEn: "Valle Solar" });
  });
  it("no hay personas de ejemplo en los datos", () => {
    expect(JSON.stringify(DECISIONES)).not.toMatch(/Luc[ií]a|Lucas/);
  });
});

const NEUTRA: Condicion = { ...SIN_CONDICION, adhirio: true };
const exterior: Condicion = { residencia: "exterior", pase: false, adhirio: true };
const argentina: Condicion = { residencia: "argentina", pase: false, adhirio: true };
const conPase: Condicion = { residencia: undefined, pase: true, adhirio: true };

describe("quién puede votar (residencia cargada y Pase Fundador)", () => {
  it("con residencia en el exterior y sin Pase vota en tribu; no en la asamblea ni en el fideicomiso", () => {
    expect(motivoSinVoto(huerta, exterior)).toBeNull();
    expect(motivoSinVoto(bomba, exterior)).toBe("residentes");
    expect(motivoSinVoto(presupuesto, exterior)).toBe("pase");
  });
  it("el motivo se lee en los dos idiomas desde el diccionario", () => {
    expect(textos("fogon", "es").motivos).toEqual({
      manifiesto: "Para participar, adherí al manifiesto de Lighthouse VRN",
      pase: "Votan quienes tienen el Pase Fundador",
      residentes: "Solo residentes",
      sinDato: "Sin dato de tu residencia",
    });
    expect(textos("fogon", "en").motivos.residentes).toBe("Residents only");
  });
  it("con residencia en Argentina vota en tribu; el fideicomiso pide el Pase", () => {
    for (const d of DECISIONES) {
      expect(motivoSinVoto(d, argentina)).toBe(d.id === "presupuesto" ? "pase" : null);
    }
    expect(motivoSinVoto(bomba, argentina)).toBeNull();
  });
  it("sin dato de residencia vota en tribu y en la asamblea dice que falta el dato (no asume)", () => {
    expect(motivoSinVoto(huerta, NEUTRA)).toBeNull();
    expect(motivoSinVoto(bomba, NEUTRA)).toBe("sinDato");
    expect(motivoSinVoto(presupuesto, NEUTRA)).toBe("pase");
  });
  it("con el Pase vota en el fideicomiso sin importar la residencia; la asamblea sigue pidiendo residencia", () => {
    expect(motivoSinVoto(presupuesto, conPase)).toBeNull();
    expect(motivoSinVoto(presupuesto, { residencia: "exterior", pase: true, adhirio: true })).toBeNull();
    expect(motivoSinVoto(bomba, conPase)).toBe("sinDato");
  });
});

describe("la adhesión al manifiesto de Lighthouse VRN va antes que todo (ADR-023)", () => {
  const sinAdhesionConPase: Condicion = { residencia: "argentina", pase: true, adhirio: false };

  it("sin adhesión el motivo es 'manifiesto', en cualquier decisión", () => {
    for (const d of DECISIONES) expect(motivoSinVoto(d, sinAdhesionConPase), d.id).toBe("manifiesto");
  });
  it("sin adhesión y sin pase da un solo motivo: manifiesto", () => {
    expect(motivoSinVoto(presupuesto, { residencia: undefined, pase: false, adhirio: false })).toBe("manifiesto");
    expect(motivoSinVoto(bomba, SIN_CONDICION)).toBe("manifiesto");
  });
  it("una decisión con requisito 'ninguno' sin adhesión da 'manifiesto'", () => {
    expect(huerta.requisito).toBe("ninguno");
    expect(motivoSinVoto(huerta, SIN_CONDICION)).toBe("manifiesto");
    expect(motivoSinVoto(huerta, NEUTRA)).toBeNull();
  });
  it("si falta el dato no se asume que adhirió", () => {
    expect(SIN_CONDICION.adhirio).toBe(false);
  });
  it("sin adhesión, votar y llevarAlConsejo devuelven el mismo estado", () => {
    expect(votar(INICIAL, "huerta", "favor", SIN_CONDICION)).toBe(INICIAL);
    expect(votar(INICIAL, "presupuesto", "favor", sinAdhesionConPase)).toBe(INICIAL);
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

describe("filtro", () => {
  it("Fideicomiso deja solo el presupuesto", () => {
    expect(filtrar("fideicomiso").map((d) => d.id)).toEqual(["presupuesto"]);
  });
  it("sin filtro están todas", () => {
    expect(filtrar(null)).toHaveLength(10);
  });
  it("cada ámbito deja sus decisiones", () => {
    expect(filtrar("circulo").map((d) => d.id)).toEqual(["siembra"]);
    expect(filtrar("tribu").map((d) => d.id)).toEqual(["huerta", "facilitador", "cisterna"]);
    expect(filtrar("comun").map((d) => d.id)).toEqual(["bomba", "animales", "regalia"]);
    expect(filtrar("consejo").map((d) => d.id)).toEqual(["consejo-bomba", "cisterna-compartida"]);
  });
  it("filtrar por el común incluye la regalía y por el consejo la cisterna compartida", () => {
    expect(filtrar("comun").map((d) => d.titulo.es)).toContain("Parámetros de la regalía de regeneración");
    expect(filtrar("consejo").map((d) => d.titulo.es)).toContain("Cisterna compartida entre Agua Clara y Valle Solar");
  });
  it("el común trae las dos decisiones del mock-up, cada una con su regla y su ⚖", () => {
    for (const d of filtrar("comun")) {
      expect(d.regla).toBeTruthy();
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
});

const lideraValle: Condicion = { residencia: undefined, pase: false, adhirio: true, lidera: "valle" };
const lideraTaller: Condicion = { residencia: undefined, pase: false, adhirio: true, lidera: "taller" };
const cisterna = DECISIONES_DE_GOBERNANZA[1];

describe("llevar al consejo", () => {
  it("quien lidera Valle Solar puede, y crea la copia en el consejo con su origen", () => {
    expect(puedeLlevarAlConsejo(INICIAL, cisterna, lideraValle)).toBe(true);
    const e = llevarAlConsejo(INICIAL, "cisterna", lideraValle);
    expect(e.alConsejo).toEqual(["cisterna"]);
    const copia = filtrar("consejo", e).find((d) => d.id === "consejo-cisterna")!;
    expect(copia.titulo).toBe(cisterna.titulo);
    expect(copia.origen).toEqual({ tribuId: "valle", aprobadaEn: "Valle Solar" });
    expect(copia.ambito).toBe("consejo");
    // La original sigue en la tribu.
    expect(filtrar("tribu", e).map((d) => d.id)).toContain("cisterna");
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
  it("el fideicomiso solo registra el voto de quien tiene el Pase", () => {
    expect(votar(INICIAL, "presupuesto", "favor", argentina)).toBe(INICIAL);
    expect(votar(INICIAL, "presupuesto", "favor", conPase).votos.presupuesto).toBe("favor");
  });
  it("el voto guardado en un ámbito donde ya no puede votar no se muestra", () => {
    const e = { votos: { presupuesto: "contra" as const }, alConsejo: [] };
    expect(votoPropio(e, presupuesto, argentina)).toBeUndefined();
    expect(votoPropio(e, presupuesto, conPase)).toBe("contra");
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
  it("un voto guardado en una decisión del común se conserva (la bomba y los animales volvieron en ese ámbito)", () => {
    const e = leer(JSON.stringify({ votos: { huerta: "contra", bomba: "favor", animales: "favor" } }));
    expect(e).toEqual({ votos: { huerta: "contra", bomba: "favor", animales: "favor" }, alConsejo: [] });
  });
  it("lo guardado con personas de ejemplo (formato viejo) no pasa a quien mira", () => {
    const viejo = leer(
      JSON.stringify({ persona: "lucas", votos: { lucia: { huerta: "favor" }, lucas: { bomba: "contra" } } }),
    );
    expect(viejo).toEqual({ votos: {}, alConsejo: [] });
  });
  it("el formato plano más viejo con persona tampoco pasa a quien mira", () => {
    expect(leer(JSON.stringify({ persona: "lucas", votos: { bomba: "contra" } }))).toEqual({ votos: {}, alConsejo: [] });
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
