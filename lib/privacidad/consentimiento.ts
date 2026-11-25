import { VIGENCIA_PENDIENTE_MS } from "@/lib/sesion/nivel";
import type { CanalRegistrado, CuerpoConsentimiento, EstadoServidor, FilaPublica } from "./estado";
import { VERSIONES_POLITICA } from "./politica";

/**
 * Consentimiento informado de la persona (política de privacidad y términos del prototipo).
 * Con sesión, el consentimiento vive en el servidor, en el libro `consentimientos` (`consentimiento-en-la-base`): este archivo
 * es la única puerta del navegador (`pedirConsentimiento`, `aceptarEnServidor`, `retirarEnServidor`, `cambiarNovedadesEnServidor`).
 * El navegador solo guarda lo que todavía no se mudó: el consentimiento para datos sensibles del KYC (`datos-en-la-nube`) y la
 * aceptación previa al login, en la pestaña.
 */

/**
 * Versión de la política vigente: la última de `VERSIONES_POLITICA`. Al cambiarla, todas las personas vuelven a aceptar.
 * Es un borrador: hasta que lo revise Gabriel (pendiente R14) no es una versión legal.
 */
export const VERSION_POLITICA: string = VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!.version;

/**
 * Nombre base de la clave del consentimiento que se guardaba en el navegador antes de `consentimiento-en-la-base`. Hoy solo se
 * usa para limpiarlo. No está en `NOMBRES_BASE`: "Borrar todo" borra datos de ejemplo, no el consentimiento.
 */
export const NOMBRE_CLAVE_CONSENTIMIENTO = "lh-consentimiento";

/** Clave (también anterior) de las novedades en el navegador; hoy solo se limpia. */
const NOMBRE_CLAVE_NOVEDADES_ANTERIOR = "lh-novedades";

/** Consentimiento para datos sensibles (KYC): sigue en el navegador hasta `datos-en-la-nube`. Tampoco está en `NOMBRES_BASE`. */
export const NOMBRE_CLAVE_SENSIBLES = "lh-consentimiento-sensibles";

/** Evento del navegador que avisa que cambió el consentimiento (el proveedor de sesión lo escucha). */
export const EVENTO_CONSENTIMIENTO = "lh-consentimiento-cambio";

/** Aceptación dada en el paso previo al login, en `sessionStorage` (por pestaña, sin prefijo: todavía no hay persona). */
export const CLAVE_ACEPTACION_PREVIA = "lh-consentimiento-previo";

export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type Aceptado = { politica: boolean; terminos: boolean };

/** Por qué camino aceptó: `alta` (paso "Crear tu cuenta"), `al-entrar` (paso "Entrar" o pantalla) o `nueva-version`. */
export type CanalConsentimiento = "alta" | "al-entrar" | "nueva-version";

export type Consentimiento = {
  /** Versión de la política que se aceptó. */
  version: string;
  /** Fecha y hora (ISO) en que se aceptó, la del servidor. */
  aceptadoEn: string;
  /** Qué se aceptó. */
  aceptado: { politica: true; terminos: true };
  /** Por qué camino; null = sin dato. */
  canal: CanalRegistrado | null;
  /** Consentimiento específico para identidad, residencia fiscal y origen de fondos (KYC); null si todavía no se dio. */
  sensibles: { version: string; aceptadoEn: string } | null;
};

export type SensiblesLocal = { version: string; aceptadoEn: string };

/** Clave del consentimiento de sensibles de la persona con ese id (explícito: no depende de quién esté activa). */
export function claveSensiblesDe(idPersona: string): string {
  return `u:${idPersona}:${NOMBRE_CLAVE_SENSIBLES}`;
}

