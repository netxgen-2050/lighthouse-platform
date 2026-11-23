// Datos de ejemplo de la ronda (no son de nadie real). Los motivos no llevan ningún id del equipo como texto.
import type { Idioma } from "@/lib/idioma/tipos";
import type { Dimension, Evaluacion } from "./tipos";

export const PERIODO_EJEMPLO = "2026-10";
export const PERSONA_EJEMPLO = "vos";
/** Equipo de la ronda (mismo círculo, período 2026-10). */
export const EQUIPO_EJEMPLO = ["vos", "martina", "joaquin", "lucia", "tomas"];

type Fila = { de: string; rol: number; cultura: number; motivo: { es: string; en: string } };

const FILAS: Fila[] = [
  {
    de: "lucia",
    rol: 3,
    cultura: 4,
    motivo: {
      es: "Cumple lo acordado en cada jornada y es cálida con quienes llegan.",
      en: "Meets what was agreed at every work day and is warm with newcomers.",
    },
  },
  {
    de: "tomas",
    rol: 3,
    cultura: 4,
    motivo: {
      es: "Entrega a tiempo y escucha antes de opinar.",
      en: "Delivers on time and listens before giving an opinion.",
    },
  },
  {
    de: "martina",
    rol: 4,
    cultura: 4,
    motivo: {
      es: "Se puede contar con esta persona para las tareas de la huerta.",
      en: "This person can be counted on for the garden tasks.",
    },
  },
  {
    de: "joaquin",
    rol: 5,
    cultura: 5,
    motivo: {
      es: "Siempre suma y deja el espacio mejor de como lo encontró.",
      en: "Always adds value and leaves the space better than they found it.",
    },
  },
  {
    // Fuera del equipo: se descarta.
    de: "bruno",
    rol: 5,
    cultura: 5,
    motivo: { es: "Excelente en todo.", en: "Excellent in everything." },
  },
];

/** Las evaluaciones de ejemplo sobre la persona (cinco evaluadores, uno de ellos fuera del equipo). */
export function evaluacionesDeEjemplo(idioma: Idioma = "es"): Evaluacion[] {
  const salida: Evaluacion[] = [];
  for (const f of FILAS) {
    for (const dimension of ["rol", "cultura"] as Dimension[]) {
      salida.push({ de: f.de, a: PERSONA_EJEMPLO, dimension, nota: f[dimension], motivo: f.motivo[idioma] });
    }
  }
  return salida;
}

/** Todos los motivos de ejemplo (para comprobar que nunca se muestran). */
export const MOTIVOS_DE_EJEMPLO: string[] = FILAS.flatMap((f) => [f.motivo.es, f.motivo.en]);

/** Resumen fijo, escrito a mano: simula el que en la versión real arma una IA. No copia ninguna frase de los motivos. */
export const RESUMEN_FEEDBACK_EJEMPLO: Record<Idioma, string> = {
  es: "En general el equipo ve un trabajo constante y confiable, con una presencia que ayuda al clima del grupo. Lo más repetido es la puntualidad y la disposición a colaborar.",
  en: "Overall the team sees steady, dependable work and a presence that helps the mood of the group. What comes up most is punctuality and a willingness to collaborate.",
};
