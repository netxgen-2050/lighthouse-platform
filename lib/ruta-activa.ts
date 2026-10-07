/** Una subruta cuenta como su sección: /tribus/valle marca /tribus. */
export function esActivo(href: string, ruta: string) {
  return href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
}
