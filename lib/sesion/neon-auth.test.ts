import { count } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { cuentas, personas } from "@/lib/db/schema";
import { cargaInicial, claveAnterior, personaDeLaSesion } from "./base";
import { parsearPersonas } from "./personas";
import { adaptadorNeonAuth, type RespuestaSesionNeon } from "./proveedores/neon-auth";
import { adaptadorPrivy } from "./proveedores/privy";
import type { ClienteIdentidad } from "./proveedores/puerto";
import { resolverIdentidad } from "./verificar";

const COOKIE = "__Secure-neon-auth.session_token=abc";

function pedido(cabeceras: Record<string, string> = {}) {
  return new Request("http://x/api/sesion", { headers: cabeceras });
}

function neon(respuesta: RespuestaSesionNeon | Error): ClienteIdentidad {
  return adaptadorNeonAuth({
    sesion: async () => {
      if (respuesta instanceof Error) throw respuesta;
      return respuesta;
    },
  });
}

const usuario = (extra: Record<string, unknown> = {}) => ({
  estado: 200,
  cuerpo: { session: { id: "s1" }, user: { id: "u-ana", email: "Ana@Prueba.test", emailVerified: true, name: "Ana", ...extra } },
});

function privy(): ClienteIdentidad {
  return adaptadorPrivy(() => ({
    verifyAuthToken: async (t) => {
      if (t === "malo") throw new Error("token malo");
      return { userId: "did:privy:ana" };
    },
    getUser: async () => ({ id: "did:privy:ana", email: { address: "ana@prueba.test" } }),
  }));
}

describe("adaptador de Neon Auth", () => {
  it("sesión válida: identidad con el email en minúsculas y el nombre", async () => {
    expect(await neon(usuario()).identidad(pedido({ cookie: COOKIE }))).toEqual({
      proveedor: "neon-auth",
      idExterno: "u-ana",
      email: "ana@prueba.test",
      emailVerificado: true,
      nombre: "Ana",
    });
  });

  it("sin cookie de Neon Auth no pregunta nada (null)", async () => {
    const cliente = { sesion: vi.fn() };
    expect(await adaptadorNeonAuth(cliente).identidad(pedido({ cookie: "otra=1" }))).toBeNull();
    expect(cliente.sesion).not.toHaveBeenCalled();
  });

  it("sin sesión en Neon Auth (null o sin usuario): null", async () => {
    expect(await neon({ estado: 200, cuerpo: null }).identidad(pedido({ cookie: COOKIE }))).toBeNull();
    expect(await neon({ estado: 200, cuerpo: { session: null, user: null } }).identidad(pedido({ cookie: COOKIE }))).toBeNull();
  });

  it("email sin verificar: la identidad lo dice", async () => {
    expect(await neon(usuario({ emailVerified: false })).identidad(pedido({ cookie: COOKIE }))).toMatchObject({ emailVerificado: false });
  });

  it("otra forma, 5xx o cliente caído: invalida", async () => {
    const p = pedido({ cookie: COOKIE });
    expect(await neon({ estado: 200, cuerpo: { user: { id: 7 } } }).identidad(p)).toBe("invalida");
    expect(await neon({ estado: 200, cuerpo: "ilegible" }).identidad(p)).toBe("invalida");
    expect(await neon({ estado: 500, cuerpo: {} }).identidad(p)).toBe("invalida");
    expect(await neon(new Error("sin red")).identidad(p)).toBe("invalida");
  });
});

