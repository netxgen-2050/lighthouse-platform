import { describe, expect, it } from "vitest";
import { ESTADOS_ADMINISTRATIVOS, accionesDeLote, textoExpediente, textoFechaAprobacion, textoTitular } from "./estado-administrativo";
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
  it("Norte ofrece consultar, reservar y comprar (solo simulados)", () => {
    expect(accionesDeLote("lighthouse-norte")).toEqual(["consultar", "reservar", "comprar"]);
    expect(ESTADOS_ADMINISTRATIVOS["lighthouse-norte"].ventaSimulada).toBe(true);
  });
  it("Soluna sigue en solo consultar, incluso con aprobación", () => {
    const original = ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal;
    ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal = true;
    try {
      expect(accionesDeLote("soluna")).toEqual(["consultar"]);
    } finally {
      ESTADOS_ADMINISTRATIVOS.soluna.aprobacionMunicipal = original;
    }
  });
  it("Norte: aprobación no otorgada, titular y fecha sin dato", () => {
    const n = ESTADOS_ADMINISTRATIVOS["lighthouse-norte"];
    expect(n.aprobacionMunicipal).toBe(false);
    expect(textoTitular(n)).toBe("sin dato");
    expect(textoFechaAprobacion(n)).toBe("sin dato");
    expect(textoExpediente(n)).toBe("sin dato");
    expect(textoTitular(ESTADOS_ADMINISTRATIVOS.soluna)).toBe("BioPueblo");
    expect(textoFechaAprobacion({ ...n, fechaAprobacion: "2027-01-05" })).toBe("2027-01-05");
  });
  it("el supuesto de trabajo dice 'no otorgada' / 'not granted'", () => {
    const n = ESTADOS_ADMINISTRATIVOS["lighthouse-norte"];
    expect(n.supuestoDeTrabajo).toContain("no otorgada");
    expect(n.en?.supuestoDeTrabajo).toContain("not granted");
  });
  it("la lista de vistas con lotes incluye el territorio (Soluna y Norte), /lotes y una ficha (Norte)", () => {
    const de = (ruta: string) => VISTAS_CON_LOTES.find((v) => v.ruta === ruta)?.proyectos;
    expect(de("/territorios/lighthouse")).toEqual(["soluna", "lighthouse-norte"]);
    expect(de("/lotes")).toEqual(["lighthouse-norte"]);
    expect(de("/lotes/lote-1")).toEqual(["lighthouse-norte"]);
  });
  it("cada vista con lotes declara al menos un proyecto que existe", () => {
    for (const v of VISTAS_CON_LOTES) {
      expect(v.proyectos.length, v.ruta).toBeGreaterThan(0);
      for (const p of v.proyectos) expect(ESTADOS_ADMINISTRATIVOS[p], `${v.ruta}: ${p}`).toBeDefined();
    }
  });
});
