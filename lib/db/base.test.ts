import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { bitacora, contactos, cuentas, consentimientos, personas, reservas } from "./schema";
import { crearPglite } from "./pglite";

let base: Awaited<ReturnType<typeof crearPglite>>;
beforeAll(async () => {
  base = await crearPglite();
});

async function persona(email: string) {
  const [p] = await base.insert(personas).values({ email }).returning();
  return p!;
}

describe("las migraciones", () => {
  it("crean las cuatro tablas", async () => {
    const r = await base.execute(sql`select table_name from information_schema.tables where table_schema = 'public'`);
    const nombres = r.rows.map((f) => f.table_name);
    for (const t of ["personas", "cuentas", "cambios_de_rol", "consentimientos"]) expect(nombres).toContain(t);
  });

  it("personas no tiene ninguna columna con privy en el nombre", async () => {
    const r = await base.execute(sql`select column_name from information_schema.columns where table_name = 'personas'`);
    expect(r.rows.map((f) => String(f.column_name)).filter((c) => c.includes("privy"))).toEqual([]);
  });

  it("el email es único sin importar mayúsculas", async () => {
    await persona("unico@prueba.test");
    await expect(persona("UNICO@prueba.test")).rejects.toThrow();
  });

  it("ningún archivo importa drizzle-orm/neon-http", () => {
    const visitar = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        if (["node_modules", ".next", ".carriles", ".git"].includes(n)) return [];
        const p = path.join(dir, n);
        if (statSync(p).isDirectory()) return visitar(p);
        return /\.(ts|tsx|mts)$/.test(n) && !n.endsWith("base.test.ts") ? [p] : [];
      });
    const culpables = [...visitar(path.join(process.cwd(), "lib")), ...visitar(path.join(process.cwd(), "app")), ...visitar(path.join(process.cwd(), "scripts"))].filter(
      (f) => readFileSync(f, "utf8").includes("neon-http"),
    );
    expect(culpables).toEqual([]);
  });
});

describe("consentimientos (libro de solo agregar)", () => {
  it("acepta filas válidas con todas las columnas", async () => {
    const p = await persona("consent@prueba.test");
    await base.insert(consentimientos).values({ personaId: p.id, tipo: "politica", evento: "acepta", version: "1", canal: "alta", idioma: "en" });
    await base.insert(consentimientos).values({ personaId: p.id, tipo: "novedades", evento: "acepta", version: "1", canal: "mis-datos" });
    const filas = await base.select().from(consentimientos).where(eq(consentimientos.personaId, p.id));
    expect(filas).toHaveLength(2);
    expect(filas[0]).toHaveProperty("aceptadoEnCliente");
    expect(filas.find((f) => f.tipo === "novedades")?.idioma).toBeNull();
  });

  it("UPDATE y DELETE fallan y la fila queda igual", async () => {
    const p = await persona("libro@prueba.test");
    await base.insert(consentimientos).values({ personaId: p.id, tipo: "terminos", evento: "acepta", version: "1" });
    await expect(base.update(consentimientos).set({ version: "2" }).where(eq(consentimientos.personaId, p.id))).rejects.toThrow();
    await expect(base.delete(consentimientos).where(eq(consentimientos.personaId, p.id))).rejects.toThrow();
    const filas = await base.select().from(consentimientos).where(eq(consentimientos.personaId, p.id));
    expect(filas).toHaveLength(1);
    expect(filas[0]?.version).toBe("1");
  });

  it("TRUNCATE consentimientos y TRUNCATE personas CASCADE fallan y las filas siguen", async () => {
    const antes = (await base.select().from(consentimientos)).length;
    await expect(base.execute(sql`truncate consentimientos`)).rejects.toThrow();
    await expect(base.execute(sql`truncate personas cascade`)).rejects.toThrow();
    expect((await base.select().from(consentimientos)).length).toBe(antes);
    expect((await base.select().from(personas)).length).toBeGreaterThan(0);
  });

  it("rechaza tipo marketing e idioma fr", async () => {
    const p = await persona("fuera@prueba.test");
    await expect(
      base.execute(sql`insert into consentimientos (persona_id, tipo, evento, version) values (${p.id}, 'marketing', 'acepta', '1')`),
    ).rejects.toThrow();
    await expect(
      base.execute(sql`insert into consentimientos (persona_id, tipo, evento, version, idioma) values (${p.id}, 'politica', 'acepta', '1', 'fr')`),
    ).rejects.toThrow();
  });

  it("no se puede borrar una persona con consentimientos", async () => {
    const p = await persona("conserva@prueba.test");
    await base.insert(consentimientos).values({ personaId: p.id, tipo: "politica", evento: "acepta", version: "1" });
    await expect(base.delete(personas).where(eq(personas.id, p.id))).rejects.toThrow();
  });
});

