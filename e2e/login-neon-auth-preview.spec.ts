import { expect, test } from "./fixtura";

// Contra un preview (BASE_URL), con la persona de prueba de Neon Auth de la rama `previews` (login@prueba.test, creada por Gus
// con email y contraseña SOLO en esa rama; ver docs/guiones/login-neon-auth.md). Los datos van en el .env.local de quien corre,
// nunca en el repo. Sin alguno de los tres, se salta.
const EMAIL = process.env.NEON_AUTH_PRUEBA_EMAIL;
const CLAVE = process.env.NEON_AUTH_PRUEBA_CLAVE;
const BASE_URL = process.env.BASE_URL;

test.describe("login real con Neon Auth en el preview", () => {
  test.skip(!BASE_URL || !EMAIL || !CLAVE, "Hace falta BASE_URL (un preview), NEON_AUTH_PRUEBA_EMAIL y NEON_AUTH_PRUEBA_CLAVE");
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("entra por /api/auth/sign-in/email y /api/sesion responde con su rol y su personaId", async ({ context }) => {
    const origen = new URL(BASE_URL!).origin;
    const entrada = await context.request.post(`${origen}/api/auth/sign-in/email`, {
      data: { email: EMAIL, password: CLAVE },
      headers: { origin: origen, "content-type": "application/json" },
    });
    expect(entrada.status(), "el sign-in con contraseña tiene que estar habilitado solo en la rama previews").toBe(200);

    const sesion = await context.request.get(`${origen}/api/sesion`);
    expect(sesion.status()).toBe(200);
    const cuerpo = (await sesion.json()) as { ok: boolean; rol: string; personaId: string | null; email: string; idPersona: string };
    expect(cuerpo).toMatchObject({ ok: true, rol: "persona", email: EMAIL!.toLowerCase() });
    // `login@prueba.test` está en scripts/datos-previews.sql: la persona existe y la sesión trae su id de NetX.
    expect(cuerpo.personaId).toMatch(/^[0-9a-f-]{36}$/);
    expect(cuerpo.idPersona).toBe(cuerpo.personaId);
  });
});
