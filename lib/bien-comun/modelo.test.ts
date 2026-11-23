import { describe, expect, it } from "vitest";
import { MODELO_LOTES } from "@/lib/lotes/modelo";
import {
  CAMBIOS_DESDE_V_ANTERIOR,
  CARRILES,
  DECISIONES,
  FARO_POR_M2,
  POLITICA,
  PUENTES,
  PUERTAS,
  QUE_DA,
  QUE_NO_TIENE,
  VERSION_PROPUESTA,
  centroDeAnillo,
  faroDeLote,
  loteTraeFaro,
} from "./modelo";

describe("propuesta v0.1 del bien común", () => {
  it("tiene versión, fecha y fuente", () => {
    expect(VERSION_PROPUESTA.version).toBe("v0.1");
    expect(VERSION_PROPUESTA.fecha).toBe("2026-11-19");
    expect(VERSION_PROPUESTA.fuente).toContain("doc 34");
  });

  it("son 8 decisiones y todas están abiertas", () => {
    expect(DECISIONES).toHaveLength(8);
    expect(new Set(DECISIONES.map((d) => d.id)).size).toBe(8);
    for (const d of DECISIONES) expect(d.estado, d.id).toBe("abierta");
  });

  it("dos carriles: tres nodos en el A y dos en el B", () => {
    expect(CARRILES.a).toHaveLength(3);
    expect(CARRILES.b).toHaveLength(2);
  });

  it("son 3 puentes, cada uno con origen y destino", () => {
    expect(PUENTES).toHaveLength(3);
    for (const p of PUENTES) {
      expect(p.desde, p.id).toBeTruthy();
      expect(p.hacia, p.id).toBeTruthy();
    }
  });

  it("la parte de cada pago es la misma que el aporte único de los lotes (no se copia)", () => {
    const parte = PUENTES.find((p) => p.id === "parteDeCadaPago");
    expect(parte?.valor?.fraccion).toBe(MODELO_LOTES.aporteUnico);
  });

  it("son 3 puertas, 5 cosas que da y 5 que no tiene", () => {
    expect(PUERTAS).toHaveLength(3);
    expect(QUE_DA).toHaveLength(5);
    expect(QUE_NO_TIENE).toHaveLength(5);
  });

  it("la política tiene 6 palancas y cada una dice de dónde viene", () => {
    expect(Object.keys(POLITICA)).toEqual(["emision", "quema", "bloqueo", "transferencia", "reserva", "voz"]);
    for (const [id, p] of Object.entries(POLITICA)) expect(p.fuente.trim(), id).not.toBe("");
    expect(POLITICA.transferencia.revisionMeses).toBe(12);
  });

  it("FARO por m² dice su fuente", () => {
    expect(FARO_POR_M2.fuente.trim()).not.toBe("");
  });

  it("cuatro cosas salieron del modelo del 8-nov", () => {
    expect(CAMBIOS_DESDE_V_ANTERIOR.ids).toHaveLength(4);
    expect(CAMBIOS_DESDE_V_ANTERIOR.fechaModeloAnterior).toBe("2026-11-08");
  });

  it("faroDeLote usa los tokens por m² y no inventa un valor", () => {
    expect(faroDeLote(100)).toBe(100 * FARO_POR_M2.valor);
    expect(faroDeLote(null)).toBeNull();
    expect(faroDeLote(undefined)).toBeNull();
    expect(faroDeLote(0)).toBeNull();
  });

  it("los primeros 4 lotes no traen NFT ni FARO; los del sector norte sí", () => {
    expect(loteTraeFaro("primeros")).toBe(false);
    expect(loteTraeFaro("norte")).toBe(true);
  });

  it("centroDeAnillo promedia los vértices y no cuenta dos veces el que cierra", () => {
    expect(
      centroDeAnillo([
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
        [0, 0],
      ]),
    ).toEqual({ lat: 1, lng: 1 });
    expect(centroDeAnillo([])).toBeNull();
  });
});
