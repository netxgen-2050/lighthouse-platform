import { VIGENCIA_PENDIENTE_MS } from "@/lib/sesion/nivel";
import { VERSIONES_POLITICA } from "./politica";

/**
 * Consentimiento informado de la persona (política de privacidad y términos del prototipo).
 * Hoy se guarda en el navegador, con el prefijo de la persona. Con `base-neon` se guarda en la base: solo cambian
 * `leerConsentimiento`, `registrarConsentimiento`, `registrarConsentimientoSensible` y `retirarConsentimiento`
 * (la única puerta de entrada y salida del registro); el resto de la app no se entera.
 */

/**
 * Versión de la política vigente: la última de `VERSIONES_POLITICA`. Al cambiarla, todas las personas vuelven a aceptar.
 * Es un borrador: hasta que lo revise Gabriel (pendiente R14) no es una versión legal.
 */
export const VERSION_POLITICA: string = VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!.version;

/** Nombre base de la clave. No está en `NOMBRES_BASE`: "Borrar todo" borra datos de ejemplo, no el consentimiento. */
export const NOMBRE_CLAVE_CONSENTIMIENTO = "lh-consentimiento";

/** Evento del navegador que avisa que cambió el consentimiento (el proveedor de sesión lo escucha). */
export const EVENTO_CONSENTIMIENTO = "lh-consentimiento-cambio";

/** Aceptación dada en el paso previo al login, en `sessionStorage` (por pestaña, sin prefijo: todavía no hay persona). */
export const CLAVE_ACEPTACION_PREVIA = "lh-consentimiento-previo";

export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type Aceptado = { politica: boolean; terminos: boolean };

/** Por qué camino aceptó: `alta` (paso "Crear tu cuenta"), `al-entrar` (paso "Entrar" o pantalla) o `nueva-version`. */
export type CanalConsentimiento = "alta" | "al-entrar" | "nueva-version";

const CANALES: readonly string[] = ["alta", "al-entrar", "nueva-version"];

export type Consentimiento = {
  /** Versión de la política que se aceptó. */
  version: string;
  /** Fecha y hora (ISO) en que se aceptó. */
  aceptadoEn: string;
  /** Qué se aceptó. */
  aceptado: { politica: true; terminos: true };
  /** Por qué camino; ausente en los registros anteriores a `consentimiento-alta` ("sin dato"). */
  canal?: CanalConsentimiento;
  /** Consentimiento específico para identidad, residencia fiscal y origen de fondos (KYC); null si todavía no se dio. */
  sensibles: { version: string; aceptadoEn: string } | null;
};

/** Clave del consentimiento de la persona con ese id (explícito: no depende de quién esté activa). */
export function claveConsentimientoDe(idPersona: string): string {
  return `u:${idPersona}:${NOMBRE_CLAVE_CONSENTIMIENTO}`;
}

