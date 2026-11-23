import type { IdentidadExterna } from "./identidad";
import { modoPruebaActivo, normalizarEmail } from "./personas";
import { adaptadorPrivy, type ClientePrivy } from "./proveedores/privy";
import type { ClienteIdentidad } from "./proveedores/puerto";

export type { ClientePrivy };

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
 * Orden (login-neon-auth, design §1): (1) cabecera del modo de prueba, solo con `modoPruebaActivo` y un email `.test` (si no,
 * 403, también en local); (2) los proveedores en su orden (Privy y después Neon Auth); (3) nada, 401. Algo que no se puede
 * verificar es 401; una sesión de Neon Auth con el email sin verificar es 403. Con un token pero ningún proveedor
 * configurado, 503.
 */
export async function resolverIdentidad(req: Request, entorno: Entorno, proveedores: ClienteIdentidad[]): Promise<Resultado> {
  const prueba = req.headers.get("x-lh-prueba");
  if (prueba && modoPruebaActivo(entorno)) {
    const email = normalizarEmail(prueba);
    if (!esEmailDePrueba(email)) return { estado: 403 };
    // En el modo de prueba el "id de Privy" es el email, para que los datos queden separados por persona.
    return { estado: 200, prueba: true, identidad: { proveedor: "privy", idExterno: `prueba:${email}`, email, emailVerificado: true } };
  }

  if (proveedores.length === 0) return /^Bearer\s+\S/i.test(req.headers.get("authorization") ?? "") ? { estado: 503 } : { estado: 401 };

  for (const proveedor of proveedores) {
    const r = await proveedor.identidad(req);
    if (r === null) continue;
    if (r === "invalida") return { estado: 401 };
    if (r.proveedor === "neon-auth" && !r.emailVerificado) return { estado: 403 };
    return { estado: 200, prueba: false, identidad: r };
  }
  return { estado: 401 };
}

/** Pedido mínimo con las cabeceras que acreditan la sesión (las páginas del servidor no tienen el `Request`). */
export function pedidoDeCabeceras(cabeceras: { authorization?: string | null; prueba?: string | null; cookie?: string | null }): Request {
  const h = new Headers();
  if (cabeceras.authorization) h.set("authorization", cabeceras.authorization);
  if (cabeceras.prueba) h.set("x-lh-prueba", cabeceras.prueba);
  if (cabeceras.cookie) h.set("cookie", cabeceras.cookie);
  return new Request("http://interno.invalid/", { headers: h });
}

/** Solo Privy (el camino de antes de Neon Auth): lo conservan los tests de Privy y de la cabecera de prueba. */
export async function resolverSesion(
  cabeceras: { authorization: string | null; prueba: string | null },
  entorno: Entorno,
  crearCliente: () => ClientePrivy | null,
): Promise<Resultado> {
  const proveedores = crearCliente() ? [adaptadorPrivy(crearCliente)] : [];
  return resolverIdentidad(pedidoDeCabeceras(cabeceras), entorno, proveedores);
}
