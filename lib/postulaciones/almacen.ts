import { CLAVES } from "@/lib/demo/claves";
import { agregar, leerPostulaciones } from "./postulaciones";
import type { Postulacion } from "./tipos";

/** Lee las postulaciones del navegador. Sin almacenamiento o con datos dañados devuelve una lista vacía. */
export function leerPostulacionesDelNavegador(): Postulacion[] {
  try {
    return leerPostulaciones(window.localStorage.getItem(CLAVES.postulaciones));
  } catch {
    return [];
  }
}

/** Guarda una postulación en el navegador. Devuelve false si el navegador no deja guardar. */
export function guardarPostulacion(p: Postulacion): boolean {
  try {
    const nueva = agregar(leerPostulacionesDelNavegador(), p);
    window.localStorage.setItem(CLAVES.postulaciones, JSON.stringify(nueva));
    return true;
  } catch {
    return false;
  }
}
