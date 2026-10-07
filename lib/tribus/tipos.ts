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
};

export const TEXTO_ESTADO: Record<EstadoTribu, string> = {
  activa: "Activa",
  formacion: "En formación",
  vacante: "Busca tribu",
};
