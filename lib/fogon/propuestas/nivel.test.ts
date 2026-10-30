import { describe, expect, it } from "vitest";
import { propuestaDe } from "./ejemplos";
import { nivelInicial, nivelInicialSeguro } from "./nivel";
import type { Propuesta } from "./tipos";

const P = (id: string): Propuesta => propuestaDe(id)!;
const valle = { membresias: ["valle"], tribuLider: null };
const nadie = { membresias: [], tribuLider: null };

describe("nivelInicial (design §3)", () => {
  it("miembro de Valle Solar → ámbito en la siembra (holón valle-0)", () => {
    expect(nivelInicial(P("siembra"), valle)).toBe("ambito");
  });
  it("quien lidera la tribu también es del ámbito", () => {
    expect(nivelInicial(P("siembra"), { membresias: [], tribuLider: "valle" })).toBe("ambito");
  });
  it("miembro de Valle Solar → red en la bomba: decide el consejo y vos no está en su lista", () => {
    expect(nivelInicial(P("consejo-bomba"), valle)).toBe("red");
  });
  it("vos en la lista del consejo → ámbito en la bomba", () => {
    const p = P("consejo-bomba");
    expect(nivelInicial(p, nadie, [...p.ambitoConsejo!.personas, "vos"])).toBe("ambito");
  });
  it("cualquier persona → común en la regalía", () => {
    expect(nivelInicial(P("regalia"), nadie)).toBe("comun");
  });
  it("la huerta (sin holón) → red", () => {
    expect(nivelInicial(P("huerta"), valle)).toBe("red");
  });
  it("sin membresía → red", () => {
    expect(nivelInicial(P("siembra"), nadie)).toBe("red");
  });
  it("si lo guardado está roto → red", () => {
    expect(
      nivelInicialSeguro(P("siembra"), () => {
        throw new Error("localStorage roto");
      }),
    ).toBe("red");
  });
});
