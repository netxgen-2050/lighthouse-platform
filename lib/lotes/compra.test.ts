import { describe, expect, it } from "vitest";
import { listarLotes } from "@/lib/territorios/loteo";
import { ESTADOS_EJEMPLO, estadoDeLote } from "@/lib/territorios/loteo-estados";
import { deshacer, estadoConCompras, leerCompras, pagar, reservar, type CompraLote, type LoVisto, type PlanVisto } from "./compra";
import { VERSION_HIBRIDO } from "./hibrido";
import { VERSION_MODELO_LOTES } from "./modelo";
import { porcentajeEn, usdEn } from "./formato";

const ids = listarLotes().map((l) => l.id);
const disponible = ids.find((id) => estadoDeLote(id) === "disponible")!;
const otroDisponible = ids.filter((id) => estadoDeLote(id) === "disponible")[1]!;
const vendido = Object.keys(ESTADOS_EJEMPLO).find((id) => ESTADOS_EJEMPLO[id] === "vendido")!;
const reservadoEjemplo = Object.keys(ESTADOS_EJEMPLO).find((id) => ESTADOS_EJEMPLO[id] === "reservado")!;

const vio: LoVisto = { precio: 20_000, aporte: 1_000, expensa: 100, version: VERSION_MODELO_LOTES.version };
const ahora = new Date("2026-11-03T12:00:00.000Z");

function reservada(id = disponible): CompraLote[] {
  const r = reservar([], id, "solo-lote", vio, ahora);
  if (!r.ok) throw new Error("no se pudo reservar");
  return r.compras;
}

const plan: PlanVisto = { cuotas: 24, anticipo: 4_000, cuota: 667, ultimaCuota: 659, faroAnticipo: 100, faroPorCuota: 4, faroUltimaCuota: 8 };

describe("leerCompras con plan en cuotas", () => {
  const base = (): CompraLote => reservada()[0];

  it("una compra vieja sin plan se lee igual, sin plan", () => {
    const [leida] = leerCompras(JSON.stringify([base()]));
    expect(leida).toEqual(base());
    expect(leida.vio).not.toHaveProperty("plan");
  });

  it("una compra nueva conserva el plan", () => {
    const nueva: CompraLote = { ...base(), vio: { ...vio, plan } };
    const [leida] = leerCompras(JSON.stringify([nueva]));
    expect(leida.vio.plan).toEqual(plan);
  });

  it("un plan con FARO null (sin superficie) es válido y se conserva", () => {
    const sinFaro = { ...plan, faroAnticipo: null, faroPorCuota: null, faroUltimaCuota: null };
    const [leida] = leerCompras(JSON.stringify([{ ...base(), vio: { ...vio, plan: sinFaro } }]));
    expect(leida.vio.plan).toEqual(sinFaro);
  });

  it("un plan mal formado no borra la compra: se lee sin plan", () => {
    for (const malo of [{ ...plan, cuotas: 7 }, { ...plan, anticipo: "x" }, { ...plan, cuota: undefined }, "contado", null]) {
      const texto = JSON.stringify([{ ...base(), vio: { ...vio, plan: malo } }]);
      const leidas = leerCompras(texto);
      expect(leidas).toHaveLength(1);
      expect(leidas[0].vio).not.toHaveProperty("plan");
      expect(leidas[0].loteId).toBe(base().loteId);
    }
  });
});

describe("leerCompras", () => {
  it("un JSON inválido o que no es una lista da lista vacía", () => {
    expect(leerCompras(null)).toEqual([]);
    expect(leerCompras("")).toEqual([]);
    expect(leerCompras("{no es json")).toEqual([]);
    expect(leerCompras('{"a":1}')).toEqual([]);
  });

  it("descarta lo que no tiene la forma esperada", () => {
    const buena = reservada()[0];
    const texto = JSON.stringify([buena, { loteId: 3 }, null, { ...buena, loteId: "x", opcion: "palacio" }]);
    expect(leerCompras(texto)).toEqual([buena]);
  });

  it("no copia campos de identidad que alguien haya agregado a mano", () => {
    const buena = reservada()[0];
    const [leida] = leerCompras(JSON.stringify([{ ...buena, nombre: "Ana", documento: "123" }]));
    expect(leida).not.toHaveProperty("nombre");
    expect(leida).not.toHaveProperty("documento");
  });

  it("un lote repetido se lee una sola vez", () => {
    const buena = reservada()[0];
    expect(leerCompras(JSON.stringify([buena, buena]))).toHaveLength(1);
  });
});

