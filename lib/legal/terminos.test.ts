import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS, esBorrador, type ClaveTermino } from "./terminos";

const mock = readFileSync(
  path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"),
  "utf8",
);

describe("catálogo legal", () => {
  it("las claves del catálogo", () => {
    expect(Object.keys(TERMINOS).sort()).toEqual(
      [
        "adherente",
        "agencia",
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
        "licencia",
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
  it("agencia es borrador", () => {
    expect(esBorrador("agencia")).toBe(true);
    expect(esBorrador("ritual")).toBe(false);
  });
  for (const [clave, t] of Object.entries(TERMINOS)) {
    // Los borradores son textos nuevos que no vienen del mock-up.
    if (esBorrador(clave as ClaveTermino)) continue;
    it(`${clave} coincide con el mock-up`, () => {
      const m = mock.match(new RegExp(`^\\s*${clave}:\\["([^"]+)","([^"]+)"\\]`, "m"));
      expect(m).not.toBeNull();
      expect(t.titulo).toBe(m![1]);
      expect(t.texto).toBe(m![2]);
    });
  }
});
