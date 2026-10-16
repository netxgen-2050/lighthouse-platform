import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Único punto de entrada a la base. Con `DATABASE_URL`: Neon por WebSocket (`neon-serverless`, que sí tiene transacciones
 * interactivas; el driver HTTP de Neon no las tiene). Sin `DATABASE_URL` y fuera de producción: PGlite (Postgres embebido) con las migraciones
 * aplicadas. En producción de Vercel sin `DATABASE_URL`: error explícito.
 */
export type Db = NeonDatabase<typeof schema>;

export class ErrorDeConfiguracionDeBase extends Error {}

type Global = typeof globalThis & { __lhBase?: Promise<Db>; __lhPool?: Pool; __lhBasePrueba?: Db | null };
const g = globalThis as Global;

function conNeon(url: string): Db {
  // Node 22+ y Vercel traen WebSocket global; si no, el driver lo pide a `ws` (no lo usamos en producción).
  if (typeof WebSocket === "undefined") throw new ErrorDeConfiguracionDeBase("Falta WebSocket en este Node (se necesita Node 22 o más)");
  // Un Pool por proceso, reutilizado entre pedidos (guía de Neon para funciones con Fluid compute).
  if (!g.__lhPool) {
    g.__lhPool = new Pool({ connectionString: url });
    // Sin este manejador, un error de una conexión ociosa (la base reinicia o corta) tumba el proceso. Se loguea sin el mensaje
    // (puede traer datos de la conexión o de la consulta).
    g.__lhPool.on("error", (e: unknown) => {
      console.error(`[db] error en una conexión ociosa del Pool${e instanceof Error && "code" in e ? ` (código ${String(e.code)})` : ""}`);
    });
  }
  return drizzleNeon(g.__lhPool, { schema });
}

async function conPglite(): Promise<Db> {
  const { crearPglite } = await import("./pglite");
  return (await crearPglite()) as unknown as Db;
}

export function db(): Promise<Db> {
  if (g.__lhBasePrueba) return Promise.resolve(g.__lhBasePrueba);
  if (g.__lhBase) return g.__lhBase;
  const url = process.env.DATABASE_URL;
  if (url) {
    // Neon sobre la WebSocket global de Node.
    neonConfig.webSocketConstructor = typeof WebSocket === "undefined" ? undefined : WebSocket;
    g.__lhBase = Promise.resolve(conNeon(url));
  } else if (process.env.VERCEL_ENV === "production") {
    return Promise.reject(new ErrorDeConfiguracionDeBase("Falta DATABASE_URL en producción: la app no arranca sin base."));
  } else {
    g.__lhBase = conPglite();
    // Si falla al crearse, no dejamos la promesa rota guardada.
    g.__lhBase.catch(() => {
      g.__lhBase = undefined;
    });
  }
  return g.__lhBase;
}

/** Solo para tests: reemplaza la base de todo el proceso (null la restaura). */
export function fijarBaseParaTests(base: Db | null): void {
  g.__lhBasePrueba = base;
}
