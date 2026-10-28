// Registros con forma de attestation, solo en este navegador (sin servidor, sin blockchain, sin firmas).
// Lista de solo agregar: un registro no se edita; revocar es agregar un registro `revoca` que apunta al original.
import { CLAVES } from "@/lib/demo/claves";
import { listarTribusBilingues } from "@/lib/tribus/datos";
import { COMUN_ID, validacionesDeEjemplo } from "./datos";
import type { Esquema, Lugar, Registro } from "./tipos";

const ESQUEMAS: readonly string[] = ["valida-tribu", "valida-persona", "lleva-al-consejo", "revoca"];

type Nuevo = { esquema: Esquema; afirma: string; sobre: string; apuntaA?: string | null; datos?: Record<string, string> };

/** Agrega un registro al final. No toca los anteriores. El id sale del largo de la lista, así no se repite. */
export function agregar(lista: readonly Registro[], nuevo: Nuevo, cuando: string): Registro[] {
  const registro: Registro = {
    id: `r${lista.length + 1}-${nuevo.esquema}`,
    esquema: nuevo.esquema,
    afirma: nuevo.afirma,
    sobre: nuevo.sobre,
    apuntaA: nuevo.apuntaA ?? null,
    cuando,
    datos: nuevo.datos ?? {},
  };
  return [...lista, registro];
}

/** Un registro está revocado si existe un `revoca` que apunta a él. Se calcula; nunca se guarda. */
export function estaRevocado(lista: readonly Registro[], id: string): boolean {
  return lista.some((r) => r.esquema === "revoca" && r.apuntaA === id);
}

/**
 * Revoca un registro agregando uno nuevo que lo apunta. El original queda intacto. Si no existe, ya está revocado
 * o es él mismo una revocación, no hace nada.
 */
export function revocar(lista: readonly Registro[], id: string, cuando: string): Registro[] {
  const original = lista.find((r) => r.id === id);
  if (!original || original.esquema === "revoca" || estaRevocado(lista, id)) return [...lista];
  return agregar(lista, { esquema: "revoca", afirma: original.afirma, sobre: original.sobre, apuntaA: id }, cuando);
}

function vigentes(lista: readonly Registro[], esquema: Esquema): Registro[] {
  return lista.filter((r) => r.esquema === esquema && !estaRevocado(lista, r.id));
}

/** ¿El común validó a esta tribu? Cuentan los registros de ejemplo y los del navegador, menos los revocados. */
export function validadaPorElComun(tribuId: string, lista: readonly Registro[] = []): boolean {
  const todos = [...validacionesDeEjemplo(), ...lista];
  return vigentes(todos, "valida-tribu").some((r) => r.afirma === COMUN_ID && r.sobre === tribuId);
}

/** Tribus que validan hoy a una persona (sin repetir, sin las revocadas). */
export function tribusQueValidan(personaId: string, lista: readonly Registro[]): string[] {
  const ids = vigentes(lista, "valida-persona")
    .filter((r) => r.sobre === personaId)
    .map((r) => r.afirma);
  return [...new Set(ids)];
}

/**
 * Agrega una validación (la tribu valida a la persona) por cada tribu donde su membresía está aceptada y que todavía
 * no tuvo ninguna, vigente o revocada: una validación retirada no vuelve sola. Devuelve la misma lista si no hay nada nuevo.
 */
export function sincronizarValidaciones(
  lista: readonly Registro[],
  personaId: string,
  tribusMiembro: readonly string[],
  cuando: string,
): Registro[] {
  let siguiente: Registro[] = [...lista];
  for (const tribuId of tribusMiembro) {
    const yaTuvo = siguiente.some((r) => r.esquema === "valida-persona" && r.afirma === tribuId && r.sobre === personaId);
    if (!yaTuvo) siguiente = agregar(siguiente, { esquema: "valida-persona", afirma: tribuId, sobre: personaId }, cuando);
  }
  return siguiente.length === lista.length ? [...lista] : siguiente;
}

/** Un lugar por cada tribu validada por el común. Sin representante elegido (null) hasta que exista la elección real. */
export function lugaresDelConsejo(lista: readonly Registro[] = []): Lugar[] {
  return listarTribusBilingues()
    .filter((t) => validadaPorElComun(t.id, lista))
    .map((t) => ({ tribuId: t.id, representante: null }));
}

/** Lee lo guardado; cualquier cosa rara se descarta registro por registro (lista vacía si todo está roto). */
export function leerRegistros(crudo: string | null): Registro[] {
  if (!crudo) return [];
  try {
    const o: unknown = JSON.parse(crudo);
    if (!Array.isArray(o)) return [];
    const salida: Registro[] = [];
    for (const x of o) {
      if (typeof x !== "object" || x === null) continue;
      const r = x as Record<string, unknown>;
      if (
        typeof r.id !== "string" ||
        typeof r.esquema !== "string" ||
        !ESQUEMAS.includes(r.esquema) ||
        typeof r.afirma !== "string" ||
        typeof r.sobre !== "string" ||
        typeof r.cuando !== "string"
      ) {
        continue;
      }
      const datos: Record<string, string> = {};
      if (typeof r.datos === "object" && r.datos !== null) {
        for (const [k, v] of Object.entries(r.datos)) if (typeof v === "string") datos[k] = v;
      }
      salida.push({
        id: r.id,
        esquema: r.esquema as Esquema,
        afirma: r.afirma,
        sobre: r.sobre,
        apuntaA: typeof r.apuntaA === "string" ? r.apuntaA : null,
        cuando: r.cuando,
        datos,
      });
    }
    return salida;
  } catch {
    return [];
  }
}

/** Los registros guardados en el navegador. Fuera del navegador (o sin almacenamiento) devuelve una lista vacía. */
export function leerRegistrosDelNavegador(): Registro[] {
  try {
    return leerRegistros(window.localStorage.getItem(CLAVES.gobernanza));
  } catch {
    return [];
  }
}

/** Guarda la lista completa. Devuelve false si el navegador no deja guardar. */
export function guardarRegistros(lista: readonly Registro[]): boolean {
  try {
    window.localStorage.setItem(CLAVES.gobernanza, JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}
