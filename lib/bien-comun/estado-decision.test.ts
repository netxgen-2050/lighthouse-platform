import { describe, expect, it } from "vitest";
import { biencomun } from "@/lib/idioma/textos/bien-comun";
import { textoDeEstado } from "./estado-decision";

// Escenario "Cambio de estado": una decisión pasa a decidida, con fecha y quién, y la página lo dice con palabras.
describe("estado de una decisión", () => {
  it("abierta se dice 'abierta' / 'open'", () => {
    expect(textoDeEstado({ estado: "abierta" }, biencomun.es.decisiones, "es")).toBe("abierta");
    expect(textoDeEstado({ estado: "abierta" }, biencomun.en.decisiones, "en")).toBe("open");
  });

  it("decidida dice la fecha y quién, en cada idioma", () => {
    const d = { estado: "decidida", decidida: { fecha: "2026-12-02", quien: "Franz" } } as const;
    expect(textoDeEstado(d, biencomun.es.decisiones, "es")).toBe("decidida el 2 de diciembre de 2026 por Franz");
    expect(textoDeEstado(d, biencomun.en.decisiones, "en")).toBe("decided on December 2, 2026 by Franz");
  });
});
