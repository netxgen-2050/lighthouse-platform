import { describe, expect, it } from "vitest";
import { esEmailDePrueba, resolverSesion, type ClientePrivy } from "./verificar";

function cliente(email: string | null, falla = false, google = false): () => ClientePrivy {
  return () => ({
    verifyAuthToken: async () => {
      if (falla) throw new Error("token malo");
      return { userId: "did:privy:1" };
    },
    getUser: async () => ({
      id: "did:privy:1",
      email: email && !google ? { address: email } : null,
      google: email && google ? { email } : null,
    }),
  });
}

const sinPrueba = { authorization: null, prueba: null };
const conToken = { authorization: "Bearer ok", prueba: null };

describe("resolverSesion", () => {
  it("401 sin sesión", async () => {
    expect((await resolverSesion(sinPrueba, {}, cliente("ana@x.com"))).estado).toBe(401);
  });

  it("401 si el token no se puede verificar", async () => {
    const r = await resolverSesion({ authorization: "Bearer malo", prueba: null }, {}, cliente("ana@x.com", true));
    expect(r.estado).toBe(401);
  });

  it("devuelve la identidad de Privy en minúsculas, verificada si viene de email o de Google", async () => {
    expect(await resolverSesion(conToken, {}, cliente("ANA@x.com"))).toMatchObject({
      estado: 200,
      prueba: false,
      identidad: { proveedor: "privy", idExterno: "did:privy:1", email: "ana@x.com", emailVerificado: true },
    });
    expect(await resolverSesion(conToken, {}, cliente("ana@x.com", false, true))).toMatchObject({
      identidad: { email: "ana@x.com", emailVerificado: true },
    });
  });

  it("sin email: identidad sin email y sin verificar", async () => {
    expect(await resolverSesion(conToken, {}, cliente(null))).toMatchObject({
      estado: 200,
      identidad: { email: null, emailVerificado: false },
    });
  });

  it("503 si Privy no está configurado", async () => {
    expect((await resolverSesion(conToken, {}, () => null)).estado).toBe(503);
  });

  it("el header de prueba solo vale con LH_AUTH_PRUEBA=1 fuera de producción", async () => {
    const h = { authorization: null, prueba: "super@prueba.test" };
    expect((await resolverSesion(h, { LH_AUTH_PRUEBA: "1" }, () => null)).estado).toBe(200);
    expect((await resolverSesion(h, {}, () => null)).estado).toBe(401);
    expect((await resolverSesion(h, { LH_AUTH_PRUEBA: "1", VERCEL_ENV: "production" }, () => null)).estado).toBe(401);
  });

  it("el modo de prueba acepta ` SUPER@Prueba.TEST ` (normalizado) y devuelve una identidad de prueba", async () => {
    const r = await resolverSesion({ authorization: null, prueba: " SUPER@Prueba.TEST " }, { LH_AUTH_PRUEBA: "1" }, () => null);
    expect(r).toMatchObject({ estado: 200, prueba: true, identidad: { idExterno: "prueba:super@prueba.test", email: "super@prueba.test" } });
  });

  it("el modo de prueba rechaza (403) emails que no son de prueba, aun con LH_AUTH_PRUEBA=1 fuera de producción", async () => {
    for (const prueba of ["gus@gmail.com", "gus@gmail.com.test.ar", "prueba.test", "a b@prueba.test"]) {
      const r = await resolverSesion({ authorization: null, prueba }, { LH_AUTH_PRUEBA: "1", VERCEL_ENV: "preview" }, () => null);
      expect(r.estado, prueba).toBe(403);
    }
  });
});

describe("esEmailDePrueba", () => {
  it("solo dominios que terminan en .test", () => {
    expect(esEmailDePrueba("a@prueba.test")).toBe(true);
    expect(esEmailDePrueba("a@x.test.com")).toBe(false);
    expect(esEmailDePrueba("a@test")).toBe(false);
  });
});
