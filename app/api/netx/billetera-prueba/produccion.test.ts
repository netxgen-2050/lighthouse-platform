import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { llaveAHex } from "@/lib/billetera-prueba/passkey";
import { reiniciarMock } from "@/lib/integraciones/candide";
import { LLAVE_DE_PRUEBA } from "@/lib/integraciones/candide/__fixtures__/datos";

// En Production el login de prueba no existe: para llegar a la ruta con una sesión de super admin se simula la verificación.
let rol = "superadmin";
vi.mock("@/lib/sesion/servidor", () => ({
  sesionDelPedido: async () => ({ estado: 200, persona: { rol }, personaId: "p1", idPersona: "p1", clavesAnteriores: [], verificada: {} }),
}));

import { POST as cuenta } from "./cuenta/route";

const pedir = () =>
  cuenta(new Request("http://x/api/netx/billetera-prueba/cuenta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(llaveAHex(LLAVE_DE_PRUEBA)) }));

beforeEach(() => {
  rol = "superadmin";
  reiniciarMock();
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("LH_PRUEBA_CANDIDE_SIMULADO", "1");
});
afterEach(() => vi.unstubAllEnvs());

describe("Production", () => {
  it("con LH_PRUEBA_CANDIDE=1 funciona igual que en un preview: 200 para el super admin", async () => {
    vi.stubEnv("LH_PRUEBA_CANDIDE", "1");
    const r = await pedir();
    expect(r.status).toBe(200);
    expect((await r.json()).direccion).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("con LH_PRUEBA_CANDIDE=1 sigue cerrada para quien no es super admin", async () => {
    vi.stubEnv("LH_PRUEBA_CANDIDE", "1");
    rol = "persona";
    expect((await pedir()).status).toBe(403);
  });

  it("sin la variable responde 404 aunque sea super admin", async () => {
    vi.stubEnv("LH_PRUEBA_CANDIDE", "");
    expect((await pedir()).status).toBe(404);
  });
});
