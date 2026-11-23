import { describe, expect, it } from "vitest";
import { CAPITALES, CIFRAS, capitalesDePortada, cifrasDePortada } from "./portada-vrn";

describe("portada VRN", () => {
  it("hay cinco capitales con los dos idiomas", () => {
    expect(CAPITALES).toHaveLength(5);
    for (const c of CAPITALES) {
      expect(c.nombre.es.trim(), c.id).toBeTruthy();
      expect(c.nombre.en.trim(), c.id).toBeTruthy();
      expect(c.texto.es.trim(), c.id).toBeTruthy();
      expect(c.texto.en.trim(), c.id).toBeTruthy();
    }
    expect(capitalesDePortada("en")).toHaveLength(5);
  });

  it("toda cifra tiene fuente y fecha de consulta", () => {
    for (const c of CIFRAS) {
      expect(c.fuente.trim(), c.id).toBeTruthy();
      expect(c.consultado.trim(), c.id).toBeTruthy();
      expect(c.texto.en.trim(), c.id).toBeTruthy();
    }
    expect(cifrasDePortada("es").every((c) => c.fuente !== "")).toBe(true);
  });

  it("por ahora ninguna cifra es externa", () => {
    expect(CIFRAS.filter((c) => c.externa)).toEqual([]);
  });
});
