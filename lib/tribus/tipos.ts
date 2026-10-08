export type EstadoTribu = "activa" | "formacion" | "vacante";

export type Tribu = {
  id: string;
  /** Territorio al que pertenece (equivale a una clave foránea). */
  territorioId: string;
  nombre: string;
  iniciales: string;
  barrio: number;
  foco: string;
  estado: EstadoTribu;
  hogares: string;
  subtitulo?: string;
  declaracion?: string;
  tiene: string[];
  busca: string[];
  areas?: string[];
  areasAbiertas?: string[];
  ritual: string;
  formaJuridica: string;
  pozo?: string[];
  /** Plata en USD: comprometida y meta (dato de ejemplo; en los vacantes 0 es el ejemplo real). */
  plata: { comprometida: number; meta: number };
  /** Roles cubiertos y necesarios. */
  roles: { cubiertos: number; necesarios: number };
  /** Etapa de ejemplo, solo para las tribus en formación. */
  etapa?: string;
  /** Cantidad de avales de la red (ejemplo). */
  avales: number;
};

export const TEXTO_ESTADO: Record<EstadoTribu, string> = {
  activa: "Activa",
  formacion: "En formación",
  vacante: "Busca tribu",
};
