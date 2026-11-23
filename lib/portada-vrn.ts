// Datos de la portada (`/`): los cinco capitales de la regeneración y las cifras con fuente.
// Los cinco capitales los confirmó Gus el 23-nov-2026: son los de una presentación del equipo de Lighthouse (la de SMA, que la portada no nombra) ("The 5 Capitals
// of Regenerative Development", que cita The Five Capitals Playbook). Textos de cada capital en borrador.
import { vocabulario } from "./idioma/vocabulario";
import type { Bilingue, Idioma } from "./idioma/tipos";

export type Capital = { id: string; nombre: Required<Bilingue>; texto: Required<Bilingue> };

/** De dónde salen los cinco capitales; la portada la muestra debajo de la lista. */
export const FUENTE_CAPITALES = "Presentación del equipo de Lighthouse, \"The 5 Capitals of Regenerative Development\" (cita The Five Capitals Playbook)";

export const CAPITALES: readonly Capital[] = [
  {
    id: "natural",
    nombre: { es: "Natural", en: "Natural" },
    texto: { es: "Agua, suelo, monte nativo y lo que vive ahí.", en: "Water, soil, native woodland and what lives there." },
  },
  {
    id: "humano",
    nombre: { es: "Humano", en: "Human" },
    texto: { es: "Lo que cada persona sabe y puede hacer, y su salud.", en: "What each person knows and can do, and their health." },
  },
  {
    id: "social",
    nombre: { es: "Social", en: "Social" },
    texto: { es: "La confianza y los acuerdos entre quienes están.", en: "Trust and agreements among the people here." },
  },
  {
    id: "construido",
    nombre: { es: "Construido", en: "Built" },
    texto: { es: "Caminos, casas y lo que hace falta para vivir y producir.", en: "Roads, homes and what it takes to live and produce." },
  },
  {
    id: "financiero",
    nombre: { es: "Financiero", en: "Financial" },
    texto: { es: "La plata que entra y cómo se reparte.", en: "The money coming in and how it is shared." },
  },
];

/** Una cifra solo entra con su fuente y la fecha en que se consultó: sin fuente, no se muestra. */
export type Cifra = {
  id: string;
  valor: string;
  texto: Required<Bilingue>;
  fuente: string;
  consultado: string;
  /** Cifra de afuera del proyecto (Argentina, Vaca Muerta). Por ahora no hay ninguna con fuente. */
  externa: boolean;
};

const FUENTE_SITIO = "NS_permacultura 01 y 08, según NS_platform nota 19 §3";

export const CIFRAS: readonly Cifra[] = [
  {
    id: "lluvia",
    valor: "~250 mm",
    texto: { es: "de lluvia por año", en: "of rain per year" },
    fuente: FUENTE_SITIO,
    consultado: "2026-11-23",
    externa: false,
  },
  {
    id: "desierto",
    valor: "90 %",
    texto: { es: "del 7A es hoy desierto", en: "of 7A is desert today" },
    fuente: FUENTE_SITIO,
    consultado: "2026-11-23",
    externa: false,
  },
  {
    id: "escurrimiento",
    valor: "~6 km",
    texto: {
      es: "de escurrimiento que drena más de 600 ha a un solo punto",
      en: "of runoff that drains more than 600 ha to a single point",
    },
    fuente: FUENTE_SITIO,
    consultado: "2026-11-23",
    externa: false,
  },
];

export function capitalesDePortada(idioma: Idioma) {
  return CAPITALES.map((c) => ({ id: c.id, nombre: vocabulario(c.nombre[idioma]), texto: vocabulario(c.texto[idioma]) }));
}

export function cifrasDePortada(idioma: Idioma) {
  return CIFRAS.map((c) => ({ id: c.id, valor: c.valor, texto: vocabulario(c.texto[idioma]), fuente: c.fuente }));
}
