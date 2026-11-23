import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { estiloElegido, estiloLote } from "./capas";

// `token` lee el tema del documento: acá se simula.
beforeAll(() => {
  vi.stubGlobal("document", { documentElement: {} });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "token-de-prueba" }));
});
afterAll(() => vi.unstubAllGlobals());

const forma = (o: { dashArray?: unknown }) => (o.dashArray === undefined ? "continuo" : String(o.dashArray));

describe("estiloLote: la forma del borde dice el estado", () => {
  it("los tres estados tienen un borde distinto: continuo, trazos y puntos", () => {
    const formas = (["disponible", "reservado", "vendido"] as const).map((e) => forma(estiloLote(e)));
    expect(new Set(formas).size).toBe(3);
    expect(formas[0]).toBe("continuo");
  });

  it("con el lote elegido el borde conserva su forma", () => {
    for (const e of ["disponible", "reservado", "vendido"] as const) {
      const base = estiloLote(e);
      expect(forma(estiloElegido(base, true))).toBe(forma(base));
    }
    const formas = (["disponible", "reservado", "vendido"] as const).map((e) => forma(estiloElegido(estiloLote(e), true)));
    expect(new Set(formas).size).toBe(3);
  });

  it("la punta del trazo nunca queda sin definir: vuelve al 'round' de Leaflet", () => {
    for (const e of ["disponible", "reservado", "vendido"] as const) {
      expect(estiloElegido(estiloLote(e), true).lineCap).toBe("round");
    }
    expect(estiloElegido({}).lineCap).toBe("round");
  });

  it("fuera de los lotes el resaltado sigue sacando el trazo", () => {
    expect(estiloElegido({ dashArray: "1 4" }).dashArray).toBeUndefined();
  });
});
