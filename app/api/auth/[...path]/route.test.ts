import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const ctx = { params: Promise.resolve({ path: ["get-session"] }) };

describe("/api/auth sin configurar", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("responde 503 con { ok: false } y avisa en el log sin valores", async () => {
    vi.stubEnv("NEON_AUTH_BASE_URL", "");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "secreto-corto-que-no-debe-aparecer");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const r of [await GET(new Request("http://x/api/auth/get-session"), ctx), await POST(new Request("http://x/api/auth/sign-in/email-otp", { method: "POST" }), ctx)]) {
      expect(r.status).toBe(503);
      expect(await r.json()).toEqual({ ok: false });
    }
    expect(log).toHaveBeenCalled();
    expect(JSON.stringify(log.mock.calls)).not.toContain("secreto-corto");
  });

  it("un secreto de menos de 32 caracteres cuenta como no configurado", async () => {
    vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.ejemplo.test");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "corto");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await GET(new Request("http://x/api/auth/get-session"), ctx)).status).toBe(503);
  });
});
