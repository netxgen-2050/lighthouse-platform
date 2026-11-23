// La propuesta v0.1 del bien común y los tokens (spec bien-comun-propuesta, `NS_Tokenomics` doc 34). Es una PROPUESTA EN
// DISCUSIÓN: nada está acordado, todos los números son de ejemplo y lo legal está a verificar con abogado.
// Puro: sin React ni Next, y sin textos (los textos viven en `lib/idioma/textos/bien-comun.ts`, con las mismas claves).
// Todo valor de la propuesta sale de acá, con su fuente, o de `lib/lotes/modelo.ts` cuando ya vive ahí. Las pantallas y el
// diccionario no escriben números (lo vigila `lib/lotes/sin-numeros-escritos.test.ts`).
// ADR-031: nada de acá devuelve membresía, voto, nivel ni rol. Los helpers son números para mostrar.
import { MODELO_LOTES } from "@/lib/lotes/modelo";

export const VERSION_PROPUESTA = {
  version: "v0.1",
  fecha: "2026-11-19",
  fuente: "NS_Tokenomics doc 34",
} as const;

/** Nombre provisorio del token del bien común (Lighthouse es un faro). Decisión 6 abierta. */
export const NOMBRE_TOKEN = "FARO";

/** FARO que se acreditan por m² de lote, de ejemplo. */
export const FARO_POR_M2 = {
  valor: 10,
  fuente: "Slides del 9-nov, láminas 8 a 14 (doc 34 §3)",
} as const;

// ---- Los dos carriles ----
export const CARRILES = {
  /** Capital con retorno (lidera Juanpi): quién pone plata y qué recibe. */
  a: ["tokenTierra", "tokenInversor", "fideicomiso"],
  /** Bien común (lidera Gus): qué es de todos y cómo se alimenta. */
  b: ["tesoro", "faro"],
} as const;

export type IdPuente = "parteDeCadaPago" | "faroPorCuota" | "reventa";

/** Los tres puentes entre los carriles. `valor` solo existe donde el puente usa un número. */
export const PUENTES: readonly {
  id: IdPuente;
  desde: string;
  hacia: string;
  valor: { fraccion: number; fuente: string } | null;
}[] = [
  {
    id: "parteDeCadaPago",
    desde: "fideicomiso",
    hacia: "tesoro",
    // No se copia: vive en el módulo de lotes.
    valor: { fraccion: MODELO_LOTES.aporteUnico, fuente: "lib/lotes/modelo.ts (aporte único) · doc 34 §3, sim/lot_sale_sim.py" },
  },
  { id: "faroPorCuota", desde: "tokenTierra", hacia: "faro", valor: null },
  { id: "reventa", desde: "reventa", hacia: "tesoro", valor: null },
];

// ---- Las tres puertas para tener FARO (ninguna es una inversión) ----
export const PUERTAS = ["conElLote", "aportando", "prepagando"] as const;
export type IdPuerta = (typeof PUERTAS)[number];

export const QUE_DA = ["voz", "noches", "huertaYCocina", "talleres", "expensas"] as const;
export const QUE_NO_TIENE = ["exchange", "liquidez", "recompra", "respaldoTierra", "premioPorBloquear"] as const;

// ---- Política de FARO (doc 34 §3, columna "De dónde viene") ----
// La fuente es una cita del documento de origen y va en los dos idiomas.
export const POLITICA = {
  emision: { fuente: { es: "Doc 11 (oferta atada a capacidad)", en: "Doc 11 (supply tied to capacity)" } },
  quema: {
    fuente: {
      es: "Juanpi 2025 (quema por tarifas) y Gus en la call del 16-nov",
      en: "Juanpi 2025 (burning through fees) and Gus on the Nov 16 call",
    },
  },
  bloqueo: {
    fuente: {
      es: "Juanpi 2025 (veNETX), suavizado; slides, opción A",
      en: "Juanpi 2025 (veNETX), softened; slides, option A",
    },
  },
  /** En la versión 1 solo viaja con el lote; se revisa a los 12 meses con datos de uso. */
  transferencia: {
    revisionMeses: 12,
    fuente: {
      es: "Objeción de Juanpi: sin circulación no hay precio que defender",
      en: "Juanpi's objection: with no circulation there is no price to defend",
    },
  },
  reserva: { fuente: { es: "Slides, lámina 8", en: "Slides, slide 8" } },
  voz: { fuente: { es: "Regla 6; slides, lámina 6", en: "Rule 6; slides, slide 6" } },
} as const;

