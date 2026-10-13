import type { Nivel } from "@/lib/permisos/niveles";
import { CLAVES } from "@/lib/demo/claves";
import { INICIAL, leer, reducir, type Accion, type EstadoSumarte } from "@/lib/sumarte/estado";
import type { RolSesion } from "./personas";

/**
 * El nivel de la persona sale de lo que eligió en Sumarte (`EstadoSumarte`), que hoy vive en el navegador con el prefijo
 * de la persona. Cuando `base-neon` lo pase a la base, solo cambian `leerEstadoGuardado` y `guardarEstado`:
 * el resto (`calcularNivel`, el contexto de sesión) no se entera.
 */

/** Evento del navegador que avisa que cambió lo elegido en Sumarte (el proveedor de sesión lo escucha). */
export const EVENTO_NIVEL = "lh-nivel";

/** Pedido guardado cuando alguien elige un plan antes de registrarse; se aplica apenas entra (vive solo en la pestaña). */
export const CLAVE_PENDIENTE = "lh-sumarte-pendiente";

export type AjustesDePersona = { rol: RolSesion; tribuAdmin: string | null };

export type NivelCalculado = { nivel: Nivel; tribuLider: string | null };

const ORDEN: Nivel[] = ["sin-cuenta", "explorador", "miembro", "lider", "superadmin"];

/**
 * Nivel y tribu que lidera. Sin persona no hay cuenta. El super admin y el nivel asignado de antemano (`admin-tribu` en
 * `LH_PERSONAS`) son un piso: lo elegido en Sumarte nunca los baja, pero sí puede subir de plan.
 */
export function calcularNivel(estado: EstadoSumarte, persona: AjustesDePersona | null): NivelCalculado {
  if (!persona) return { nivel: "sin-cuenta", tribuLider: null };
  let nivel: Nivel = estado.tribu ? "lider" : estado.plan === "miembro" || estado.pase ? "miembro" : "explorador";
  let tribuLider = estado.tribu ? estado.tribuId : null;
  if (persona.rol === "admin-tribu") {
    if (ORDEN.indexOf("lider") > ORDEN.indexOf(nivel)) nivel = "lider";
    tribuLider = tribuLider ?? persona.tribuAdmin;
  }
  if (persona.rol === "superadmin") nivel = "superadmin";
  return { nivel, tribuLider };
}

/** Lo elegido en Sumarte por la persona en sesión (INICIAL si no eligió nada o no se puede leer). */
export function leerEstadoGuardado(almacen: Pick<Storage, "getItem"> | null): EstadoSumarte {
  try {
    return leer(almacen?.getItem(CLAVES.sumarte) ?? null);
  } catch {
    return INICIAL;
  }
}

/** Guarda lo elegido y avisa al resto de la app. Devuelve false si el navegador no deja guardar. */
export function guardarEstado(almacen: Pick<Storage, "setItem">, estado: EstadoSumarte): boolean {
  try {
    almacen.setItem(CLAVES.sumarte, JSON.stringify(estado));
  } catch {
    return false;
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_NIVEL));
  return true;
}

/** Acciones de Sumarte elegidas sin sesión, para aplicarlas al entrar. Solo se aceptan las que cambian de plan. */
export function leerPendiente(almacen: Pick<Storage, "getItem">): Accion[] {
  try {
    const lista = JSON.parse(almacen.getItem(CLAVE_PENDIENTE) ?? "[]") as unknown;
    if (!Array.isArray(lista)) return [];
    return lista.filter((a): a is Accion => {
      if (typeof a !== "object" || a === null) return false;
      const x = a as Record<string, unknown>;
      return (
        x.tipo === "pase" ||
        x.tipo === "invitacion" ||
        x.tipo === "charla" ||
        (x.tipo === "plan" && (x.plan === "explorador" || x.plan === "miembro")) ||
        (x.tipo === "nivel" && (x.nivel === "semilla" || x.nivel === "brote" || x.nivel === "raiz")) ||
        (x.tipo === "tribu" && (x.tribuId === undefined || x.tribuId === null || typeof x.tribuId === "string"))
      );
    });
  } catch {
    return [];
  }
}

export function guardarPendiente(almacen: Pick<Storage, "setItem">, acciones: Accion[]): void {
  try {
    almacen.setItem(CLAVE_PENDIENTE, JSON.stringify(acciones));
  } catch {
    // Sin almacenamiento de la pestaña no se recuerda el pedido: la persona vuelve a elegir al entrar.
  }
}

export function aplicarAcciones(estado: EstadoSumarte, acciones: Accion[]): EstadoSumarte {
  return acciones.reduce(reducir, estado);
}
