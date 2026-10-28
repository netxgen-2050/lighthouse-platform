// Registro de constancias de pactos compartido entre las personas de este navegador (sin prefijo de persona).
// La otra parte (la tribu) tiene que poder leerlo. Es solo del prototipo: en la base lo reemplaza el servidor (P9).
import { CLAVES_COMPARTIDAS } from "@/lib/demo/claves";
import {
  PERSONA_BORRADA,
  agregar,
  leerConstancias,
  revocar,
  sobreEsDe,
  type ConstanciaPacto,
  type Nueva,
} from "./constancias";

export type Almacen = Pick<Storage, "getItem" | "setItem">;

function delNavegador(): Almacen | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Las constancias guardadas, o null si el navegador no deja leer ("sin dato"). Sin nada guardado es una lista vacía. */
export function leerDelNavegador(almacen: Almacen | null = delNavegador()): ConstanciaPacto[] | null {
  if (!almacen) return null;
  try {
    return leerConstancias(almacen.getItem(CLAVES_COMPARTIDAS.pactosConstancias));
  } catch {
    return null;
  }
}

/**
 * Relee, aplica el cambio y escribe (dos pestañas no se pisan). Si `cambio` devuelve null no escribe.
 * Devuelve la lista nueva, o null si no se pudo leer o escribir.
 */
export function actualizarEnNavegador(
  cambio: (lista: readonly ConstanciaPacto[]) => ConstanciaPacto[] | null,
  almacen: Almacen | null = delNavegador(),
): ConstanciaPacto[] | null {
  if (!almacen) return null;
  try {
    const actual = leerConstancias(almacen.getItem(CLAVES_COMPARTIDAS.pactosConstancias));
    const siguiente = cambio(actual);
    if (siguiente === null) return actual;
    almacen.setItem(CLAVES_COMPARTIDAS.pactosConstancias, JSON.stringify(siguiente));
    return siguiente;
  } catch {
    return null;
  }
}

/** Agrega una constancia releyendo antes de escribir. Devuelve la lista nueva o null si el navegador no deja. */
export function agregarEnNavegador(nueva: Nueva, cuando: string, almacen: Almacen | null = delNavegador()): ConstanciaPacto[] | null {
  return actualizarEnNavegador((lista) => agregar(lista, nueva, cuando), almacen);
}

/** Revoca una constancia (retirar) releyendo antes de escribir. */
export function revocarEnNavegador(id: string, por: string, cuando: string, almacen: Almacen | null = delNavegador()): ConstanciaPacto[] | null {
  return actualizarEnNavegador((lista) => revocar(lista, id, por, cuando), almacen);
}

/** Las constancias sobre los pactos de una persona (para la descarga). */
export function constanciasDe(lista: readonly ConstanciaPacto[], idPersona: string): ConstanciaPacto[] {
  return lista.filter((c) => sobreEsDe(c.sobre, idPersona));
}

/**
 * Saca del registro las constancias sobre los pactos de la persona y anonimiza `por` en las demás donde ella
 * respondió por su tribu (design §7 y §12: borrar es anonimizar). Excepción al "solo agregar", solo en el navegador.
 * Devuelve false si el navegador no deja.
 */
export function quitarConstanciasDe(idPersona: string, almacen: Almacen | null = delNavegador()): boolean {
  return (
    actualizarEnNavegador(
      (lista) =>
        lista
          .filter((c) => !sobreEsDe(c.sobre, idPersona))
          .map((c) => (c.por === idPersona ? { ...c, por: PERSONA_BORRADA } : c)),
      almacen,
    ) !== null
  );
}
