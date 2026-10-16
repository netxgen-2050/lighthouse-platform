import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { guardaDeEntorno, MENSAJE_GUARDA, type Consultar } from "./guarda";
import { crearPglite } from "./pglite";

function consultarDe(pg: PGlite): Consultar {
  return async (s) => (await pg.query<Record<string, unknown>>(s)).rows;
}

async function baseMigrada() {
  const b = await crearPglite();
  return { b, pg: (b as unknown as { $client: PGlite }).$client };
}

afterEach(() => vi.restoreAllMocks());

describe("guardaDeEntorno", () => {
  it("base virgen: sigue", async () => {
    await expect(guardaDeEntorno(consultarDe(new PGlite()), {})).resolves.toBeUndefined();
  });

  it("base migrada sin personas: falla", async () => {
    const { pg } = await baseMigrada();
    await expect(guardaDeEntorno(consultarDe(pg), {})).rejects.toThrow(MENSAJE_GUARDA);
  });

  it("solo personas .test: sigue", async () => {
    const { pg } = await baseMigrada();
    await pg.query("insert into personas (email) values ('a@prueba.test'), ('B@Prueba.TEST')");
    await expect(guardaDeEntorno(consultarDe(pg), {})).resolves.toBeUndefined();
  });

  it("con un email real: falla sin nombrar el email ni en el mensaje ni en el log", async () => {
    const { pg } = await baseMigrada();
    await pg.query("insert into personas (email) values ('a@prueba.test'), ('gus@ejemplo.com')");
    const espia = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error")];
    const error = await guardaDeEntorno(consultarDe(pg), { VERCEL_ENV: "preview" }).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain("gus@ejemplo.com");
    for (const e of espia) expect(JSON.stringify(e.mock.calls)).not.toContain("gus@ejemplo.com");
  });

  it("en producción no corre", async () => {
    const { pg } = await baseMigrada();
    await pg.query("insert into personas (email) values ('gus@ejemplo.com')");
    await expect(guardaDeEntorno(consultarDe(pg), { VERCEL_ENV: "production" })).resolves.toBeUndefined();
  });
});
