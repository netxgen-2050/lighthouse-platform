import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/cliente";
import { crearPglite } from "@/lib/db/pglite";
import { personas, reservas } from "@/lib/db/schema";
import type { LoVisto } from "./compra";
import {
  borrarActividadDeReservas,
  comprasDePersona,
  deshacer,
  deshacerEn,
  estadosDeLotes,
  eventosDePersona,
  leerOrigen,
  origenDePersona,
  pagar,
  reservar,
  reservarEn,
  validarCuerpo,
  type Cuerpo,
} from "./servidor";

let db: Db;
beforeEach(async () => {
  db = (await crearPglite()) as unknown as Db;
});

async function persona(email: string, rol: "persona" | "superadmin" = "persona") {
  const [p] = await db.insert(personas).values({ email, rol }).returning();
  return p!;
}

const vio: LoVisto = { precio: 100, aporte: 5, expensa: 2, version: "v1" };
type Reservar = Extract<Cuerpo, { accion: "reservar" }>;
const pedido = (loteId: string, extra: Partial<Reservar> = {}): Reservar => ({ accion: "reservar", loteId, opcion: "solo-lote", vio, origen: null, ...extra });
const comun = (personaId: string) => ({ personaId, esSuperAdmin: false });

describe("validarCuerpo", () => {
  it("acepta reservar, pagar y deshacer de un lote del loteo", () => {
    expect(validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "modular", vio })).toMatchObject({ ok: true, cuerpo: { accion: "reservar", opcion: "modular", origen: null } });
    expect(validarCuerpo({ accion: "pagar", loteId: "lote-7" })).toEqual({ ok: true, cuerpo: { accion: "pagar", loteId: "lote-7" } });
    expect(validarCuerpo({ accion: "deshacer", loteId: "lote-7" })).toEqual({ ok: true, cuerpo: { accion: "deshacer", loteId: "lote-7" } });
  });

  it("rechaza acción, lote, opción, vio y origen inválidos", () => {
    expect(validarCuerpo(null).ok).toBe(false);
    expect(validarCuerpo({ accion: "regalar", loteId: "lote-7" }).ok).toBe(false);
    expect(validarCuerpo({ accion: "pagar", loteId: "lote-9999" }).ok).toBe(false);
    expect(validarCuerpo({ accion: "pagar" }).ok).toBe(false);
    expect(validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "mansion", vio }).ok).toBe(false);
    expect(validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote" }).ok).toBe(false);
    expect(validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio: { ...vio, precio: "mucho" } }).ok).toBe(false);
    expect(validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio, origen: "web" }).ok).toBe(false);
  });

  it("descarta los campos desconocidos de vio y rechaza un vio de más de 4 KB", () => {
    const r = validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio: { ...vio, email: "a@b.test" } });
    expect(r.ok && r.cuerpo.accion === "reservar" && "email" in r.cuerpo.vio).toBe(false);
    const grande = validarCuerpo({ accion: "reservar", loteId: "lote-7", opcion: "solo-lote", vio: { ...vio, fuente: "x".repeat(5000) } });
    expect(grande.ok).toBe(false);
  });

  it("el origen copia solo los campos conocidos", () => {
    expect(leerOrigen({ fuente: "a", medio: "b", otro: "c" })).toEqual({ fuente: "a", medio: "b" });
    expect(leerOrigen({})).toBeNull();
    expect(leerOrigen(undefined)).toBeNull();
    expect(leerOrigen({ fuente: 3 })).toBe("invalido");
    expect(leerOrigen({ fuente: "x".repeat(300) })).toBe("invalido");
  });
});

