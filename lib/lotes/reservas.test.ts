import { describe, expect, it, vi } from "vitest";
import type { CompraLote } from "./compra";
import { deshacerLote, leerEstados, leerReservas, pagarLote, reservarLote } from "./reservas";

const compra: CompraLote = {
  loteId: "lote-7",
  opcion: "solo-lote",
  paso: "reservado",
  reservadoEl: "2026-11-20T10:00:00.000Z",
  vio: { precio: 1, aporte: 1, expensa: 1, version: "v" },
};
const OK = { estado: "ok", cabeceras: async () => ({ "x-lh-prueba": "a@prueba.test" }) };
const SIN = { estado: "sin-sesion", cabeceras: async () => ({}) };
const vio = compra.vio;

const responder = (estado: number, cuerpo: unknown) => vi.fn(async () => new Response(JSON.stringify(cuerpo), { status: estado }));

describe("leerReservas", () => {
  it("pide las compras con las cabeceras de la sesión", async () => {
    const pedir = responder(200, { ok: true, compras: [compra] });
    expect(await leerReservas(OK, pedir as unknown as typeof fetch)).toEqual([compra]);
    expect(pedir).toHaveBeenCalledWith("/api/lotes/reservas", expect.objectContaining({ headers: { "x-lh-prueba": "a@prueba.test" }, cache: "no-store" }));
  });

  it("sin sesión devuelve [] sin pedir nada", async () => {
    const pedir = responder(200, { compras: [compra] });
    expect(await leerReservas(SIN, pedir as unknown as typeof fetch)).toEqual([]);
    expect(await leerReservas({ ...SIN, estado: "cargando" }, pedir as unknown as typeof fetch)).toEqual([]);
    expect(pedir).not.toHaveBeenCalled();
  });

  it("si el servidor falla o no responde, null (no se sabe), no una lista vacía", async () => {
    expect(await leerReservas(OK, responder(503, { ok: false }) as unknown as typeof fetch)).toBeNull();
    expect(await leerReservas(OK, responder(403, { consentimiento: false }) as unknown as typeof fetch)).toBeNull();
    expect(await leerReservas(OK, vi.fn().mockRejectedValue(new Error("sin red")) as unknown as typeof fetch)).toBeNull();
    expect(await leerReservas(OK, responder(200, { compras: "no es una lista" }) as unknown as typeof fetch)).toBeNull();
  });

  it("una lista vacía del servidor sigue siendo una lista vacía", async () => {
    expect(await leerReservas(OK, responder(200, { compras: [] }) as unknown as typeof fetch)).toEqual([]);
  });
});

describe("reservarLote, pagarLote y deshacerLote", () => {
  it("mandan la acción como JSON y devuelven las compras nuevas", async () => {
    const pedir = responder(200, { ok: true, compras: [compra] });
    expect(await reservarLote(OK, { loteId: "lote-7", opcion: "solo-lote", vio }, pedir as unknown as typeof fetch)).toEqual({ ok: true, compras: [compra] });
    const [url, init] = pedir.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/lotes/reservas");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote" });
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");

    await pagarLote(OK, "lote-7", pedir as unknown as typeof fetch);
    expect(JSON.parse(String((pedir.mock.calls[1] as unknown as [string, RequestInit])[1].body))).toEqual({ accion: "pagar", loteId: "lote-7" });
    await deshacerLote(OK, "lote-7", pedir as unknown as typeof fetch);
    expect(JSON.parse(String((pedir.mock.calls[2] as unknown as [string, RequestInit])[1].body))).toEqual({ accion: "deshacer", loteId: "lote-7" });
  });

  it("un 409 trae el motivo del servidor", async () => {
    const r = await reservarLote(OK, { loteId: "lote-7", opcion: "solo-lote", vio }, responder(409, { ok: false, motivo: "ya-reservado" }) as unknown as typeof fetch);
    expect(r).toEqual({ ok: false, motivo: "ya-reservado" });
    expect(await pagarLote(OK, "lote-7", responder(409, { ok: false, motivo: "no-reservado" }) as unknown as typeof fetch)).toEqual({ ok: false, motivo: "no-reservado" });
  });

  it("cualquier otro fallo (500, 403, sin red, sin sesión) es error y no inventa compras", async () => {
    const datos = { loteId: "lote-7", opcion: "solo-lote" as const, vio };
    expect(await reservarLote(OK, datos, responder(500, { ok: false }) as unknown as typeof fetch)).toEqual({ ok: false, motivo: "error" });
    expect(await reservarLote(OK, datos, responder(403, { consentimiento: false }) as unknown as typeof fetch)).toEqual({ ok: false, motivo: "error" });
    expect(await reservarLote(OK, datos, vi.fn().mockRejectedValue(new Error("sin red")) as unknown as typeof fetch)).toEqual({ ok: false, motivo: "error" });
    const pedir = responder(200, { ok: true, compras: [] });
    expect(await reservarLote(SIN, datos, pedir as unknown as typeof fetch)).toEqual({ ok: false, motivo: "error" });
    expect(pedir).not.toHaveBeenCalled();
  });
});

describe("leerEstados", () => {
  it("trae los estados de la base", async () => {
    expect(await leerEstados(responder(200, { ok: true, estados: { "lote-7": "reservado" } }) as unknown as typeof fetch)).toEqual({ "lote-7": "reservado" });
  });

  it("null si el servidor no respondió bien", async () => {
    expect(await leerEstados(responder(503, { ok: false }) as unknown as typeof fetch)).toBeNull();
    expect(await leerEstados(vi.fn().mockRejectedValue(new Error("sin red")) as unknown as typeof fetch)).toBeNull();
    expect(await leerEstados(responder(200, { ok: true }) as unknown as typeof fetch)).toBeNull();
  });
});
