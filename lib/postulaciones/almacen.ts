import { CLAVES } from "@/lib/demo/claves";
import { agregar, leerPostulaciones } from "./postulaciones";
import type { Postulacion } from "./tipos";

/**
 * Lee las postulaciones del navegador. Datos dañados o nada guardado dan una lista vacía;
 * si el navegador no deja leer, devuelve null (sin dato, no cero).
 */
export function leerPostulacionesDelNavegador(): Postulacion[] | null {
  try {
    return leerPostulaciones(window.localStorage.getItem(CLAVES.postulaciones));
  } catch {
    return null;
  }
}

/** Guarda una postulación en el navegador. Devuelve false si el navegador no deja guardar. */
export function guardarPostulacion(p: Postulacion): boolean {
  try {
    const nueva = agregar(leerPostulacionesDelNavegador() ?? [], p);
    window.localStorage.setItem(CLAVES.postulaciones, JSON.stringify(nueva));
    return true;
  } catch {
    return false;
  }
}
