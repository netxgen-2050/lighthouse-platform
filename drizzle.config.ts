import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  // Neon Auth (cuando se active) vive en el esquema `neon_auth` de la misma base: ningún comando de Drizzle lo toca.
  schemaFilter: ["public"],
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
