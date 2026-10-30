import { frentesBilingues, listarFrentes, type Frente } from "@/lib/equipos/frentes";
import type { Idioma } from "@/lib/idioma/tipos";
import { listarBarrios, listarFincas, listarLugares, terrenoComun } from "./biopueblo";
import { FASE_ACTUAL, esFase, vigenteEn, type Fase } from "./fases";

// Vistas del mapa del territorio (spec territorio-vistas). Todo acá es puro: la pantalla solo dibuja lo que esto decide.

export type VistaId = "ahora" | "plan" | "vision";

/** Grupos de capas del mapa. La vista Red (D28) sumaría una capa propia sin tocar las demás. */
export type Capa = "contexto" | "soluna" | "macrolote" | "comun" | "barrios" | "sellos-barrio" | "lugares" | "frentes";

export type Vista = {
  id: VistaId;
  /** Qué grupos de Leaflet se ven. En Plan, `barrios` se dibuja en neutro (sin estado de tribu ni sellos). */
  capas: readonly Capa[];
  /** Ids que se pueden elegir en el mapa y en la lista, para esa fase. */
  elegibles(fase: Fase): string[];
};

const idsFincas = () => listarFincas().map((f) => f.id);
const idsLugares = () => listarLugares().map((l) => l.id);

export const VISTAS: readonly Vista[] = [
  {
    id: "ahora",
    capas: ["contexto", "soluna", "macrolote", "comun", "frentes", "lugares"],
    // El común se elige en las tres vistas (lo que es elegible en todas se queda donde está la persona).
    elegibles: (fase) => [...frentesEn(fase).conLugar.map((f) => f.id), terrenoComun().id, ...idsFincas(), ...idsLugares()],
  },
  {
    id: "plan",
    capas: ["contexto", "soluna", "macrolote", "comun", "barrios", "lugares"],
    elegibles: () => [terrenoComun().id, ...idsFincas(), ...idsLugares()],
  },
  {
    id: "vision",
    capas: ["contexto", "soluna", "macrolote", "comun", "barrios", "sellos-barrio", "lugares"],
    elegibles: () => [...listarBarrios().map((b) => b.id), terrenoComun().id, ...idsFincas(), ...idsLugares()],
  },
];

export const VISTA_POR_DEFECTO: VistaId = "ahora";

export function buscarVista(id: VistaId): Vista {
  return VISTAS.find((v) => v.id === id)!;
}

export function elegibles(vista: VistaId, fase: Fase): string[] {
  return buscarVista(vista).elegibles(fase);
}

/** Vista de la URL. Desconocida o ausente = Ahora. El alias viejo `permacultura` abre Plan (la fuente se lee aparte). */
export function leerVista(x: string | null): VistaId {
  if (x === "permacultura") return "plan";
  return VISTAS.find((v) => v.id === x)?.id ?? VISTA_POR_DEFECTO;
}

/** Fase de la URL. Inválida o ausente = la de hoy. */
export function leerFase(x: string | null): Fase {
  if (x === null || x.trim() === "") return FASE_ACTUAL;
  const n = Number(x);
  return esFase(n) ? n : FASE_ACTUAL;
}

// --- Frentes ---

/** Número del sello: el orden entre los frentes que tienen lugar. Es el mismo en todas las fases. */
export function numeroDeFrente(id: string): number | null {
  const conLugar = frentesBilingues().filter((f) => f.lugar);
  const i = conLugar.findIndex((f) => f.id === id);
  return i < 0 ? null : i + 1;
}

/** Frentes vigentes con lugar, vigentes sin lugar, y los que vienen en fases siguientes a la elegida. */
export function frentesEn(fase: Fase, idioma: Idioma = "es"): { conLugar: Frente[]; sinLugar: Frente[]; despues: Frente[] } {
  const todos = listarFrentes(idioma);
  return {
    conLugar: todos.filter((f) => vigenteEn(f, fase) && f.lugar),
    sinLugar: todos.filter((f) => vigenteEn(f, fase) && !f.lugar),
    despues: todos.filter((f) => !vigenteEn(f, fase)),
  };
}

/** Un frente es "de hoy" si ya está vigente en la fase actual: solo a esos se puede sumar una persona. */
export function esDeHoy(f: { desde: Fase }): boolean {
  return vigenteEn(f, FASE_ACTUAL);
}

// --- Fuentes del plan ---

export type FuentePlanId = "ilustrativa" | "permacultura" | "martin";
export type FuentePlan = { id: FuentePlanId; estado: "disponible" | "pendiente" };

/** La alternativa de permacultura (PR #109) se suma acá cuando sus datos estén en el código. */
export const FUENTES_PLAN: readonly FuentePlan[] = [
  { id: "ilustrativa", estado: "disponible" },
  { id: "martin", estado: "pendiente" },
];

/** Fuente del plan de la URL (`?plan=`, o el alias viejo `?vista=permacultura`). Desconocida o no disponible = ilustrativa. */
export function leerFuentePlan(params: URLSearchParams, fuentes: readonly FuentePlan[] = FUENTES_PLAN): FuentePlanId {
  const pedida = params.get("plan") ?? (params.get("vista") === "permacultura" ? "permacultura" : null);
  return fuentes.find((f) => f.id === pedida && f.estado === "disponible")?.id ?? "ilustrativa";
}

// --- Entrada desde la URL ---

export type Entrada = { vista: VistaId; fase: Fase; sel: string | null; fuente: FuentePlanId };

/**
 * Lee `vista`, `fase` y `sel` juntos. Un `sel` no elegible se limpia. Única excepción de compatibilidad: sin `vista`,
 * un `sel` que no es elegible en Ahora abre la primera vista donde sí lo sea (enlaces viejos como `?sel=barrio-6`).
 */
export function leerEntrada(params: URLSearchParams): Entrada {
  const fase = leerFase(params.get("fase"));
  const fuente = leerFuentePlan(params);
  const pedida = params.get("vista");
  const sel = params.get("sel");
  let vista = leerVista(pedida);
  if (!sel) return { vista, fase, sel: null, fuente };
  if (buscarVista(vista).elegibles(fase).includes(sel)) return { vista, fase, sel, fuente };
  if (pedida === null) {
    const otra = VISTAS.find((v) => v.elegibles(fase).includes(sel));
    if (otra) {
      vista = otra.id;
      return { vista, fase, sel, fuente };
    }
  }
  return { vista, fase, sel: null, fuente };
}
