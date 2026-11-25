/** Id de la necesidad a la que apunta el ancla (`#necesidad-<id>`), o null si no hay ancla válida. Un ancla mal codificada se ignora. */
export function idDeAncla(hash: string): string | null {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null;
  }
  return id.startsWith("necesidad-") ? id : null;
}
