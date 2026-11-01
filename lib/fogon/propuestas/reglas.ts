// Reglas de gobernanza de las propuestas del Fogón (design §1). TODO valor A–G vive acá o en `permisos.ts`:
// ningún componente escribe un número de días, un quórum ni una celda de la matriz.
// Son valores de prueba para el prototipo; cambiar uno no obliga a tocar pantallas.
import { COMUN_ID } from "@/lib/gobernanza/datos";
import { CONSEJO_ID, caminoHasta, construirHolarquia, type NodoH } from "@/lib/gobernanza/holarquia";
import type { Fase, Recorrido, Resultado, TipoRegistro } from "./tipos";

export const REGLAS = {
  // A1 · decidido por Gus, 29-oct-2026: se declara sola con un motivo de una línea; el grupo del ámbito puede objetarla.
  afectada: { motivoMax: 140, objetaQuien: "ambito" },
  // G1 · decidido por Gus, 29-oct-2026: en el consejo, el ámbito lo define el board de NetXGen (en el prototipo, el super admin).
  ambitoConsejo: { defineQuien: "board-netxgen", enElPrototipo: "superadmin", puedeIncluirse: true },
  // C1 · decidido por Gus, 29-oct-2026: concern sin nombre solo en temas de cuidado o conflicto, con facilitación.
  concernSinNombre: { soloTema: "cuidado-conflicto" },
  // D4 · propuesta de Claude confirmada por Gus, 29-oct-2026 (tercera tanda).
  urgencia: {
    respaldosMinimos: 2,
    maxRespaldosDeFacilitacion: 1,
    // D1 (opción C) · decidido por Gus, 29-oct-2026: la medida provisoria se revisa a los 30 días.
    diasRevision: 30,
    criterios: ["vida", "irreversible", "plazo-externo"],
    // D1 · decidido por Gus, 29-oct-2026: un pedido de plata urgente tiene tope y solo vale para algo que se pueda revender o reutilizar.
    plata: { topeUSD: 5000, destinos: ["revender", "reutilizar"] },
  },
} as const;

/** D1 · decidido por Gus, 29-oct-2026: nunca urgentes (vender o comprometer tierra, cambiar reglas o el manifiesto). */
export const MATERIAS_SIN_URGENCIA = ["tierra", "reglas", "manifiesto"] as const;

/** C1 · decidido por Gus, 29-oct-2026: se agrupa en la fase de concerns y en el plazo para objetar de la simple. */
export const FASES_DE_AGRUPACION: readonly Fase[] = ["concerns", "objetar"];

/** B3 · decidido por Gus, 29-oct-2026: participar es escribir en la discusión o firmar el acuse (no agrupar, mecanismo, urgencia ni evaluar). */
export const REGISTROS_QUE_CUENTAN: readonly TipoRegistro[] = [
  "pregunta",
  "respuesta",
  "comentario",
  "concern",
  "sumarse",
  "resolucion",
  "a-un-lado",
  "bloqueo",
  "acuse",
];

// ---- Plazos (B2) ----

/**
 * Días por fase. B2 · decidido por Gus, 29-oct-2026: 7 días en total, 2 de preguntas, 3 de discusión y concerns (las dos
 * fases comparten esa ventana) y 2 para resolver; la decisión simple da 3 días para objetar.
 */
export type Plazos = { preguntas: number; discusion: number; resolver: number; simple: number; diasRevision: number };

export const PLAZOS_POR_DEFECTO: Plazos = {
  preguntas: 2,
  discusion: 3,
  resolver: 2,
  simple: 3,
  diasRevision: REGLAS.urgencia.diasRevision,
};

/** Plazos propios de un holón (id de nodo de la holarquía → días por fase). */
export const PLAZOS_POR_HOLON: Readonly<Record<string, Partial<Plazos>>> = {
  // Ejemplo: el círculo de tokenomics discute cinco días.
  "comun-token": { discusion: 5 },
};

export function plazosDe(holonId: string | null, tabla: Readonly<Record<string, Partial<Plazos>>> = PLAZOS_POR_HOLON): Plazos {
  return { ...PLAZOS_POR_DEFECTO, ...(holonId ? tabla[holonId] : undefined) };
}

/** Topes de plata urgente por holón (id de nodo → USD). Sin entrada, el tope por defecto. */
export const URGENCIA_POR_HOLON: Readonly<Record<string, { topePlataUSD: number }>> = {};

