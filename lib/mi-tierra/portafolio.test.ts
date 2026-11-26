import { describe, expect, test } from "vitest";
import { faroDeLote, faroDelPlan, planDeLote } from "@/lib/bien-comun/modelo";
import { estadoConCompras, pagar, reservar, type CompraLote, type LoVisto, type PlanVisto } from "@/lib/lotes/compra";
import { VERSION_MODELO_LOTES, precioLote } from "@/lib/lotes/modelo";
import { VERSION_MANIFIESTO_VRN } from "@/lib/manifiestos/lighthouse-vrn";
import { SIN_ADHESION, type Adhesion } from "@/lib/membresia/versiones";
import { lotesDelGrupo } from "@/lib/territorios/loteo";
import { estadoDeLote } from "@/lib/territorios/loteo-estados";
import { armarPortafolio } from "./portafolio";

// Los esperados salen de los módulos del modelo, nunca escritos a mano.
const norte = lotesDelGrupo("norte").filter((l) => estadoDeLote(l.id) === "disponible");
const [a, b] = norte;
const primero = lotesDelGrupo("primeros").find((l) => estadoDeLote(l.id) === "disponible")!;

function planVisto(m2: number | undefined, cuotas: number): PlanVisto {
  const p = planDeLote(precioLote(m2), cuotas)!;
  const f = faroDelPlan(m2, cuotas)!;
  return { cuotas, anticipo: p.anticipo, cuota: p.cuota, ultimaCuota: p.ultimaCuota, faroAnticipo: f.anticipo, faroPorCuota: f.porCuota, faroUltimaCuota: f.ultimaCuota };
}

function vioDe(m2: number | undefined, cuotas: number | null): LoVisto {
  return {
    precio: precioLote(m2),
    aporte: null,
    expensa: null,
    version: VERSION_MODELO_LOTES.version,
    faro: faroDeLote(m2),
    ...(cuotas === null ? {} : { plan: planVisto(m2, cuotas) }),
  };
}

const reservada = (l: { id: string; superficieM2?: number }, cuotas: number | null, fecha = "2026-11-20T10:00:00.000Z"): CompraLote => {
  const r = reservar([], l.id, "solo-lote", vioDe(l.superficieM2, cuotas), new Date(fecha));
  if (!r.ok) throw new Error("no se pudo reservar");
  return r.compras[0];
};
const pagada = (c: CompraLote, fecha = "2026-11-21T10:00:00.000Z"): CompraLote => {
  const r = pagar([c], c.loteId, new Date(fecha));
  if (!r.ok) throw new Error("no se pudo pagar");
  return r.compras[0];
};

