import { clave } from "@/lib/demo/claves";
import { esPublica } from "@/lib/sesion/rutas-publicas";

/**
 * Consentimiento informado de la persona (política de privacidad y términos del prototipo).
 * Hoy se guarda en el navegador, con el prefijo de la persona. Con `base-neon` se guarda en la base: solo cambian
 * `leerConsentimiento`, `registrarConsentimiento`, `registrarConsentimientoSensible` y `retirarConsentimiento`
 * (la única puerta de entrada y salida del registro); el resto de la app no se entera.
 */

/**
 * Versión de la política vigente. Al cambiarla, todas las personas vuelven a ver la pantalla de consentimiento.
 * Es un borrador: hasta que lo revise Gabriel (pendiente R14) no es una versión legal.
 */
export const VERSION_POLITICA = "2026-10-14-borrador";

/** Nombre base de la clave. No está en `NOMBRES_BASE`: "Borrar todo" borra datos de ejemplo, no el consentimiento. */
export const NOMBRE_CLAVE_CONSENTIMIENTO = "lh-consentimiento";

/** Evento del navegador que avisa que cambió el consentimiento (el proveedor de sesión lo escucha). */
export const EVENTO_CONSENTIMIENTO = "lh-consentimiento-cambio";

export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type Aceptado = { politica: boolean; terminos: boolean };

export type Consentimiento = {
  /** Versión de la política que se aceptó. */
  version: string;
  /** Fecha y hora (ISO) en que se aceptó. */
  aceptadoEn: string;
  /** Qué se aceptó. */
  aceptado: { politica: true; terminos: true };
  /** Consentimiento específico para identidad, residencia fiscal y origen de fondos (KYC); null si todavía no se dio. */
  sensibles: { version: string; aceptadoEn: string } | null;
};

/** Clave del consentimiento de la persona en sesión. */
export function claveConsentimiento(): string {
  return clave(NOMBRE_CLAVE_CONSENTIMIENTO);
}

function esTexto(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/** Lo guardado, o null si no hay nada o está dañado. */
export function leerConsentimiento(almacen: Pick<Storage, "getItem"> | null): Consentimiento | null {
  try {
    const crudo = almacen?.getItem(claveConsentimiento()) ?? null;
    if (crudo === null) return null;
    const o = JSON.parse(crudo) as Record<string, unknown> | null;
    if (!o || typeof o !== "object") return null;
    const aceptado = o.aceptado as Record<string, unknown> | undefined;
    if (!esTexto(o.version) || !esTexto(o.aceptadoEn) || aceptado?.politica !== true || aceptado?.terminos !== true) return null;
    const s = o.sensibles as Record<string, unknown> | null | undefined;
    const sensibles = s && esTexto(s.version) && esTexto(s.aceptadoEn) ? { version: s.version, aceptadoEn: s.aceptadoEn } : null;
    return { version: o.version, aceptadoEn: o.aceptadoEn, aceptado: { politica: true, terminos: true }, sensibles };
  } catch {
    return null;
  }
}

/** ¿Aceptó la versión vigente de la política? Con otra versión (o sin registro) hay que volver a pedirlo. */
export function consentimientoVigente(c: Consentimiento | null): boolean {
  return c !== null && c.version === VERSION_POLITICA;
}

/** ¿Dio el consentimiento específico para datos sensibles de la versión vigente? */
export function sensiblesVigente(c: Consentimiento | null): boolean {
  return consentimientoVigente(c) && c?.sensibles?.version === VERSION_POLITICA;
}

function avisar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_CONSENTIMIENTO));
}

/**
 * Registra que la persona aceptó la política y los términos (las dos casillas son obligatorias).
 * Devuelve false si falta una casilla o el navegador no deja guardar.
 */
export function registrarConsentimiento(
  almacen: Pick<Storage, "getItem" | "setItem">,
  aceptado: Aceptado,
  ahora: Date = new Date(),
): boolean {
  if (!aceptado.politica || !aceptado.terminos) return false;
  const previo = leerConsentimiento(almacen);
  const registro: Consentimiento = {
    version: VERSION_POLITICA,
    aceptadoEn: ahora.toISOString(),
    aceptado: { politica: true, terminos: true },
    // El consentimiento sensible es de una versión: si la política cambió, se vuelve a pedir en el KYC.
    sensibles: previo?.sensibles?.version === VERSION_POLITICA ? previo.sensibles : null,
  };
  try {
    almacen.setItem(claveConsentimiento(), JSON.stringify(registro));
  } catch {
    return false;
  }
  avisar();
  return true;
}

/** Registra el consentimiento específico del KYC. Pide haber aceptado antes la política vigente. */
export function registrarConsentimientoSensible(
  almacen: Pick<Storage, "getItem" | "setItem">,
  ahora: Date = new Date(),
): boolean {
  const previo = leerConsentimiento(almacen);
  if (!previo || !consentimientoVigente(previo)) return false;
  const registro: Consentimiento = { ...previo, sensibles: { version: VERSION_POLITICA, aceptadoEn: ahora.toISOString() } };
  try {
    almacen.setItem(claveConsentimiento(), JSON.stringify(registro));
  } catch {
    return false;
  }
  avisar();
  return true;
}

/** Borra el registro del consentimiento (sin avisar: quien retira cierra la sesión enseguida). Devuelve false si falla. */
export function retirarConsentimiento(almacen: Pick<Storage, "removeItem">): boolean {
  try {
    almacen.removeItem(claveConsentimiento());
    return true;
  } catch {
    return false;
  }
}

/**
 * ¿Esta ruta pide el consentimiento? Todas las que piden sesión y, además, Sumarte (el registro): ahí se acepta
 * antes de aplicar el plan elegido. El resto de las páginas públicas (Descubrir, la política) siguen abiertas.
 */
export function rutaPideConsentimiento(ruta: string): boolean {
  const limpia = (ruta.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
  return limpia === "/sumarte" || !esPublica(ruta);
}
