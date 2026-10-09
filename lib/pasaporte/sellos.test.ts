import { describe, expect, it } from "vitest";
import { INICIAL } from "@/lib/sumarte/estado";
import { KYC_VACIO } from "./kyc";
import { fechasPorGuardar, fechasPorQuitar,leerFechas, sellos, type EntradaSellos } from "./sellos";

const ahora = new Date("2026-10-09T15:00:00Z");

const vacia: EntradaSellos = {
  sumarte: INICIAL,
  membresias: {},
  kyc: KYC_VACIO,
  datos: {},
  ticket: false,
  presenciaGenesis: false,
  fechas: {},
};

const por = (e: EntradaSellos) => Object.fromEntries(sellos(e, ahora).map((s) => [s.id, s]));
const aprobado = { estado: "aprobado", enviado: "2026-10-01T10:00:00.000Z", aprobado: "2026-10-02T10:00:00.000Z" } as const;

describe("sellos", () => {
  it("una persona nueva tiene solo Explorador/a obtenido, con fecha; el resto disponible", () => {
    const s = por(vacia);
    expect(s.explorador.estado).toBe("obtenido");
    expect(s.explorador.fecha).toBe(ahora.toISOString());
    for (const [id, x] of Object.entries(s)) {
      if (id === "explorador") continue;
      expect(x.estado, id).not.toBe("obtenido");
      expect(x.fecha, id).toBeUndefined();
    }
    expect(s["miembro-red"].estado).toBe("disponible");
    expect(s["miembro-red"].accion).toMatchObject({ tipo: "enlace", href: "/sumarte" });
    expect(s.identidad.accion).toEqual({ tipo: "kyc", texto: "Verificar mi identidad" });
    expect(s.residente.estado).toBe("no-disponible");
  });

  it("hay un sello por comunidad y ninguno por barrio vacante", () => {
    const ids = sellos(vacia, ahora).filter((s) => s.id.startsWith("comunidad:")).map((s) => s.id);
    expect(ids).toContain("comunidad:lighthouse");
    expect(ids).toContain("comunidad:valle");
    expect(ids).not.toContain("comunidad:grano");
  });

  it("usa la fecha guardada y, si no hay, la de hoy", () => {
    const e = { ...vacia, fechas: { explorador: "2026-09-01T10:00:00.000Z" } };
    expect(por(e).explorador.fecha).toBe("2026-09-01T10:00:00.000Z");
  });

  it("el Pase Fundador abre el canal de fundadores, la voz en el Fondo Común y los créditos", () => {
    const s = por({ ...vacia, sumarte: { ...INICIAL, plan: "miembro", pase: "brote" } });
    expect(s.fundador.estado).toBe("obtenido");
    expect(s["miembro-red"].estado).toBe("obtenido");
    const abre = s.fundador.abre.join(" | ");
    expect(abre).toContain("Canal de fundadores");
    expect(abre).toContain("Voz en el Fondo Común · Abierta · 1 voz");
    expect(abre).toContain("Créditos comunes y de estadía");
    // Antes de tener el pase, el sello igual dice qué abriría.
    expect(por(vacia).fundador.abre.join(" | ")).toContain("Canal de fundadores");
  });

  it("no cuenta como abierto lo que ya tiene un Explorador", () => {
    expect(por(vacia)["miembro-red"].abre.join(" | ")).not.toContain("Mapa, tribus");
  });

  it("membresía de comunidad: pedido es en trámite, miembro es obtenido", () => {
    const pedido = por({ ...vacia, membresias: { valle: "pedido" } });
    expect(pedido["comunidad:valle"].estado).toBe("en-tramite");
    const miembro = por({ ...vacia, membresias: { valle: "miembro", lighthouse: "miembro" } });
    expect(miembro["comunidad:valle"].estado).toBe("obtenido");
    expect(miembro["comunidad:lighthouse"].estado).toBe("obtenido");
    expect(miembro["comunidad:valle"].abre.join(" | ")).toContain("Sala de");
  });

  it("identidad: en trámite no ofrece el botón; aprobada trae la fecha de aprobación", () => {
    const t = por({ ...vacia, kyc: { estado: "en-tramite", enviado: "2026-10-01T10:00:00.000Z" } });
    expect(t.identidad.estado).toBe("en-tramite");
    expect(t.identidad.accion).toBeUndefined();
    const a = por({ ...vacia, kyc: aprobado });
    expect(a.identidad.estado).toBe("obtenido");
    expect(a.identidad.fecha).toBe(aprobado.aprobado);
  });

  it("inversor habilitado: identidad aprobada y residencia en Argentina", () => {
    expect(por({ ...vacia, kyc: aprobado, datos: { residencia: "argentina" } }).inversor.estado).toBe("obtenido");
    expect(por({ ...vacia, kyc: aprobado }).inversor.estado).toBe("disponible");
    expect(por({ ...vacia, datos: { residencia: "argentina" } }).inversor.estado).toBe("disponible");
  });

  it("inversor del exterior: no, y explica por qué", () => {
    const i = por({ ...vacia, kyc: aprobado, datos: { residencia: "exterior" } }).inversor;
    expect(i.estado).toBe("no-disponible");
    expect(i.detalle).toContain("residencia fiscal es del exterior");
    expect(i.legal).toEqual(["sumarte"]);
    expect(i.legalDetalle).toBe("inversorexterior");
    expect(i.detalle).toContain("Aportantes con residencia fiscal en el exterior");
    expect(i.detalle).not.toMatch(/Tocá/);
    expect(i.detalle).not.toContain("Ganancias");
  });

  it("Genesis: ticket registrado es en trámite; solo el check-in lo obtiene", () => {
    expect(por({ ...vacia, ticket: true }).genesis.estado).toBe("en-tramite");
    expect(por({ ...vacia, ticket: true }).genesis.detalle).toContain("check-in");
    expect(por({ ...vacia, presenciaGenesis: true }).genesis.estado).toBe("obtenido");
  });

  it("el sello de identidad y el de Pase Fundador llevan su ⚖", () => {
    const s = por(vacia);
    expect(s.identidad.legal).toEqual(["kyc"]);
    expect(s.fundador.legal).toEqual(["pasefundador"]);
  });
});

