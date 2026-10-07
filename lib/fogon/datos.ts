// Datos copiados de V.fogon y PEOPLE en docs/referencia/netx-tribus-mockup-v6.html.
// Los conteos de votos son de ejemplo (el mock-up no trae cifras).
import type { ClaveTermino } from "@/lib/legal/terminos";

export type Ambito = "tribu" | "asamblea" | "fideicomiso";
export type Requisito = "ninguno" | "residente" | "beneficiario";
export type Opcion = "favor" | "contra" | "abstencion";

export type Decision = {
  id: string;
  titulo: string;
  donde: string;
  regla: string;
  base: ClaveTermino;
  ambito: Ambito;
  /** Quién puede votar. */
  requisito: Requisito;
  /** Votos de ejemplo, sin contar el propio. */
  votos: Record<Opcion, number>;
};

export const DECISIONES: readonly Decision[] = [
  {
    id: "huerta",
    titulo: "Plan de huerta comunitaria 2027",
    donde: "Círculo de Tierra",
    regla: "Consentimiento",
    base: "art32",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 14, contra: 1, abstencion: 3 },
  },
  {
    id: "bomba",
    titulo: "Usar el fondo común para la bomba solar",
    donde: "Asamblea de residentes",
    regla: "Consenso",
    base: "art35",
    ambito: "asamblea",
    requisito: "residente",
    votos: { favor: 21, contra: 4, abstencion: 2 },
  },
  {
    id: "animales",
    titulo: "Permitir animales de granja en las chacras",
    donde: "Asamblea de residentes",
    regla: "2/3 de los votos",
    base: "art44",
    ambito: "asamblea",
    requisito: "residente",
    votos: { favor: 12, contra: 9, abstencion: 5 },
  },
  {
    id: "presupuesto",
    titulo: "Presupuesto de obra 2027 del macrolote",
    donde: "Asamblea de beneficiarios",
    regla: "Mayoría según el contrato",
    base: "fidasamblea",
    ambito: "fideicomiso",
    requisito: "beneficiario",
    votos: { favor: 17, contra: 6, abstencion: 1 },
  },
  {
    id: "facilitador",
    titulo: "Elegir facilitador/a de Valle Solar",
    donde: "Valle Solar",
    regla: "Según el estatuto de la tribu",
    base: "estatuto",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 9, contra: 0, abstencion: 2 },
  },
];

export const AMBITOS: readonly { id: Ambito; etiqueta: string }[] = [
  { id: "tribu", etiqueta: "Tribu" },
  { id: "asamblea", etiqueta: "Asamblea de residentes" },
  { id: "fideicomiso", etiqueta: "Fideicomiso" },
];

export const OPCIONES: readonly { id: Opcion; etiqueta: string }[] = [
  { id: "favor", etiqueta: "A favor" },
  { id: "contra", etiqueta: "En contra" },
  { id: "abstencion", etiqueta: "Abstención" },
];

export type PersonaId = "lucia" | "lucas";

/** Las dos personas de ejemplo del mock-up: `residente` y `beneficiaria` (residencia fiscal argentina). */
export const PERSONAS: Record<PersonaId, { nombre: string; residente: boolean; beneficiaria: boolean }> = {
  lucia: { nombre: "Lucía", residente: false, beneficiaria: false },
  lucas: { nombre: "Lucas", residente: true, beneficiaria: true },
};