export function topeUrgenciaDe(holonId: string | null, tabla: Readonly<Record<string, { topePlataUSD: number }>> = URGENCIA_POR_HOLON): number {
  return (holonId ? tabla[holonId]?.topePlataUSD : undefined) ?? REGLAS.urgencia.plata.topeUSD;
}

// ---- Quórum (B3) ----

/** Mínimo de personas que tienen que participar: la mitad del ámbito, o 3 si la mitad es menos (nunca más que el ámbito). Sin dato → null, nunca 0. */
export function minimoParticipacion(tamano: number | null): number | null {
  if (tamano === null || !Number.isFinite(tamano) || tamano <= 0) return null;
  return Math.min(tamano, Math.max(Math.ceil(tamano / 2), 3));
}

// ---- Fechas (siempre UTC, para que no corra un día) ----

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// ---- Concern abierto: la única función que decide (design §4) ----

/** Abierto, agrupado o en resolución. Un concern sobre la urgencia no cuenta como oposición. Ninguna regla compara el estado a mano. */
export function concernAbierto(c: { estado: string; sobreUrgencia?: boolean }): boolean {
  if (c.sobreUrgencia) return false;
  return c.estado === "abierto" || c.estado === "agrupado" || c.estado === "resolviendo";
}

// ---- Nivel de arriba ----

let arbol: NodoH | null = null;
function raiz(): NodoH {
  arbol ??= construirHolarquia("es");
  return arbol;
}

/**
 * El id del holón de arriba (círculo → tribu → consejo → común); null en el común o sin holón. Sale de `caminoHasta`.
 * Salvedad: en la holarquía de ejemplo las tribus cuelgan directo del común, pero las decisiones de una tribu suben por el
 * consejo (como en `lib/gobernanza/caminos.ts`), así que el nivel de arriba de una tribu es el consejo. Ver el PR (spec ambigua).
 */
export function nivelDeArriba(holonId: string | null): string | null {
  if (!holonId) return null;
  const camino = caminoHasta(raiz(), holonId);
  if (camino.length < 2) return null;
  if (camino[camino.length - 1].tipo === "tribu") return CONSEJO_ID;
  return camino[camino.length - 2].id;
}

export { COMUN_ID };

// ---- Qué pasa al vencer el plazo (D1, B4) ----

/** Lo que sabe `alVencer`: ya recortado en el tiempo (solo registros hasta el vencimiento) por `estado.ts`. */
export type HechosAlVencer = {
  recorrido: Recorrido;
  /** Versión abierta por una revisión: nunca da `provisoria` (design §4c). */
  esRevision: boolean;
  concernAbierto: boolean;
  bloqueo: boolean;
  bloqueoLegitimo: boolean;
  cuenta: number;
  /** Participantes sin concern abierto ni bloqueo. */
  apoyan: number;
  minimo: number | null;
  urgencia: "pedida" | "validada" | "caida" | null;
  holonId: string | null;
  /** AAAA-MM-DD del vencimiento. */
  vencimiento: string;
  diasRevision: number;
  concernsQueObligan: string[];
};

/**
 * El resultado de una propuesta que vence sin cierre. El cierre por consenso es un registro de quien facilita: acá solo
 * se resuelve lo que pasa cuando el plazo se acaba.
 */
export function alVencer(h: HechosAlVencer): Resultado {
  const hayQuorum = h.minimo !== null && h.cuenta >= h.minimo;
  if (h.recorrido === "simple" && !h.concernAbierto && !h.bloqueo) {
    return hayQuorum
      ? { tipo: "adoptada", motivo: "nadie-objeto" }
      : { tipo: "pausada", motivo: "participacion-minima" };
  }
  if (h.esRevision) return { tipo: "pausada", motivo: "revision-sin-consenso" };
  if (h.urgencia !== "validada") {
    return { tipo: "pausada", motivo: h.concernAbierto || h.bloqueo ? "concern-abierto" : "sin-consenso" };
  }
  // Urgencia validada: se aplica lo que apoya la mayoría solo como medida provisoria.
  const mayoria = hayQuorum && h.apoyan * 2 > h.cuenta;
  if (mayoria && !h.bloqueoLegitimo) {
    return {
      tipo: "provisoria",
      revisarAntesDe: sumarDias(h.vencimiento, h.diasRevision),
      concernsQueObligan: h.concernsQueObligan,
      enRevision: false,
    };
  }
  // Sin mayoría (o con un bloqueo legítimo): sube al nivel de arriba; en el común, que no tiene, pausa.
  const arriba = nivelDeArriba(h.holonId);
  return arriba ? { tipo: "sube", a: arriba } : { tipo: "pausada", motivo: "sin-nivel-de-arriba" };
}
