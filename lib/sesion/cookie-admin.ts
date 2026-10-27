import { COOKIE_SESION_ADMIN, VIDA_COOKIE_ADMIN_SEGUNDOS } from "./cookies";

// La cookie que lleva la sesión del super admin al servidor de /admin (ADR-016). Funciones puras: el navegador hace el
// `document.cookie = …` (components/sesion/proveedor-sesion.tsx).

/** ¿Hay que escribirla? Solo con sesión de Privy (no de prueba), verificada, y de super admin. */
export function debeEscribirCookieAdmin(p: { prueba: string | null; estado: string; rol: string | undefined }): boolean {
  return !p.prueba && p.estado === "ok" && p.rol === "superadmin";
}

/** El texto de la cookie: solo viaja a /admin, no la manda otro sitio y vive menos que el token. */
export function cookieAdmin(token: string, https: boolean): string {
  return `${COOKIE_SESION_ADMIN}=${encodeURIComponent(token)}; path=/admin; max-age=${VIDA_COOKIE_ADMIN_SEGUNDOS}; SameSite=Strict${
    https ? "; Secure" : ""
  }`;
}

export function cookieAdminBorrada(https: boolean): string {
  return `${COOKIE_SESION_ADMIN}=; path=/admin; max-age=0; SameSite=Strict${https ? "; Secure" : ""}`;
}
