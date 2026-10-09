/** Claves de localStorage del modo demostración. No cambiar los valores: borraría lo ya guardado. */
export const CLAVES = {
  /** Entrevista anterior; hoy solo se lee para migrarla al perfil nuevo (`perfilDatos`). */
  perfil: "lh-perfil-entrevista",
  perfilDatos: "lh-perfil",
  compromisos: "lighthouse.compromisos.v1",
  congreso: "lh-congreso-ticket",
  pactos: "lh-pactos",
  semillasRonda: "lh-semillas-ronda",
  sumarte: "lh-sumarte",
  pasaporte: "lh-pasaporte",
  consultasLotes: "lh-consultas-lotes",
  contactos: "lh-contactos",
  bitacora: "lh-bitacora",
  membresia: "lh-membresia",
  postulaciones: "lh-postulaciones",
  actividad: "lh-actividad",
  kyc: "lh-kyc",
  sellos: "lh-sellos",
  hifa: "lh-hifa",
} as const;
