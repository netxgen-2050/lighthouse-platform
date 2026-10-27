// Datos copiados de V.fogon y PEOPLE en docs/referencia/netx-tribus-mockup-v6.html.
// Los conteos de votos son de ejemplo (el mock-up no trae cifras).
import type { ClaveTermino } from "@/lib/legal/terminos";

export type Ambito = "circulo" | "tribu" | "comun" | "consejo" | "fideicomiso";
export type Requisito = "ninguno" | "residente" | "pase";
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
  /** Tribu que decide (decisiones de tribu que se pueden llevar al consejo). */
  tribuId?: string;
  /** Decisión de tribu ya aprobada en la tribu que pide algo al común: su líder puede llevarla al consejo. */
  pideAlComun?: boolean;
  /** En el consejo: de qué tribu viene y que ya se aprobó ahí. */
  origen?: { tribuId: string; aprobadaEn: string };
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
    id: "presupuesto",
    titulo: "Presupuesto de obra 2027 del macrolote",
    donde: "Asamblea de beneficiarios",
    regla: "Mayoría según el contrato",
    base: "fidasamblea",
    ambito: "fideicomiso",
    requisito: "pase",
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

/**
 * Ejemplos del mock-up que antes eran de la Asamblea de residentes (que no existe). Hoy son decisiones del ámbito
 * "Lighthouse (el común)" (ver `DECISIONES_DEL_COMUN`): sin requisito de residencia y sin nombrar la asamblea.
 */
export const EJEMPLOS_COMUN: readonly Omit<Decision, "ambito">[] = [
  {
    id: "bomba",
    titulo: "Usar el fondo común para la bomba solar",
    donde: "Asamblea de residentes",
    regla: "Consenso",
    base: "art35",
    requisito: "residente",
    votos: { favor: 21, contra: 4, abstencion: 2 },
  },
  {
    id: "animales",
    titulo: "Permitir animales de granja en las chacras",
    donde: "Asamblea de residentes",
    regla: "2/3 de los votos",
    base: "art44",
    requisito: "residente",
    votos: { favor: 12, contra: 9, abstencion: 5 },
  },
];

/** Las dos decisiones de ejemplo del mock-up, ahora en el ámbito del común. */
export const DECISIONES_DEL_COMUN: readonly Decision[] = EJEMPLOS_COMUN.map((d) => ({
  ...d,
  donde: "Lighthouse (el común)",
  ambito: "comun" as const,
  requisito: "ninguno" as const,
}));

/** Regla de ejemplo del consejo: el reglamento real lo define el diseño legal. */
export const REGLA_CONSEJO = "Consenso de los representantes (ejemplo)";
export const DONDE_CONSEJO = "Consejo de las tribus";

/** Decisiones de ejemplo nuevas (no vienen del mock-up): de un círculo, de una tribu que pide al común y del consejo. */
export const DECISIONES_DE_GOBERNANZA: readonly Decision[] = [
  {
    id: "siembra",
    titulo: "Calendario de siembra de otoño",
    donde: "Círculo de Cuidado de la tierra · Valle Solar",
    regla: "Consentimiento",
    base: "circulotrabajo",
    ambito: "circulo",
    requisito: "ninguno",
    votos: { favor: 6, contra: 0, abstencion: 1 },
  },
  {
    id: "cisterna",
    titulo: "Pedir al Fondo Común una cisterna para la huerta de Valle Solar",
    donde: "Valle Solar",
    regla: "Según el estatuto de la tribu",
    base: "estatuto",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 11, contra: 1, abstencion: 2 },
    tribuId: "valle",
    pideAlComun: true,
  },
  {
    id: "consejo-bomba",
    titulo: "Pedido de Valle Solar al Fondo Común para la bomba solar",
    donde: DONDE_CONSEJO,
    regla: REGLA_CONSEJO,
    base: "consejo",
    ambito: "consejo",
    requisito: "ninguno",
    votos: { favor: 5, contra: 1, abstencion: 1 },
    origen: { tribuId: "valle", aprobadaEn: "Valle Solar" },
  },
];

/** Todas las decisiones que se ven en /fogon, antes de sumar las que se llevaron al consejo. */
export const DECISIONES_BASE: readonly Decision[] = [...DECISIONES, ...DECISIONES_DE_GOBERNANZA.slice(0, 2), ...DECISIONES_DEL_COMUN, ...DECISIONES_DE_GOBERNANZA.slice(2)];

/** Copia de una decisión de tribu en el ámbito del consejo (id propio, con su origen). Los votos del consejo arrancan en cero. */
export function copiaParaElConsejo(d: Decision): Decision {
  return {
    ...d,
    id: `consejo-${d.id}`,
    donde: DONDE_CONSEJO,
    regla: REGLA_CONSEJO,
    base: "consejo",
    ambito: "consejo",
    requisito: "ninguno",
    votos: { favor: 0, contra: 0, abstencion: 0 },
    pideAlComun: false,
    origen: { tribuId: d.tribuId ?? "", aprobadaEn: d.donde },
  };
}

export const AMBITOS: readonly { id: Ambito; etiqueta: string }[] = [
  { id: "circulo", etiqueta: "Círculo" },
  { id: "tribu", etiqueta: "Tribu" },
  { id: "comun", etiqueta: "Lighthouse (el común)" },
  { id: "consejo", etiqueta: "Consejo" },
  { id: "fideicomiso", etiqueta: "Fideicomiso" },
];

export const OPCIONES: readonly { id: Opcion; etiqueta: string }[] = [
  { id: "favor", etiqueta: "A favor" },
  { id: "contra", etiqueta: "En contra" },
  { id: "abstencion", etiqueta: "Abstención" },
];