describe("reservar, pagar y deshacer", () => {
  it("reservar escribe una fila con la persona, quién la agregó, la opción y lo que vio", async () => {
    const a = await persona("a@prueba.test");
    expect(await reservar(db, a.id, pedido("lote-7", { opcion: "familiar" }))).toEqual({ ok: true });
    const [f] = await db.select().from(reservas);
    expect(f).toMatchObject({ personaId: a.id, hechoPor: a.id, loteId: "lote-7", evento: "reserva", opcion: "familiar", vio });
    const compras = await comprasDePersona(db, a.id);
    expect(compras).toHaveLength(1);
    expect(compras[0]).toMatchObject({ loteId: "lote-7", opcion: "familiar", paso: "reservado", vio });
    expect(compras[0]?.pagadoEl).toBeUndefined();
  });

  it("pagar deja el lote pagado y conserva la opción y lo que vio", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7", { opcion: "amplia" }));
    expect(await pagar(db, a.id, "lote-7")).toEqual({ ok: true });
    const [c] = await comprasDePersona(db, a.id);
    expect(c).toMatchObject({ opcion: "amplia", paso: "pagado", vio });
    expect(c?.pagadoEl).toBeTruthy();
    expect((await estadosDeLotes(db))["lote-7"]).toBe("vendido");
  });

  it("deshacer libera el lote y la fila anterior sigue en el libro", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    expect(await deshacer(db, comun(a.id), "lote-7")).toEqual({ ok: true });
    expect(await comprasDePersona(db, a.id)).toEqual([]);
    expect((await estadosDeLotes(db))["lote-7"]).toBeUndefined();
    expect(await db.select().from(reservas)).toHaveLength(2);
    // Se puede volver a reservar.
    expect(await reservar(db, a.id, pedido("lote-7"))).toEqual({ ok: true });
  });

  it("dos reservas del mismo lote a la vez: una gana y la otra da ya-reservado", async () => {
    const a = await persona("a@prueba.test");
    const b = await persona("b@prueba.test");
    const r = await Promise.all([reservar(db, a.id, pedido("lote-7")), reservar(db, b.id, pedido("lote-7"))]);
    expect(r.filter((x) => x.ok)).toHaveLength(1);
    expect(r.filter((x) => !x.ok)).toEqual([{ ok: false, motivo: "ya-reservado" }]);
    expect((await db.select().from(reservas)).filter((f) => f.evento === "reserva")).toHaveLength(1);
  });

  it("reservar lo que ya reservaste vos también da ya-reservado", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    expect(await reservar(db, a.id, pedido("lote-7"))).toEqual({ ok: false, motivo: "ya-reservado" });
  });

  it("un lote de ejemplo vendido o reservado da no-disponible y no escribe", async () => {
    const a = await persona("a@prueba.test");
    expect(await reservar(db, a.id, pedido("lote-13"))).toEqual({ ok: false, motivo: "no-disponible" });
    expect(await reservar(db, a.id, pedido("lote-5"))).toEqual({ ok: false, motivo: "no-disponible" });
    expect(await db.select().from(reservas)).toHaveLength(0);
  });

  it("pagar lo ajeno o lo que no está reservado da no-reservado y no escribe", async () => {
    const a = await persona("a@prueba.test");
    const b = await persona("b@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    expect(await pagar(db, b.id, "lote-7")).toEqual({ ok: false, motivo: "no-reservado" });
    expect(await pagar(db, b.id, "lote-8")).toEqual({ ok: false, motivo: "no-reservado" });
    await pagar(db, a.id, "lote-7");
    expect(await pagar(db, a.id, "lote-7")).toEqual({ ok: false, motivo: "no-reservado" });
    expect(await db.select().from(reservas)).toHaveLength(2);
  });

  it("deshacer sin nada vigente es un no-op", async () => {
    const a = await persona("a@prueba.test");
    expect(await deshacer(db, comun(a.id), "lote-7")).toEqual({ ok: true });
    await reservar(db, a.id, pedido("lote-7"));
    await deshacer(db, comun(a.id), "lote-7");
    expect(await deshacer(db, comun(a.id), "lote-7")).toEqual({ ok: true });
    expect(await db.select().from(reservas)).toHaveLength(2);
  });

  it("el super admin libera con hecho_por propio y persona_id del titular", async () => {
    const a = await persona("a@prueba.test");
    const s = await persona("s@prueba.test", "superadmin");
    await reservar(db, a.id, pedido("lote-7"));
    expect(await deshacer(db, { personaId: s.id, esSuperAdmin: true }, "lote-7")).toEqual({ ok: true });
    const ultima = (await db.select().from(reservas).orderBy(sql`registrado_at desc`).limit(1))[0]!;
    expect(ultima).toMatchObject({ evento: "deshace", personaId: a.id, hechoPor: s.id });
    expect((await estadosDeLotes(db))["lote-7"]).toBeUndefined();
    expect(await comprasDePersona(db, a.id)).toEqual([]);
  });

  it("una persona común no puede deshacer lo ajeno", async () => {
    const a = await persona("a@prueba.test");
    const b = await persona("b@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    expect(await deshacer(db, comun(b.id), "lote-7")).toEqual({ ok: false, motivo: "sin-permiso" });
    expect(await comprasDePersona(db, a.id)).toHaveLength(1);
    expect(await db.select().from(reservas)).toHaveLength(1);
  });

  it("la hora de cada fila es la del insert (clock_timestamp), no la del inicio de la transacción", async () => {
    const a = await persona("a@prueba.test");
    await db.transaction(async (tx) => {
      const r = await tx.execute(sql`select now() as inicio`);
      const inicio = String((r.rows[0] as { inicio: unknown }).inicio);
      await tx.execute(sql`select pg_sleep(0.05)`);
      await reservarEn(tx, a.id, pedido("lote-7"));
      const [f] = await tx.select().from(reservas);
      expect(f!.registradoAt.getTime()).toBeGreaterThan(new Date(inicio).getTime());
    });
  });

  it("reserva, deshace y reserva de otra persona en la misma transacción terminan con el lote reservado (orden por hora real)", async () => {
    const a = await persona("a@prueba.test");
    const b = await persona("b@prueba.test");
    // Con now() las tres filas tendrían la misma hora y "el último evento" sería cualquiera.
    await db.transaction(async (tx) => {
      await reservarEn(tx, a.id, pedido("lote-7"));
      await deshacerEn(tx, comun(a.id), "lote-7");
      expect(await reservarEn(tx, b.id, pedido("lote-7"))).toEqual({ ok: true });
    });
    expect((await estadosDeLotes(db))["lote-7"]).toBe("reservado");
    expect(await comprasDePersona(db, b.id)).toHaveLength(1);
  });
});

