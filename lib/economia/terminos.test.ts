import { describe, expect, it } from "vitest";
import { TERMINOS_ECONOMICOS, esBorradorEconomico, terminoEconomico } from "./terminos";

describe("catálogo de términos económicos", () => {
  it("el término Semillas es un borrador y explica que no es dinero", () => {
    expect(TERMINOS_ECONOMICOS.semillas.titulo).toBe("Semillas");
    expect(esBorradorEconomico("semillas")).toBe(true);
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("No son dinero ni se venden");
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("potencial de acceso");
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("tokenomics");
  });

  it("en inglés el título sigue siendo Semillas, el texto está en inglés y es siempre un borrador", () => {
    const en = terminoEconomico("semillas", "en");
    expect(en.titulo).toBe("Semillas");
    expect(en.texto).toContain("Semillas (seeds)");
    expect(en.texto).toContain("not money");
    expect(en.texto).not.toContain("potencial");
    expect(en.borrador).toBe(true);
  });

  it("en español es el texto de siempre", () => {
    const es = terminoEconomico("semillas", "es");
    expect(es.texto).toBe(TERMINOS_ECONOMICOS.semillas.texto);
    expect(es.borrador).toBe(true);
  });
});
