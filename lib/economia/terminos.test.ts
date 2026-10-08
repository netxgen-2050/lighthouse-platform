import { describe, expect, it } from "vitest";
import { TERMINOS_ECONOMICOS, esBorradorEconomico } from "./terminos";

describe("catálogo de términos económicos", () => {
  it("el término Semillas es un borrador y explica que no es dinero", () => {
    expect(TERMINOS_ECONOMICOS.semillas.titulo).toBe("Semillas");
    expect(esBorradorEconomico("semillas")).toBe(true);
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("No son dinero ni se venden");
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("potencial de acceso");
    expect(TERMINOS_ECONOMICOS.semillas.texto).toContain("tokenomics");
  });
});
