import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { reservas } from "@/lib/db/schema";
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";
import { POST as consentir } from "../../consentimientos/route";
import { GET as estados } from "../estados/route";
import { GET, POST } from "./route";

let base: Db;
beforeEach(async () => {
  base = (await crearPglite()) as unknown as Db;
  fijarBaseParaTests(base);
  vi.stubEnv("LH_AUTH_PRUEBA", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("LH_PERSONAS", "super@prueba.test=superadmin:usuario");
});
afterEach(() => {
  fijarBaseParaTests(null);
  vi.unstubAllEnvs();
});

const A = "a@prueba.test";
const B = "b@prueba.test";
const SUPER = "super@prueba.test";
const vio = { precio: 100, aporte: 5, expensa: 2, version: "v1" };

function pedir(metodo: "GET" | "POST", url: string, opciones: { email?: string | null; cuerpo?: unknown; tipo?: string | null; origen?: string } = {}) {
  const headers = new Headers({ host: "localhost:3000" });
  if (opciones.email !== null) headers.set("x-lh-prueba", opciones.email ?? A);
  if (metodo === "POST" && opciones.tipo !== null) headers.set("content-type", opciones.tipo ?? "application/json");
  if (opciones.origen) headers.set("origin", opciones.origen);
  return new Request(`http://localhost:3000${url}`, { method: metodo, headers, body: metodo === "POST" ? JSON.stringify(opciones.cuerpo ?? {}) : undefined });
}

const enviar = (cuerpo: unknown, email: string | null = A) => POST(pedir("POST", "/api/lotes/reservas", { cuerpo, email }));
const reservar = (loteId = "lote-7", email: string | null = A) => enviar({ accion: "reservar", loteId, opcion: "solo-lote", vio }, email);

async function aceptar(email: string) {
  const r = await consentir(pedir("POST", "/api/consentimientos", { email, cuerpo: { accion: "acepta", canal: "alta", version: VERSION_POLITICA } }));
  expect(r.status).toBe(200);
}

describe("POST /api/lotes/reservas", () => {
  it("sin sesión es 401", async () => {
    expect((await reservar("lote-7", null)).status).toBe(401);
  });

  it("sin consentimiento es 403 con consentimiento false y no escribe", async () => {
    const r = await reservar();
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ consentimiento: false });
    expect(await base.select().from(reservas)).toHaveLength(0);
  });

  it("con consentimiento reserva, y devuelve las compras", async () => {
    await aceptar(A);
    const r = await reservar();
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.compras).toHaveLength(1);
    expect(j.compras[0]).toMatchObject({ loteId: "lote-7", paso: "reservado", opcion: "solo-lote" });
    const g = await GET(pedir("GET", "/api/lotes/reservas"));
    expect((await g.json()).compras).toHaveLength(1);
  });

  it("409 con el motivo: ya-reservado, no-disponible y no-reservado", async () => {
    await aceptar(A);
    await aceptar(B);
    await reservar("lote-7", A);
    const ya = await reservar("lote-7", B);
    expect(ya.status).toBe(409);
    expect(await ya.json()).toMatchObject({ motivo: "ya-reservado" });
    const no = await reservar("lote-13", B);
    expect(no.status).toBe(409);
    expect(await no.json()).toMatchObject({ motivo: "no-disponible" });
    const ajeno = await enviar({ accion: "pagar", loteId: "lote-7" }, B);
    expect(ajeno.status).toBe(409);
    expect(await ajeno.json()).toMatchObject({ motivo: "no-reservado" });
  });

  it("paga y deshace lo propio", async () => {
    await aceptar(A);
    await reservar();
    const p = await enviar({ accion: "pagar", loteId: "lote-7" });
    expect((await p.json()).compras[0]).toMatchObject({ paso: "pagado" });
    const d = await enviar({ accion: "deshacer", loteId: "lote-7" });
    expect((await d.json()).compras).toEqual([]);
  });

  it("deshacer lo ajeno: 403 para una persona común, 200 para el super admin", async () => {
    await aceptar(A);
    await aceptar(B);
    await aceptar(SUPER);
    await reservar("lote-7", A);
    expect((await enviar({ accion: "deshacer", loteId: "lote-7" }, B)).status).toBe(403);
    expect((await (await GET(pedir("GET", "/api/lotes/reservas"))).json()).compras).toHaveLength(1);
    expect((await enviar({ accion: "deshacer", loteId: "lote-7" }, SUPER)).status).toBe(200);
    expect((await (await GET(pedir("GET", "/api/lotes/reservas"))).json()).compras).toEqual([]);
  });

  it("422 con un cuerpo inválido, un lote desconocido o algo que no es JSON", async () => {
    await aceptar(A);
    expect((await enviar({ accion: "regalar", loteId: "lote-7" })).status).toBe(422);
    expect((await enviar({ accion: "reservar", loteId: "lote-99999", opcion: "solo-lote", vio })).status).toBe(422);
    expect((await enviar({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote" })).status).toBe(422);
    const roto = new Request("http://localhost:3000/api/lotes/reservas", {
      method: "POST",
      headers: { "x-lh-prueba": A, "content-type": "application/json", host: "localhost:3000" },
      body: "{no es json",
    });
    expect((await POST(roto)).status).toBe(422);
  });

  it("413 con un cuerpo demasiado grande, declarado o leído, y no escribe", async () => {
    await aceptar(A);
    const headers = { "x-lh-prueba": A, "content-type": "application/json", host: "localhost:3000" };
    const grande = JSON.stringify({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio, relleno: "x".repeat(6000) });
    expect((await POST(new Request("http://localhost:3000/api/lotes/reservas", { method: "POST", headers, body: grande }))).status).toBe(413);
    const declarado = new Request("http://localhost:3000/api/lotes/reservas", {
      method: "POST",
      headers: { ...headers, "content-length": "999999" },
      body: JSON.stringify({ accion: "pagar", loteId: "lote-7" }),
    });
    expect((await POST(declarado)).status).toBe(413);
    expect(await base.select().from(reservas)).toHaveLength(0);
  });

  it("exige JSON y un origen propio", async () => {
    await aceptar(A);
    const cuerpo = { accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio };
    expect((await POST(pedir("POST", "/api/lotes/reservas", { cuerpo, tipo: "text/plain" }))).status).toBe(415);
    expect((await POST(pedir("POST", "/api/lotes/reservas", { cuerpo, origen: "https://otro-sitio.test" }))).status).toBe(403);
  });

  it("si la base falla responde 503 sin el detalle", async () => {
    await aceptar(A);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(base, "transaction").mockRejectedValue(new Error("la base se cayó"));
    const r = await reservar();
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("la base se cayó");
  });
});

describe("GET /api/lotes/reservas", () => {
  it("401 sin sesión y 403 sin consentimiento", async () => {
    expect((await GET(pedir("GET", "/api/lotes/reservas", { email: null }))).status).toBe(401);
    const r = await GET(pedir("GET", "/api/lotes/reservas"));
    expect(r.status).toBe(403);
    expect(await r.json()).toMatchObject({ consentimiento: false });
  });

  it("solo trae las compras de la persona", async () => {
    await aceptar(A);
    await aceptar(B);
    await reservar("lote-7", A);
    await reservar("lote-8", B);
    const g = await (await GET(pedir("GET", "/api/lotes/reservas", { email: B }))).json();
    expect(g.compras.map((c: { loteId: string }) => c.loteId)).toEqual(["lote-8"]);
  });
});

describe("GET /api/lotes/estados", () => {
  it("sin sesión trae los estados y ninguna identidad de persona", async () => {
    await aceptar(A);
    await reservar("lote-7", A);
    const r = await estados();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const texto = await r.text();
    expect(JSON.parse(texto).estados).toMatchObject({ "lote-7": "reservado", "lote-13": "vendido" });
    expect(texto).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(texto).not.toContain("@");
  });

  it("si la base falla responde 503", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(base, "selectDistinctOn").mockImplementation(() => {
      throw new Error("la base se cayó");
    });
    expect((await estados()).status).toBe(503);
  });
});
