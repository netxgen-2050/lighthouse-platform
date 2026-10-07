import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "@/lib/legal/terminos";
import { DECISIONES } from "./datos";
import { cambiarPersona, contar, filtrar, INICIAL, leer, motivoSinVoto, votar } from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");
const huerta = DECISIONES[0];
const bomba = DECISIONES[1];
const presupuesto = DECISIONES[3];

describe("datos", () => {
  it("son las cinco decisiones del mock-up, con títulos y reglas copiados", () => {
    expect(DECISIONES).toHaveLength(5);
    for (const d of DECISIONES) {
      expect(mock).toContain(`["${d.titulo}","${d.donde}","${d.regla}","${d.base}"`);
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
});

describe("quién puede votar", () => {
  it("Lucía vota en tribu; no en la asamblea ni en el fideicomiso", () => {
    expect(motivoSinVoto(huerta, "lucia")).toBeNull();
    expect(motivoSinVoto(bomba, "lucia")).toBe("Solo residentes");
    expect(motivoSinVoto(presupuesto, "lucia")).toBe("No sos beneficiaria/o");
  });
  it("Lucas vota en todas", () => {
    for (const d of DECISIONES) expect(motivoSinVoto(d, "lucas")).toBeNull();
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
    const e = votar(INICIAL, "huerta", "favor");
    expect(contar(huerta, e.votos.huerta).favor).toBe(huerta.votos.favor + 1);
    expect(contar(huerta, undefined)).toEqual(huerta.votos);
  });
  it("cambiar el voto no suma dos", () => {
    const e = votar(votar(INICIAL, "huerta", "favor"), "huerta", "contra");
    const c = contar(huerta, e.votos.huerta);
    expect(c.favor).toBe(huerta.votos.favor);
    expect(c.contra).toBe(huerta.votos.contra + 1);
  });
  it("sin derecho a voto no registra nada", () => {
    expect(votar(INICIAL, "bomba", "favor")).toBe(INICIAL);
    expect(votar(cambiarPersona(INICIAL, "lucas"), "bomba", "favor").votos.bomba).toBe("favor");
  });
});

describe("leer", () => {
  it("vacío o roto vuelve al inicial", () => {
    expect(leer(null)).toBe(INICIAL);
    expect(leer("{no")).toBe(INICIAL);
  });
  it("descarta votos inválidos y decisiones desconocidas", () => {
    const e = leer(JSON.stringify({ persona: "x", votos: { huerta: "favor", bomba: "ya", otra: "favor" } }));
    expect(e).toEqual({ persona: "lucia", votos: { huerta: "favor" } });
  });
});
