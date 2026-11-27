import { describe, expect, it } from "vitest";
import { textos } from "../textos";

// El resumen de "Lo que hay que decidir" cuenta solo las abiertas: singular, plural y ninguna, en los dos idiomas.
describe("resumen de decisiones abiertas", () => {
  it("español: ninguna, una y varias", () => {
    const r = textos("biencomun", "es").resumenes.decisiones;
    expect(r("0", 0)).toBe("No quedan decisiones abiertas.");
    expect(r("1", 1)).toBe("1 decisión abierta, con la recomendación de Gus.");
    expect(r("3", 3)).toBe("3 decisiones abiertas, con la recomendación de Gus.");
  });
  it("inglés: none, one and several", () => {
    const r = textos("biencomun", "en").resumenes.decisiones;
    expect(r("0", 0)).toBe("No open decisions are left.");
    expect(r("1", 1)).toBe("1 open decision, with Gus's recommendation.");
    expect(r("3", 3)).toBe("3 open decisions, with Gus's recommendation.");
  });
});
