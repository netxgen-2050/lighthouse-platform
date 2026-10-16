/** Quien ejecuta SQL de solo lectura y devuelve las filas (el script usa el Pool de Neon; los tests, PGlite). */
export type Consultar = (sql: string) => Promise<Record<string, unknown>[]>;

export const MENSAJE_GUARDA =
  "Esta base no parece la rama `previews`: tiene personas reales o ninguna persona de prueba. Revisá `docs/guiones/neon-previews.md`.";

/**
 * Cinturón de ADR-008: fuera de producción, antes de migrar, la base tiene que ser virgen (sin tabla `personas`) o la rama
 * de previews (al menos una persona y todas con email `.test`). Si no, falla. Nunca imprime emails.
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
  if (total === 0 || dePrueba !== total) throw new Error(MENSAJE_GUARDA);
}
