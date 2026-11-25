/** Quien ejecuta SQL de solo lectura y devuelve las filas (el script usa el Pool de Neon; los tests, PGlite). */
export type Consultar = (sql: string) => Promise<Record<string, unknown>[]>;

export const MENSAJE_GUARDA =
  "Esta base no parece la rama `previews`: no tiene ninguna persona de prueba (`.test`). Revisá `docs/guiones/neon-previews.md`.";

/**
 * Cinturón de ADR-008 (revisado el 25-nov-2026): fuera de producción, antes de migrar, la base tiene que ser virgen (sin
 * tabla `personas`) o la rama de previews, que se reconoce porque tiene al menos una persona `.test` (producción nunca
 * tiene). Desde el 25-nov-2026 se permiten personas reales en `previews` (las deja el login con Google o el código por
 * email al probar), así que ya no frenan el build. Nunca imprime emails.
 */
export async function guardaDeEntorno(consultar: Consultar, env: { VERCEL_ENV?: string }): Promise<void> {
  if (env.VERCEL_ENV === "production") return;
  const existe = await consultar("select to_regclass('public.personas') is not null as existe");
  if (existe[0]?.existe !== true) return;
  const filas = await consultar(
    "select count(*)::int as total, count(*) filter (where lower(email) ~ '^[^@\\s]+@[a-z0-9.-]+\\.test$')::int as de_prueba from personas",
  );
  const total = Number(filas[0]?.total ?? 0);
  const dePrueba = Number(filas[0]?.de_prueba ?? 0);
  if (total === 0 || dePrueba === 0) throw new Error(MENSAJE_GUARDA);
}