describe("reservas y bitácora (libros) y contactos", () => {
  it("las tablas y la columna personas.origen existen", async () => {
    const r = await base.execute(sql`select table_name from information_schema.tables where table_schema = 'public'`);
    const nombres = r.rows.map((f) => f.table_name);
    for (const t of ["reservas", "contactos", "bitacora"]) expect(nombres).toContain(t);
    const c = await base.execute(sql`select column_name from information_schema.columns where table_name = 'personas' and column_name = 'origen'`);
    expect(c.rows).toHaveLength(1);
  });

  it("reservas: UPDATE, DELETE y TRUNCATE fallan y la fila queda igual", async () => {
    const p = await persona("libro-reservas@prueba.test");
    await base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-7", evento: "reserva", opcion: "solo-lote", vio: { version: "x" } });
    await expect(base.update(reservas).set({ loteId: "lote-8" }).where(eq(reservas.personaId, p.id))).rejects.toThrow();
    await expect(base.delete(reservas).where(eq(reservas.personaId, p.id))).rejects.toThrow();
    await expect(base.execute(sql`truncate reservas`)).rejects.toThrow();
    const filas = await base.select().from(reservas).where(eq(reservas.personaId, p.id));
    expect(filas).toHaveLength(1);
    expect(filas[0]?.loteId).toBe("lote-7");
  });

  it("bitácora: UPDATE, DELETE y TRUNCATE fallan y la fila queda igual", async () => {
    const p = await persona("libro-bitacora@prueba.test");
    await base.insert(bitacora).values({ personaId: p.id, ruta: "/lotes", tipo: "estado-loteo", clave: "k", mostrado: "m", huella: "h" });
    await expect(base.update(bitacora).set({ mostrado: "otro" }).where(eq(bitacora.personaId, p.id))).rejects.toThrow();
    await expect(base.delete(bitacora).where(eq(bitacora.personaId, p.id))).rejects.toThrow();
    await expect(base.execute(sql`truncate bitacora`)).rejects.toThrow();
    const filas = await base.select().from(bitacora).where(eq(bitacora.personaId, p.id));
    expect(filas).toHaveLength(1);
    expect(filas[0]?.mostrado).toBe("m");
  });

  it("contactos no es un libro: DELETE sí funciona", async () => {
    const p = await persona("contactos@prueba.test");
    await base.insert(contactos).values({ personaId: p.id, motivo: "consulta", canal: "email" });
    await base.delete(contactos).where(eq(contactos.personaId, p.id));
    expect(await base.select().from(contactos).where(eq(contactos.personaId, p.id))).toHaveLength(0);
  });

  it("una reserva sin opción o sin lo que la persona vio se rechaza; paga y deshace no la necesitan", async () => {
    const p = await persona("check-reservas@prueba.test");
    await expect(base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-2", evento: "reserva", vio: { version: "x" } })).rejects.toThrow();
    await expect(base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-2", evento: "reserva", opcion: "modular" })).rejects.toThrow();
    await base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-2", evento: "reserva", opcion: "modular", vio: { version: "x" } });
    await base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-2", evento: "paga" });
    await base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-2", evento: "deshace" });
  });

  it("rechaza un evento o una opción desconocidos y borrar una persona con reservas", async () => {
    const p = await persona("enums-reservas@prueba.test");
    await expect(
      base.execute(sql`insert into reservas (persona_id, hecho_por, lote_id, evento) values (${p.id}, ${p.id}, 'lote-1', 'compra')`),
    ).rejects.toThrow();
    await expect(
      base.execute(sql`insert into reservas (persona_id, hecho_por, lote_id, evento, opcion) values (${p.id}, ${p.id}, 'lote-1', 'reserva', 'mansion')`),
    ).rejects.toThrow();
    await base.insert(reservas).values({ personaId: p.id, hechoPor: p.id, loteId: "lote-1", evento: "deshace" });
    await expect(base.delete(personas).where(eq(personas.id, p.id))).rejects.toThrow();
  });
});

describe("cuentas", () => {
  it("rechaza la cuenta repetida y la segunda cuenta privy de la misma persona", async () => {
    const a = await persona("cuenta-a@prueba.test");
    const b = await persona("cuenta-b@prueba.test");
    await base.insert(cuentas).values({ personaId: a.id, proveedor: "privy", idExterno: "did:privy:a", emailVerificado: a.email });
    await expect(
      base.insert(cuentas).values({ personaId: b.id, proveedor: "privy", idExterno: "did:privy:a", emailVerificado: b.email }),
    ).rejects.toThrow();
    await expect(
      base.insert(cuentas).values({ personaId: a.id, proveedor: "privy", idExterno: "did:privy:otro", emailVerificado: a.email }),
    ).rejects.toThrow();
  });

  it("privy y neon-auth de la misma persona conviven", async () => {
    const a = await persona("dos@prueba.test");
    await base.insert(cuentas).values({ personaId: a.id, proveedor: "privy", idExterno: "did:privy:dos", emailVerificado: a.email });
    await base.insert(cuentas).values({ personaId: a.id, proveedor: "neon-auth", idExterno: "na-dos", emailVerificado: a.email });
    expect(await base.select().from(cuentas).where(eq(cuentas.personaId, a.id))).toHaveLength(2);
  });

  it("rechaza un proveedor desconocido y borrar una persona con cuentas", async () => {
    const a = await persona("github@prueba.test");
    await expect(
      base.execute(sql`insert into cuentas (persona_id, proveedor, id_externo, email_verificado) values (${a.id}, 'github', 'x', 'x@y.test')`),
    ).rejects.toThrow();
    await base.insert(cuentas).values({ personaId: a.id, proveedor: "privy", idExterno: "did:privy:gh", emailVerificado: a.email });
    await expect(base.delete(personas).where(eq(personas.id, a.id))).rejects.toThrow();
  });
});
