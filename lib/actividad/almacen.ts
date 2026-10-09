import { CLAVES } from "@/lib/demo/claves";
import { leerEventos, marcarTodasLeidas, registrar, type EventoActividad, type NuevoEvento } from "./actividad";

/** Aviso interno para que la campanita y la bandeja se actualicen en la misma pestaña. */
export const EVENTO_CAMBIO = "lh-actividad-cambio";

/** Lee el registro del navegador. Sin almacenamiento o con datos dañados devuelve una lista vacía. */
export function leerActividadDelNavegador(): EventoActividad[] {
  try {
    return leerEventos(window.localStorage.getItem(CLAVES.actividad));
  } catch {
    return [];
  }
}

function guardar(lista: EventoActividad[]): boolean {
  try {
    window.localStorage.setItem(CLAVES.actividad, JSON.stringify(lista));
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
    return true;
  } catch {
    return false;
  }
}

function idNuevo(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Registra un evento. Devuelve false si el navegador no deja guardar (la pantalla sigue funcionando igual). */
export function registrarEvento(nuevo: NuevoEvento): boolean {
  return guardar(registrar(leerActividadDelNavegador(), nuevo, new Date(), idNuevo()));
}

export function marcarTodasLeidasEnNavegador(): boolean {
  return guardar(marcarTodasLeidas(leerActividadDelNavegador(), new Date()));
}
