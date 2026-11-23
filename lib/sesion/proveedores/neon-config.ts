/** Las dos variables que necesita el servidor para hablar con Neon Auth (el secreto firma las cookies: 32 caracteres o más). */
export function neonAuthConfigurado(env: Record<string, string | undefined> = process.env): { baseUrl: string; secreto: string } | null {
  const baseUrl = env.NEON_AUTH_BASE_URL?.trim();
  const secreto = env.NEON_AUTH_COOKIE_SECRET;
  return baseUrl && secreto && secreto.length >= 32 ? { baseUrl, secreto } : null;
}
