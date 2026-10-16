import path from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { guardaDeEntorno } from "../lib/db/guarda";

/**
 * Aplica las migraciones pendientes (cada una en una transacción: si falla, no queda a medias). Corre antes de `next build`.
 * Sin `DATABASE_URL` no hace nada (local, tests y agentes usan PGlite). Usa la URL sin pool si la integración la crea.
 * Si falla, el deploy falla.
 */
async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.log("[db:migrate] Sin DATABASE_URL: no hay nada que migrar (se usa PGlite).");
    return;
  }
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: url });
  try {
    await guardaDeEntorno(async (sql) => (await pool.query(sql)).rows, { VERCEL_ENV: process.env.VERCEL_ENV });
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("[db:migrate] Migraciones al día.");
  } finally {
    await pool.end();
  }
}

main().catch((e: unknown) => {
  console.error(`[db:migrate] ${e instanceof Error ? e.message : "falló"}`);
  process.exit(1);
});
