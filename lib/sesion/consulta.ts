/**
 * Cómo pregunta el navegador quién es a `/api/sesion` (login-neon-auth, design §1) y qué login abre "Entrar". Funciones puras
 * para poder probar la convivencia de Privy con Neon Auth sin montar el proveedor.
 */

export type Consulta =
  /** Todavía no se sabe (Privy se está inicializando): no se pregunta nada. */
  | { tipo: "esperar" }
  /** Sin nada con qué acreditarse y sin Neon Auth: no hay sesión, sin preguntar al servidor. */
  | { tipo: "sin-sesion" }
  /** Se pregunta al servidor con estas cabeceras; `porCookie` si la sesión sería la de Neon Auth (cookie del navegador). */
  | { tipo: "preguntar"; cabeceras: Record<string, string>; porCookie: boolean };

/**
 * Orden: el modo de prueba; el token de Privy si hay una sesión de Privy abierta (también con el entorno en `neon-auth`:
 * quien ya estaba adentro sigue adentro); si no, con `neon-auth`, la cookie; si no, nada.
 */
export function decidirConsulta(datos: { prueba: string | null; privyListo: boolean; tokenPrivy: string | null; conNeonAuth: boolean }): Consulta {
  if (datos.prueba) return { tipo: "preguntar", cabeceras: { "x-lh-prueba": datos.prueba }, porCookie: false };
  if (!datos.privyListo) return { tipo: "esperar" };
  if (datos.tokenPrivy) return { tipo: "preguntar", cabeceras: { Authorization: `Bearer ${datos.tokenPrivy}` }, porCookie: false };
  if (datos.conNeonAuth) return { tipo: "preguntar", cabeceras: {}, porCookie: true };
  return { tipo: "sin-sesion" };
}

/** Qué se abre al aceptar el paso: con `neon-auth`, siempre el formulario propio (también después de salir de Privy). */
export function loginAAbrir(datos: { conNeonAuth: boolean; hayPrivy: boolean }): "formulario" | "privy" | "entrar-como" {
  if (datos.conNeonAuth) return "formulario";
  return datos.hayPrivy ? "privy" : "entrar-como";
}
