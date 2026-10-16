import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

/** Una base PGlite nueva en memoria, con las migraciones de `drizzle/` aplicadas (local y tests; nunca en Vercel). */
export async function crearPglite() {
  const base = drizzle(new PGlite(), { schema });
  await migrate(base, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return base;
}
