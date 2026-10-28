// Datos copiados de V.fogon y PEOPLE en docs/referencia/netx-tribus-mockup-v6.html.
// Los conteos de votos son de ejemplo (el mock-up no trae cifras).
// El título, el lugar y la regla de cada decisión de ejemplo tienen su inglés (borrador a revisar: ver
// `lib/idioma/revision-nativa.ts`); el título se muestra con la nota "Translated from Spanish". Los nombres de tribus no se traducen.
import type { ClaveTermino } from "@/lib/legal/terminos";
import { textos } from "@/lib/idioma/textos";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";

export type Ambito = "circulo" | "tribu" | "comun" | "consejo" | "fideicomiso";
export type Requisito = "ninguno" | "residente" | "pase";
export type Opcion = "favor" | "contra" | "abstencion";

type Bi = BilingueConOriginal & { en: string };

export type Decision = {
  id: string;
  /** Título en español (original) y en inglés. */
  titulo: Bi;
  donde: Bi;
  /** Nombre de la tribu cuando el lugar o el título la nombran: no se traduce (va con `translate="no"`). */
  tribu?: string;
  regla: Bi;
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
  /** En el consejo: de qué tribu viene y que ya se aprobó ahí (el nombre de la tribu no se traduce). */
  origen?: { tribuId: string; aprobadaEn: string };
  /** Parámetros opcionales (fogon-gobernanza-holarquia): solo se muestran si existen. No van en el mapa. */
  plazo?: { cierra: string /* AAAA-MM-DD */ };
  acuerdo?: { tipo: "pacto" | "norma"; nombre: Bi; href?: string };
  /** Plata SIMULADA. `cantidad: null` es "sin dato", nunca 0. */
  monto?: { cantidad: number | null; moneda: "USD"; fuente: "fondo-comun" | "tribu" | "fideicomiso" };
};

const b = (es: string, en: string): { es: string; en: string; original: "es" } => ({ es, en, original: "es" });

export const DECISIONES: readonly Decision[] = [
  {
    id: "huerta",
    titulo: b("Plan de huerta comunitaria 2027", "2027 community garden plan"),
    donde: b("Círculo de Tierra", "Círculo de Tierra"),
    tribu: "Círculo de Tierra",
    regla: b("Consentimiento", "Consent"),
    base: "art32",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 14, contra: 1, abstencion: 3 },
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
    tribu: "Valle Solar",
    regla: b("Según el estatuto de la tribu", "As set by the tribe's bylaws"),
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
    titulo: b("Usar el fondo común para la bomba solar", "Use the common fund for the solar pump"),
    donde: b("Asamblea de residentes", "Residents' Assembly"),
    regla: b("Consenso", "Consensus"),
    base: "art35",
    requisito: "residente",
    votos: { favor: 21, contra: 4, abstencion: 2 },
  },
  {
    id: "animales",
    titulo: b("Permitir animales de granja en las chacras", "Allow farm animals on the smallholdings (chacras)"),
    donde: b("Asamblea de residentes", "Residents' Assembly"),
    regla: b("2/3 de los votos", "2/3 of the votes"),
    base: "art44",
    requisito: "residente",
    votos: { favor: 12, contra: 9, abstencion: 5 },
  },
];

/** Las dos decisiones de ejemplo del mock-up, ahora en el ámbito del común. */
export const DECISIONES_DEL_COMUN: readonly Decision[] = EJEMPLOS_COMUN.map((d) => ({
  ...d,
  donde: b("Lighthouse (el común)", "Lighthouse (the commons)"),
  ambito: "comun" as const,
  requisito: "ninguno" as const,
}));

/** Regla de ejemplo del consejo: el reglamento real lo define el diseño legal. */
export const REGLA_CONSEJO = b("Consenso de los representantes (ejemplo)", "Consensus of the representatives (sample)");
export const DONDE_CONSEJO = b("Consejo de las tribus", "Council of the tribes");

