/**
 * Única lista de páginas que se pueden ver sin sesión (Descubrir). Cualquier otra ruta pide entrar.
 * Cada patrón es una ruta completa: `[id]` es un solo tramo, sin barras.
 */
export const RUTAS_PUBLICAS: readonly RegExp[] = [
  /^\/$/,
  /^\/territorios\/[^/]+$/,
  /^\/tribus$/,
  /^\/tribus\/[^/]+$/,
  /^\/tribus\/[^/]+\/manifiesto$/,
];

/** ¿Se puede mostrar esta ruta sin sesión? Ignora la barra final, la query y el hash. */
export function esPublica(ruta: string | null | undefined): boolean {
  if (!ruta) return false;
  const limpia = ruta.split(/[?#]/)[0] ?? "";
  const sinBarra = limpia.length > 1 ? limpia.replace(/\/+$/, "") : limpia;
  return RUTAS_PUBLICAS.some((r) => r.test(sinBarra));
}
