import { neonAuthConfigurado } from "./neon-config";

/** Parámetro con que Neon Auth devuelve a la persona después de Google (a verificar en el preview). */
export const PARAMETRO_VERIFICADOR = "neon_auth_session_verifier";

export type VueltaDeGoogle = { redirigir: URL; cookies: string[] };

/**
 * Al volver de Google, la página trae un verificador que hay que cambiar por la sesión (pone las cookies y quita el
 * parámetro de la dirección). Solo actúa en esa vuelta y solo con Neon Auth configurado; no protege ninguna ruta.
 */
export async function intercambiarVerificador(req: Request, env: Record<string, string | undefined> = process.env): Promise<VueltaDeGoogle | null> {
  const url = new URL(req.url);
  if (!url.searchParams.has(PARAMETRO_VERIFICADOR)) return null;
  const config = neonAuthConfigurado(env);
  if (!config) return null;
  try {
    // El kit del SDK se carga recién acá: el resto de los pedidos del middleware no lo evalúan.
    const { processAuthMiddleware } = await import("@neondatabase/auth/server");
    const r = await processAuthMiddleware({
      request: req,
      pathname: url.pathname,
      // Todo es público: este paso solo intercambia el verificador.
      skipRoutes: ["/"],
      loginUrl: "/__sin-login-de-neon",
      baseUrl: config.baseUrl,
      cookieSecret: config.secreto,
    });
    return r.action === "redirect_oauth" ? { redirigir: r.redirectUrl, cookies: r.cookies } : null;
  } catch {
    return null;
  }
}
