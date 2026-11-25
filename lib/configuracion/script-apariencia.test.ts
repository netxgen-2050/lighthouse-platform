import { describe, expect, it } from "vitest";
import { SCRIPT_APARIENCIA } from "./script-apariencia";

// Corre el script del <head> con un navegador de mentira y devuelve el tema que dejó en <html>.
function temaQueDeja(guardado: Record<string, unknown> | null, sistemaOscuro: boolean): string | undefined {
  const dataset: Record<string, string> = {};
  const almacen: Record<string, string> = {};
  if (guardado) almacen["lh-configuracion"] = JSON.stringify(guardado);
  const localStorage = { getItem: (k: string) => (k in almacen ? almacen[k] : null) };
  const matchMedia = () => ({ matches: sistemaOscuro });
  const document = { documentElement: { dataset } };
  new Function("localStorage", "matchMedia", "document", SCRIPT_APARIENCIA)(localStorage, matchMedia, document);
  return dataset.tema;
}

describe("script de apariencia", () => {
  it("sin preferencia guardada sigue al sistema", () => {
    expect(temaQueDeja(null, false)).toBe("claro");
    expect(temaQueDeja(null, true)).toBe("oscuro");
  });

  it("respeta el tema claro u oscuro guardado, sea cual sea el sistema", () => {
    expect(temaQueDeja({ tema: "claro" }, true)).toBe("claro");
    expect(temaQueDeja({ tema: "oscuro" }, false)).toBe("oscuro");
  });

  it("con 'sistema' sigue al sistema", () => {
    expect(temaQueDeja({ tema: "sistema" }, false)).toBe("claro");
    expect(temaQueDeja({ tema: "sistema" }, true)).toBe("oscuro");
  });
});
