// El lugar en la holarquía que viaja en la dirección de /fogon (`?holon=<id>&lente=<id>`). Lo que llega por la dirección no
// se confía: se valida contra el árbol y el registro de lentes, y los textos que se ven salen del nodo encontrado, nunca
// del parámetro.
import { buscarNodo, type NodoH } from "./holarquia";

export type ParametroDeDireccion = string | string[] | undefined;
export type LugarInicial = { focoId: string; lenteId: string };

const primero = (v: ParametroDeDireccion): string | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

/**
 * Interpreta `holon` y `lente`. Un holón que no existe (o que no es un círculo, tribu, consejo o común) vuelve al común;
 * una lente desconocida vuelve a la primera. Nunca falla.
 */
export function interpretarLugar(
  raiz: NodoH,
  lenteIds: readonly string[],
  params: { holon?: ParametroDeDireccion; lente?: ParametroDeDireccion },
): LugarInicial {
  const holon = primero(params.holon);
  const nodo = holon ? buscarNodo(raiz, holon) : null;
  const focoId = nodo && "hijos" in nodo ? nodo.id : raiz.id;
  const lente = primero(params.lente);
  const lenteId = lente && lenteIds.includes(lente) ? lente : lenteIds[0];
  return { focoId, lenteId };
}

/** Los parámetros de la dirección para un lugar: la primera lente no se escribe. */
export function parametrosDeLugar(lugar: LugarInicial, raizId: string, primeraLente: string): URLSearchParams {
  const p = new URLSearchParams();
  if (lugar.focoId !== raizId) p.set("holon", lugar.focoId);
  if (lugar.lenteId !== primeraLente) p.set("lente", lugar.lenteId);
  return p;
}
