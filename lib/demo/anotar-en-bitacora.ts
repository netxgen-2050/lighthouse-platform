"use client";

import { CLAVES } from "./claves";
import { anotar, leer, type EntradaBitacora } from "./bitacora";

/** Anota en la bitácora del navegador. Si no se puede guardar, no rompe la pantalla. */
export function anotarEnBitacora(entrada: Omit<EntradaBitacora, "fecha" | "ruta">): void {
  try {
    const previa = leer(window.localStorage.getItem(CLAVES.bitacora));
    const nueva = anotar(previa, { ...entrada, ruta: window.location.pathname }, new Date());
    if (nueva !== previa) window.localStorage.setItem(CLAVES.bitacora, JSON.stringify(nueva));
  } catch {
    // Sin almacenamiento: la bitácora del prototipo es opcional.
  }
}