describe("resolverIdentidad: el orden", () => {
  const entornoDePrueba = { LH_AUTH_PRUEBA: "1" };
  const todos = () => [privy(), neon(usuario())];

  it("1. la cabecera de prueba va primero", async () => {
    const r = await resolverIdentidad(pedido({ "x-lh-prueba": "a@prueba.test", authorization: "Bearer ok", cookie: COOKIE }), entornoDePrueba, todos());
    expect(r).toMatchObject({ estado: 200, prueba: true, identidad: { idExterno: "prueba:a@prueba.test" } });
  });

  it("2. el token de Privy va antes que la cookie de Neon Auth", async () => {
    const r = await resolverIdentidad(pedido({ authorization: "Bearer ok", cookie: COOKIE }), {}, todos());
    expect(r).toMatchObject({ estado: 200, identidad: { proveedor: "privy", idExterno: "did:privy:ana" } });
  });

  it("3. sin token, la cookie de Neon Auth", async () => {
    const r = await resolverIdentidad(pedido({ cookie: COOKIE }), {}, todos());
    expect(r).toMatchObject({ estado: 200, identidad: { proveedor: "neon-auth", idExterno: "u-ana" } });
  });

  it("4. nada: 401; un token malo: 401", async () => {
    expect((await resolverIdentidad(pedido(), {}, todos())).estado).toBe(401);
    expect((await resolverIdentidad(pedido({ authorization: "Bearer malo" }), {}, todos())).estado).toBe(401);
  });

  it("Neon Auth con otra forma: 401 y con el email sin verificar: 403", async () => {
    expect((await resolverIdentidad(pedido({ cookie: COOKIE }), {}, [neon({ estado: 200, cuerpo: { user: { id: 1 } } })])).estado).toBe(401);
    expect((await resolverIdentidad(pedido({ cookie: COOKIE }), {}, [neon(usuario({ emailVerified: false }))])).estado).toBe(403);
  });

  it("ningún proveedor ni modo de prueba: 503 con un token, 401 sin nada", async () => {
    expect((await resolverIdentidad(pedido({ authorization: "Bearer ok" }), {}, [])).estado).toBe(503);
    expect((await resolverIdentidad(pedido(), {}, [])).estado).toBe(401);
  });
});

describe("la misma persona con Privy y con Neon Auth (PGlite)", () => {
  let db: Db;
  beforeEach(async () => {
    db = (await crearPglite()) as unknown as Db;
    await cargaInicial(db, parsearPersonas("ana@prueba.test=admin-tribu:inversor"));
  });
  afterEach(() => vi.restoreAllMocks());

  const entrar = async (cabeceras: Record<string, string>, proveedores: ClienteIdentidad[]) => {
    const v = await resolverIdentidad(pedido(cabeceras), {}, proveedores);
    if (v.estado !== 200) throw new Error(`estado ${v.estado}`);
    return personaDeLaSesion(db, v, {});
  };

  it("la persona de Privy entra con Neon Auth y el mismo email verificado: dos cuentas, mismo personaId y mismo rol", async () => {
    const conPrivy = await entrar({ authorization: "Bearer ok" }, [privy()]);
    const conNeon = await entrar({ cookie: COOKIE }, [neon(usuario())]);
    expect(conPrivy.estado === 200 && conNeon.estado === 200).toBe(true);
    if (conPrivy.estado !== 200 || conNeon.estado !== 200) return;
    expect(conNeon.personaId).toBe(conPrivy.personaId);
    expect(conNeon.persona.rol).toBe("admin-tribu");
    expect((await db.select({ proveedor: cuentas.proveedor }).from(cuentas)).map((c) => c.proveedor).sort()).toEqual(["neon-auth", "privy"]);
    // La clave del navegador es la misma y trae las dos anteriores.
    expect(conNeon.idPersona).toBe(conPrivy.personaId);
    expect([...conNeon.clavesAnteriores].sort()).toEqual(["did:privy:ana", "neon-auth:u-ana"]);
  });

  it("persona nueva con Neon Auth: rol persona, clave `neon-auth:<id>` y ninguna fila nueva", async () => {
    const antes = [(await db.select({ n: count() }).from(personas))[0]!.n, (await db.select({ n: count() }).from(cuentas))[0]!.n];
    const r = await entrar({ cookie: COOKIE }, [neon({ estado: 200, cuerpo: { user: { id: "u-nueva", email: "nueva@prueba.test", emailVerified: true } } })]);
    expect(r).toMatchObject({ estado: 200, personaId: null, idPersona: "neon-auth:u-nueva", clavesAnteriores: [], persona: { rol: "persona" } });
    expect([(await db.select({ n: count() }).from(personas))[0]!.n, (await db.select({ n: count() }).from(cuentas))[0]!.n]).toEqual(antes);
  });

  it("claveAnterior: la de Privy sin prefijo y la de Neon Auth con `neon-auth:`", () => {
    expect(claveAnterior("privy", "did:privy:x")).toBe("did:privy:x");
    expect(claveAnterior("neon-auth", "u1")).toBe("neon-auth:u1");
  });
});
