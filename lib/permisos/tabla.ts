import type { Celda, Columna, Motivo, Puerta } from "./tipos";

/**
 * Transcripción de la tabla de permisos de
 * NS_platform/Documentation/18 - Integración plataforma y tokenomics.md §3.
 * Cada celda "—" es null. No hay `if` sueltos: toda regla sale de acá.
 *
 * Fuera de esta tabla queda la fila "Descuentos y prioridad en estadías y
 * eventos" de la nota: la spec servicio-permisos lista solo 9 puertas.
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
    residente: { grado: "completa" },
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
    residente: A,
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
  creditos: {
    explorador: null, miembro: null, pase: A, tribu: null, presencia: null, residente: null,
  },
};

export const PUERTAS = Object.keys(TABLA) as Puerta[];
