// Datos copiados de V.sumarte, PASSES, COHORT y EMISION en docs/referencia/netx-tribus-mockup-v6.html.
// Cifras de ejemplo: ningún flujo cobra de verdad.
import type { Bilingue } from "@/lib/idioma/tipos";

export type NivelPase = "semilla" | "brote" | "raiz";

export const PASSES: readonly { id: NivelPase; nombre: string; precio: number; creditos: number }[] = [
  { id: "semilla", nombre: "Semilla", precio: 300, creditos: 90 },
  { id: "brote", nombre: "Brote", precio: 1500, creditos: 450 },
  { id: "raiz", nombre: "Raíz", precio: 5000, creditos: 1500 },
];

export const COHORT = { vendidos: 142, cupo: 300, recaudado: 46000, minimo: 75000 };

export const EMISION = { total: 480000, aportantes: 22, cupo: 35, noCalificados: 11, cupoNoCalificados: 15 };

export const MEMBRESIA = { mensual: 10, anual: 100 };

/** Cifras de ejemplo. El anual sigue la misma regla de "2 meses gratis" que Miembro: 10 × el mensual. */
export const PLAN_TRIBU = { mensual: 60, anual: 600 };

export type Fila = { texto: Bilingue; incluye: readonly [boolean, boolean, boolean] };

/** Columnas: Explorador, Miembro, Pase Fundador. El inglés está pendiente de revisión nativa. */
export const FILAS: readonly Fila[] = [
  {
    texto: {
      es: "Mapa, tribus, eventos abiertos y registro de tu ticket del Congreso",
      en: "Map, tribes, open events and registration of your Congress ticket",
    },
    incluye: [true, true, true],
  },
  {
    texto: { es: "Entrevista con el agente y tribus sugeridas", en: "Interview with the agent and suggested tribes" },
    incluye: [true, true, true],
  },
  {
    texto: { es: "Salas de tribu y foros de la red", en: "Tribe rooms and network forums" },
    incluye: [false, true, true],
  },
  {
    texto: { es: "Proponer pactos y sumar Semillas", en: "Propose pacts and earn Semillas" },
    incluye: [false, true, true],
  },
  {
    texto: {
      es: "Voz en las decisiones de tu tribu (según su estatuto)",
      en: "A voice in your tribe's decisions (according to its bylaws)",
    },
    incluye: [false, true, true],
  },
  {
    texto: {
      es: "Canal de fundadores y encuentros con el Consejo",
      en: "Founders channel and meetings with the Council",
    },
    incluye: [false, false, true],
  },
  {
    texto: {
      es: "Voz en la Ronda 0 del Fondo Común (1 persona = 1 voz)",
      en: "A voice in Round 0 of the Common Fund (1 person = 1 voice)",
    },
    incluye: [false, false, true],
  },
  { texto: { es: "Créditos comunes y de estadía", en: "Common and stay credits" }, incluye: [false, false, true] },
];

/** Número con punto de miles (es-AR), sin depender del locale del entorno. */
export function miles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
