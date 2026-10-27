import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";

vi.mock("server-only", () => ({}));

let cookiesActuales: Record<string, string> = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (n: string) => (n in cookiesActuales ? { name: n, value: cookiesActuales[n] } : undefined) }),
}));
class Prohibido extends Error {}
vi.mock("next/navigation", () => ({
  forbidden: () => {
    throw new Prohibido("403");
  },
}));

import { exigirSuperAdmin } from "./pagina";

async function resultado() {
  try {
    await exigirSuperAdmin();
    return "pasa";
  } catch (e) {
    if (e instanceof Prohibido) return "403";
    throw e;
  }
}

let base: Db;

beforeEach(async () => {
  base = (await crearPglite()) as unknown as Db;
  fijarBaseParaTests(base);
  cookiesActuales = {};
  vi.stubEnv("LH_AUTH_PRUEBA", "1");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("LH_ACCESO", "");
  vi.stubEnv("LH_PERSONAS", "super@prueba.test=superadmin:usuario;persona@prueba.test=persona:usuario");
  vi.stubEnv("NEXT_PUBLIC_PRIVY_APP_ID", "");
  vi.stubEnv("PRIVY_APP_SECRET", "");
});
afterEach(() => {
  fijarBaseParaTests(null);
  vi.unstubAllEnvs();
});

describe("exigirSuperAdmin", () => {
  it("sin cookies: 403", async () => {
    expect(await resultado()).toBe("403");
  });

  it("una persona común con la cookie de prueba: 403", async () => {
    cookiesActuales = { "lh-auth-prueba": "persona@prueba.test" };
    expect(await resultado()).toBe("403");
  });

  it("el super admin de prueba con modo de prueba: pasa", async () => {
    cookiesActuales = { "lh-auth-prueba": encodeURIComponent("super@prueba.test") };
    expect(await resultado()).toBe("pasa");
  });

  it("la misma cookie sin modo de prueba: 403", async () => {
    vi.stubEnv("LH_AUTH_PRUEBA", "");
    cookiesActuales = { "lh-auth-prueba": "super@prueba.test" };
    expect(await resultado()).toBe("403");
  });

  it("un token inválido en lh-sesion-admin: 403", async () => {
    cookiesActuales = { "lh-sesion-admin": "token-que-no-existe" };
    expect(await resultado()).toBe("403");
  });

  it("si la base falla (503): 403", async () => {
    fijarBaseParaTests({} as unknown as Db);
    cookiesActuales = { "lh-auth-prueba": "super@prueba.test" };
    expect(await resultado()).toBe("403");
  });
});
