/**
 * Mensaje de error de Candide o de la red sin URL ni clave. Quita cualquier `https://…` (con sus parámetros de consulta), las
 * claves largas sueltas y el RPC configurado, y corta el largo. Nunca devuelve nada que permita reconstruir una URL con clave.
 */
export function sanear(mensaje: unknown, secretos: Array<string | undefined> = []): string {
  let texto = mensaje instanceof Error ? mensaje.message : typeof mensaje === "string" ? mensaje : "";
  for (const s of secretos) {
    if (s && s.length >= 6) texto = texto.split(s).join("[oculto]");
  }
  texto = texto.replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[url oculta]");
  texto = texto.replace(/[?&](api[-_]?key|key|token|apikey)=\S+/gi, "");
  texto = texto.replace(/\s+/g, " ").trim();
  if (!texto) return "Error sin detalle.";
  return texto.length > 300 ? `${texto.slice(0, 297)}…` : texto;
}
