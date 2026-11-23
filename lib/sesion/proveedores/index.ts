import { loginElegido } from "../errores-login";
import { adaptadorNeonAuth, crearClienteNeonAuth } from "./neon-auth";
import { neonAuthConfigurado } from "./neon-config";
import { adaptadorPrivy, crearClientePrivy } from "./privy";
import type { ClienteIdentidad } from "./puerto";

export type { ClienteIdentidad, ResultadoProveedor } from "./puerto";

type Variables = Record<string, string | undefined>;


let avisado = false;

/**
 * Los proveedores listos en este entorno, en el orden de la sesión: Privy (token `Bearer`) y después Neon Auth (cookie).
 * Un proveedor sin sus variables no se crea; si el entorno pide `neon-auth` y faltan, se avisa una vez en el log (sin valores).
 */
export function proveedoresDelEntorno(env: Variables = process.env): ClienteIdentidad[] {
  const lista: ClienteIdentidad[] = [];
  if (env.NEXT_PUBLIC_PRIVY_APP_ID && env.PRIVY_APP_SECRET) lista.push(adaptadorPrivy(() => crearClientePrivy(env)));
  const neon = neonAuthConfigurado(env);
  if (neon) lista.push(adaptadorNeonAuth(crearClienteNeonAuth(neon.baseUrl, neon.secreto)));
  else if (loginElegido(env.NEXT_PUBLIC_LH_LOGIN) === "neon-auth" && !avisado) {
    avisado = true;
    console.warn("[sesion] NEXT_PUBLIC_LH_LOGIN es neon-auth pero faltan NEON_AUTH_BASE_URL o NEON_AUTH_COOKIE_SECRET (32 caracteres o más)");
  }
  return lista;
}
