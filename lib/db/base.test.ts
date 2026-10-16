import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { cuentas, consentimientos, personas } from "./schema";
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
