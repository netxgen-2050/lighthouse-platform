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

/** Nombre (con el prefijo de la persona) de la marca de que ya se copiaron las claves de sus logins anteriores. */
export const NOMBRE_CLAVES_COPIADAS = "lh-claves-copiadas";

/**
 * Cambio de proveedor de login (login-neon-auth, design §4): `idPersona` pasa a ser `personas.id`, así que lo guardado con la
 * clave anterior (el id de Privy, `neon-auth:<id>`) se copia UNA vez a la clave nueva. No pisa lo que ya esté en la nueva, no
 * borra las viejas y no se repite (marca `u:<idPersona>:lh-claves-copiadas`). Devuelve cuántas claves copió.
 */
export function copiarClavesAnteriores(
  almacen: Pick<Storage, "getItem" | "setItem" | "key" | "length">,
  idPersona: string,
  clavesAnteriores: readonly string[],
): number {
  const origenes = [...new Set(clavesAnteriores)].filter((a) => a !== "" && a !== idPersona);
  // Sin claves anteriores no se toca el almacenamiento: antes de aceptar nada se guarda a nombre de la persona.
  if (origenes.length === 0) return 0;
  const marca = prefijo(idPersona) + NOMBRE_CLAVES_COPIADAS;
  if (almacen.getItem(marca) !== null) return 0;
  const claves: string[] = [];
  for (let i = 0; i < almacen.length; i += 1) {
    const k = almacen.key(i);
    if (k !== null) claves.push(k);
  }
  let copiadas = 0;
  for (const anterior of origenes) {
    const pre = prefijo(anterior);
    for (const k of claves) {
      if (!k.startsWith(pre)) continue;
      const nombre = k.slice(pre.length);
      if (nombre === NOMBRE_CLAVES_COPIADAS) continue;
      const destino = prefijo(idPersona) + nombre;
      if (almacen.getItem(destino) !== null) continue;
      const valor = almacen.getItem(k);
      if (valor === null) continue;
      almacen.setItem(destino, valor);
      copiadas += 1;
    }
  }
  // La marca solo se escribe si hubo algo que copiar (si no, no se guarda nada nuevo a nombre de la persona).
  if (copiadas > 0) almacen.setItem(marca, "1");
  return copiadas;
}

/** La persona eligió no importar: no se vuelve a preguntar (los datos previos quedan sin tocar). */
export function descartarImportacion(almacen: Almacen): void {
  almacen.setItem(CLAVE_IMPORTACION_RESUELTA, "1");
}
