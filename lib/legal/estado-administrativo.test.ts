import { describe, expect, it } from "vitest";
import { ESTADOS_ADMINISTRATIVOS, accionesDeLote, textoExpediente } from "./estado-administrativo";
import { VISTAS_CON_LOTES } from "./vistas-con-lotes";

describe("estado administrativo", () => {
  it("Soluna: loteo en trámite, sin expediente ni aprobación", () => {
    const s = ESTADOS_ADMINISTRATIVOS.soluna;
    expect(s.proyecto).toBe("Chacras de Soluna");
    expect(s.titular).toBe("BioPueblo");
    expect(s.estado).toBe("Loteo en trámite");
    expect(s.norma).toBe("Ord. 173/2026 de Mainqué");
    expect(s.aprobacionMunicipal).toBe(false);
    expect(s.expediente).toBeUndefined();
    expect(textoExpediente(s)).toBe("sin dato");
  });
  it("un expediente vacío también es sin dato", () => {
    expect(textoExpediente({ ...ESTADOS_ADMINISTRATIVOS.soluna, expediente: "  " })).toBe("sin dato");
    expect(textoExpediente({ ...ESTADOS_ADMINISTRATIVOS.soluna, expediente: "123/26" })).toBe("123/26");
  });
  it("sin aprobación solo se puede consultar", () => {
    expect(accionesDeLote("soluna")).toEqual(["consultar"]);
  });
  it("con aprobación sigue siendo solo consultar en este cambio", () => {
    const original = ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal;
    ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal = true;
    try {
      expect(accionesDeLote("soluna")).toEqual(["consultar"]);
    } finally {
      ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal = original;
    }
  });
  it("la lista de vistas con lotes incluye el territorio", () => {
    expect(VISTAS_CON_LOTES).toContain("/territorios/lighthouse");
  });
});
