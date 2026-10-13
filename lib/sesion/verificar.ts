import { modoPruebaActivo, normalizarEmail, personaConAcceso, type Persona } from "./personas";

/** Lo mínimo que usamos del cliente de Privy en el servidor (se simula en los tests). */
export type ClientePrivy = {
  verifyAuthToken(token: string): Promise<{ userId: string }>;
  getUser(userId: string): Promise<{
    id: string;
    email?: { address: string } | null;
    google?: { email: string } | null;
  }>;
};

export type Entorno = { LH_AUTH_PRUEBA?: string; VERCEL_ENV?: string; LH_ACCESO?: string };

export type Resultado =
  | { estado: 200; persona: Persona; idPersona: string; nombre?: string }
  | { estado: 401 | 403 | 503 };

/**
 * Decide quién es la persona que pide. Acceso abierto: cualquier email verificado entra (con los ajustes de `personas` si
 * los tiene). 401 sin sesión o con token inválido, 403 si no hay email válido o, con `LH_ACCESO=lista`, si no está en la lista,
 * 503 si el servidor no tiene Privy configurado. El header de prueba solo vale con `modoPruebaActivo`.
 */
export async function resolverSesion(
  cabeceras: { authorization: string | null; prueba: string | null },
  personas: Persona[],
  entorno: Entorno,
  crearCliente: () => ClientePrivy | null,
): Promise<Resultado> {
  if (cabeceras.prueba && modoPruebaActivo(entorno)) {
    const email = normalizarEmail(cabeceras.prueba);
    const persona = personaConAcceso(personas, email, entorno);
    // En el modo de prueba el "id de Privy" es el email, para que los datos queden separados por persona.
    return persona ? { estado: 200, persona, idPersona: `prueba:${email}` } : { estado: 403 };
  }

  const token = /^Bearer\s+(.+)$/i.exec(cabeceras.authorization ?? "")?.[1]?.trim();
  if (!token) return { estado: 401 };

  const cliente = crearCliente();
  if (!cliente) return { estado: 503 };

  let usuario: Awaited<ReturnType<ClientePrivy["getUser"]>>;
  try {
    const claims = await cliente.verifyAuthToken(token);
    usuario = await cliente.getUser(claims.userId);
  } catch {
    return { estado: 401 };
  }
  const email = usuario.email?.address ?? usuario.google?.email ?? null;
  const persona = personaConAcceso(personas, email, entorno);
  if (!persona) return { estado: 403 };
  return { estado: 200, persona, idPersona: usuario.id };
}
