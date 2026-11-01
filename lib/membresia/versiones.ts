import { CLAVES } from "@/lib/demo/claves";
import { leerMembresiaDelNavegador, type Membresias } from "./estado";

/*
 * A qué versión del manifiesto adhirió la persona (decisión de Gus, 29-oct-2026: si el manifiesto cambia de versión hay
 * que volver a adherir para seguir participando). Se guarda aparte de la membresía, bajo `CLAVES.adhesionVersion`:
 * así la clave de membresía no cambia de forma. Solo se guarda para el manifiesto del Lighthouse.
 */

/** Versión del manifiesto a la que adhirió cada comunidad (hoy solo `lighthouse`). */
export type VersionesAdheridas = Record<string, string>;

export const SIN_VERSIONES: VersionesAdheridas = {};

/** Lee lo guardado; cualquier cosa rara se descarta entrada por entrada. */
export function leerVersiones(crudo: string | null): VersionesAdheridas {
  if (!crudo) return SIN_VERSIONES;
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return SIN_VERSIONES;
    const salida: VersionesAdheridas = {};
    for (const [comunidad, valor] of Object.entries(o)) {
      if (typeof valor === "string" && valor.trim() !== "") salida[comunidad] = valor;
    }
    return salida;
  } catch {
    return SIN_VERSIONES;
  }
}

/** Anota la versión a la que adhirió una comunidad. */
export function conVersion(v: VersionesAdheridas, comunidad: string, version: string): VersionesAdheridas {
  return { ...v, [comunidad]: version };
}

export function versionAdheridaDe(v: VersionesAdheridas, comunidad: string): string | undefined {
  return Object.hasOwn(v, comunidad) ? v[comunidad] : undefined;
}

/**
 * Lo que la persona adhirió, tal como está en este navegador. Quien adhirió antes de que se guardara la versión no
 * tiene ninguna anotada: tiene que volver a adherir.
 */
export type Adhesion = { membresias: Membresias; versiones: VersionesAdheridas };

export const SIN_ADHESION: Adhesion = { membresias: {}, versiones: SIN_VERSIONES };

export function leerAdhesionDelNavegador(): Adhesion {
  try {
    return {
      membresias: leerMembresiaDelNavegador(),
      versiones: leerVersiones(window.localStorage.getItem(CLAVES.adhesionVersion)),
    };
  } catch {
    return SIN_ADHESION;
  }
}

