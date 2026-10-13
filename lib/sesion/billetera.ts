/** Dirección abreviada para mostrar: `0x1234…abcd`. Una dirección corta se deja entera. */
export function abreviarDireccion(direccion: string): string {
  const d = direccion.trim();
  if (d.length <= 12) return d;
  return `${d.slice(0, 6)}…${d.slice(-4)}`;
}
