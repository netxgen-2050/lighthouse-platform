export type Territorio = {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  /** Texto, no número: es una aproximación. Si falta, es `undefined` ("sin dato"), nunca 0. */
  superficie?: string;
  /** Solo los nombres; sin montos ni horas. */
  bienesComunes: string[];
};

export type ResumenTerritorio = {
  activa: number;
  formacion: number;
  vacante: number;
  total: number;
};