/** Decisiones de ejemplo nuevas (no vienen del mock-up): de un círculo, de una tribu que pide al común y del consejo. */
export const DECISIONES_DE_GOBERNANZA: readonly Decision[] = [
  {
    id: "siembra",
    titulo: b("Calendario de siembra de otoño", "Autumn sowing calendar"),
    donde: b("Círculo de Cuidado de la tierra · Valle Solar", "Land Care Circle · Valle Solar"),
    tribu: "Valle Solar",
    regla: b("Consentimiento", "Consent"),
    base: "circulotrabajo",
    ambito: "circulo",
    requisito: "ninguno",
    votos: { favor: 6, contra: 0, abstencion: 1 },
  },
  {
    id: "cisterna",
    titulo: b(
      "Pedir al Fondo Común una cisterna para la huerta de Valle Solar",
      "Ask the Common Fund for a cistern for the Valle Solar garden",
    ),
    donde: b("Valle Solar", "Valle Solar"),
    tribu: "Valle Solar",
    regla: b("Según el estatuto de la tribu", "As set by the tribe's bylaws"),
    base: "estatuto",
    ambito: "tribu",
    requisito: "ninguno",
    votos: { favor: 11, contra: 1, abstencion: 2 },
    tribuId: "valle",
    pideAlComun: true,
  },
  {
    id: "consejo-bomba",
    titulo: b(
      "Pedido de Valle Solar al Fondo Común para la bomba solar",
      "Valle Solar's request to the Common Fund for the solar pump",
    ),
    donde: DONDE_CONSEJO,
    tribu: "Valle Solar",
    regla: REGLA_CONSEJO,
    base: "consejo",
    ambito: "consejo",
    requisito: "ninguno",
    votos: { favor: 5, contra: 1, abstencion: 1 },
    origen: { tribuId: "valle", aprobadaEn: "Valle Solar" },
    plazo: { cierra: "2026-11-15" },
    monto: { cantidad: 4800, moneda: "USD", fuente: "fondo-comun" },
  },
];

/** Decisiones de ejemplo para la lente "Decisiones que suben" (fogon-gobernanza-holarquia): una del común y una del consejo. */
export const DECISIONES_CON_CAMINO: readonly Decision[] = [
  {
    id: "regalia",
    titulo: b("Parámetros de la regalía de regeneración", "Parameters of the regeneration royalty"),
    donde: b("Lighthouse (el común)", "Lighthouse (the commons)"),
    regla: b("Consenso", "Consensus"),
    base: "art35",
    ambito: "comun",
    requisito: "ninguno",
    votos: { favor: 8, contra: 1, abstencion: 2 },
    plazo: { cierra: "2026-12-01" },
    acuerdo: { tipo: "pacto", nombre: b("Pacto de regalía regenerativa (ejemplo)", "Regenerative royalty pact (sample)") },
  },
  {
    id: "cisterna-compartida",
    titulo: b("Cisterna compartida entre Agua Clara y Valle Solar", "Shared cistern between Agua Clara and Valle Solar"),
    donde: DONDE_CONSEJO,
    tribu: "Agua Clara",
    regla: REGLA_CONSEJO,
    base: "consejo",
    ambito: "consejo",
    requisito: "ninguno",
    votos: { favor: 3, contra: 0, abstencion: 1 },
    acuerdo: { tipo: "norma", nombre: b("Norma de uso compartido del agua (ejemplo)", "Shared water use rule (sample)") },
    monto: { cantidad: null, moneda: "USD", fuente: "fondo-comun" },
  },
];

/** Todas las decisiones que se ven en /fogon, antes de sumar las que se llevaron al consejo. */
export const DECISIONES_BASE: readonly Decision[] = [
  ...DECISIONES,
  ...DECISIONES_DE_GOBERNANZA.slice(0, 2),
  ...DECISIONES_DEL_COMUN,
  DECISIONES_CON_CAMINO[0],
  DECISIONES_DE_GOBERNANZA[2],
  DECISIONES_CON_CAMINO[1],
];

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
    origen: { tribuId: d.tribuId ?? "", aprobadaEn: d.tribu ?? d.donde.es },
  };
}

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
