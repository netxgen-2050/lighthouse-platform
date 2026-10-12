"use client";

import { useSyncExternalStore } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { leerPreferencias, PREFERENCIAS_INICIALES, type Preferencias } from "./preferencias";

/** Aviso interno para que toda la página se entere al instante de un cambio de preferencias. */
export const EVENTO_PREFERENCIAS = "lh-preferencias-cambio";

function crudo(): string | null {
  try {
    return window.localStorage.getItem(CLAVES.configuracion);
  } catch {
    return null;
  }
}

/** Preferencias guardadas en el navegador. Sin almacenamiento o con datos dañados, las iniciales. */
export function leerPreferenciasDelNavegador(): Preferencias {
  return leerPreferencias(crudo());
}

/** Guarda las preferencias y avisa. Devuelve false si el navegador no deja guardar. */
export function guardarPreferencias(p: Preferencias): boolean {
  try {
    window.localStorage.setItem(CLAVES.configuracion, JSON.stringify(p));
  } catch {
    return false;
  } finally {
    window.dispatchEvent(new Event(EVENTO_PREFERENCIAS));
  }
  return true;
}

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener(EVENTO_PREFERENCIAS, alCambiar);
  window.addEventListener("storage", alCambiar);
  return () => {
    window.removeEventListener(EVENTO_PREFERENCIAS, alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

// useSyncExternalStore exige un valor estable: se reutiliza el objeto mientras el texto guardado no cambie.
let ultimoCrudo: string | null | undefined;
let ultimoValor: Preferencias = PREFERENCIAS_INICIALES;

function instantanea(): Preferencias {
  const actual = crudo();
  if (actual !== ultimoCrudo) {
    ultimoCrudo = actual;
    ultimoValor = leerPreferencias(actual);
  }
  return ultimoValor;
}

function delServidor(): Preferencias {
  return PREFERENCIAS_INICIALES;
}

/** Hook: las preferencias de la persona, siempre al día (en el servidor, las iniciales). */
export function usePreferencias(): Preferencias {
  return useSyncExternalStore(suscribir, instantanea, delServidor);
}
