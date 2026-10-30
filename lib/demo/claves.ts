/**
 * Claves de localStorage del modo demostración. No cambiar estos nombres: borraría lo ya guardado.
 * Con una persona en sesión, cada clave se guarda con el prefijo `u:<id>:` (ver `clave`), para que dos personas
 * en el mismo navegador no se pisen. Sin sesión (o antes del login) son los nombres sin prefijo.
 */
export const NOMBRES_BASE = {
  /** Entrevista anterior; hoy solo se lee para migrarla al perfil nuevo (`perfilDatos`). */
  perfil: "lh-perfil-entrevista",
  perfilDatos: "lh-perfil",
  compromisos: "lighthouse.compromisos.v1",
  congreso: "lh-congreso-ticket",
  /** Idioma elegido para la vitrina del Congreso ("es" o "en"). Preferencia de interfaz; cualquier otro valor se ignora. */
  idiomaCongreso: "lh-congreso-idioma",
  pactos: "lh-pactos",
  semillasRonda: "lh-semillas-ronda",
  sumarte: "lh-sumarte",
  pasaporte: "lh-pasaporte",
  /** Horas de trabajo en texto libre del Pasaporte. */
  pasaporteHorasTexto: "lh-pasaporte:horas-texto",
  consultasLotes: "lh-consultas-lotes",
  contactos: "lh-contactos",
  origen: "lh-origen",
  bitacora: "lh-bitacora",
  membresia: "lh-membresia",
  /** A qué versión del manifiesto de Lighthouse VRN adhirió la persona (si cambia de versión, vuelve a adherir). */
  adhesionVersion: "lh-adhesion-version",
  postulaciones: "lh-postulaciones",
  actividad: "lh-actividad",
  kyc: "lh-kyc",
  sellos: "lh-sellos",
  hifa: "lh-hifa",
  configuracion: "lh-configuracion",
  fogon: "lh-fogon",
  /** Repartos propios y cierres simulados de las consultas del Fogón. */
  fogonConsultas: "lh-fogon-consultas",
  /** Registros de gobernanza con forma de attestation (validaciones y decisiones llevadas al consejo), solo de agregar. */
  gobernanza: "lh-gobernanza",
} as const;

/**
 * Claves compartidas entre las personas de un mismo navegador: NUNCA llevan el prefijo de una persona (no pasan por `clave`).
 * Su nombre no empieza con `lh-` a propósito: la fixtura de e2e prefija todo lo `lh-*`.
 */
export const CLAVES_COMPARTIDAS = {
  /** Constancias de los pactos (propuestas, respuestas, retiros), de solo agregar. Ver `lib/pactos/constancias.ts`. */
  pactosConstancias: "compartido:pactos-constancias",
} as const;

/** Guarda, sin prefijo, cuál fue la última persona: lo necesita el script que aplica el tema antes de hidratar. */
export const CLAVE_ULTIMA_PERSONA = "lh-ultima-persona";

const PREFIJO = "u:";

let personaActiva: string | null = null;

/** Fija la persona cuyos datos se leen y escriben (null = sin sesión). Lo llama el proveedor de sesión antes de dibujar la app. */
export function establecerPersona(id: string | null): void {
  personaActiva = id;
}

export function personaEnSesion(): string | null {
  return personaActiva;
}

/** Nombre de clave para la persona en sesión. Un nombre que ya viene prefijado se deja igual. */
export function clave(nombre: string): string {
  if (!personaActiva || nombre.startsWith(PREFIJO)) return nombre;
  return `${PREFIJO}${personaActiva}:${nombre}`;
}

type Claves = { readonly [K in keyof typeof NOMBRES_BASE]: string };

/** Las claves de la persona en sesión. Se calculan al leerlas: no las guardes en una constante de módulo. */
export const CLAVES: Claves = (() => {
  const objeto = {} as Record<string, string>;
  for (const [nombre, valor] of Object.entries(NOMBRES_BASE)) {
    Object.defineProperty(objeto, nombre, { enumerable: true, get: () => clave(valor) });
  }
  return objeto as Claves;
})();
