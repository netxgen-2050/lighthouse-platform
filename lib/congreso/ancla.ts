/** Id del ancla de una dirección (`#ticket` → `ticket`). Un ancla mal codificada (`#%E0`, `#100%`) se usa tal cual, sin fallar. */
export function idDeAncla(hash: string): string {
  const crudo = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(crudo);
  } catch {
    return crudo;
  }
}
