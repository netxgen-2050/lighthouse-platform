import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { consentimientos, personas, reservas } from "@/lib/db/schema";
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";
import { POST as consentir } from "../../consentimientos/route";
import { GET as leerEstados } from "../../lotes/estados/route";
import { POST as escribirReserva } from "../../lotes/reservas/route";
import { DELETE, GET } from "./route";

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

function pedir(metodo: string, url: string, opciones: { email?: string | null; cuerpo?: unknown; tipo?: string | null; origen?: string } = {}) {
  const headers = new Headers({ host: "localhost:3000" });
  if (opciones.email !== null) headers.set("x-lh-prueba", opciones.email ?? A);
  if (metodo !== "GET" && opciones.tipo !== null) headers.set("content-type", opciones.tipo ?? "application/json");
  if (opciones.origen) headers.set("origin", opciones.origen);
  return new Request(`http://localhost:3000${url}`, { method: metodo, headers, body: metodo === "GET" ? undefined : JSON.stringify(opciones.cuerpo ?? {}) });
}

async function aceptar(email: string) {
  const r = await consentir(pedir("POST", "/api/consentimientos", { email, cuerpo: { accion: "acepta", canal: "alta", version: VERSION_POLITICA } }));
  expect(r.status).toBe(200);
}
const reservar = (loteId: string, email: string, extra: Record<string, unknown> = {}) =>
  escribirReserva(pedir("POST", "/api/lotes/reservas", { email, cuerpo: { accion: "reservar", loteId, opcion: "solo-lote", vio, ...extra } }));
const estados = async () => (await (await leerEstados()).json()).estados as Record<string, string>;

describe("GET /api/mis-datos/actividad", () => {
  it("sin sesión es 401", async () => {
    expect((await GET(pedir("GET", "/api/mis-datos/actividad", { email: null }))).status).toBe(401);
  });

  it("una persona que nunca aceptó recibe listas vacías", async () => {
    const r = await GET(pedir("GET", "/api/mis-datos/actividad", { email: "nueva@prueba.test" }));
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ reservas: [], origen: null });
  });

  it("trae todos los eventos, también deshace, y el origen", async () => {
    await aceptar(A);
    await reservar("lote-7", A, { origen: { fuente: "mail" } });
    await escribirReserva(pedir("POST", "/api/lotes/reservas", { cuerpo: { accion: "deshacer", loteId: "lote-7" } }));
    const j = await (await GET(pedir("GET", "/api/mis-datos/actividad"))).json();
    expect(j.reservas.map((x: { evento: string }) => x.evento)).toEqual(["reserva", "deshace"]);
    expect(j.origen).toEqual({ fuente: "mail" });
  });

  it("con la política vencida responde 200 con los datos", async () => {
    await aceptar(A);
    await reservar("lote-7", A);
    const [p] = await base.select().from(personas).where(eq(personas.email, A));
    // Una política más nueva que la que aceptó: el consentimiento deja de ser vigente.
    for (const tipo of ["politica", "terminos"] as const) {
      await base.insert(consentimientos).values({ personaId: p!.id, tipo, evento: "retira", version: VERSION_POLITICA });
    }
    expect((await escribirReserva(pedir("POST", "/api/lotes/reservas", { cuerpo: { accion: "pagar", loteId: "lote-7" } }))).status).toBe(403);
    const r = await GET(pedir("GET", "/api/mis-datos/actividad"));
    expect(r.status).toBe(200);
    expect((await r.json()).reservas).toHaveLength(1);
  });

  it("no trae el id del super admin que liberó", async () => {
    await aceptar(A);
    await aceptar(SUPER);
    await reservar("lote-7", A);
    await escribirReserva(pedir("POST", "/api/lotes/reservas", { email: SUPER, cuerpo: { accion: "deshacer", loteId: "lote-7" } }));
    const [s] = await base.select().from(personas).where(eq(personas.email, SUPER));
    const texto = await (await GET(pedir("GET", "/api/mis-datos/actividad"))).text();
    expect(texto).not.toContain(s!.id);
    expect(JSON.parse(texto).reservas[1]).toMatchObject({ evento: "deshace", liberadoPorElEquipo: true });
  });
});

describe("DELETE /api/mis-datos/actividad", () => {
  it("sin sesión es 401", async () => {
    expect((await DELETE(pedir("DELETE", "/api/mis-datos/actividad", { email: null }))).status).toBe(401);
  });

  it("libera los lotes de la persona, deja el libro y borra el origen; no toca a otra persona", async () => {
    await aceptar(A);
    await aceptar(B);
    await reservar("lote-7", A, { origen: { fuente: "mail" } });
    await reservar("lote-8", B);
    expect((await estados())["lote-7"]).toBe("reservado");
    const r = await DELETE(pedir("DELETE", "/api/mis-datos/actividad"));
    expect(r.status).toBe(200);
    const e = await estados();
    expect(e["lote-7"]).toBeUndefined();
    expect(e["lote-8"]).toBe("reservado");
    const [p] = await base.select().from(personas).where(eq(personas.email, A));
    expect(p!.origen).toBeNull();
    expect((await base.select().from(reservas).where(eq(reservas.personaId, p!.id))).map((f) => f.evento)).toEqual(["reserva", "deshace"]);
    // La persona B puede reservar lo que A liberó.
    expect((await reservar("lote-7", B)).status).toBe(200);
  });

  it("funciona con la política vencida (no pide consentimiento)", async () => {
    await aceptar(A);
    await reservar("lote-7", A);
    const [p] = await base.select().from(personas).where(eq(personas.email, A));
    for (const tipo of ["politica", "terminos"] as const) {
      await base.insert(consentimientos).values({ personaId: p!.id, tipo, evento: "retira", version: VERSION_POLITICA });
    }
    expect((await DELETE(pedir("DELETE", "/api/mis-datos/actividad"))).status).toBe(200);
    expect((await estados())["lote-7"]).toBeUndefined();
  });

  it("sin persona en la base responde 200 sin escribir", async () => {
    const r = await DELETE(pedir("DELETE", "/api/mis-datos/actividad", { email: "nunca@prueba.test" }));
    expect(r.status).toBe(200);
    expect(await base.select().from(reservas)).toHaveLength(0);
  });

  it("exige JSON y un origen propio", async () => {
    await aceptar(A);
    await reservar("lote-7", A);
    expect((await DELETE(pedir("DELETE", "/api/mis-datos/actividad", { origen: "https://otro-sitio.test" }))).status).toBe(403);
    expect((await DELETE(pedir("DELETE", "/api/mis-datos/actividad", { tipo: "text/plain" }))).status).toBe(415);
    expect((await DELETE(pedir("DELETE", "/api/mis-datos/actividad", { tipo: null }))).status).toBe(415);
    expect((await estados())["lote-7"]).toBe("reservado");
  });

  it("si la base falla responde 503 sin el detalle", async () => {
    await aceptar(A);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(base, "transaction").mockRejectedValue(new Error("la base se cayó"));
    const r = await DELETE(pedir("DELETE", "/api/mis-datos/actividad"));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("la base se cayó");
  });
});
