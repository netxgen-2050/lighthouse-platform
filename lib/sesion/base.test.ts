import { count, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { cuentas, personas } from "@/lib/db/schema";
import { cargaInicial, personaDeLaSesion } from "./base";
import type { IdentidadExterna } from "./identidad";
import { parsearPersonas } from "./personas";

let db: Db;
beforeEach(async () => {
  db = (await crearPglite()) as unknown as Db;
});
afterEach(() => vi.restoreAllMocks());

const privy = (idExterno: string, email: string | null, emailVerificado = true): { identidad: IdentidadExterna; prueba: boolean } => ({
  prueba: false,
  identidad: { proveedor: "privy", idExterno, email, emailVerificado },
});

async function totales() {
  const [p] = await db.select({ n: count() }).from(personas);
  const [c] = await db.select({ n: count() }).from(cuentas);
  return { personas: p!.n, cuentas: c!.n };
}

const NUEVE = Array.from({ length: 9 }, (_, i) => `p${i}@prueba.test=persona:usuario`).join(";");

describe("carga inicial", () => {
  it("con la tabla vacía carga las 9 de LH_PERSONAS y después manda la base", async () => {
    await cargaInicial(db, parsearPersonas(NUEVE));
    expect((await totales()).personas).toBe(9);
    // Otra base ya cargada: aunque la variable cambie, no se vuelve a cargar.
    await db.delete(personas).where(eq(personas.email, "p0@prueba.test"));
    await cargaInicial(db, parsearPersonas(NUEVE));
    expect((await totales()).personas).toBe(8);
  });

  it("con la tabla con datos no carga nada", async () => {
    await db.insert(personas).values({ email: "x@prueba.test" });
    await cargaInicial(db, parsearPersonas(NUEVE));
    expect((await totales()).personas).toBe(1);
  });
});

describe("personaDeLaSesion", () => {
  beforeEach(async () => {
    await cargaInicial(db, parsearPersonas("ana@prueba.test=admin-tribu:inversor;super@prueba.test=superadmin:usuario"));
  });

  it("primer login: vincula la cuenta y trae el rol; el segundo no agrega filas", async () => {
    const r = await personaDeLaSesion(db, privy("did:privy:ana", "Ana@Prueba.test"), {});
    expect(r).toMatchObject({ estado: 200, idPersona: "did:privy:ana", persona: { rol: "admin-tribu", perfil: "inversor", tribuAdmin: "valle" } });
    expect(r.estado === 200 && r.personaId).toBeTruthy();
    const [cuenta] = await db.select().from(cuentas);
    expect(cuenta).toMatchObject({ proveedor: "privy", idExterno: "did:privy:ana", emailVerificado: "ana@prueba.test" });
    await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {});
    expect((await totales()).cuentas).toBe(1);
  });

  it("segundo login con otro email en la cuenta se encuentra por la cuenta", async () => {
    await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {});
    const r = await personaDeLaSesion(db, privy("did:privy:ana", null, false), {});
    expect(r).toMatchObject({ estado: 200, persona: { rol: "admin-tribu" } });
  });

  it("otra cuenta privy con el mismo email: 403, no vincula y el log no tiene el email", async () => {
    await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {});
    const espias = [vi.spyOn(console, "warn"), vi.spyOn(console, "error"), vi.spyOn(console, "log")];
    const log = vi.fn();
    const r = await personaDeLaSesion(db, privy("did:privy:otra", "ana@prueba.test"), {}, log);
    expect(r.estado).toBe(403);
    expect((await totales()).cuentas).toBe(1);
    expect(JSON.stringify(log.mock.calls)).not.toContain("ana@prueba.test");
    for (const e of espias) expect(JSON.stringify(e.mock.calls)).not.toContain("ana@prueba.test");
  });

  it("email sin verificar no vincula (y no hereda el rol)", async () => {
    const r = await personaDeLaSesion(db, privy("did:privy:falso", "ana@prueba.test", false), {});
    expect(r).toMatchObject({ estado: 200, personaId: null, persona: { rol: "persona", tribuAdmin: null } });
    expect((await totales()).cuentas).toBe(0);
    expect((await personaDeLaSesion(db, privy("did:privy:falso", "ana@prueba.test", false), { LH_ACCESO: "lista" })).estado).toBe(403);
  });

  it("persona nueva: rol persona y cero filas nuevas", async () => {
    const antes = await totales();
    const r = await personaDeLaSesion(db, privy("did:privy:nueva", "Nueva@Prueba.test"), {});
    expect(r).toMatchObject({ estado: 200, personaId: null, persona: { email: "nueva@prueba.test", rol: "persona", perfil: "usuario" } });
    expect(await totales()).toEqual(antes);
  });

  it("LH_ACCESO=lista: la persona nueva no entra y la de la tabla sí", async () => {
    expect((await personaDeLaSesion(db, privy("did:privy:n", "nueva@prueba.test"), { LH_ACCESO: "lista" })).estado).toBe(403);
    expect((await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), { LH_ACCESO: "lista" })).estado).toBe(200);
  });

  it("persona sin acceso: 403 con o sin cuenta vinculada", async () => {
    await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {});
    await db.update(personas).set({ acceso: false }).where(eq(personas.email, "ana@prueba.test"));
    expect((await personaDeLaSesion(db, privy("did:privy:ana", null, false), {})).estado).toBe(403);
    await db.update(personas).set({ acceso: false }).where(eq(personas.email, "super@prueba.test"));
    expect((await personaDeLaSesion(db, privy("did:privy:s", "super@prueba.test"), {})).estado).toBe(403);
    expect((await totales()).cuentas).toBe(1);
  });

  it("dos vínculos seguidos de la misma cuenta dejan una sola fila", async () => {
    const [a, b] = await Promise.all([
      personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {}),
      personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {}),
    ]);
    expect([a.estado, b.estado].every((e) => e === 200 || e === 403)).toBe(true);
    expect((await totales()).cuentas).toBe(1);
    expect((await personaDeLaSesion(db, privy("did:privy:ana", "ana@prueba.test"), {})).estado).toBe(200);
  });

  it("modo de prueba: encuentra por email, no escribe cuentas", async () => {
    const r = await personaDeLaSesion(
      db,
      { prueba: true, identidad: { proveedor: "privy", idExterno: "prueba:super@prueba.test", email: "super@prueba.test", emailVerificado: true } },
      {},
    );
    expect(r).toMatchObject({ estado: 200, idPersona: "prueba:super@prueba.test", persona: { rol: "superadmin" } });
    expect((await totales()).cuentas).toBe(0);
  });
});
