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
  BARRIO,
  VERSION_PROPUESTA,
  VERSION_SIM_BARRIO,
  PLAN_CUOTAS,
  centroDeAnillo,
  faroAcreditado,
  faroDelPlan,
  faroDeLote,
  loteTraeFaro,
  planDeLote,
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
    for (const [id, p] of Object.entries(POLITICA)) expect(p.fuente.es.trim(), id).not.toBe("");
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

describe("parámetros del barrio", () => {
  it("la versión del simulador está a la vista", () => {
    expect(VERSION_SIM_BARRIO).toEqual({ archivo: "sim/barrio_stack_sim.py", version: "v0.1", fecha: "2026-11-19" });
  });

  it("cada parámetro dice su fuente", () => {
    for (const [id, p] of Object.entries(BARRIO)) expect(p.fuente.trim(), id).not.toBe("");
  });

  it("el precio del lote es 27.500 y sale de MODELO_LOTES; lo que ya vive en lotes no se copia", () => {
    expect(BARRIO.precioLote.valor).toBe(27_500);
    expect(BARRIO.precioLote.valor).toBe((MODELO_LOTES.precioLote.min + MODELO_LOTES.precioLote.max) / 2);
    expect(BARRIO.infraestructuraPorLote.valor).toBe(MODELO_LOTES.infraestructuraPorLote);
    expect(BARRIO.parteDueno.valor).toBe(MODELO_LOTES.parteDelDueno);
    expect(BARRIO.parteComun.valor).toBe(MODELO_LOTES.aporteUnico);
    expect(BARRIO.expensa.valor).toBe(MODELO_LOTES.expensaAnual);
    expect(BARRIO.presupuestoComun.valor).toBe(MODELO_LOTES.presupuestoComunAnual);
  });
});

describe("plan en cuotas (Token Tierra)", () => {
  const precio = 27_500;
  const m2 = 1_000;

  it("de partida son las cuotas del barrio, y el contado es una opción", () => {
    expect(PLAN_CUOTAS.dePartida).toBe(BARRIO.cuotas.valor);
    expect(PLAN_CUOTAS.anticipo).toBe(BARRIO.anticipo.valor);
    expect(PLAN_CUOTAS.opciones).toContain(0);
    expect(PLAN_CUOTAS.opciones).toContain(PLAN_CUOTAS.dePartida);
    expect(PLAN_CUOTAS.fuente.trim()).not.toBe("");
  });

  it("contado: un solo pago igual al precio, sin cuotas", () => {
    expect(planDeLote(precio, 0)).toEqual({ anticipo: precio, cuota: null, ultimaCuota: null, cuotas: 0 });
  });

  it("24 cuotas: anticipo del simulador y anticipo + cuotas = precio, para todas las opciones", () => {
    const p = planDeLote(precio, 24);
    expect(p?.anticipo).toBe(Math.round(precio * PLAN_CUOTAS.anticipo));
    for (const n of PLAN_CUOTAS.opciones.filter((o) => o > 0)) {
      for (const pr of [precio, 15_000, 40_001, 33_333]) {
        const q = planDeLote(pr, n)!;
        expect(q.anticipo + (n - 1) * q.cuota! + q.ultimaCuota!).toBe(pr);
      }
    }
  });

  it("sin precio o con cuotas que no son una opción: null", () => {
    expect(planDeLote(null, 24)).toBeNull();
    expect(planDeLote(undefined, 24)).toBeNull();
    expect(planDeLote(0, 24)).toBeNull();
    expect(planDeLote(precio, 7)).toBeNull();
  });

  it("FARO: el anticipo y todas las cuotas suman los FARO del lote, con la última según el redondeo", () => {
    for (const n of PLAN_CUOTAS.opciones.filter((o) => o > 0)) {
      for (const sup of [1_000, 777, 1_234, 3_333]) {
        const f = faroDelPlan(sup, n)!;
        expect(f.total).toBe(faroDeLote(sup));
        expect(f.anticipo + (n - 1) * f.porCuota! + f.ultimaCuota!).toBe(faroDeLote(sup));
      }
    }
    const f = faroDelPlan(m2, 24)!;
    expect(f.anticipo).toBe(faroAcreditado(m2, PLAN_CUOTAS.anticipo));
  });

  it("FARO contado: todo con el primer pago", () => {
    expect(faroDelPlan(m2, 0)).toEqual({ anticipo: faroDeLote(m2), porCuota: null, ultimaCuota: null, total: faroDeLote(m2) });
  });

  it("sin superficie no hay FARO (nunca 0)", () => {
    expect(faroDelPlan(null, 24)).toBeNull();
    expect(faroDelPlan(undefined, 0)).toBeNull();
    expect(faroAcreditado(null, 0.5)).toBeNull();
    expect(faroAcreditado(m2, 1.5)).toBeNull();
    expect(faroDelPlan(m2, 7)).toBeNull();
  });

  it("faroAcreditado es proporcional a lo pagado", () => {
    expect(faroAcreditado(m2, 0.5)).toBe(Math.round(faroDeLote(m2)! / 2));
    expect(faroAcreditado(m2, 1)).toBe(faroDeLote(m2));
  });
});
