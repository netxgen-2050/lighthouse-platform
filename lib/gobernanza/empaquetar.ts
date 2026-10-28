// Layout de la holarquía: círculos dentro de círculos. Es lo único que usa d3-hierarchy (solo `hierarchy` + `pack`),
// así que si se quisiera sacar la dependencia se cambia esta función.
import { hierarchy, pack } from "d3-hierarchy";
import { hijosDe, type NodoH } from "./holarquia";

export type Circulo2D = { x: number; y: number; r: number };

/** Posición y radio de cada nodo, en un cuadrado de `tamaño` x `tamaño`. Puro y determinístico. */
export function empaquetar(raiz: NodoH, tamaño: number): Map<string, Circulo2D> {
  const jerarquia = hierarchy<NodoH>(raiz, (n) => {
    const h = hijosDe(n);
    return h.length > 0 ? h : null;
  }).sum((n) => (hijosDe(n).length === 0 ? 1 : 0));
  const resultado = pack<NodoH>().size([tamaño, tamaño]).padding(3)(jerarquia);
  const salida = new Map<string, Circulo2D>();
  resultado.each((nodo) => {
    salida.set(nodo.data.id, { x: nodo.x, y: nodo.y, r: nodo.r });
  });
  return salida;
}
