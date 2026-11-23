import { db, ErrorDeConfiguracionDeBase } from "@/lib/db/cliente";
import { cargaInicial, personaDeLaSesion } from "./base";
import { entornoDeSesion } from "./entorno";
import { parsearPersonas, type Persona } from "./personas";
import { proveedoresDelEntorno, type ClienteIdentidad } from "./proveedores";
import { pedidoDeCabeceras, resolverIdentidad } from "./verificar";

/** Personas de `LH_PERSONAS`: solo la carga inicial de la tabla; las entradas mal formadas se avisan en el log del servidor. */
export function personasDelEntorno() {
  return parsearPersonas(process.env.LH_PERSONAS, (m) => console.warn(`[sesion] ${m}`));
}

export type ResultadoSesion =
  | { estado: 200; persona: Persona; idPersona: string; personaId: string | null; clavesAnteriores: string[] }
  | { estado: 401 | 403 | 503 };

/**
 * Quién hace el pedido, en este orden (login-neon-auth, design §1): la cabecera del modo de prueba (fuera de producción, solo
 * emails `.test`), el token de Privy, la cookie de Neon Auth; si no hay nada, 401. Después busca a la persona en la base
 * (`personaDeLaSesion`). Sin base configurada en producción, o si la base falla, responde 503 y lo deja en el log (sin datos
 * de la persona). Nadie fuera de este archivo importa un adaptador de `lib/sesion/proveedores/`.
 */
export async function sesionDelPedido(req: Request, proveedores: ClienteIdentidad[] = proveedoresDelEntorno()): Promise<ResultadoSesion> {
  const entorno = entornoDeSesion();
  const verificada = await resolverIdentidad(req, entorno, proveedores);
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

/**
 * Lo mismo que `sesionDelPedido`, desde los datos que acreditan la sesión. Lo usan las páginas protegidas en el servidor
 * (`lib/sesion/pagina.ts`, que los saca de cookies).
 */
export async function sesionDeCabeceras(cabeceras: {
  authorization: string | null;
  prueba: string | null;
  cookie?: string | null;
}): Promise<ResultadoSesion> {
  return sesionDelPedido(pedidoDeCabeceras(cabeceras));
}
