export type TipoCompromiso = "ofrezco" | "necesito";

/** Desde la fase de prototipo (7-oct) existe la clase "plata": monto orientativo, nunca se cobra. */
export type ClaseCompromiso = "tiempo" | "bienes" | "plata";

export type Compromiso = {
  id: string;
  tipo: TipoCompromiso;
  clase: ClaseCompromiso;
  descripcion: string;
  horasPorMes?: number;
  cantidadBienes?: string;
  /** Monto orientativo en USD, entero (solo Plata). */
  montoUsd?: number;
  /** "lighthouse" o el id de una tribu. */
  para: string;
  /** ISO; solo sirve para ordenar, no se muestra. */
  creado: string;
};

export type Borrador = {
  tipo: TipoCompromiso;
  clase: ClaseCompromiso;
  descripcion: string;
  /** Texto tal como lo escribió la persona (solo Tiempo). */
  horas: string;
  /** Texto libre (solo Bienes). */
  bienes: string;
  /** Texto tal como lo escribió la persona (solo Plata). */
  monto: string;
  para: string;
};

export const MAX_DESCRIPCION = 140;
export const MAX_BIENES = 60;
export const MIN_HORAS = 1;
export const MAX_HORAS = 160;
export const MIN_MONTO = 1;
export const MAX_MONTO = 1000000;
export const PARA_LIGHTHOUSE = "lighthouse";
