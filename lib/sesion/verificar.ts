import type { IdentidadExterna } from "./identidad";
import { modoPruebaActivo, normalizarEmail } from "./personas";

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

/** La identidad verificada. `prueba`: viene de la cabecera del modo de prueba (no hay proveedor ni cuenta que vincular). */
export type Verificada = { identidad: IdentidadExterna; prueba: boolean };

export type Resultado = ({ estado: 200 } & Verificada) | { estado: 401 | 403 | 503 };

/** El modo de prueba solo acepta emails de prueba (ADR-008 C): dominio que termina en `.test`, sobre el email normalizado. */
export function esEmailDePrueba(email: string): boolean {
  return /^[^@\s]+@[a-z0-9.-]+\.test$/.test(normalizarEmail(email));
}

/**
 * Verifica quién pide y devuelve su identidad en nuestro vocabulario; no busca a la persona (eso es `personaDeLaSesion`).
 * 401 sin sesión o con token inválido, 503 si el servidor no tiene Privy configurado. La cabecera de prueba solo vale con
 * `modoPruebaActivo` y con un email `.test` (si no, 403, también en local).
 */
export async function resolverSesion(
  cabeceras: { authorization: string | null; prueba: string | null },
  entorno: Entorno,
  crearCliente: () => ClientePrivy | null,
): Promise<Resultado> {
  if (cabeceras.prueba && modoPruebaActivo(entorno)) {
    const email = normalizarEmail(cabeceras.prueba);
    if (!esEmailDePrueba(email)) return { estado: 403 };
    // En el modo de prueba el "id de Privy" es el email, para que los datos queden separados por persona.
    return { estado: 200, prueba: true, identidad: { proveedor: "privy", idExterno: `prueba:${email}`, email, emailVerificado: true } };
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
  // Privy verifica el email con un código o con Google: los dos caminos cuentan como verificados.
  const email = usuario.email?.address ?? usuario.google?.email ?? null;
  return {
    estado: 200,
    prueba: false,
    identidad: {
      proveedor: "privy",
      idExterno: usuario.id,
      email: email ? normalizarEmail(email) : null,
      emailVerificado: email !== null,
    },
  };
}