function esTexto(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function sensiblesDe(o: unknown): SensiblesLocal | null {
  const s = o as Record<string, unknown> | null | undefined;
  return s && esTexto(s.version) && esTexto(s.aceptadoEn) ? { version: s.version, aceptadoEn: s.aceptadoEn } : null;
}

/** El consentimiento de sensibles guardado en el navegador para esa persona, o null. */
export function leerSensibles(almacen: Pick<Storage, "getItem"> | null, idPersona: string): SensiblesLocal | null {
  try {
    const crudo = almacen?.getItem(claveSensiblesDe(idPersona)) ?? null;
    return crudo === null ? null : sensiblesDe(JSON.parse(crudo));
  } catch {
    return null;
  }
}

/** ¿Dio el consentimiento específico para datos sensibles de la versión vigente? */
export function sensiblesVigente(s: SensiblesLocal | null): boolean {
  return s !== null && s.version === VERSION_POLITICA;
}

/** ¿Aceptó la versión vigente de la política? Con otra versión (o sin registro) hay que volver a pedirlo. */
export function consentimientoVigente(c: Pick<Consentimiento, "version"> | null): boolean {
  return c !== null && c.version === VERSION_POLITICA;
}

/** Avisa a la app (el proveedor de sesión) que cambió el consentimiento; con `estado`, trae el nuevo valor del servidor. */
function avisar(detalle?: { id: string; estado: EstadoServidor }) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENTO_CONSENTIMIENTO, { detail: detalle ?? null }));
}

/**
 * Registra el consentimiento específico del KYC (sigue en el navegador). Lo llama el KYC, que solo se abre con el
 * consentimiento general vigente.
 */
export function registrarConsentimientoSensible(
  almacen: Pick<Storage, "setItem">,
  idPersona: string,
  ahora: Date = new Date(),
): boolean {
  try {
    almacen.setItem(claveSensiblesDe(idPersona), JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: ahora.toISOString() }));
  } catch {
    return false;
  }
  avisar();
  return true;
}

/**
 * Limpieza de lo que el navegador guardaba antes de que el servidor fuera la fuente (design §3): el consentimiento general y las
 * novedades se ignoran y se borran; el consentimiento de sensibles que tuviera el registro anterior pasa a su clave propia.
 */
export function limpiarRegistroAnterior(almacen: Pick<Storage, "getItem" | "setItem" | "removeItem">, idPersona: string): void {
  try {
    const clave = `u:${idPersona}:${NOMBRE_CLAVE_CONSENTIMIENTO}`;
    const crudo = almacen.getItem(clave);
    if (crudo !== null) {
      if (almacen.getItem(claveSensiblesDe(idPersona)) === null) {
        let sensibles: SensiblesLocal | null = null;
        try {
          sensibles = sensiblesDe((JSON.parse(crudo) as Record<string, unknown> | null)?.sensibles);
        } catch {
          sensibles = null;
        }
        if (sensibles) almacen.setItem(claveSensiblesDe(idPersona), JSON.stringify(sensibles));
      }
      almacen.removeItem(clave);
    }
    almacen.removeItem(`u:${idPersona}:${NOMBRE_CLAVE_NOVEDADES_ANTERIOR}`);
  } catch {
    // Sin almacenamiento no hay nada que limpiar.
  }
}

/** Borra el consentimiento de sensibles (al retirar). Devuelve false si falla. */
export function borrarSensibles(almacen: Pick<Storage, "removeItem">, idPersona: string): boolean {
  try {
    almacen.removeItem(claveSensiblesDe(idPersona));
    return true;
  } catch {
    return false;
  }
}

/**
 * Camino con el que se registra una aceptación hecha sin el paso "Crear tu cuenta": `nueva-version` si había un registro de
 * otra versión, `al-entrar` si no había ninguno.
 */
export function canalAlEntrar(previo: Pick<Consentimiento, "version"> | null): CanalConsentimiento {
  return previo !== null && !consentimientoVigente(previo) ? "nueva-version" : "al-entrar";
}

// --- El servidor ---------------------------------------------------------------------------------------------------------

export type Cabeceras = () => Promise<Record<string, string>>;
type Fetch = typeof fetch;

/** De lo que dice el servidor al registro que muestra la app: null si nunca aceptó o si retiró. */
export function registroDeEstado(estado: EstadoServidor | null, sensibles: SensiblesLocal | null): Consentimiento | null {
  if (!estado || estado.general === "retirado" || !estado.version || !estado.registradoAt) return null;
  return {
    version: estado.version,
    aceptadoEn: estado.registradoAt,
    aceptado: { politica: true, terminos: true },
    canal: estado.canal,
    sensibles,
  };
}

