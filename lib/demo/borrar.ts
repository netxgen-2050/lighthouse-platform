import { CLAVES } from "./claves";

/** Quita del navegador todo lo que guarda el modo demostración. */
export function borrarDemo(quitar: (clave: string) => void): void {
  for (const clave of Object.values(CLAVES)) quitar(clave);
}
