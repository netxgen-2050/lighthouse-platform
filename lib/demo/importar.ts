import { NOMBRES_BASE } from "./claves";

/** Lo mínimo que usamos de localStorage (se simula en los tests). */
export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Marca (sin prefijo) de que ya se ofreció importar los datos de antes del login: se ofrece una sola vez. */
export const CLAVE_IMPORTACION_RESUELTA = "lh-importacion-resuelta";

const NOMBRES = Object.values(NOMBRES_BASE) as string[];

function prefijo(idPersona: string): string {
  return `u:${idPersona}:`;
}

/** ¿Hay datos guardados sin prefijo (de antes del login)? */
export function hayDatosPrevios(almacen: Almacen): boolean {
  return NOMBRES.some((n) => almacen.getItem(n) !== null);
}

/** ¿La persona ya tiene algo guardado con su prefijo? */
export function personaTieneDatos(almacen: Almacen, idPersona: string): boolean {
  return NOMBRES.some((n) => almacen.getItem(prefijo(idPersona) + n) !== null);
}

/** Hay que ofrecer la importación si no se resolvió antes, hay datos previos y la persona que entra no tiene los suyos. */
export function corresponderOfrecerImportacion(almacen: Almacen, idPersona: string): boolean {
  if (almacen.getItem(CLAVE_IMPORTACION_RESUELTA) !== null) return false;
  return hayDatosPrevios(almacen) && !personaTieneDatos(almacen, idPersona);
}

/** Copia los datos previos a la persona, quita los originales y marca la importación como resuelta. Devuelve cuántas claves copió. */
export function importarDatosPrevios(almacen: Almacen, idPersona: string): number {
  let copiadas = 0;
  for (const n of NOMBRES) {
    const valor = almacen.getItem(n);
    if (valor === null) continue;
    almacen.setItem(prefijo(idPersona) + n, valor);
    almacen.removeItem(n);
    copiadas += 1;
  }
  almacen.setItem(CLAVE_IMPORTACION_RESUELTA, "1");
  return copiadas;
}

/** La persona eligió no importar: no se vuelve a preguntar (los datos previos quedan sin tocar). */
export function descartarImportacion(almacen: Almacen): void {
  almacen.setItem(CLAVE_IMPORTACION_RESUELTA, "1");
}