/** El estado vigente que guardó el servidor (y, con `filas`, todas las filas de la persona). null si no respondió. */
export async function pedirConsentimiento(
  cabeceras: Cabeceras,
  opciones: { filas?: boolean } = {},
  pedir: Fetch = fetch,
): Promise<{ estado: EstadoServidor; filas?: FilaPublica[] } | null> {
  try {
    const res = await pedir(`/api/consentimientos${opciones.filas ? "?filas=1" : ""}`, {
      headers: await cabeceras(),
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { estado?: EstadoServidor; filas?: FilaPublica[] };
    return j.estado ? { estado: j.estado, filas: j.filas } : null;
  } catch {
    return null;
  }
}

async function enviar(
  cabeceras: Cabeceras,
  cuerpo: CuerpoConsentimiento,
  idPersona: string,
  pedir: Fetch,
  publicar = true,
): Promise<EstadoServidor | null> {
  try {
    const res = await pedir("/api/consentimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await cabeceras()) },
      body: JSON.stringify(cuerpo),
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { estado?: EstadoServidor };
    if (!j.estado) return null;
    if (publicar) avisar({ id: idPersona, estado: j.estado });
    return j.estado;
  } catch {
    return null;
  }
}

/**
 * Registra en el servidor que la persona aceptó la política y los términos (`novedades`: lo que marcó en la casilla opcional).
 * `aceptadoEn` es cuando marcó las casillas (por defecto, ahora). Devuelve el estado nuevo, o null si el servidor no confirmó:
 * entonces la persona sigue como estaba (anónima). Nunca se la da por aceptada sin la confirmación.
 */
export function aceptarEnServidor(
  cabeceras: Cabeceras,
  idPersona: string,
  opciones: { canal: CanalRegistrado; novedades?: boolean; aceptadoEn?: Date; ahora?: Date },
  pedir: Fetch = fetch,
): Promise<EstadoServidor | null> {
  const ahora = opciones.ahora ?? new Date();
  return enviar(
    cabeceras,
    {
      accion: "acepta",
      canal: opciones.canal,
      version: VERSION_POLITICA,
      aceptadoEnCliente: (opciones.aceptadoEn ?? ahora).toISOString(),
      enviadoEnCliente: ahora.toISOString(),
      novedades: opciones.novedades === undefined ? "sin-cambio" : opciones.novedades ? "acepta" : "retira",
    },
    idPersona,
    pedir,
  );
}

/**
 * Retira el consentimiento (novedades, política y términos, en ese orden, en una transacción del servidor). No avisa a la app
 * del cambio: quien retira todavía tiene que borrar sus datos del navegador con su sesión puesta (las claves llevan su prefijo)
 * y recién después sale. Si algo falla en el medio, `publicarEstado` avisa lo que ya quedó registrado.
 */
export function retirarEnServidor(cabeceras: Cabeceras, idPersona: string, pedir: Fetch = fetch): Promise<EstadoServidor | null> {
  return enviar(cabeceras, { accion: "retira", canal: "mis-datos", version: VERSION_POLITICA }, idPersona, pedir, false);
}

/** Avisa a la app el estado que confirmó el servidor (cuando quien lo pidió no lo publicó). */
export function publicarEstado(idPersona: string, estado: EstadoServidor): void {
  avisar({ id: idPersona, estado });
}

/** Da o retira el consentimiento de novedades desde Mis datos. */
export function cambiarNovedadesEnServidor(cabeceras: Cabeceras, idPersona: string, dar: boolean, pedir: Fetch = fetch): Promise<EstadoServidor | null> {
  return enviar(
    cabeceras,
    { accion: "acepta", canal: "mis-datos", version: VERSION_POLITICA, novedades: dar ? "acepta" : "retira" },
    idPersona,
    pedir,
  );
}

// --- Aceptación previa al login (en la pestaña) ----------------------------------------------------------------------------

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

/** El mensaje que ve la persona cuando el servidor no confirmó su aceptación (design §7.4 de `consentimiento-alta`). */
export const TEXTO_FALLO_GUARDAR = "No pudimos guardar tu aceptación. Probá de nuevo.";
