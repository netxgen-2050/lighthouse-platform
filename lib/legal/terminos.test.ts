import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "./terminos";

const mock = readFileSync(
  path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"),
  "utf8",
);

describe("catálogo legal", () => {
  it("las cinco claves", () => {
    expect(Object.keys(TERMINOS).sort()).toEqual(["obra", "personeria", "presencia", "ritual", "ticket"]);
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
