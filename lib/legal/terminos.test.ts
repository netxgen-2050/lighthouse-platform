import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "./terminos";

const mock = readFileSync(
  path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"),
  "utf8",
);

describe("catálogo legal", () => {
  it("las claves del catálogo", () => {
    expect(Object.keys(TERMINOS).sort()).toEqual(
      [
        "art32",
        "caja",
        "circulo",
        "creditos",
        "espejo",
        "guardian",
        "hacienda",
        "membresia",
        "obra",
        "pacto",
        "pase",
        "pasefundador",
        "personeria",
        "plantribu",
        "presencia",
        "remoto",
        "ritual",
        "ronda0",
        "safe",
        "semillas",
        "sumarte",
        "ticket",
      ].sort(),
    );
  });
  for (const [clave, t] of Object.entries(TERMINOS)) {
    it(`${clave} coincide con el mock-up`, () => {
      const m = mock.match(new RegExp(`^\\s*${clave}:\\["([^"]+)","([^"]+)"\\]`, "m"));
      expect(m).not.toBeNull();
      expect(t.titulo).toBe(m![1]);
      expect(t.texto).toBe(m![2]);
    });
  }
});