// ---- Preguntas para el abogado: el orden y el ⚖ de cada una viven acá, no en la posición del diccionario ----
export const PREGUNTAS_ABOGADO = [
  { id: "boleto", termino: "boletocompraventa" },
  { id: "valorNegociable", termino: "valornegociable" },
  { id: "ticketsChicos", termino: null },
  { id: "faroPrepagado", termino: null },
  { id: "reventaAporta", termino: null },
  { id: "faroPorCuota", termino: null },
] as const;
export type IdPreguntaAbogado = (typeof PREGUNTAS_ABOGADO)[number]["id"];

export type IdPolitica = keyof typeof POLITICA;

// ---- Decisiones abiertas (doc 34 §7) ----
export type EstadoDecision =
  | { estado: "abierta" }
  | { estado: "decidida"; decidida: { fecha: string; quien: string } };

export type IdDecision = "d1" | "d2" | "d3" | "d4" | "d5" | "d6" | "d7" | "d8";

/**
 * Un solo dato por decisión. Cuando Juanpi y Franz decidan, se cambia solo ese objeto (y el texto de la decisión tomada en el
 * diccionario), en un cambio OpenSpec aprobado por Gus (ADR-031, regla 2). Hoy las 8 están abiertas.
 */
export const DECISIONES: readonly ({ id: IdDecision } & EstadoDecision)[] = [
  { id: "d1", estado: "abierta" },
  { id: "d2", estado: "abierta" },
  { id: "d3", estado: "abierta" },
  { id: "d4", estado: "abierta" },
  { id: "d5", estado: "abierta" },
  { id: "d6", estado: "abierta" },
  { id: "d7", estado: "abierta" },
  { id: "d8", estado: "abierta" },
];

// ---- Lo que cambió respecto del modelo del 8-nov ----
export const CAMBIOS_DESDE_V_ANTERIOR = {
  fechaModeloAnterior: "2026-11-08",
  ids: ["tramos", "staking", "reservaTierra", "repartoFijo"],
} as const;

// ---- Helpers que usan otras pantallas (misma firma que antes): números para mostrar ----

/** Tokens que traería un lote de `m2` metros cuadrados. Sin superficie, null (nunca 0). */
export function faroDeLote(m2: number | null | undefined): number | null {
  if (typeof m2 !== "number" || !Number.isFinite(m2) || m2 <= 0) return null;
  return Math.round(m2 * FARO_POR_M2.valor);
}

/**
 * Si un lote trae NFT y FARO. Los primeros 4 (fincas 535 a 538, fuera del 7A) no: si aportan al bien común de Lighthouse es
 * "sin dato" (R40), así que ni la ficha, ni el boleto, ni el panel del mapa les asignan FARO (decisión D de Gus, 19-nov).
 */
export const loteTraeFaro = (grupo: "primeros" | "norte"): boolean => grupo !== "primeros";

/** Centro de un contorno [longitud, latitud]: el promedio de sus vértices (sin contar el que cierra el anillo). Sin vértices, null. */
export function centroDeAnillo(anillo: readonly (readonly [number, number])[]): { lat: number; lng: number } | null {
  const abierto =
    anillo.length > 1 && anillo[0][0] === anillo[anillo.length - 1][0] && anillo[0][1] === anillo[anillo.length - 1][1]
      ? anillo.slice(0, -1)
      : anillo;
  if (abierto.length === 0) return null;
  const lng = abierto.reduce((s, p) => s + p[0], 0) / abierto.length;
  const lat = abierto.reduce((s, p) => s + p[1], 0) / abierto.length;
  return { lat, lng };
}