describe("armarPortafolio", () => {
  test("sin compras no hay nada", () => {
    const p = armarPortafolio([], SIN_ADHESION);
    expect(p.lotes).toEqual([]);
    expect(p.libro).toEqual([]);
    expect(p.totales.hayPago).toBe(false);
  });

  test("reservado: chip reservado, plan visto con 0 de N y FARO sin pago", () => {
    const c = reservada(a, 24);
    const [l] = armarPortafolio([c], SIN_ADHESION).lotes;
    expect(l.estado).toBe("reservado");
    expect(l.numero).toBe(a.numero);
    expect(l.precioVisto).toBe(precioLote(a.superficieM2));
    expect(l.version).toBe(VERSION_MODELO_LOTES.version);
    expect(l.plan).toMatchObject({ tipo: "cuotas", cuotas: 24, cuotasPagadas: 0, fraccionPagada: 0 });
    expect(l.faro).toEqual({ tipo: "sin-pago", total: faroDeLote(a.superficieM2) });
  });

  test("en cuotas: anticipo pagado, 0 de N, fracción = anticipo sobre el plan y FARO del anticipo", () => {
    const c = pagada(reservada(a, 24));
    const [l] = armarPortafolio([c], SIN_ADHESION).lotes;
    const plan = planDeLote(precioLote(a.superficieM2), 24)!;
    expect(l.estado).toBe("enCuotas");
    expect(l.plan.tipo).toBe("cuotas");
    if (l.plan.tipo !== "cuotas") return;
    expect(l.plan.anticipo).toBe(plan.anticipo);
    expect(l.plan.cuota).toBe(plan.cuota);
    expect(l.plan.cuotasPagadas).toBe(0);
    expect(l.plan.total).toBe(precioLote(a.superficieM2));
    expect(l.plan.fraccionPagada).toBeCloseTo(plan.anticipo / precioLote(a.superficieM2)!, 10);
    const f = faroDelPlan(a.superficieM2, 24)!;
    expect(l.faro).toEqual({ tipo: "acreditado", acreditados: f.anticipo, total: f.total });
  });

  test("el estado sale de estadoConCompras (la misma regla que la ficha)", () => {
    const cuotas = pagada(reservada(a, 12));
    const contado = pagada(reservada(b, 0));
    const solo = reservada(norte[2], null);
    const todas = [cuotas, contado, solo];
    const p = armarPortafolio(todas, SIN_ADHESION);
    expect(p.lotes.map((l) => l.estado)).toEqual(["enCuotas", "vendido", "reservado"]);
    expect(estadoConCompras(a.id, todas)).toBe("en-cuotas-tuyo");
    expect(estadoConCompras(b.id, todas)).toBe("vendido-a-vos");
  });

  test("contado: un pago, todo el FARO con ese pago", () => {
    const [l] = armarPortafolio([pagada(reservada(a, 0))], SIN_ADHESION).lotes;
    expect(l.plan).toMatchObject({ tipo: "contado", fraccionPagada: 1, pago: precioLote(a.superficieM2) });
    expect(l.faro).toMatchObject({ tipo: "acreditado", acreditados: faroDeLote(a.superficieM2) });
  });

  test("primeros 4 lotes: no entran al plan ni traen FARO", () => {
    const p = armarPortafolio([pagada(reservada(primero, null))], SIN_ADHESION);
    expect(p.lotes[0].plan).toEqual({ tipo: "no-entra" });
    expect(p.lotes[0].faro).toEqual({ tipo: "no-aplica" });
    // El monto de un lote de los primeros 4 se conoce (el precio que vio): cuenta como pago único.
    expect(p.totales.fraccionPagada).toBe(1);
    expect(p.totales.pagado).toBe(p.lotes[0].precioVisto);
    expect(p.totales.faroAcreditados).toBeNull();
    // Ningún lote entra al plan: los indicadores de plan y FARO no aplican (no es "sin dato").
    expect(p.totales.entraAlPlan).toBe(false);
  });

  test("un lote del plan junto a uno de los primeros 4: los indicadores sí aplican", () => {
    const p = armarPortafolio([reservada(a, 24), reservada(primero, null)], SIN_ADHESION);
    expect(p.totales.entraAlPlan).toBe(true);
  });

  test("lo pagado suma los lotes de ambos tipos: el anticipo del plan más el precio del lote de los primeros 4", () => {
    const delPlan = pagada(reservada(a, 24));
    const deLosPrimeros = pagada(reservada(primero, null));
    const p = armarPortafolio([delPlan, deLosPrimeros], SIN_ADHESION);
    const anticipo = planDeLote(precioLote(a.superficieM2), 24)!.anticipo;
    expect(p.totales.pagado).toBe(Math.round(anticipo + precioLote(primero.superficieM2)!));
  });

  test("un lote de los primeros 4 reservado sin pagar: pagado es 0, no sin dato", () => {
    expect(armarPortafolio([reservada(primero, null)], SIN_ADHESION).totales.pagado).toBe(0);
  });

  test("reserva vieja sin plan: plan sin dato, nunca contado", () => {
    const vieja = reservada(a, null);
    const [l] = armarPortafolio([vieja], SIN_ADHESION).lotes;
    expect(l.plan).toEqual({ tipo: "sin-dato" });
    const [pagadaVieja] = armarPortafolio([pagada(vieja)], SIN_ADHESION).lotes;
    expect(pagadaVieja.estado).toBe("vendido");
    expect(pagadaVieja.plan).toEqual({ tipo: "sin-dato" });
    expect(pagadaVieja.faro).toEqual({ tipo: "a-medida-que-se-paga", total: faroDeLote(a.superficieM2) });
  });

  test("sin FARO guardado: sin dato, sin recalcular con el modelo de hoy", () => {
    const c = reservada(a, null);
    const sinFaro: CompraLote = { ...c, vio: { ...c.vio, faro: undefined } };
    expect(armarPortafolio([pagada(sinFaro)], SIN_ADHESION).lotes[0].faro).toEqual({ tipo: "sin-dato" });
  });

  test("muestra lo guardado, aunque el modelo de hoy dé otra cosa", () => {
    const c = pagada(reservada(a, 24));
    const guardado: PlanVisto = { cuotas: 36, anticipo: 111, cuota: 7, ultimaCuota: 9, faroAnticipo: 5, faroPorCuota: 2, faroUltimaCuota: 3 };
    const distinta: CompraLote = { ...c, vio: { ...c.vio, plan: guardado, faro: 77, precio: 4242 } };
    const [l] = armarPortafolio([distinta], SIN_ADHESION).lotes;
    expect(l.precioVisto).toBe(4242);
    expect(l.plan).toMatchObject({ tipo: "cuotas", cuotas: 36, anticipo: 111, cuota: 7, total: 111 + 7 * 35 + 9 });
    expect(l.faro).toEqual({ tipo: "acreditado", acreditados: 5, total: 77 });
  });

  test("un valor que la persona no vio es null (sin dato), no 0", () => {
    const c = pagada(reservada(a, 24));
    const sinPrecio: CompraLote = { ...c, vio: { ...c.vio, precio: null, plan: { ...c.vio.plan!, cuota: null, faroAnticipo: null } } };
    const p = armarPortafolio([sinPrecio], SIN_ADHESION);
    expect(p.lotes[0].precioVisto).toBeNull();
    expect(p.lotes[0].plan).toMatchObject({ cuota: null, total: null, fraccionPagada: null });
    expect(p.lotes[0].faro).toMatchObject({ acreditados: null });
    expect(p.libro.every((f) => f.tipo !== "reserva" || f.monto === null)).toBe(true);
    expect(p.totales.fraccionPagada).toBeNull();
    expect(p.totales.faroAcreditados).toBeNull();
  });

  test("libro: una fila por paso, del más nuevo al más viejo, con el monto que se vio", () => {
    const c = pagada(reservada(a, 24, "2026-11-20T10:00:00.000Z"), "2026-11-21T10:00:00.000Z");
    const otra = reservada(b, null, "2026-11-22T09:00:00.000Z");
    const p = armarPortafolio([c, otra], SIN_ADHESION);
    expect(p.libro.map((f) => [f.tipo, f.numero])).toEqual([
      ["reserva", b.numero],
      ["primer-pago", a.numero],
      ["reserva", a.numero],
    ]);
    expect(p.libro[1].monto).toBe(planDeLote(precioLote(a.superficieM2), 24)!.anticipo);
    expect(p.libro[2].monto).toBe(precioLote(a.superficieM2));
  });

  test("totales: lotes, fracción pagada pesada y FARO acreditados sumados", () => {
    const x = pagada(reservada(a, 24));
    const y = pagada(reservada(b, 12));
    const p = armarPortafolio([x, y], SIN_ADHESION);
    expect(p.totales.lotes).toBe(2);
    expect(p.totales.hayPago).toBe(true);
    const pa = planDeLote(precioLote(a.superficieM2), 24)!.anticipo;
    const pb = planDeLote(precioLote(b.superficieM2), 12)!.anticipo;
    expect(p.totales.fraccionPagada).toBeCloseTo((pa + pb) / (precioLote(a.superficieM2)! + precioLote(b.superficieM2)!), 10);
    expect(p.totales.faroAcreditados).toBe(faroDelPlan(a.superficieM2, 24)!.anticipo + faroDelPlan(b.superficieM2, 12)!.anticipo);
  });

  test("caso mixto: reservar sin pagar un lote del plan y pagar uno de los primeros 4 no cuenta como pago", () => {
    const delPlan = reservada(a, 24);
    const deLosPrimeros = pagada(reservada(primero, null));
    const p = armarPortafolio([delPlan, deLosPrimeros], SIN_ADHESION);
    expect(p.totales.entraAlPlan).toBe(true);
    expect(p.totales.hayPago).toBe(false);
  });

  test("un lote que no está en el loteo se ignora", () => {
    const c: CompraLote = { ...reservada(a, 24), loteId: "no-existe" };
    expect(armarPortafolio([c], SIN_ADHESION).lotes).toEqual([]);
  });

  test("voz: sin adhesión, con adhesión vigente y con adhesión de una versión vieja", () => {
    expect(armarPortafolio([], SIN_ADHESION).voz).toEqual({ adhirio: false, desactualizada: false });
    const vigente: Adhesion = { membresias: { lighthouse: "miembro" }, versiones: { lighthouse: VERSION_MANIFIESTO_VRN } };
    expect(armarPortafolio([], vigente).voz).toEqual({ adhirio: true, desactualizada: false });
    const vieja: Adhesion = { membresias: { lighthouse: "miembro" }, versiones: { lighthouse: "2026-01-01-vieja" } };
    expect(armarPortafolio([], vieja).voz).toEqual({ adhirio: false, desactualizada: true });
  });
});
