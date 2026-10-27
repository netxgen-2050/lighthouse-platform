// Nombres de las cookies de sesión que lee el servidor de las páginas. Sin React ni Next: las usan el navegador y el servidor.

/** Modo de prueba (ADR-008): el email elegido en "Entrar como…". `path=/`. */
export const COOKIE_PRUEBA = "lh-auth-prueba";

/** Token de Privy del super admin, solo para `/admin` (ADR-016). `path=/admin`, `SameSite=Strict`. */
export const COOKIE_SESION_ADMIN = "lh-sesion-admin";

/** 55 minutos: menos que la vida del token. */
export const VIDA_COOKIE_ADMIN_SEGUNDOS = 3300;
