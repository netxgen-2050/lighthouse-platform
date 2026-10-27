import { PrivyClient } from "@privy-io/server-auth";
import { db, ErrorDeConfiguracionDeBase } from "@/lib/db/cliente";
import { cargaInicial, personaDeLaSesion } from "./base";
import { entornoDeSesion } from "./entorno";
import { parsearPersonas, type Persona } from "./personas";
import { resolverSesion } from "./verificar";

/** Personas de `LH_PERSONAS`: solo la carga inicial de la tabla; las entradas mal formadas se avisan en el log del servidor. */
export function personasDelEntorno() {
  return parsearPersonas(process.env.LH_PERSONAS, (m) => console.warn(`[sesion] ${m}`));
}

function crearClientePrivy() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secreto = process.env.PRIVY_APP_SECRET;
  return appId && secreto ? new PrivyClient(appId, secreto) : null;
}

export type ResultadoSesion =
  | { estado: 200; persona: Persona; idPersona: string; personaId: string | null }
  | { estado: 401 | 403 | 503 };

/**
 * Quién hace el pedido: token de Privy (o el modo de prueba fuera de producción, solo con emails `.test`) y la persona en la
 * base. Sin base configurada en producción, o si la base falla, responde 503 y lo deja en el log (sin datos de la persona).
 */
export async function sesionDelPedido(req: Request): Promise<ResultadoSesion> {
  return sesionDeCabeceras({ authorization: req.headers.get("authorization"), prueba: req.headers.get("x-lh-prueba") });
}

/**
 * Lo mismo que `sesionDelPedido`, desde los dos datos que acreditan la sesión. Lo usan los pedidos a `/api/*` (cabeceras) y
 * las páginas protegidas en el servidor (`lib/sesion/pagina.ts`, que los saca de cookies).
 */
export async function sesionDeCabeceras(cabeceras: {
  authorization: string | null;
  prueba: string | null;
}): Promise<ResultadoSesion> {
  const entorno = entornoDeSesion();
  const verificada = await resolverSesion(cabeceras, entorno, crearClientePrivy);
  if (verificada.estado !== 200) return { estado: verificada.estado };
  try {
    const base = await db();
    await cargaInicial(base, personasDelEntorno());
    return await personaDeLaSesion(base, verificada, entorno);
  } catch (e) {
    console.error(
      e instanceof ErrorDeConfiguracionDeBase ? `[sesion] ${e.message}` : "[sesion] la base no respondió al buscar a la persona",
    );
    return { estado: 503 };
  }
}
