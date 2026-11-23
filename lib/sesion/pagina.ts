import "server-only";
import { cookies, headers } from "next/headers";
import { forbidden } from "next/navigation";
import { COOKIE_PRUEBA, COOKIE_SESION_ADMIN } from "./cookies";
import { sesionDeCabeceras, type ResultadoSesion } from "./servidor";
import { origenDeCabeceras } from "./verificar";

/**
 * Quién pide esta página (servidor). El navegador no manda cabeceras de sesión al pedir una página: se leen dos cookies.
 * `lh-auth-prueba` (modo de prueba, solo emails `.test`, ignorada en producción) y `lh-sesion-admin` (token de Privy del
 * super admin, limitada a `/admin`). Ver ADR-016.
 */
export async function sesionDeLaPagina(): Promise<ResultadoSesion> {
  const jar = await cookies();
  const cab = await headers();
  const token = jar.get(COOKIE_SESION_ADMIN)?.value;
  const prueba = jar.get(COOKIE_PRUEBA)?.value;
  return sesionDeCabeceras({
    authorization: token ? `Bearer ${token}` : null,
    prueba: prueba ? decodificar(prueba) : null,
    // La sesión de Neon Auth viaja en su propia cookie: se la pasa tal cual al adaptador.
    cookie: jar.toString(),
    // El origen real de la página: Neon Auth lo controla contra los dominios permitidos. En una página no se puede poner
    // cookies, así que la renovación de la caché de sesión (`Set-Cookie`) no se aplica acá: la sigue haciendo /api/sesion.
    origen: origenDeCabeceras(cab.get("x-forwarded-host") ?? cab.get("host"), cab.get("x-forwarded-proto")),
  });
}

function decodificar(valor: string): string {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

/**
 * Corta con 403 salvo que quien pide sea el super admin. Falla cerrado: sin cookie, token vencido, email no permitido o
 * base caída también dan 403. Va primero en el layout y en cada página de `/admin`.
 */
export async function exigirSuperAdmin(): Promise<void> {
  const s = await sesionDeLaPagina();
  if (s.estado !== 200 || s.persona.rol !== "superadmin") forbidden();
}
