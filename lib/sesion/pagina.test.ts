import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fijarBaseParaTests, type Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";

vi.mock("server-only", () => ({}));

let cookiesActuales: Record<string, string> = {};
let cabecerasActuales: Record<string, string> = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) => (n in cookiesActuales ? { name: n, value: cookiesActuales[n] } : undefined),
    toString: () => Object.entries(cookiesActuales).map(([k, v]) => `${k}=${v}`).join("; "),
  }),
  headers: async () => ({ get: (n: string) => cabecerasActuales[n.toLowerCase()] ?? null }),
}));
// El SDK de Neon Auth: se anota el pedido que le llega y se responde con una sesión de la persona super admin.
const pedidosANeon: Request[] = [];
vi.mock("@neondatabase/auth/server", () => ({
  handleAuthProxyRequest: async ({ request }: { request: Request }) => {
    pedidosANeon.push(request);
    return new Response(JSON.stringify({ session: { id: "s1" }, user: { id: "u-super", email: "super@prueba.test", emailVerified: true } }), {
      status: 200,
    });
  },
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
  cabecerasActuales = {};
  pedidosANeon.length = 0;
  vi.stubEnv("NEON_AUTH_BASE_URL", "");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "");
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

  describe("con la cookie de Neon Auth", () => {
    beforeEach(() => {
      vi.stubEnv("LH_AUTH_PRUEBA", "");
      vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.ejemplo.test");
      vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "x".repeat(32));
      cookiesActuales = { "__Secure-neon-auth.session_token": "abc" };
    });

    it("el super admin pasa y Neon Auth recibe el origen real de la página, no uno interno", async () => {
      cabecerasActuales = { host: "preview-lh.vercel.app", "x-forwarded-proto": "https" };
      expect(await resultado()).toBe("pasa");
      expect(pedidosANeon).toHaveLength(1);
      expect(new URL(pedidosANeon[0].url).origin).toBe("https://preview-lh.vercel.app");
      expect(pedidosANeon[0].headers.get("origin")).toBe("https://preview-lh.vercel.app");
      expect(pedidosANeon[0].headers.get("cookie")).toContain("__Secure-neon-auth.session_token=abc");
    });

    it("en local sin cabecera de protocolo usa http", async () => {
      cabecerasActuales = { host: "localhost:3000" };
      expect(await resultado()).toBe("pasa");
      expect(pedidosANeon[0].headers.get("origin")).toBe("http://localhost:3000");
    });

    it("sin ninguna cookie de Neon Auth no se le pregunta nada: 403", async () => {
      cookiesActuales = {};
      cabecerasActuales = { host: "preview-lh.vercel.app" };
      expect(await resultado()).toBe("403");
      expect(pedidosANeon).toHaveLength(0);
    });
  });

  it("si la base falla (503): 403", async () => {
    fijarBaseParaTests({} as unknown as Db);
    cookiesActuales = { "lh-auth-prueba": "super@prueba.test" };
    expect(await resultado()).toBe("403");
  });
});
