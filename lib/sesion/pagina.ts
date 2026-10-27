import "server-only";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { COOKIE_PRUEBA, COOKIE_SESION_ADMIN } from "./cookies";
import { sesionDeCabeceras, type ResultadoSesion } from "./servidor";

/**
 * Quién pide esta página (servidor). El navegador no manda cabeceras de sesión al pedir una página: se leen dos cookies.
 * `lh-auth-prueba` (modo de prueba, solo emails `.test`, ignorada en producción) y `lh-sesion-admin` (token de Privy del
 * super admin, limitada a `/admin`). Ver ADR-016.
 */
export async function sesionDeLaPagina(): Promise<ResultadoSesion> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESION_ADMIN)?.value;
  const prueba = jar.get(COOKIE_PRUEBA)?.value;
  return sesionDeCabeceras({
    authorization: token ? `Bearer ${token}` : null,
    prueba: prueba ? decodificar(prueba) : null,
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
