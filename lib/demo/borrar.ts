import { CLAVES } from "./claves";

/**
 * Quita del navegador todo lo que guarda el modo demostración.
 * Intenta todas las claves aunque alguna falle; devuelve las que no se pudieron quitar.
 */
export function borrarDemo(quitar: (clave: string) => void): string[] {
  const fallidas: string[] = [];
  for (const clave of Object.values(CLAVES)) {
    try {
      quitar(clave);
    } catch {
      fallidas.push(clave);
    }
  }
  return fallidas;
}
