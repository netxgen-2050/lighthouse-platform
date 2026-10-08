import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "@/lib/legal/terminos";
import { DECISIONES } from "./datos";
import { contar, filtrar, INICIAL, leer, motivoSinVoto, votar, votoPropio } from "./estado";

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
  it("no hay personas de ejemplo en los datos", () => {
    expect(JSON.stringify(DECISIONES)).not.toMatch(/Luc[ií]a|Lucas/);
  });
});

describe("quién puede votar (según la residencia que cargó la persona)", () => {
  it("con residencia en el exterior vota en tribu; no en la asamblea ni en el fideicomiso", () => {
    expect(motivoSinVoto(huerta, "exterior")).toBeNull();
    expect(motivoSinVoto(bomba, "exterior")).toBe("Solo residentes");
    expect(motivoSinVoto(presupuesto, "exterior")).toBe("No sos beneficiaria/o");
  });
  it("con residencia en Argentina vota en todas", () => {
    for (const d of DECISIONES) expect(motivoSinVoto(d, "argentina")).toBeNull();
  });
  it("sin dato de residencia vota en tribu y en las otras dice que falta el dato (no asume)", () => {
    expect(motivoSinVoto(huerta, undefined)).toBeNull();
    expect(motivoSinVoto(bomba, undefined)).toBe("Sin dato de tu residencia");
    expect(motivoSinVoto(presupuesto, undefined)).toBe("Sin dato de tu residencia");
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
    const e = votar(INICIAL, "huerta", "favor", undefined);
    expect(contar(huerta, votoPropio(e, huerta, undefined)).favor).toBe(huerta.votos.favor + 1);
    expect(contar(huerta, undefined)).toEqual(huerta.votos);
  });
  it("cambiar el voto no suma dos", () => {
    const e = votar(votar(INICIAL, "huerta", "favor", undefined), "huerta", "contra", undefined);
    const c = contar(huerta, votoPropio(e, huerta, undefined));
    expect(c.favor).toBe(huerta.votos.favor);
    expect(c.contra).toBe(huerta.votos.contra + 1);
  });
  it("sin derecho a voto no registra nada", () => {
    expect(votar(INICIAL, "bomba", "favor", undefined)).toBe(INICIAL);
    expect(votar(INICIAL, "bomba", "favor", "exterior")).toBe(INICIAL);
    expect(votar(INICIAL, "bomba", "favor", "argentina").votos.bomba).toBe("favor");
  });
  it("el voto guardado en un ámbito donde ya no puede votar no se muestra", () => {
    const e = { votos: { bomba: "favor" as const } };
    expect(votoPropio(e, bomba, "exterior")).toBeUndefined();
    expect(votoPropio(e, bomba, "argentina")).toBe("favor");
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
});
