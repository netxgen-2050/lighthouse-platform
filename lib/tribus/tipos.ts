import { comunes } from "@/lib/idioma/textos/comunes";
import type { Idioma } from "@/lib/idioma/tipos";

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

/** Texto del estado de una tribu en cada idioma (vive en el diccionario `comunes`, una sola fuente). */
export const TEXTO_ESTADO_POR_IDIOMA: Record<Idioma, Record<EstadoTribu, string>> = {
  es: comunes.es.estadoTribu,
  en: comunes.en.estadoTribu,
};

/** El estado en español: las páginas que todavía no están traducidas siguen usando este. */
export const TEXTO_ESTADO: Record<EstadoTribu, string> = TEXTO_ESTADO_POR_IDIOMA.es;

export function textoDeEstado(estado: EstadoTribu, idioma: Idioma = "es"): string {
  return TEXTO_ESTADO_POR_IDIOMA[idioma][estado];
}
