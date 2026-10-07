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
        "art35",
        "art44",
        "caja",
        "calificado",
        "chacra",
        "circulo",
        "creditos",
        "espejo",
        "estatuto",
        "fidasamblea",
        "guardian",
        "hacienda",
        "membresia",
        "obra",
        "pacto",
        "pase",
        "pasaporte",
        "pasefundador",
        "personeria",
        "plantribu",
        "presencia",
        "remoto",
        "ribera",
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
