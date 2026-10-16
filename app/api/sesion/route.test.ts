import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { cuentas, personas } from "@/lib/db/schema";
import { GET } from "./route";

const pedido = (email: string) => new Request("http://x/api/sesion", { headers: { "x-lh-prueba": email } });

describe("GET /api/sesion (modo de prueba, con la base)", () => {
  let base: Db;
  beforeEach(async () => {
    base = (await crearPglite()) as unknown as Db;
    fijarBaseParaTests(base);
    vi.stubEnv("LH_AUTH_PRUEBA", "1");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("LH_ACCESO", "");
    vi.stubEnv("LH_PERSONAS", "super@prueba.test=superadmin:usuario;admin@prueba.test=admin-tribu:inversor");
  });
  afterEach(() => {
    fijarBaseParaTests(null);
    vi.unstubAllEnvs();
  });

  it("carga las personas de LH_PERSONAS y devuelve rol, perfil, tribu y personaId", async () => {
    const r = await GET(pedido("ADMIN@prueba.test"));
    expect(r.status).toBe(200);
    const cuerpo = await r.json();
    expect(cuerpo).toMatchObject({ ok: true, idPersona: "prueba:admin@prueba.test", email: "admin@prueba.test", rol: "admin-tribu", perfil: "inversor", tribuAdmin: "valle" });
    expect(cuerpo.personaId).toMatch(/^[0-9a-f-]{36}$/);
    expect(cuerpo.personas).toBeUndefined();
    expect(await base.select().from(cuentas)).toHaveLength(0);
  });

  it("persona nueva: rol persona, personaId null y nada guardado", async () => {
    await GET(pedido("super@prueba.test"));
    const r = await GET(pedido("intruso@prueba.test"));
    expect(await r.json()).toMatchObject({ rol: "persona", personaId: null });
    expect(await base.select().from(personas)).toHaveLength(2);
  });

  it("403 con un email que no es de prueba", async () => {
    expect((await GET(pedido("gus@gmail.com"))).status).toBe(403);
  });
});

describe("la base en producción", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sin DATABASE_URL y con VERCEL_ENV=production la base falla de forma explícita", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");
    await expect(db()).rejects.toThrow(/DATABASE_URL/);
  });
});
