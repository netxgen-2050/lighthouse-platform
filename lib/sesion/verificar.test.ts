import { describe, expect, it } from "vitest";
import { parsearPersonas } from "./personas";
import { resolverSesion, type ClientePrivy } from "./verificar";

const personas = parsearPersonas("ana@x.com=admin-tribu:usuario;super@x.com=superadmin:inversor");

function cliente(email: string | null, falla = false): () => ClientePrivy {
  return () => ({
    verifyAuthToken: async () => {
      if (falla) throw new Error("token malo");
      return { userId: "did:privy:1" };
    },
    getUser: async () => ({ id: "did:privy:1", email: email ? { address: email } : null }),
  });
}

const sinPrueba = { authorization: null, prueba: null };

describe("resolverSesion", () => {
  it("401 sin sesión", async () => {
    expect((await resolverSesion(sinPrueba, personas, {}, cliente("ana@x.com"))).estado).toBe(401);
  });

  it("401 si el token no se puede verificar", async () => {
    const r = await resolverSesion({ authorization: "Bearer malo", prueba: null }, personas, {}, cliente("ana@x.com", true));
    expect(r.estado).toBe(401);
  });

  it("acceso abierto: un email que no está en LH_PERSONAS entra como persona común", async () => {
    const r = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, {}, cliente("Otra@x.com"));
    expect(r).toMatchObject({ estado: 200, persona: { email: "otra@x.com", rol: "persona", tribuAdmin: null } });
  });

  it("LH_ACCESO=lista: un email que no está en la lista no entra", async () => {
    const r = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, { LH_ACCESO: "lista" }, cliente("otra@x.com"));
    expect(r.estado).toBe(403);
    const ok = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, { LH_ACCESO: "lista" }, cliente("ana@x.com"));
    expect(ok.estado).toBe(200);
  });

  it("403 si la cuenta no tiene un email válido", async () => {
    const r = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, {}, cliente(null));
    expect(r.estado).toBe(403);
  });

  it("200 con el rol y la tribu, sin importar mayúsculas", async () => {
    const r = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, {}, cliente("ANA@x.com"));
    expect(r).toMatchObject({ estado: 200, idPersona: "did:privy:1", persona: { rol: "admin-tribu", tribuAdmin: "valle" } });
  });

  it("503 si Privy no está configurado", async () => {
    const r = await resolverSesion({ authorization: "Bearer ok", prueba: null }, personas, {}, () => null);
    expect(r.estado).toBe(503);
  });

  it("el header de prueba solo vale con LH_AUTH_PRUEBA=1 fuera de producción", async () => {
    const h = { authorization: null, prueba: "super@x.com" };
    expect((await resolverSesion(h, personas, { LH_AUTH_PRUEBA: "1" }, () => null)).estado).toBe(200);
    expect((await resolverSesion(h, personas, {}, () => null)).estado).toBe(401);
    expect((await resolverSesion(h, personas, { LH_AUTH_PRUEBA: "1", VERCEL_ENV: "production" }, () => null)).estado).toBe(401);
  });

  it("el modo de prueba también tiene acceso abierto y respeta LH_ACCESO=lista", async () => {
    const h = { authorization: null, prueba: "otra@x.com" };
    expect((await resolverSesion(h, personas, { LH_AUTH_PRUEBA: "1" }, () => null)).estado).toBe(200);
    expect((await resolverSesion(h, personas, { LH_AUTH_PRUEBA: "1", LH_ACCESO: "lista" }, () => null)).estado).toBe(403);
  });
});
