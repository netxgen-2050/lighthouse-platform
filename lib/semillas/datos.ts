// Datos de ejemplo copiados de `V.semillas` del mock-up v6 (docs/referencia/netx-tribus-mockup-v6.html).
export const META_SEMBRADOR = 120;
/** Meses que cuenta el mock-up para el medidor de Sembrador/a activo/a. */
export const MESES = 3;

/** Compañeros de tribu a evaluar (los dos primeros de `peers` del mock-up). */
export const COMPANEROS = [
  { nombre: "Martina", rol: "Huerta" },
  { nombre: "Joaquín", rol: "Carpintería" },
] as const;

export const DIMENSIONES = [
  ["rol", "Cumplió su rol"],
  ["cultura", "Aporte al grupo"],
] as const;
