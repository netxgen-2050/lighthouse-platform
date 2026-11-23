/**
 * Forma del consentimiento que viaja entre el servidor y el navegador (`GET` y `POST /api/consentimientos`). Sin dependencias del
 * servidor: el navegador solo importa tipos y la lista de canales de acá.
 */

export const CANALES_CONSENTIMIENTO = ["alta", "al-entrar", "nueva-version", "mis-datos"] as const;
export type CanalRegistrado = (typeof CANALES_CONSENTIMIENTO)[number];

export type EventoNovedades = "acepta" | "retira";

/** Lo que eligió la persona con la casilla de novedades: marcada, sin marcar, o no tocar (design §2). */
export type EleccionNovedades = "acepta" | "retira" | "sin-cambio";

export type RegistroNovedades = {
  evento: EventoNovedades;
  version: string;
  registradoAt: string;
  canal: CanalRegistrado | null;
};

/** El estado vigente de una persona, calculado en el servidor desde la última fila por tipo (design §1). */
export type EstadoServidor = {
  /** `vigente`: política y términos aceptados en la versión actual; `retirado`: retiró; `pendiente`: nunca aceptó o la versión cambió. */
  general: "vigente" | "pendiente" | "retirado";
  /** De la última fila de la política (con cualquier evento); null si no hay ninguna. */
  version: string | null;
  registradoAt: string | null;
  canal: CanalRegistrado | null;
  /** ¿Quiere recibir novedades por email? */
  novedades: boolean;
  /** La última fila de novedades (null = nunca decidió). */
  novedadesRegistro: RegistroNovedades | null;
};

/** Una fila del libro, tal como la ve la persona en la descarga de Mis datos. */
export type FilaPublica = {
  tipo: string;
  evento: string;
  version: string;
  canal: string | null;
  idioma: string | null;
  registradoAt: string;
  aceptadoEnCliente: string | null;
};

export const ESTADO_SIN_REGISTRO: EstadoServidor = {
  general: "pendiente",
  version: null,
  registradoAt: null,
  canal: null,
  novedades: false,
  novedadesRegistro: null,
};

export type CuerpoConsentimiento = {
  accion: "acepta" | "retira";
  canal: CanalRegistrado;
  version: string;
  aceptadoEnCliente?: string;
  enviadoEnCliente?: string;
  novedades?: EleccionNovedades;
};