describe("un boleto muestra lo que se vio", () => {
  const visto: LoVisto = {
    precio: 111,
    aporte: 7,
    expensa: 3,
    version: "v0.0-vieja",
    fuente: "Fuente vieja",
    precioCasa: 5,
  };

  it("lo visto, con el precio de la casa y la fuente, sobrevive a guardar y leer, aunque el modelo sea otro", () => {
    const r = reservar([], disponible, "familiar", visto, ahora);
    if (!r.ok) throw new Error("no se pudo reservar");
    const [leida] = leerCompras(JSON.stringify(r.compras));
    expect(leida.vio).toEqual(visto);
    // El modelo vigente es otro: el registro no depende de él.
    expect(leida.vio.version).not.toBe(VERSION_MODELO_LOTES.version);
    expect(leida.vio.fuente).not.toBe(VERSION_MODELO_LOTES.fuente);
  });

  it("pagar no cambia lo visto", () => {
    const r = reservar([], disponible, "familiar", visto, ahora);
    if (!r.ok) throw new Error("no se pudo reservar");
    const p = pagar(r.compras, disponible, ahora);
    if (!p.ok) throw new Error("no pagó");
    expect(p.compras[0].vio).toEqual(visto);
  });

  it("un registro guardado antes, sin precio de casa ni fuente, se sigue leyendo", () => {
    const [vieja] = leerCompras(JSON.stringify([{ ...reservada()[0], vio }]));
    expect(vieja.vio).toEqual(vio);
    expect(vieja.vio).not.toHaveProperty("precioCasa");
    expect(vieja.vio).not.toHaveProperty("fuente");
  });

  it("la versión del texto aceptado (hibridoAceptado) sobrevive a guardar, leer y pagar; un registro sin ella sigue leyéndose", () => {
    const aceptado: LoVisto = { ...vio, hibridoAceptado: VERSION_HIBRIDO };
    const r = reservar([], disponible, "solo-lote", aceptado, ahora);
    if (!r.ok) throw new Error("no se pudo reservar");
    const [leida] = leerCompras(JSON.stringify(r.compras));
    expect(leida.vio.hibridoAceptado).toBe(VERSION_HIBRIDO);
    const p = pagar(r.compras, disponible, ahora);
    if (!p.ok) throw new Error("no pagó");
    expect(p.compras[0].vio.hibridoAceptado).toBe(VERSION_HIBRIDO);
    const [vieja] = leerCompras(JSON.stringify(reservada()));
    expect(vieja.vio).not.toHaveProperty("hibridoAceptado");
  });

  it("el FARO simulado (faro) sobrevive a guardar y leer; un registro sin él se lee igual y uno de tipo raro se descarta", () => {
    const r = reservar([], disponible, "solo-lote", { ...vio, faro: 18560 }, ahora);
    if (!r.ok) throw new Error("no se pudo reservar");
    expect(leerCompras(JSON.stringify(r.compras))[0].vio.faro).toBe(18560);
    expect(leerCompras(JSON.stringify(reservada()))[0].vio).not.toHaveProperty("faro");
    expect(leerCompras(JSON.stringify([{ ...reservada()[0], vio: { ...vio, faro: "mucho" } }]))).toEqual([]);
  });

  it("una versión aceptada de tipo raro invalida el registro", () => {
    expect(leerCompras(JSON.stringify([{ ...reservada()[0], vio: { ...vio, hibridoAceptado: 7 } }]))).toEqual([]);
  });

  it("un precio de casa o una fuente de tipo raro invalidan el registro", () => {
    const base = reservada()[0];
    expect(leerCompras(JSON.stringify([{ ...base, vio: { ...vio, precioCasa: "mucho" } }]))).toEqual([]);
    expect(leerCompras(JSON.stringify([{ ...base, vio: { ...vio, fuente: 3 } }]))).toEqual([]);
  });
});

