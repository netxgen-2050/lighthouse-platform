import type { Celda, Columna, Motivo, Puerta } from "./tipos";

/**
 * Transcripción de la tabla de permisos de
 * NS_platform/Documentation/18 - Integración plataforma y tokenomics.md §3.
 * Cada celda "—" es null. No hay `if` sueltos: toda regla sale de acá.
 *
 * Fuera de esta tabla queda la fila "Descuentos y prioridad en estadías y
 * eventos" de la nota: la spec servicio-permisos lista 9 puertas, más `voto-fideicomiso`
 * (pase-fundador-gobernanza), que la nota 18 todavía no tiene.
 */
export const COLUMNAS: Columna[] = [
  "explorador",
  "miembro",
  "pase",
  "tribu",
  "presencia",
  "residente",
];

export const MOTIVO_DE_COLUMNA: Record<Columna, Motivo> = {
  explorador: "plan",
  miembro: "plan",
  pase: "pase",
  tribu: "tribu",
  presencia: "presencia",
  residente: "rol",
};

const A: Celda = { grado: "abierta" };

export const TABLA: Record<Puerta, Record<Columna, Celda | null>> = {
  "mapa-tribus-eventos": {
    explorador: A, miembro: A, pase: A, tribu: A, presencia: A, residente: A,
  },
  "registrar-ticket": {
    explorador: A, miembro: A, pase: A, tribu: A, presencia: null, residente: A,
  },
  "foros-red": {
    explorador: null, miembro: A, pase: A, tribu: A, presencia: A, residente: A,
  },
  "sala-tribu": {
    explorador: null,
    miembro: { grado: "visita" },
    pase: { grado: "visita" },
    tribu: { grado: "completa", soloSuTribu: true },
    presencia: null,
    // Decisión de Gus (7-oct-2026): ser residente no abre salas de tribu. Un residente
    // entra a la sala de su tribu (o de sus tribus) por la columna "tribu".
    residente: null,
  },
  "canal-fundadores": {
    explorador: null, miembro: null, pase: A, tribu: null, presencia: null, residente: null,
  },
  "voz-tribu": {
    explorador: null,
    miembro: null,
    pase: null,
    tribu: { grado: "segun estatuto", soloSuTribu: true },
    presencia: null,
    // Decisión de Gus (7-oct-2026): la voz en una tribu sale solo de ser miembro de esa tribu.
    residente: null,
  },
  "voz-fondo-comun": {
    explorador: null,
    miembro: null,
    pase: { grado: "1 voz" },
    tribu: null,
    // Nota 18: "×1,5 a ×2 (tope)". Sin decisión registrada: solo refuerza.
    presencia: { grado: "abierta", soloRefuerzo: true },
    residente: null,
  },
  "voto-asamblea-residentes": {
    explorador: null, miembro: null, pase: null, tribu: null, presencia: null,
    residente: { grado: "1 persona = 1 voto" },
  },
  // Decisión de Gus (14-oct-2026, cambio pase-fundador-gobernanza): el Pase Fundador da gobernanza; vota en el Fideicomiso.
  // Los tres niveles del pase votan igual. En la versión real el alcance lo define el contrato del fideicomiso (R14).
  "voto-fideicomiso": {
    explorador: null, miembro: null, pase: A, tribu: null, presencia: null, residente: null,
  },
  creditos: {
    explorador: null, miembro: null, pase: A, tribu: null, presencia: null, residente: null,
  },
};

export const PUERTAS = Object.keys(TABLA) as Puerta[];
