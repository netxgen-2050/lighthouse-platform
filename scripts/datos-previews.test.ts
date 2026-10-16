import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { crearPglite } from "@/lib/db/pglite";

const SQL = readFileSync(path.join(process.cwd(), "scripts", "datos-previews.sql"), "utf8");

async function baseMigrada() {
  const b = await crearPglite();
  return (b as unknown as { $client: PGlite }).$client;
}

describe("scripts/datos-previews.sql", () => {
  it("corrido dos veces deja las seis personas de prueba, una vez cada una", async () => {
    const pg = await baseMigrada();
    await pg.exec(SQL);
    await pg.exec(SQL);
    const r = await pg.query<{ email: string; rol: string; perfil: string; tribu_admin: string | null }>(
      "select email, rol, perfil, tribu_admin from personas order by email",
    );
    expect(r.rows.map((f) => f.email)).toEqual([
      "a@prueba.test",
      "admin@prueba.test",
      "b@prueba.test",
      "c@prueba.test",
      "persona@prueba.test",
      "super@prueba.test",
    ]);
    expect(r.rows.find((f) => f.email === "admin@prueba.test")).toMatchObject({ rol: "admin-tribu", tribu_admin: "valle" });
    expect(r.rows.find((f) => f.email === "persona@prueba.test")?.perfil).toBe("inversor");
  });

  it("con una persona real cargada antes, falla y no inserta ninguna persona de prueba", async () => {
    const pg = await baseMigrada();
    await pg.query("insert into personas (email) values ('gus@ejemplo.com')");
    await expect(pg.exec(SQL)).rejects.toThrow(/no son de prueba/);
    const r = await pg.query<{ email: string }>("select email from personas");
    expect(r.rows.map((f) => f.email)).toEqual(["gus@ejemplo.com"]);
  });

  it("aunque se ignore el error de la guarda, el insert no agrega nada si hay una persona real", async () => {
    const pg = await baseMigrada();
    await pg.query("insert into personas (email) values ('gus@ejemplo.com')");
    const insert = SQL.slice(SQL.indexOf("insert into personas"));
    await pg.exec(insert);
    expect((await pg.query("select 1 from personas")).rows).toHaveLength(1);
  });

  it("no tiene update, delete, truncate ni consentimientos fuera de los comentarios", () => {
    const sinComentarios = SQL.split("\n")
      .filter((l) => !l.trim().startsWith("--"))
      .join("\n")
      .toLowerCase();
    for (const prohibida of ["update", "delete", "truncate", "consentimientos", "drop "]) {
      expect(sinComentarios, prohibida).not.toContain(prohibida);
    }
  });
});
