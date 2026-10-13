import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/sesion/prueba", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("con el modo de prueba activo lista los emails de LH_PERSONAS", async () => {
    vi.stubEnv("LH_AUTH_PRUEBA", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("LH_PERSONAS", "a@x.test=superadmin:usuario;b@x.test=persona:inversor");
    const cuerpo = await (await GET()).json();
    expect(cuerpo.activo).toBe(true);
    expect(cuerpo.emails).toContain("a@x.test");
  });

  it("en producción de Vercel no existe: activo false y ningún email, aunque LH_AUTH_PRUEBA esté puesta", async () => {
    vi.stubEnv("LH_AUTH_PRUEBA", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("LH_PERSONAS", "a@x.test=superadmin:usuario");
    const res = await GET();
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ activo: false, emails: [] });
    expect(texto).not.toContain("a@x.test");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("sin LH_AUTH_PRUEBA tampoco existe", async () => {
    vi.stubEnv("LH_AUTH_PRUEBA", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("LH_PERSONAS", "a@x.test=superadmin:usuario");
    expect(await (await GET()).json()).toEqual({ activo: false, emails: [] });
  });
});
