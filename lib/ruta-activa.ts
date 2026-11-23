/** Una subruta cuenta como su sección: /tribus/valle marca /tribus. */
export function esActivo(href: string, ruta: string) {
  return href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
}

/** Como `esActivo`, pero el destino también se marca en otras secciones (Explorar: /territorios, /barrios, /lotes, /tribus). */
export function esActivoEnSecciones(href: string, secciones: readonly string[] | undefined, ruta: string) {
  return esActivo(href, ruta) || (secciones ?? []).some((s) => esActivo(s, ruta));
}