describe("usdEn", () => {
  it("el valor que falta se dice según el idioma, nunca 0", () => {
    expect(usdEn(null, "es")).toBe("sin dato");
    expect(usdEn(undefined, "en")).toBe("no data");
    expect(usdEn(Number.NaN, "en")).toBe("no data");
    expect(usdEn(1_000, "en")).toBe("USD 1.000");
  });
});

describe("porcentajeEn", () => {
  it("el valor que falta es sin dato, nunca 0 %", () => {
    expect(porcentajeEn(null, "es")).toBe("sin dato");
    expect(porcentajeEn(Number.NaN, "en")).toBe("no data");
  });

  it("redondea sin decimales, pero una fracción chica que no es cero no se lee 0 %", () => {
    expect(porcentajeEn(2.61, "es")).toBe("261 %");
    expect(porcentajeEn(0.0025, "es")).toBe("0,3 %");
    expect(porcentajeEn(0.0004, "es")).toBe("0,04 %");
    expect(porcentajeEn(0.0004, "en")).toBe("0.04%");
    expect(porcentajeEn(0.004, "es", 1)).toBe("0,4 %");
    expect(porcentajeEn(0, "es")).toBe("0 %");
  });

  it("por debajo de 0,001 % dice menos de, nunca 0,000 %", () => {
    expect(porcentajeEn(1e-9, "es")).toBe("menos de 0,001 %");
    expect(porcentajeEn(1e-9, "en")).toBe("less than 0.001%");
    expect(porcentajeEn(0.00001, "es")).toBe("0,001 %");
  });
});

describe("reservar", () => {
  it("reserva un lote disponible y guarda lo que la persona vio", () => {
    const r = reservar([], disponible, "familiar", vio, ahora);
    expect(r).toEqual({
      ok: true,
      compras: [{ loteId: disponible, opcion: "familiar", paso: "reservado", reservadoEl: ahora.toISOString(), vio }],
    });
  });

  it("no reserva un lote vendido ni uno reservado de ejemplo", () => {
    expect(reservar([], vendido, "solo-lote", vio, ahora)).toEqual({ ok: false, motivo: "no-disponible" });
    expect(reservar([], reservadoEjemplo, "solo-lote", vio, ahora)).toEqual({ ok: false, motivo: "no-disponible" });
  });

  it("no reserva dos veces el mismo lote", () => {
    expect(reservar(reservada(), disponible, "solo-lote", vio, ahora)).toEqual({ ok: false, motivo: "ya-reservado" });
  });

  it("no reserva un id que no está en el loteo", () => {
    expect(reservar([], "no-existe", "solo-lote", vio, ahora)).toEqual({ ok: false, motivo: "desconocido" });
  });

  it("el registro no tiene campos de identidad ni de pago", () => {
    const [c] = reservada();
    expect(Object.keys(c).sort()).toEqual(["loteId", "opcion", "paso", "reservadoEl", "vio"]);
    expect(Object.keys(c.vio).sort()).toEqual(["aporte", "expensa", "precio", "version"]);
  });
});

describe("pagar y deshacer", () => {
  it("paga lo reservado y anota la fecha", () => {
    const r = pagar(reservada(), disponible, ahora);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.compras[0].paso).toBe("pagado");
      expect(r.compras[0].pagadoEl).toBe(ahora.toISOString());
    }
  });

  it("no paga lo que no está reservado", () => {
    expect(pagar([], disponible, ahora)).toEqual({ ok: false, motivo: "no-reservado" });
    expect(pagar(reservada(), otroDisponible, ahora)).toEqual({ ok: false, motivo: "no-reservado" });
  });

  it("no se paga dos veces", () => {
    const r = pagar(reservada(), disponible, ahora);
    if (!r.ok) throw new Error("no pagó");
    expect(pagar(r.compras, disponible, ahora)).toEqual({ ok: false, motivo: "no-reservado" });
  });

  it("deshacer saca la reserva y deja las demás", () => {
    const dos = [...reservada(), ...reservada(otroDisponible)];
    expect(deshacer(dos, disponible).map((c) => c.loteId)).toEqual([otroDisponible]);
    expect(deshacer([], disponible)).toEqual([]);
  });
});

