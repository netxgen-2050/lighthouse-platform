import { VERSION_POLITICA } from "./consentimiento";

/**
 * Consentimiento opcional de novedades por email (cambio `consentimiento-alta`, design §9). Guarda solo el último evento.
 * En el prototipo no se manda ningún email: solo queda la elección. No está en `NOMBRES_BASE`: "Borrar todo" e
 * "Importar a mi cuenta" no lo tocan (es un consentimiento, no un dato de ejemplo).
 */

export const NOMBRE_CLAVE_NOVEDADES = "lh-novedades";

export type CanalNovedades = "alta" | "al-entrar" | "nueva-version" | "mis-datos";

const CANALES: readonly string[] = ["alta", "al-entrar", "nueva-version", "mis-datos"];

export type Novedades = {
  evento: "acepta" | "retira";
  version: string;
  /** Fecha y hora (ISO) del evento. */
  registradoEn: string;
  canal: CanalNovedades;
};

export function claveNovedadesDe(idPersona: string): string {
  return `u:${idPersona}:${NOMBRE_CLAVE_NOVEDADES}`;
}

/** El último evento de la persona, o null si nunca decidió (o el registro está dañado o trae un canal desconocido). */
export function leerNovedades(almacen: Pick<Storage, "getItem"> | null, idPersona: string): Novedades | null {
  try {
    const crudo = almacen?.getItem(claveNovedadesDe(idPersona)) ?? null;
    if (crudo === null) return null;
    const o = JSON.parse(crudo) as Record<string, unknown> | null;
    if (!o || typeof o !== "object") return null;
    if (o.evento !== "acepta" && o.evento !== "retira") return null;
    if (typeof o.version !== "string" || !o.version || typeof o.registradoEn !== "string" || !o.registradoEn) return null;
    if (typeof o.canal !== "string" || !CANALES.includes(o.canal)) return null;
    return { evento: o.evento, version: o.version, registradoEn: o.registradoEn, canal: o.canal as CanalNovedades };
  } catch {
    return null;
  }
}

function escribir(
  almacen: Pick<Storage, "setItem">,
  idPersona: string,
  evento: Novedades["evento"],
  opciones: { canal: CanalNovedades; ahora?: Date },
): boolean {
  const registro: Novedades = {
    evento,
    version: VERSION_POLITICA,
    registradoEn: (opciones.ahora ?? new Date()).toISOString(),
    canal: opciones.canal,
  };
  try {
    almacen.setItem(claveNovedadesDe(idPersona), JSON.stringify(registro));
    return true;
  } catch {
    return false;
  }
}

/** Registra que la persona quiere recibir novedades. */
export function darNovedades(almacen: Pick<Storage, "setItem">, idPersona: string, opciones: { canal: CanalNovedades; ahora?: Date }): boolean {
  return escribir(almacen, idPersona, "acepta", opciones);
}

/** Registra que la persona no quiere recibir novedades (o que las dejó de querer). */
export function retirarNovedades(almacen: Pick<Storage, "setItem">, idPersona: string, opciones: { canal: CanalNovedades; ahora?: Date }): boolean {
  return escribir(almacen, idPersona, "retira", opciones);
}

/**
 * Registra la elección hecha con la casilla a la vista (design §9). Sin registro anterior, se escribe `acepta` o `retira`
 * según la casilla. Con registro, solo se escribe `acepta` si la marcó y su último evento no era `acepta`: dejarla sin marcar
 * no pisa una elección anterior.
 */
export function registrarEleccionNovedades(
  almacen: Pick<Storage, "getItem" | "setItem">,
  idPersona: string,
  marcada: boolean,
  opciones: { canal: CanalNovedades; ahora?: Date },
): boolean {
  const previo = leerNovedades(almacen, idPersona);
  if (previo === null) return marcada ? darNovedades(almacen, idPersona, opciones) : retirarNovedades(almacen, idPersona, opciones);
  if (marcada && previo.evento !== "acepta") return darNovedades(almacen, idPersona, opciones);
  return true;
}
