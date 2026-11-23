import { afterEach, describe, expect, it, vi } from "vitest";
import { intercambiarVerificador, PARAMETRO_VERIFICADOR } from "./proveedores/neon-auth-oauth";
import { proveedoresDelEntorno } from "./proveedores";
import { origenDeCabeceras, pedidoDeCabeceras } from "./verificar";

vi.mock("@neondatabase/auth/server", () => ({
  processAuthMiddleware: async () => {
    throw new Error("detalle con https://x/?neon_auth_session_verifier=secreto");
  },
}));

afterEach(() => vi.restoreAllMocks());

describe("origen del pedido de una página", () => {
  it("usa el host y el protocolo del proxy", () => {
    expect(origenDeCabeceras("lh.vercel.app", "https")).toBe("https://lh.vercel.app");
    expect(origenDeCabeceras("lh.vercel.app", "https, http")).toBe("https://lh.vercel.app");
  });
  it("sin protocolo: http en local, https en el resto", () => {
    expect(origenDeCabeceras("localhost:3000", null)).toBe("http://localhost:3000");
    expect(origenDeCabeceras("lh.vercel.app", null)).toBe("https://lh.vercel.app");
  });
  it("sin host o con un host raro, nada", () => {
    expect(origenDeCabeceras(null, "https")).toBeNull();
    expect(origenDeCabeceras("a b/c", "https")).toBeNull();
  });
  it("el pedido armado lleva ese origen (y el interno solo si no hay)", () => {
    expect(new URL(pedidoDeCabeceras({ origen: "https://lh.vercel.app" }).url).origin).toBe("https://lh.vercel.app");
    expect(new URL(pedidoDeCabeceras({}).url).hostname).toBe("interno.invalid");
  });
});

describe("NEXT_PUBLIC_LH_LOGIN con espacios", () => {
  it("el servidor lo recorta igual que el navegador: avisa que faltan variables", () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
    proveedoresDelEntorno({ NEXT_PUBLIC_LH_LOGIN: " neon-auth " });
    expect(aviso).toHaveBeenCalledTimes(1);
  });
});

describe("vuelta de Google que falla", () => {
  it("se registra sin el mensaje del error (puede traer el verificador) y la persona sigue sin sesión", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await intercambiarVerificador(new Request(`https://lh.vercel.app/tribus?${PARAMETRO_VERIFICADOR}=secreto`), {
      NEON_AUTH_BASE_URL: "https://auth.ejemplo.test",
      NEON_AUTH_COOKIE_SECRET: "x".repeat(32),
    });
    expect(r).toBeNull();
    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0].join(" "))).not.toContain("secreto");
  });
});
