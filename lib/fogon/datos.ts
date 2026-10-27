// Datos copiados de V.fogon y PEOPLE en docs/referencia/netx-tribus-mockup-v6.html.
// Los conteos de votos son de ejemplo (el mock-up no trae cifras).
// El título, el lugar y la regla de cada decisión de ejemplo tienen su inglés (borrador a revisar: ver
// `lib/idioma/revision-nativa.ts`); el título se muestra con la nota "Translated from Spanish". Los nombres de tribus no se traducen.
import type { ClaveTermino } from "@/lib/legal/terminos";
import { textos } from "@/lib/idioma/textos";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";

export type Ambito = "tribu" | "asamblea" | "fideicomiso";
export type Requisito = "ninguno" | "residente" | "pase";
export type Opcion = "favor" | "contra" | "abstencion";

export type Decision = {
  id: string;
  /** Título en español (original) y en inglés. */
  titulo: BilingueConOriginal & { en: string };
  donde: BilingueConOriginal & { en: string };
  regla: BilingueConOriginal & { en: string };
  base: ClaveTermino;
  ambito: Ambito;
  /** Quién puede votar. */
  requisito: Requisito;
  /** Votos de ejemplo, sin contar el propio. */
  votos: Record<Opcion, number>;
};

const b = (es: string, en: string): { es: string; en: string; original: "es" } => ({ es, en, original: "es" });

export const DECISIONES: readonly Decision[] = [
  {
    id: "huerta",
    titulo: b("Plan de huerta comunitaria 2027", "2027 community garden plan"),
    donde: b("Círculo de Tierra", "Círculo de Tierra"),
    regla: b("Consentimiento", "Consent"),
    base: "art32",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 14, contra: 1, abstencion: 3 },
  },
  {
    id: "bomba",
    titulo: b("Usar el fondo común para la bomba solar", "Use the common fund for the solar pump"),
    donde: b("Asamblea de residentes", "Residents' Assembly"),
    regla: b("Consenso", "Consensus"),
    base: "art35",
    ambito: "asamblea",
    requisito: "residente",
    votos: { favor: 21, contra: 4, abstencion: 2 },
  },
  {
    id: "animales",
    titulo: b("Permitir animales de granja en las chacras", "Allow farm animals on the smallholdings (chacras)"),
    donde: b("Asamblea de residentes", "Residents' Assembly"),
    regla: b("2/3 de los votos", "2/3 of the votes"),
    base: "art44",
    ambito: "asamblea",
    requisito: "residente",
    votos: { favor: 12, contra: 9, abstencion: 5 },
  },
  {
    id: "presupuesto",
    titulo: b("Presupuesto de obra 2027 del macrolote", "2027 construction budget for the macro-lot"),
    donde: b("Asamblea de beneficiarios", "Beneficiaries' Assembly"),
    regla: b("Mayoría según el contrato", "Majority as set by the contract"),
    base: "fidasamblea",
    ambito: "fideicomiso",
    requisito: "pase",
    votos: { favor: 17, contra: 6, abstencion: 1 },
  },
  {
    id: "facilitador",
    titulo: b("Elegir facilitador/a de Valle Solar", "Choose a facilitator for Valle Solar"),
    donde: b("Valle Solar", "Valle Solar"),
    regla: b("Según el estatuto de la tribu", "As set by the tribe's bylaws"),
    base: "estatuto",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 9, contra: 0, abstencion: 2 },
  },
];

/** Los ámbitos y las opciones de voto con su etiqueta en español (las de inglés salen de `textos("fogon", "en")`). */
export const AMBITOS: readonly { id: Ambito; etiqueta: string }[] = (
  Object.entries(textos("fogon", "es").ambitos) as [Ambito, string][]
).map(([id, etiqueta]) => ({ id, etiqueta }));

export const OPCIONES: readonly { id: Opcion; etiqueta: string }[] = (
  Object.entries(textos("fogon", "es").opciones) as [Opcion, string][]
).map(([id, etiqueta]) => ({ id, etiqueta }));

/** Los ámbitos con su etiqueta en el idioma pedido. */
export function ambitos(idioma: "es" | "en"): readonly { id: Ambito; etiqueta: string }[] {
  const t = textos("fogon", idioma).ambitos;
  return AMBITOS.map((a) => ({ id: a.id, etiqueta: t[a.id] }));
}

/** Las opciones de voto con su etiqueta en el idioma pedido. */
export function opciones(idioma: "es" | "en"): readonly { id: Opcion; etiqueta: string }[] {
  const t = textos("fogon", idioma).opciones;
  return OPCIONES.map((o) => ({ id: o.id, etiqueta: t[o.id] }));
}
