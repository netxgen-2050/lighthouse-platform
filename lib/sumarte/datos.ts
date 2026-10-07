// Datos copiados de V.sumarte, PASSES, COHORT y EMISION en docs/referencia/netx-tribus-mockup-v6.html.
// Cifras de ejemplo: ningún flujo cobra de verdad.
export type NivelPase = "semilla" | "brote" | "raiz";

export const PASSES: readonly { id: NivelPase; nombre: string; precio: number; creditos: number }[] = [
  { id: "semilla", nombre: "Semilla", precio: 300, creditos: 90 },
  { id: "brote", nombre: "Brote", precio: 1500, creditos: 450 },
  { id: "raiz", nombre: "Raíz", precio: 5000, creditos: 1500 },
];

export const COHORT = { vendidos: 142, cupo: 300, recaudado: 46000, minimo: 75000 };

export const EMISION = { total: 480000, aportantes: 22, cupo: 35, noCalificados: 11, cupoNoCalificados: 15 };

export const MEMBRESIA = { mensual: 10, anual: 100 };

export const PLAN_TRIBU_MENSUAL = 60;

export type Fila = { texto: string; incluye: readonly [boolean, boolean, boolean] };

/** Columnas: Explorador, Miembro, Pase Fundador. */
export const FILAS: readonly Fila[] = [
  { texto: "Mapa, tribus, eventos abiertos y registro de tu ticket del Congreso", incluye: [true, true, true] },
  { texto: "Entrevista con el agente y tribus sugeridas", incluye: [true, true, true] },
  { texto: "Salas de tribu y foros de la red", incluye: [false, true, true] },
  { texto: "Proponer pactos y sumar Semillas", incluye: [false, true, true] },
  { texto: "Voz en las decisiones de tu tribu (según su estatuto)", incluye: [false, true, true] },
  { texto: "Canal de fundadores y encuentros con el Consejo", incluye: [false, false, true] },
  { texto: "Voz en la Ronda 0 del Fondo Común (1 persona = 1 voz)", incluye: [false, false, true] },
  { texto: "Créditos comunes y de estadía", incluye: [false, false, true] },
];

/** Número con punto de miles (es-AR), sin depender del locale del entorno. */
export function miles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