function esTexto(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/** Lo guardado de esa persona, o null si no hay nada o está dañado. */
export function leerConsentimiento(almacen: Pick<Storage, "getItem"> | null, idPersona: string): Consentimiento | null {
  try {
    const crudo = almacen?.getItem(claveConsentimientoDe(idPersona)) ?? null;
    if (crudo === null) return null;
    const o = JSON.parse(crudo) as Record<string, unknown> | null;
    if (!o || typeof o !== "object") return null;
    const aceptado = o.aceptado as Record<string, unknown> | undefined;
    if (!esTexto(o.version) || !esTexto(o.aceptadoEn) || aceptado?.politica !== true || aceptado?.terminos !== true) return null;
    // Sin camino = registro anterior a este cambio (vale); con un camino que no es uno de los tres, se descarta.
    if (o.canal !== undefined && !(typeof o.canal === "string" && CANALES.includes(o.canal))) return null;
    const s = o.sensibles as Record<string, unknown> | null | undefined;
    const sensibles = s && esTexto(s.version) && esTexto(s.aceptadoEn) ? { version: s.version, aceptadoEn: s.aceptadoEn } : null;
    const registro: Consentimiento = { version: o.version, aceptadoEn: o.aceptadoEn, aceptado: { politica: true, terminos: true }, sensibles };
    if (o.canal !== undefined) registro.canal = o.canal as CanalConsentimiento;
    return registro;
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
 * Camino con el que se registra una aceptación hecha sin el paso "Crear tu cuenta": `nueva-version` si había un registro de
 * otra versión, `al-entrar` si no había ninguno.
 */
export function canalAlEntrar(previo: Consentimiento | null): CanalConsentimiento {
  return previo !== null && !consentimientoVigente(previo) ? "nueva-version" : "al-entrar";
}

/**
 * Registra que la persona aceptó la política y los términos (las dos casillas son obligatorias).
 * `aceptadoEn` es la fecha y hora en que marcó las casillas (por defecto, ahora). Devuelve false si falta una casilla o el
 * navegador no deja guardar.
 */
export function registrarConsentimiento(
  almacen: Pick<Storage, "getItem" | "setItem">,
  idPersona: string,
  aceptado: Aceptado,
  opciones: { canal?: CanalConsentimiento; aceptadoEn?: Date } = {},
): boolean {
  if (!aceptado.politica || !aceptado.terminos) return false;
  const previo = leerConsentimiento(almacen, idPersona);
  const registro: Consentimiento = {
    version: VERSION_POLITICA,
    aceptadoEn: (opciones.aceptadoEn ?? new Date()).toISOString(),
    aceptado: { politica: true, terminos: true },
    ...(opciones.canal ? { canal: opciones.canal } : {}),
    // El consentimiento sensible es de una versión: si la política cambió, se vuelve a pedir en el KYC.
    sensibles: previo?.sensibles?.version === VERSION_POLITICA ? previo.sensibles : null,
  };
  try {
    almacen.setItem(claveConsentimientoDe(idPersona), JSON.stringify(registro));
  } catch {
    return false;
  }
  avisar();
  return true;
}

/** Registra el consentimiento específico del KYC. Pide haber aceptado antes la política vigente. */
export function registrarConsentimientoSensible(
  almacen: Pick<Storage, "getItem" | "setItem">,
  idPersona: string,
  ahora: Date = new Date(),
): boolean {
  const previo = leerConsentimiento(almacen, idPersona);
  if (!previo || !consentimientoVigente(previo)) return false;
  const registro: Consentimiento = { ...previo, sensibles: { version: VERSION_POLITICA, aceptadoEn: ahora.toISOString() } };
  try {
    almacen.setItem(claveConsentimientoDe(idPersona), JSON.stringify(registro));
  } catch {
    return false;
  }
  avisar();
  return true;
}

/** Borra el registro del consentimiento (sin avisar: quien retira cierra la sesión enseguida). Devuelve false si falla. */
export function retirarConsentimiento(almacen: Pick<Storage, "removeItem">, idPersona: string): boolean {
  try {
    almacen.removeItem(claveConsentimientoDe(idPersona));
    return true;
  } catch {
    return false;
  }
}

/** Desde qué paso aceptó: "alta" (Crear tu cuenta) o "entrar" (Entrar). */
export type ModoAlta = "alta" | "entrar";

export type AceptacionPrevia = { aceptadoEn: string; modo: ModoAlta; novedades: boolean };

/** Guarda la aceptación dada en el paso previo al login, en la pestaña. Devuelve false si el navegador no deja guardar. */
export function guardarAceptacionPrevia(
  almacen: Pick<Storage, "setItem">,
  ahora: Date,
  datos: { modo: ModoAlta; novedades: boolean },
): boolean {
  try {
    almacen.setItem(
      CLAVE_ACEPTACION_PREVIA,
      JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: ahora.toISOString(), modo: datos.modo, novedades: datos.novedades }),
    );
    return true;
  } catch {
    return false;
  }
}

function leerAceptacionPrevia(almacen: Pick<Storage, "getItem"> | null, ahora: Date): AceptacionPrevia | null {
  try {
    const crudo = almacen?.getItem(CLAVE_ACEPTACION_PREVIA) ?? null;
    if (crudo === null) return null;
    const o = JSON.parse(crudo) as Record<string, unknown> | null;
    if (!o || typeof o !== "object") return null;
    if (o.version !== VERSION_POLITICA || !esTexto(o.aceptadoEn)) return null;
    if (o.modo !== "alta" && o.modo !== "entrar") return null;
    const cuando = Date.parse(o.aceptadoEn);
    if (!Number.isFinite(cuando) || ahora.getTime() - cuando > VIGENCIA_PENDIENTE_MS) return null;
    return { aceptadoEn: o.aceptadoEn, modo: o.modo, novedades: o.novedades === true };
  } catch {
    return null;
  }
}

/** ¿Se puede abrir el login? Solo con una aceptación previa de la versión vigente y dentro del plazo. No la consume. */
export function puedeAbrirLogin(almacen: Pick<Storage, "getItem"> | null, ahora: Date): boolean {
  return leerAceptacionPrevia(almacen, ahora) !== null;
}

/**
 * Llama a `login` solo si `puedeAbrirLogin` (design §1). Devuelve si lo llamó. El proveedor la usa en su única puerta
 * privada al login; vive acá para poder probarla con un login falso.
 */
export function intentarLogin(almacen: Pick<Storage, "getItem"> | null, ahora: Date, login: () => void): boolean {
  if (!puedeAbrirLogin(almacen, ahora)) return false;
  login();
  return true;
}

/**
 * Lee la aceptación previa y la **borra siempre** (se usa en el primer login de la pestaña, la haya usado o no).
 * Devuelve null si no hay, venció (más de 5 minutos) o es de otra versión.
 */
export function tomarAceptacionPrevia(almacen: Pick<Storage, "getItem" | "removeItem"> | null, ahora: Date): AceptacionPrevia | null {
  const aceptacion = leerAceptacionPrevia(almacen, ahora);
  try {
    almacen?.removeItem(CLAVE_ACEPTACION_PREVIA);
  } catch {
    // Sin almacenamiento de la pestaña no hay nada que borrar.
  }
  return aceptacion;
}

/** Borra la aceptación previa sin leerla (al salir). */
export function descartarAceptacionPrevia(almacen: Pick<Storage, "removeItem"> | null): void {
  try {
    almacen?.removeItem(CLAVE_ACEPTACION_PREVIA);
  } catch {
    // Sin almacenamiento de la pestaña no hay nada que borrar.
  }
}

/**
 * ¿Esta ruta pide el consentimiento? Todas menos la política: tiene que poder leerse antes de aceptarla. Las demás
 * (también las públicas) lo piden cuando hay una sesión sin consentimiento vigente.
 */
export function rutaPideConsentimiento(ruta: string): boolean {
  const limpia = (ruta.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
  return limpia !== "/privacidad";
}
