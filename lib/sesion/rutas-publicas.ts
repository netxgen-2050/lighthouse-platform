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
  // La vitrina del Congreso se ve sin cuenta; vincular el ticket pide cuenta (decisión de Gus, 14-oct-2026).
  // Y su versión en inglés (`/congreso/en`), la dirección que enlazan los organizadores.
  /^\/congreso(\/en)?$/,
  // Sumarte es la puerta de entrada: ahí se elige cómo sumarse y se registra la persona.
  /^\/sumarte$/,
  // La política de privacidad se lee antes de aceptarla: tiene que ser pública.
  /^\/privacidad$/,
];

/** ¿Se puede mostrar esta ruta sin sesión? Ignora la barra final, la query y el hash. */
export function esPublica(ruta: string | null | undefined): boolean {
  if (!ruta) return false;
  const limpia = ruta.split(/[?#]/)[0] ?? "";
  const sinBarra = limpia.length > 1 ? limpia.replace(/\/+$/, "") : limpia;
  return RUTAS_PUBLICAS.some((r) => r.test(sinBarra));
}
