export type TipoCompromiso = "ofrezco" | "necesito";

/** Unión cerrada: no existe la clase "plata". Agregarla obliga a cambiar la spec. */
export type ClaseCompromiso = "tiempo" | "bienes";

export type Compromiso = {
  id: string;
  tipo: TipoCompromiso;
  clase: ClaseCompromiso;
  descripcion: string;
  horasPorMes?: number;
  cantidadBienes?: string;
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
  para: string;
};

export const MAX_DESCRIPCION = 140;
export const MAX_BIENES = 60;
export const MIN_HORAS = 1;
export const MAX_HORAS = 160;
export const PARA_LIGHTHOUSE = "lighthouse";
