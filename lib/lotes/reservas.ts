import { CLAVES } from "@/lib/demo/claves";
import { leerCompras, type CompraLote } from "./compra";

/**
 * ÚNICA puerta a las reservas y pagos SIMULADOS de la persona (spec mi-tierra). Hoy lee y escribe el navegador, en la clave
 * `CLAVES.lotes` (con el prefijo de la persona en sesión: otra persona en el mismo navegador no ve estas reservas).
 * Mañana (`lotes-en-la-base`) lee y escribe la base: por eso es asíncrona desde hoy y nadie más toca esa clave
 * (lo vigila `lib/lotes/reservas-unica.test.ts`).
 *
 * OJO para `lotes-en-la-base`: hay tres lugares que recorren TODAS las claves `lh-*` sin nombrar `CLAVES.lotes`, así que el
 * test no los ve, y tienen que pasar a leer y borrar las reservas por la base junto con esta función; si no, la persona
 * exportaría o borraría un navegador vacío creyendo que exportó o borró sus reservas:
 *  - `lib/privacidad/exportar.ts` (Mis datos, exportar),
 *  - `lib/demo/importar.ts` (mueve las claves viejas sin prefijo a las de la persona),
 *  - el borrado de `/mis-datos`.
 */
export type SesionDeReservas = { estado: string };

const hayPersona = (sesion: SesionDeReservas) => sesion.estado === "ok";

/** Las compras simuladas de la persona en sesión. Sin sesión, o si lo guardado no se puede leer, una lista vacía (sin tocar el navegador sin sesión). */
export async function leerReservas(sesion: SesionDeReservas): Promise<CompraLote[]> {
  if (!hayPersona(sesion)) return [];
  try {
    return leerCompras(window.localStorage.getItem(CLAVES.lotes));
  } catch {
    return [];
  }
}

/** Guarda la lista completa de compras de la persona. Sin sesión, o si el navegador no deja guardar, false. Una lista vacía borra la clave. */
export async function guardarReservas(sesion: SesionDeReservas, compras: CompraLote[]): Promise<boolean> {
  if (!hayPersona(sesion)) return false;
  try {
    if (compras.length === 0) window.localStorage.removeItem(CLAVES.lotes);
    else window.localStorage.setItem(CLAVES.lotes, JSON.stringify(compras));
    return true;
  } catch {
    return false;
  }
}
