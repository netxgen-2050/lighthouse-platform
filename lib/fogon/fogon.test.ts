import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { textos } from "@/lib/idioma/textos";
import { TERMINOS } from "@/lib/legal/terminos";
import { ambitos, DECISIONES, opciones } from "./datos";
import { contar, filtrar, INICIAL, leer, motivoSinVoto, SIN_CONDICION, votar, votoPropio, type Condicion } from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");
const huerta = DECISIONES[0];
const bomba = DECISIONES[1];
const presupuesto = DECISIONES[3];

describe("datos", () => {
  it("son las cinco decisiones del mock-up, con títulos y reglas copiados", () => {
    expect(DECISIONES).toHaveLength(5);
    for (const d of DECISIONES) {
      expect(mock).toContain(`["${d.titulo.es}","${d.donde.es}","${d.regla.es}","${d.base}"`);
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
  it("cada decisión tiene su inglés, con el español como original", () => {
    for (const d of DECISIONES) {
      for (const v of [d.titulo, d.donde, d.regla]) {
        expect(v.en.trim(), d.id).not.toBe("");
        expect(v.original).toBe("es");
      }
      expect(d.titulo.en, d.id).not.toBe(d.titulo.es);
    }
  });
  it("las etiquetas de ámbitos y opciones salen del diccionario, en los dos idiomas", () => {
    expect(ambitos("es").map((a) => a.etiqueta)).toEqual(["Tribu", "Asamblea de residentes", "Fideicomiso"]);
    expect(ambitos("en").map((a) => a.etiqueta)).toEqual(["Tribe", "Residents' Assembly", "Trust"]);
    expect(opciones("es").map((o) => o.etiqueta)).toEqual(["A favor", "En contra", "Abstención"]);
    expect(opciones("en").map((o) => o.etiqueta)).toEqual(["In favor", "Against", "Abstention"]);
  });
  it("no hay personas de ejemplo en los datos", () => {
    expect(JSON.stringify(DECISIONES)).not.toMatch(/Luc[ií]a|Lucas/);
  });
});

const exterior: Condicion = { residencia: "exterior", pase: false };
const argentina: Condicion = { residencia: "argentina", pase: false };
const conPase: Condicion = { residencia: undefined, pase: true };

describe("quién puede votar (residencia cargada y Pase Fundador)", () => {
  it("con residencia en el exterior y sin Pase vota en tribu; no en la asamblea ni en el fideicomiso", () => {
    expect(motivoSinVoto(huerta, exterior)).toBeNull();
    expect(motivoSinVoto(bomba, exterior)).toBe("residentes");
    expect(motivoSinVoto(presupuesto, exterior)).toBe("pase");
  });
  it("el motivo se lee en los dos idiomas desde el diccionario", () => {
    expect(textos("fogon", "es").motivos).toEqual({
      pase: "Votan quienes tienen el Pase Fundador",
      residentes: "Solo residentes",
      sinDato: "Sin dato de tu residencia",
    });
    expect(textos("fogon", "en").motivos.residentes).toBe("Residents only");
  });
  it("con residencia en Argentina vota en tribu y asamblea; el fideicomiso pide el Pase", () => {
    for (const d of DECISIONES) {
      expect(motivoSinVoto(d, argentina)).toBe(d.id === "presupuesto" ? "pase" : null);
    }
  });
  it("sin dato de residencia vota en tribu y en la asamblea dice que falta el dato (no asume)", () => {
    expect(motivoSinVoto(huerta, SIN_CONDICION)).toBeNull();
    expect(motivoSinVoto(bomba, SIN_CONDICION)).toBe("sinDato");
    expect(motivoSinVoto(presupuesto, SIN_CONDICION)).toBe("pase");
  });
  it("con el Pase vota en el fideicomiso sin importar la residencia; la asamblea sigue pidiendo residencia", () => {
    expect(motivoSinVoto(presupuesto, conPase)).toBeNull();
    expect(motivoSinVoto(presupuesto, { residencia: "exterior", pase: true })).toBeNull();
    expect(motivoSinVoto(bomba, conPase)).toBe("sinDato");
  });
});

describe("filtro", () => {
  it("Fideicomiso deja solo el presupuesto", () => {
    expect(filtrar("fideicomiso").map((d) => d.id)).toEqual(["presupuesto"]);
  });
  it("sin filtro están todas", () => {
    expect(filtrar(null)).toHaveLength(5);
  });
});

describe("votar", () => {
  it("suma el voto propio al conteo de ejemplo", () => {
    const e = votar(INICIAL, "huerta", "favor", SIN_CONDICION);
    expect(contar(huerta, votoPropio(e, huerta, SIN_CONDICION)).favor).toBe(huerta.votos.favor + 1);
    expect(contar(huerta, undefined)).toEqual(huerta.votos);
  });
  it("cambiar el voto no suma dos", () => {
    const e = votar(votar(INICIAL, "huerta", "favor", SIN_CONDICION), "huerta", "contra", SIN_CONDICION);
    const c = contar(huerta, votoPropio(e, huerta, SIN_CONDICION));
    expect(c.favor).toBe(huerta.votos.favor);
    expect(c.contra).toBe(huerta.votos.contra + 1);
  });
  it("sin derecho a voto no registra nada", () => {
    expect(votar(INICIAL, "bomba", "favor", SIN_CONDICION)).toBe(INICIAL);
    expect(votar(INICIAL, "bomba", "favor", exterior)).toBe(INICIAL);
    expect(votar(INICIAL, "bomba", "favor", argentina).votos.bomba).toBe("favor");
  });
  it("el fideicomiso solo registra el voto de quien tiene el Pase", () => {
    expect(votar(INICIAL, "presupuesto", "favor", argentina)).toBe(INICIAL);
    expect(votar(INICIAL, "presupuesto", "favor", conPase).votos.presupuesto).toBe("favor");
  });
  it("el voto guardado en un ámbito donde ya no puede votar no se muestra", () => {
    const e = { votos: { bomba: "favor" as const, presupuesto: "contra" as const } };
    expect(votoPropio(e, bomba, exterior)).toBeUndefined();
    expect(votoPropio(e, bomba, argentina)).toBe("favor");
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
    expect(e).toEqual({ votos: { huerta: "favor" } });
  });
  it("lo guardado con personas de ejemplo (formato viejo) no pasa a quien mira", () => {
    const viejo = leer(
      JSON.stringify({ persona: "lucas", votos: { lucia: { huerta: "favor" }, lucas: { bomba: "contra" } } }),
    );
    expect(viejo).toEqual({ votos: {} });
  });
  it("el formato plano más viejo con persona tampoco pasa a quien mira", () => {
    expect(leer(JSON.stringify({ persona: "lucas", votos: { bomba: "contra" } }))).toEqual({ votos: {} });
  });
});
