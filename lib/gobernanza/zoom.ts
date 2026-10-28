// Matemática del zoom y de las etiquetas del dibujo. Puro: se prueba solo, sin navegador.
import type { Circulo2D } from "./empaquetar";

/** La vista del dibujo: centro (x, y) y ancho visible, en unidades del layout. */
export type Vista = readonly [number, number, number];

/** Un poco de aire alrededor del círculo al que se hace zoom. */
export function vistaPara(c: Circulo2D): Vista {
  return [c.x, c.y, c.r * 2 * 1.04 + 4];
}

/** Suavizado ease-in-out (cuadrático). 0 → 0, 1 → 1. */
export function suavizar(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/** Interpolación lineal entre dos vistas. */
export function interpolar(a: Vista, b: Vista, t: number): Vista {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export const DURACION_ZOOM_MS = 600;

export type EtiquetaPersona = "nada" | "nombre" | "nombre-y-rol";

/** Radio mínimo, en píxeles de pantalla, para rotular el nombre y para rotular también el rol. */
export const UMBRAL_NOMBRE = 26;
export const UMBRAL_ROL = 34;

/**
 * Qué se dibuja dentro del círculo de una persona según su radio en pantalla. Lo que no entra no se dibuja (nunca se
 * recorta con "…"): sigue estando en el panel y en la lista.
 */
export function etiquetaPersona(radioEnPantalla: number, nombre: string, rol: string): EtiquetaPersona {
  if (radioEnPantalla < UMBRAL_NOMBRE || !entraElNombre(nombre, radioEnPantalla)) return "nada";
  if (radioEnPantalla >= UMBRAL_ROL && entraElRol(rol, radioEnPantalla)) return "nombre-y-rol";
  return "nombre";
}

/** ¿Entra el rol (a ~10 px, 12 px debajo del centro) dentro de la cuerda del círculo a esa altura? */
export function entraElRol(rol: string, radioEnPantalla: number): boolean {
  const media = Math.sqrt(Math.max(0, radioEnPantalla * radioEnPantalla - 12 * 12));
  return rol.length * 5.7 <= media * 2 * 0.9;
}

/** ¿Entra el nombre de un círculo (a ~11 px) dentro de su ancho en pantalla? Sin recortar: si no entra, no se rotula. */
export function entraElNombre(nombre: string, radioEnPantalla: number): boolean {
  return nombre.length * 6.3 <= radioEnPantalla * 2 * 0.9;
}
