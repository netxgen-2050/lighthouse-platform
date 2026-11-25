// Nivel inicial con el que se mira una propuesta (design §3). La identidad es la de la sesión del navegador ("vos"), no una persona
// nueva. Módulo puro: no lee la sesión ni el almacenamiento; lo que sabe de la persona se lo pasa quien lo llama.
import { COMUN_ID } from "@/lib/gobernanza/datos";
import { caminoHasta, construirHolarquia, type NodoH } from "@/lib/gobernanza/holarquia";
import type { NivelImplicacion, Propuesta } from "./tipos";

/** La persona del navegador. */
export const VOS = "vos";

export type DatosDePersona = {
  /** Comunidades donde es miembro aceptada (`lighthouse` o ids de tribu). */
  membresias: readonly string[];
  /** Tribu que lidera (Plan Tribu), o null. */
  tribuLider: string | null;
};

let arbol: NodoH | null = null;
const raiz = (): NodoH => (arbol ??= construirHolarquia("es"));

/**
 * - Propuesta del consejo: `ambito` solo si "vos" está en la lista que define el board; si no, `red` (ser de la tribu que pide
 *   no te hace del ámbito que decide: F3).
 * - Del común: toda persona con sesión arranca como `comun`.
 * - Sin holón (la huerta): `red`.
 * - De una tribu o de un círculo de una tribu (la tribu sale del camino en la holarquía, no de `Decision.tribuId`): `ambito` si
 *   es miembro aceptada o la lidera; si no, `red`.
 */
export function nivelInicial(p: Pick<Propuesta, "holonId" | "ambitoConsejo">, persona: DatosDePersona, ambitoConsejo?: readonly string[]): NivelImplicacion {
  if (p.ambitoConsejo) return (ambitoConsejo ?? p.ambitoConsejo.personas).includes(VOS) ? "ambito" : "red";
  if (p.holonId === null) return "red";
  if (p.holonId === COMUN_ID) return "comun";
  const tribu = caminoHasta(raiz(), p.holonId).find((n) => n.tipo === "tribu");
  if (!tribu) return "red";
  return persona.membresias.includes(tribu.id) || persona.tribuLider === tribu.id ? "ambito" : "red";
}

/** Igual, pero si leer lo guardado falla (almacenamiento roto o bloqueado) arranca como `red`. */
export function nivelInicialSeguro(
  p: Pick<Propuesta, "holonId" | "ambitoConsejo">,
  leer: () => DatosDePersona,
  ambitoConsejo?: readonly string[],
): NivelImplicacion {
  try {
    return nivelInicial(p, leer(), ambitoConsejo);
  } catch {
    return "red";
  }
}