describe("fechas", () => {
  it("solo se guardan las de sellos obtenidos que no tenían fecha", () => {
    const lista = sellos({ ...vacia, fechas: {}, sumarte: { ...INICIAL, plan: "miembro" } }, ahora);
    expect(fechasPorGuardar(lista, {})).toEqual({
      explorador: ahora.toISOString(),
      "miembro-red": ahora.toISOString(),
    });
    expect(fechasPorGuardar(lista, { explorador: "2026-09-01T00:00:00.000Z" })).toEqual({ "miembro-red": ahora.toISOString() });
  });
  it("quita las fechas de sellos que ya no están obtenidos", () => {
    const lista = sellos({ ...vacia, fechas: {}, sumarte: { ...INICIAL, plan: "miembro" } }, ahora);
    const previas = { explorador: "2026-09-01T00:00:00.000Z", "miembro-red": "2026-09-02T00:00:00.000Z", fundador: "2026-09-03T00:00:00.000Z" };
    expect(fechasPorQuitar(lista, previas)).toEqual(["fundador"]);
    expect(fechasPorQuitar([], previas)).toEqual([]);
  });
  it("lee fechas y descarta lo raro", () => {
    expect(leerFechas(null)).toEqual({});
    expect(leerFechas("[]")).toEqual({});
    expect(leerFechas(JSON.stringify({ a: "2026-10-01T00:00:00Z", b: 3, c: "nada" }))).toEqual({ a: "2026-10-01T00:00:00Z" });
  });
});
