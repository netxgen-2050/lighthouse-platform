import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "@/lib/legal/terminos";
import { AMBITOS, DECISIONES, EJEMPLOS_COMUN } from "./datos";
import { contar, filtrar, INICIAL, leer, motivoSinVoto, SIN_CONDICION, votar, votoPropio, type Condicion } from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");
const huerta = DECISIONES[0];
const presupuesto = DECISIONES[1];
// Una decisión que pide residencia: ya no hay ninguna visible, pero la regla sigue en el código.
const bomba = EJEMPLOS_COMUN[0];

describe("datos", () => {
  it("son las tres decisiones del mock-up que quedan en el Fogón, con títulos y reglas copiados", () => {
    expect(DECISIONES).toHaveLength(3);
    for (const d of [...DECISIONES, ...EJEMPLOS_COMUN]) {
      expect(mock).toContain(`["${d.titulo}","${d.donde}","${d.regla}","${d.base}"`);
      expect(TERMINOS[d.base]).toBeDefined();
    }
  });
  it("los ámbitos son solo tribu y fideicomiso", () => {
    expect(AMBITOS.map((a) => a.id)).toEqual(["tribu", "fideicomiso"]);
  });
  it("ninguna decisión visible es de la Asamblea de residentes", () => {
    expect(DECISIONES.filter((d) => d.donde === "Asamblea de residentes")).toEqual([]);
    expect(DECISIONES.map((d) => d.id)).not.toContain("bomba");
    expect(DECISIONES.map((d) => d.id)).not.toContain("animales");
  });
  it("los ejemplos para el común conservan las dos decisiones con su ⚖", () => {
    expect(EJEMPLOS_COMUN.map((d) => d.id)).toEqual(["bomba", "animales"]);
    for (const d of EJEMPLOS_COMUN) expect(TERMINOS[d.base]).toBeDefined();
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
    expect(motivoSinVoto(bomba, exterior)).toBe("Solo residentes");
    expect(motivoSinVoto(presupuesto, exterior)).toBe("Votan quienes tienen el Pase Fundador");
  });
  it("con residencia en Argentina vota en tribu; el fideicomiso pide el Pase", () => {
    for (const d of DECISIONES) {
      expect(motivoSinVoto(d, argentina)).toBe(d.id === "presupuesto" ? "Votan quienes tienen el Pase Fundador" : null);
    }
    expect(motivoSinVoto(bomba, argentina)).toBeNull();
  });
  it("sin dato de residencia vota en tribu y en la asamblea dice que falta el dato (no asume)", () => {
    expect(motivoSinVoto(huerta, SIN_CONDICION)).toBeNull();
    expect(motivoSinVoto(bomba, SIN_CONDICION)).toBe("Sin dato de tu residencia");
    expect(motivoSinVoto(presupuesto, SIN_CONDICION)).toBe("Votan quienes tienen el Pase Fundador");
  });
  it("con el Pase vota en el fideicomiso sin importar la residencia; la asamblea sigue pidiendo residencia", () => {
    expect(motivoSinVoto(presupuesto, conPase)).toBeNull();
    expect(motivoSinVoto(presupuesto, { residencia: "exterior", pase: true })).toBeNull();
    expect(motivoSinVoto(bomba, conPase)).toBe("Sin dato de tu residencia");
  });
});

describe("filtro", () => {
  it("Fideicomiso deja solo el presupuesto", () => {
    expect(filtrar("fideicomiso").map((d) => d.id)).toEqual(["presupuesto"]);
  });
  it("sin filtro están todas", () => {
    expect(filtrar(null)).toHaveLength(3);
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
  it("una decisión que ya no existe (la bomba) no registra nada", () => {
    expect(votar(INICIAL, "bomba", "favor", argentina)).toBe(INICIAL);
  });
  it("el fideicomiso solo registra el voto de quien tiene el Pase", () => {
    expect(votar(INICIAL, "presupuesto", "favor", argentina)).toBe(INICIAL);
    expect(votar(INICIAL, "presupuesto", "favor", conPase).votos.presupuesto).toBe("favor");
  });
  it("el voto guardado en un ámbito donde ya no puede votar no se muestra", () => {
    const e = { votos: { presupuesto: "contra" as const } };
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
  it("un estado guardado con un voto en la bomba (decisión que salió) no falla y lo ignora", () => {
    const e = leer(JSON.stringify({ votos: { huerta: "contra", bomba: "favor", animales: "favor" } }));
    expect(e).toEqual({ votos: { huerta: "contra" } });
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
