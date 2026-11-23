import { count, eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { consentimientos, cuentas, personas } from "@/lib/db/schema";
import type { Verificada } from "@/lib/sesion/verificar";
import { VERSION_POLITICA } from "./consentimiento";
import { estadoConsentimiento, exigirConsentimiento, filasDePersona, registrar, validarPedido, type Pedido } from "./servidor";

let db: Db;
beforeEach(async () => {
  db = (await crearPglite()) as unknown as Db;
});

const privy = (idExterno: string, email: string): Verificada => ({
  prueba: false,
  identidad: { proveedor: "privy", idExterno, email, emailVerificado: true },
});
const neon = (idExterno: string, email: string): Verificada => ({
  prueba: false,
  identidad: { proveedor: "neon-auth", idExterno, email, emailVerificado: true },
});
const deLaPrueba = (email: string): Verificada => ({
  prueba: true,
  identidad: { proveedor: "privy", idExterno: `prueba:${email}`, email, emailVerificado: true },
});

const pedido = (extra: Partial<Pedido> = {}): Pedido => ({
  accion: "acepta",
  canal: "alta",
  version: VERSION_POLITICA,
  aceptadoEnCliente: new Date("2026-11-23T10:00:00.000Z"),
  novedades: "sin-cambio",
  ...extra,
});

async function totales() {
  const [p] = await db.select({ n: count() }).from(personas);
  const [c] = await db.select({ n: count() }).from(cuentas);
  const [k] = await db.select({ n: count() }).from(consentimientos);
  return { personas: p!.n, cuentas: c!.n, consentimientos: k!.n };
}

async function filas(personaId: string) {
  return db.select().from(consentimientos).where(eq(consentimientos.personaId, personaId)).orderBy(consentimientos.registradoAt);
}

describe("validarPedido", () => {
  const base = { accion: "acepta", canal: "alta", version: VERSION_POLITICA };
  const hora = (min: number) => new Date(Date.parse("2026-11-23T10:00:00.000Z") + min * 60_000).toISOString();

  it("acepta un pedido sin aceptación previa", () => {
    expect(validarPedido(base)).toMatchObject({ ok: true, pedido: { accion: "acepta", novedades: "sin-cambio", aceptadoEnCliente: null } });
  });

  it("rechaza una versión que no es la vigente", () => {
    expect(validarPedido({ ...base, version: "0.0" }).ok).toBe(false);
  });

  it("rechaza una acción, un canal o unas novedades desconocidos y un cuerpo que no es un objeto", () => {
    expect(validarPedido({ ...base, accion: "borra" }).ok).toBe(false);
    expect(validarPedido({ ...base, canal: "otro" }).ok).toBe(false);
    expect(validarPedido({ ...base, novedades: "tal vez" }).ok).toBe(false);
    expect(validarPedido(null).ok).toBe(false);
    expect(validarPedido([]).ok).toBe(false);
  });

  it("rechaza una aceptación de hace 6 minutos y acepta una de 1 minuto", () => {
    expect(validarPedido({ ...base, aceptadoEnCliente: hora(0), enviadoEnCliente: hora(6) }).ok).toBe(false);
    expect(validarPedido({ ...base, aceptadoEnCliente: hora(0), enviadoEnCliente: hora(1) }).ok).toBe(true);
    expect(validarPedido({ ...base, aceptadoEnCliente: hora(0), enviadoEnCliente: hora(5) }).ok).toBe(true);
  });

  it("mide con el reloj del navegador contra sí mismo: un reloj 10 minutos atrasado no deja a nadie afuera", () => {
    // Las dos horas están 10 minutos antes que la del servidor (que acá no se mira): igual vale lo que pasó entre ellas.
    const atrasada = (min: number) => new Date(Date.now() - 10 * 60_000 + min * 60_000).toISOString();
    expect(validarPedido({ ...base, aceptadoEnCliente: atrasada(0), enviadoEnCliente: atrasada(1) }).ok).toBe(true);
    expect(validarPedido({ ...base, aceptadoEnCliente: atrasada(0), enviadoEnCliente: atrasada(6) }).ok).toBe(false);
  });

  it("rechaza una aceptación en el futuro del envío (diferencia negativa) y una sin hora de envío", () => {
    expect(validarPedido({ ...base, aceptadoEnCliente: hora(2), enviadoEnCliente: hora(1) }).ok).toBe(false);
    expect(validarPedido({ ...base, aceptadoEnCliente: hora(0) }).ok).toBe(false);
    expect(validarPedido({ ...base, aceptadoEnCliente: "no es una fecha", enviadoEnCliente: hora(1) }).ok).toBe(false);
  });
});

describe("registrar: alta y persona nueva", () => {
  it("una persona nueva nace con su cuenta y sus dos filas acepta, juntas", async () => {
    const r = await registrar(db, privy("did:privy:nueva", "Nueva@Prueba.test"), {}, pedido());
    expect(r).toMatchObject({ ok: true, estado: { general: "vigente", canal: "alta", version: VERSION_POLITICA } });
    expect(await totales()).toEqual({ personas: 1, cuentas: 1, consentimientos: 2 });
    const [p] = await db.select().from(personas);
    expect(p).toMatchObject({ email: "nueva@prueba.test", rol: "persona" });
    const [c] = await db.select().from(cuentas);
    expect(c).toMatchObject({ personaId: p!.id, proveedor: "privy", idExterno: "did:privy:nueva", emailVerificado: "nueva@prueba.test" });
    const f = await filas(p!.id);
    expect(f.map((x) => [x.tipo, x.evento, x.canal, x.version]).sort()).toEqual([
      ["politica", "acepta", "alta", VERSION_POLITICA],
      ["terminos", "acepta", "alta", VERSION_POLITICA],
    ]);
    expect(f[0]!.aceptadoEnCliente?.toISOString()).toBe("2026-11-23T10:00:00.000Z");
  });

  it("con un error forzado dentro de la transacción no queda nada en personas, cuentas ni consentimientos", async () => {
    await expect(
      registrar(db, privy("did:privy:falla", "falla@prueba.test"), {}, pedido(), {
        alInsertarPersona: () => {
          throw new Error("falla forzada");
        },
      }),
    ).rejects.toThrow("falla forzada");
    expect(await totales()).toEqual({ personas: 0, cuentas: 0, consentimientos: 0 });
  });

  it("una persona nueva en el modo de prueba no escribe cuentas", async () => {
    await registrar(db, deLaPrueba("nueva@prueba.test"), {}, pedido());
    expect(await totales()).toEqual({ personas: 1, cuentas: 0, consentimientos: 2 });
  });

  it("una persona cargada por el equipo solo recibe su fila de cuentas", async () => {
    const [equipo] = await db.insert(personas).values({ email: "equipo@prueba.test", rol: "admin-tribu", tribuAdmin: "valle" }).returning();
    const r = await registrar(db, privy("did:privy:equipo", "Equipo@prueba.test"), {}, pedido({ canal: "al-entrar" }));
    expect(r).toMatchObject({ ok: true, personaId: equipo!.id });
    expect(await totales()).toEqual({ personas: 1, cuentas: 1, consentimientos: 2 });
    const [c] = await db.select().from(cuentas);
    expect(c!.personaId).toBe(equipo!.id);
    const [p] = await db.select().from(personas);
    expect(p).toMatchObject({ rol: "admin-tribu", tribuAdmin: "valle" });
  });

  it("con la lista cerrada una persona nueva no se crea", async () => {
    const r = await registrar(db, privy("did:privy:fuera", "fuera@prueba.test"), { LH_ACCESO: "lista" }, pedido());
    expect(r).toEqual({ ok: false, motivo: "sin-acceso" });
    expect(await totales()).toEqual({ personas: 0, cuentas: 0, consentimientos: 0 });
  });

  it("un retiro de quien nunca aceptó no escribe nada", async () => {
    const r = await registrar(db, privy("did:privy:nadie", "nadie@prueba.test"), {}, pedido({ accion: "retira", canal: "mis-datos" }));
    expect(r).toMatchObject({ ok: true, estado: { general: "pendiente" } });
    expect(await totales()).toEqual({ personas: 0, cuentas: 0, consentimientos: 0 });
  });

  it("la persona que aceptó con privy y entra con neon-auth y el mismo email verificado sigue vigente", async () => {
    await registrar(db, privy("did:privy:ana", "ana@prueba.test"), {}, pedido());
    const [ana] = await db.select().from(personas);
    // Con la cuenta nueva no hay que volver a aceptar: la cuenta de Neon Auth se vincula por email (`/api/sesion`) y manda la persona.
    const cuentasAntes = (await totales()).cuentas;
    const exigido = await exigirConsentimiento({ verificada: neon("neon-1", "ANA@prueba.test") }, db);
    expect(exigido).toEqual({ ok: true, personaId: ana!.id });
    // `exigirConsentimiento` solo lee: no vinculó la cuenta nueva.
    expect((await totales()).cuentas).toBe(cuentasAntes);
    // Y `registrar` con esa identidad la vincula en su transacción, sin duplicar filas ni personas.
    const r = await registrar(db, neon("neon-1", "ana@prueba.test"), {}, pedido({ canal: "al-entrar" }));
    expect(r).toMatchObject({ ok: true, personaId: ana!.id, estado: { general: "vigente" } });
    expect(await totales()).toEqual({ personas: 1, cuentas: 2, consentimientos: 2 });
  });
});

describe("registrar: doble envío, novedades y retiro", () => {
  it("dos envíos iguales seguidos dejan dos filas, no cuatro", async () => {
    const v = privy("did:privy:doble", "doble@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido());
    expect((await totales()).consentimientos).toBe(2);
  });

  it("aceptar, retirar y volver a aceptar seguidos sí escribe cada cambio", async () => {
    const v = privy("did:privy:vaiven", "vaiven@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    const r = await registrar(db, v, {}, pedido());
    expect(r).toMatchObject({ ok: true, estado: { general: "vigente" } });
    expect((await totales()).consentimientos).toBe(6);
  });

  it("la primera elección de novedades se escribe, marcada o no", async () => {
    const a = privy("did:privy:a", "a@prueba.test");
    const b = privy("did:privy:b", "b@prueba.test");
    expect(await registrar(db, a, {}, pedido({ novedades: "acepta" }))).toMatchObject({ ok: true, estado: { novedades: true } });
    expect(await registrar(db, b, {}, pedido({ novedades: "retira" }))).toMatchObject({
      ok: true,
      estado: { novedades: false, novedadesRegistro: { evento: "retira", canal: "alta" } },
    });
  });

  it("la casilla del paso sin marcar no pisa una elección anterior", async () => {
    const v = privy("did:privy:no-pisa", "nopisa@prueba.test");
    await registrar(db, v, {}, pedido({ novedades: "acepta" }));
    const [p] = await db.select().from(personas);
    const antes = (await filas(p!.id)).length;
    // Entra de nuevo con la versión vigente y sin marcar la casilla (o sin cambio): no se escribe ninguna fila.
    await registrar(db, v, {}, pedido({ canal: "al-entrar", novedades: "retira" }));
    await registrar(db, v, {}, pedido({ canal: "al-entrar", novedades: "sin-cambio" }));
    await registrar(db, v, {}, pedido({ canal: "al-entrar", novedades: "acepta" }));
    expect((await filas(p!.id)).length).toBe(antes);
    expect((await estadoConsentimiento(db, p!.id)).novedades).toBe(true);
  });

  it("desde Mis datos la persona sí puede dar de baja y volver a pedir las novedades", async () => {
    const v = privy("did:privy:baja", "baja@prueba.test");
    await registrar(db, v, {}, pedido({ novedades: "acepta" }));
    const [p] = await db.select().from(personas);
    await registrar(db, v, {}, pedido({ canal: "mis-datos", novedades: "retira" }));
    expect((await estadoConsentimiento(db, p!.id)).novedades).toBe(false);
    await registrar(db, v, {}, pedido({ canal: "mis-datos", novedades: "acepta" }));
    expect(await estadoConsentimiento(db, p!.id)).toMatchObject({ novedades: true, novedadesRegistro: { canal: "mis-datos" } });
  });

  it("desde Mis datos no se acepta el general a escondidas", async () => {
    const v = privy("did:privy:sin", "sin@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    const antes = await totales();
    const r = await registrar(db, v, {}, pedido({ canal: "mis-datos", novedades: "acepta" }));
    expect(r).toEqual({ ok: false, motivo: "sin-consentimiento" });
    expect(await totales()).toEqual(antes);
  });

  it("retirar agrega filas retira (novedades, política, términos en ese orden) y no toca las anteriores", async () => {
    const v = privy("did:privy:retira", "retira@prueba.test");
    await registrar(db, v, {}, pedido({ novedades: "acepta" }));
    const [p] = await db.select().from(personas);
    const antes = await filas(p!.id);
    expect(antes).toHaveLength(3);
    const r = await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    expect(r).toMatchObject({ ok: true, estado: { general: "retirado", novedades: false } });
    const despues = await filas(p!.id);
    expect(despues).toHaveLength(6);
    // Las filas de antes siguen idénticas (mismo id, mismo evento).
    for (const a of antes) expect(despues.find((d) => d.id === a.id)).toMatchObject({ evento: "acepta", tipo: a.tipo });
    const nuevas = despues.slice(3);
    expect(nuevas.map((n) => `${n.tipo}:${n.evento}`)).toEqual(["novedades:retira", "politica:retira", "terminos:retira"]);
    expect(nuevas.every((n) => n.canal === "mis-datos")).toBe(true);
  });

  it("retirar sin novedades aceptadas solo retira política y términos", async () => {
    const v = privy("did:privy:solo", "solo@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    const [p] = await db.select().from(personas);
    expect((await filas(p!.id)).map((f) => `${f.tipo}:${f.evento}`).sort()).toEqual([
      "politica:acepta",
      "politica:retira",
      "terminos:acepta",
      "terminos:retira",
    ]);
  });

  it("la base rechaza UPDATE y DELETE sobre el libro (heredado de base-neon)", async () => {
    await registrar(db, privy("did:privy:libro", "libro@prueba.test"), {}, pedido());
    await expect(db.update(consentimientos).set({ evento: "retira" })).rejects.toThrow();
    await expect(db.delete(consentimientos)).rejects.toThrow();
    expect((await totales()).consentimientos).toBe(2);
  });
});

describe("estadoConsentimiento", () => {
  it("sin persona o sin filas es pendiente", async () => {
    expect(await estadoConsentimiento(db, null)).toMatchObject({ general: "pendiente", novedades: false, version: null });
    const [p] = await db.insert(personas).values({ email: "vacia@prueba.test" }).returning();
    expect(await estadoConsentimiento(db, p!.id)).toMatchObject({ general: "pendiente", registradoAt: null });
  });

  it("una aceptación de otra versión es pendiente y deja ver cuál era", async () => {
    const [p] = await db.insert(personas).values({ email: "vieja@prueba.test" }).returning();
    for (const tipo of ["politica", "terminos"] as const) {
      await db.insert(consentimientos).values({ personaId: p!.id, tipo, evento: "acepta", version: "0.1-vieja", canal: "alta" });
    }
    expect(await estadoConsentimiento(db, p!.id)).toMatchObject({ general: "pendiente", version: "0.1-vieja", canal: "alta" });
  });

  it("filasDePersona devuelve todas las filas, también los retiros", async () => {
    const v = privy("did:privy:filas", "filas@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    const [p] = await db.select().from(personas);
    expect(await filasDePersona(db, p!.id)).toHaveLength(4);
  });
});

describe("exigirConsentimiento", () => {
  const cuerpo = async (r: Response) => ({ estado: r.status, json: await r.json() });

  it("sin fila en personas es 403 con { consentimiento: false }", async () => {
    const r = await exigirConsentimiento({ verificada: privy("did:privy:x", "x@prueba.test") }, db);
    expect(r).toBeInstanceOf(Response);
    expect(await cuerpo(r as Response)).toEqual({ estado: 403, json: { consentimiento: false } });
  });

  it("con una versión vieja es 403", async () => {
    const [p] = await db.insert(personas).values({ email: "v@prueba.test" }).returning();
    await db.insert(cuentas).values({ personaId: p!.id, proveedor: "privy", idExterno: "did:privy:v", emailVerificado: "v@prueba.test" });
    for (const tipo of ["politica", "terminos"] as const) {
      await db.insert(consentimientos).values({ personaId: p!.id, tipo, evento: "acepta", version: "0.1-vieja" });
    }
    const r = await exigirConsentimiento({ verificada: privy("did:privy:v", "v@prueba.test") }, db);
    expect(r).toBeInstanceOf(Response);
    expect((r as Response).status).toBe(403);
  });

  it("con el consentimiento vigente devuelve el id de la persona", async () => {
    await registrar(db, privy("did:privy:ok", "ok@prueba.test"), {}, pedido());
    const [p] = await db.select().from(personas);
    expect(await exigirConsentimiento({ verificada: privy("did:privy:ok", "ok@prueba.test") }, db)).toEqual({ ok: true, personaId: p!.id });
  });

  it("retirado es 403", async () => {
    const v = privy("did:privy:ret", "ret@prueba.test");
    await registrar(db, v, {}, pedido());
    await registrar(db, v, {}, pedido({ accion: "retira", canal: "mis-datos" }));
    expect(await exigirConsentimiento({ verificada: v }, db)).toBeInstanceOf(Response);
  });

  it("nunca escribe: una persona del equipo sin cuenta vinculada sigue sin fila en cuentas", async () => {
    const [p] = await db.insert(personas).values({ email: "equipo@prueba.test" }).returning();
    for (const tipo of ["politica", "terminos"] as const) {
      await db.insert(consentimientos).values({ personaId: p!.id, tipo, evento: "acepta", version: VERSION_POLITICA });
    }
    const antes = await totales();
    const r = await exigirConsentimiento({ verificada: privy("did:privy:equipo", "equipo@prueba.test") }, db);
    expect(r).toEqual({ ok: true, personaId: p!.id });
    expect(await totales()).toEqual(antes);
    expect(antes.cuentas).toBe(0);
  });

  it("encontrada por email con otra cuenta del mismo proveedor ya vinculada es 403 y no escribe", async () => {
    await registrar(db, privy("did:privy:primera", "dos@prueba.test"), {}, pedido());
    const antes = await totales();
    const r = await exigirConsentimiento({ verificada: privy("did:privy:segunda", "dos@prueba.test") }, db, () => {});
    expect(r).toBeInstanceOf(Response);
    expect(await totales()).toEqual(antes);
  });

  it("en el modo de prueba se resuelve por email", async () => {
    await registrar(db, deLaPrueba("prueba@prueba.test"), {}, pedido());
    const [p] = await db.select().from(personas);
    expect(await exigirConsentimiento({ verificada: deLaPrueba("prueba@prueba.test") }, db)).toEqual({ ok: true, personaId: p!.id });
  });

  it("una persona sin acceso es 403 aunque haya aceptado", async () => {
    await registrar(db, privy("did:privy:cerrada", "cerrada@prueba.test"), {}, pedido());
    await db.update(personas).set({ acceso: false }).where(sql`true`);
    expect(await exigirConsentimiento({ verificada: privy("did:privy:cerrada", "cerrada@prueba.test") }, db)).toBeInstanceOf(Response);
  });
});