describe("estadoConCompras", () => {
  it("sin compras, es el estado de ejemplo", () => {
    for (const id of ids) expect(estadoConCompras(id, [])).toBe(estadoDeLote(id));
  });

  it("reservado por la persona y pagado en la simulación", () => {
    expect(estadoConCompras(disponible, reservada())).toBe("reservado-por-vos");
    const r = pagar(reservada(), disponible, ahora);
    if (!r.ok) throw new Error("no pagó");
    expect(estadoConCompras(disponible, r.compras)).toBe("vendido-a-vos");
  });

  it("pagado en cuotas es 'en-cuotas-tuyo'; al contado, 'vendido-a-vos'", () => {
    const conPlan = (cuotas: number): CompraLote[] => {
      const r = reservar([], disponible, "solo-lote", { ...vio, plan: { ...plan, cuotas } }, ahora);
      if (!r.ok) throw new Error("no se pudo reservar");
      const p = pagar(r.compras, disponible, ahora);
      if (!p.ok) throw new Error("no pagó");
      return p.compras;
    };
    expect(estadoConCompras(disponible, conPlan(24))).toBe("en-cuotas-tuyo");
    expect(estadoConCompras(disponible, conPlan(0))).toBe("vendido-a-vos");
  });

  it("reservado con plan en cuotas sigue 'reservado-por-vos' hasta el primer pago", () => {
    const r = reservar([], disponible, "solo-lote", { ...vio, plan }, ahora);
    if (!r.ok) throw new Error("no se pudo reservar");
    expect(estadoConCompras(disponible, r.compras)).toBe("reservado-por-vos");
  });

  it("deshacer vuelve a disponible", () => {
    expect(estadoConCompras(disponible, deshacer(reservada(), disponible))).toBe("disponible");
  });

  it("un id desconocido se ignora", () => {
    const vieja: CompraLote[] = [{ ...reservada()[0], loteId: "lote-que-ya-no-existe" }];
    expect(estadoConCompras("lote-que-ya-no-existe", vieja)).toBe("disponible");
    expect(estadoConCompras(disponible, vieja)).toBe("disponible");
  });

  it("un lote vendido o reservado de ejemplo no cambia aunque haya un registro viejo", () => {
    const vieja: CompraLote[] = [{ ...reservada()[0], loteId: vendido }];
    expect(estadoConCompras(vendido, vieja)).toBe("vendido");
  });

  it("lo que reservó o pagó otra persona (estados de la base) se ve reservado o vendido", () => {
    expect(estadoConCompras(disponible, [], { [disponible]: "reservado" })).toBe("reservado");
    expect(estadoConCompras(disponible, [], { [disponible]: "vendido" })).toBe("vendido");
    expect(estadoConCompras(otroDisponible, [], { [disponible]: "reservado" })).toBe("disponible");
  });

  it("lo propio manda sobre lo que dice la base", () => {
    const base = { [disponible]: "reservado" } as const;
    expect(estadoConCompras(disponible, reservada(), base)).toBe("reservado-por-vos");
    const pagada = pagar(reservada(), disponible, ahora);
    if (!pagada.ok) throw new Error("no pagó");
    expect(estadoConCompras(disponible, pagada.compras, { [disponible]: "vendido" })).toBe("vendido-a-vos");
  });

  it("sin estados de la base (todavía no llegaron) quedan los de ejemplo", () => {
    expect(estadoConCompras(disponible, [], undefined)).toBe("disponible");
    expect(estadoConCompras(vendido, [], {})).toBe("vendido");
  });
});
