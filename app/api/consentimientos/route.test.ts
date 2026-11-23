import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";
import { GET, POST } from "./route";

let base: Db;
beforeEach(async () => {
  base = (await crearPglite()) as unknown as Db;
  fijarBaseParaTests(base);
  vi.stubEnv("LH_AUTH_PRUEBA", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("LH_PERSONAS", "");
});
afterEach(() => {
  fijarBaseParaTests(null);
  vi.unstubAllEnvs();
});

const EMAIL = "ruta@prueba.test";

function pedir(metodo: "GET" | "POST", opciones: { email?: string | null; cuerpo?: unknown; tipo?: string | null; origen?: string; query?: string } = {}) {
  const headers = new Headers({ host: "localhost:3000" });
  if (opciones.email !== null) headers.set("x-lh-prueba", opciones.email ?? EMAIL);
  if (metodo === "POST" && opciones.tipo !== null) headers.set("content-type", opciones.tipo ?? "application/json");
  if (opciones.origen) headers.set("origin", opciones.origen);
  return new Request(`http://localhost:3000/api/consentimientos${opciones.query ?? ""}`, {
    method: metodo,
    headers,
    body: metodo === "POST" ? JSON.stringify(opciones.cuerpo ?? {}) : undefined,
  });
}

const aceptar = (extra: Record<string, unknown> = {}) => ({ accion: "acepta", canal: "alta", version: VERSION_POLITICA, ...extra });

describe("POST /api/consentimientos", () => {
  it("sin sesión es 401 y no escribe", async () => {
    const r = await POST(pedir("POST", { email: null, cuerpo: aceptar() }));
    expect(r.status).toBe(401);
  });

  it("con un pedido inválido es 422", async () => {
    expect((await POST(pedir("POST", { cuerpo: aceptar({ version: "0.0" }) }))).status).toBe(422);
    expect((await POST(pedir("POST", { cuerpo: { accion: "acepta" } }))).status).toBe(422);
    const vencida = aceptar({ aceptadoEnCliente: "2026-11-23T10:00:00.000Z", enviadoEnCliente: "2026-11-23T10:06:00.000Z" });
    expect((await POST(pedir("POST", { cuerpo: vencida }))).status).toBe(422);
    const sinNada = await GET(pedir("GET"));
    expect((await sinNada.json()).estado.general).toBe("pendiente");
  });

  it("acepta, responde 200 con el estado y el GET lo ve", async () => {
    const r = await POST(
      pedir("POST", { cuerpo: aceptar({ aceptadoEnCliente: "2026-11-23T10:00:00.000Z", enviadoEnCliente: "2026-11-23T10:01:00.000Z", novedades: "acepta" }) }),
    );
    expect(r.status).toBe(200);
    expect((await r.json()).estado).toMatchObject({ general: "vigente", novedades: true, canal: "alta" });
    const g = await GET(pedir("GET", { query: "?filas=1" }));
    const j = await g.json();
    expect(j.estado.general).toBe("vigente");
    expect(j.filas).toHaveLength(3);
    // Sin `?filas=1` no se mandan las filas.
    expect((await (await GET(pedir("GET"))).json()).filas).toBeUndefined();
  });

  it("exige el tipo de contenido JSON y un origen propio", async () => {
    expect((await POST(pedir("POST", { cuerpo: aceptar(), tipo: "text/plain" }))).status).toBe(415);
    expect((await POST(pedir("POST", { cuerpo: aceptar(), tipo: null }))).status).toBe(415);
    expect((await POST(pedir("POST", { cuerpo: aceptar(), origen: "https://otro-sitio.test" }))).status).toBe(403);
    expect((await POST(pedir("POST", { cuerpo: aceptar(), origen: "http://localhost:3000" }))).status).toBe(200);
  });

  it("un cuerpo que no es JSON es 422", async () => {
    const req = new Request("http://localhost:3000/api/consentimientos", {
      method: "POST",
      headers: { "x-lh-prueba": EMAIL, "content-type": "application/json", host: "localhost:3000" },
      body: "{no es json",
    });
    expect((await POST(req)).status).toBe(422);
  });

  it("un cuerpo de más de 2 KB es 413, declarado o leído, y no escribe", async () => {
    const grande = JSON.stringify(aceptar({ relleno: "x".repeat(3000) }));
    const headers = { "x-lh-prueba": EMAIL, "content-type": "application/json", host: "localhost:3000" };
    const real = new Request("http://localhost:3000/api/consentimientos", { method: "POST", headers, body: grande });
    expect((await POST(real)).status).toBe(413);
    const declarado = new Request("http://localhost:3000/api/consentimientos", {
      method: "POST",
      headers: { ...headers, "content-length": "999999" },
      body: JSON.stringify(aceptar()),
    });
    expect((await POST(declarado)).status).toBe(413);
    expect((await (await GET(pedir("GET"))).json()).estado.general).toBe("pendiente");
  });

  it("si la base falla responde 503 sin guardar nada", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(base, "transaction").mockRejectedValue(new Error("la base se cayó"));
    const r = await POST(pedir("POST", { cuerpo: aceptar() }));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("la base se cayó");
  });
});

describe("GET /api/consentimientos", () => {
  it("sin sesión es 401", async () => {
    expect((await GET(pedir("GET", { email: null }))).status).toBe(401);
  });

  it("una persona nueva que no aceptó es pendiente y no deja ninguna fila", async () => {
    const r = await GET(pedir("GET"));
    expect(r.status).toBe(200);
    expect((await r.json()).estado).toMatchObject({ general: "pendiente", novedades: false });
  });
});