describe("estados", () => {
  it("combina los estados de ejemplo con el libro y no trae ninguna identidad", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    await reservar(db, a.id, pedido("lote-8"));
    await pagar(db, a.id, "lote-8");
    const e = await estadosDeLotes(db);
    expect(e).toMatchObject({ "lote-5": "reservado", "lote-13": "vendido", "lote-18": "reservado", "lote-7": "reservado", "lote-8": "vendido" });
    const texto = JSON.stringify(e);
    expect(texto).not.toContain(a.id);
    expect(texto).not.toContain("@");
  });

  it("un libro vacío trae solo los de ejemplo", async () => {
    expect(await estadosDeLotes(db)).toEqual({ "lote-5": "reservado", "lote-13": "vendido", "lote-18": "reservado" });
  });
});

describe("origen de la persona", () => {
  it("personas.origen se escribe solo si es null", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7", { origen: { fuente: "primera" } }));
    await reservar(db, a.id, pedido("lote-8", { origen: { fuente: "segunda" } }));
    expect(await origenDePersona(db, a.id)).toEqual({ fuente: "primera" });
    // La fila de la reserva sí guarda el suyo.
    const filas = await db.select().from(reservas).where(eq(reservas.loteId, "lote-8"));
    expect(filas[0]?.origen).toEqual({ fuente: "segunda" });
  });
});

describe("Mis datos", () => {
  it("los eventos de la persona incluyen deshace y marcan lo que liberó el equipo sin dar su id", async () => {
    const a = await persona("a@prueba.test");
    const s = await persona("s@prueba.test", "superadmin");
    await reservar(db, a.id, pedido("lote-7"));
    await deshacer(db, { personaId: s.id, esSuperAdmin: true }, "lote-7");
    const e = await eventosDePersona(db, a.id);
    expect(e.map((x) => [x.evento, x.liberadoPorElEquipo])).toEqual([
      ["reserva", false],
      ["deshace", true],
    ]);
    expect(JSON.stringify(e)).not.toContain(s.id);
  });

  it("borrar libera los lotes vigentes, deja el libro y pone el origen en null; lo ajeno no se toca", async () => {
    const a = await persona("a@prueba.test");
    const b = await persona("b@prueba.test");
    await reservar(db, a.id, pedido("lote-7", { origen: { fuente: "x" } }));
    await reservar(db, a.id, pedido("lote-8"));
    await pagar(db, a.id, "lote-8");
    await reservar(db, a.id, pedido("lote-9"));
    await deshacer(db, comun(a.id), "lote-9");
    await reservar(db, b.id, pedido("lote-9"));
    await borrarActividadDeReservas(db, a.id);
    expect(await comprasDePersona(db, a.id)).toEqual([]);
    const e = await estadosDeLotes(db);
    expect(e["lote-7"]).toBeUndefined();
    expect(e["lote-8"]).toBeUndefined();
    expect(e["lote-9"]).toBe("reservado");
    expect(await comprasDePersona(db, b.id)).toHaveLength(1);
    expect(await origenDePersona(db, a.id)).toBeNull();
    // Las filas anteriores de A siguen: lote-7 (1), lote-8 (2), lote-9 (2) y los dos deshace del borrado.
    const deA = await db.select().from(reservas).where(eq(reservas.personaId, a.id));
    expect(deA.length).toBe(7);
  });

  it("deshacerEn respeta un pago hecho entre la lectura y el lock", async () => {
    const a = await persona("a@prueba.test");
    await reservar(db, a.id, pedido("lote-7"));
    await pagar(db, a.id, "lote-7");
    await db.transaction((tx) => deshacerEn(tx, comun(a.id), "lote-7"));
    expect(await comprasDePersona(db, a.id)).toEqual([]);
  });
});
