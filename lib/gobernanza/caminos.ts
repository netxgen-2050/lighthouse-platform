// Caminos de ejemplo de las decisiones: por qué lugares pasa cada una (lente "Decisiones que suben").
// Los ids apuntan a decisiones del Fogón (`lib/fogon/datos.ts`) y a nodos de la holarquía. Son EJEMPLOS: el reglamento
// real lo define el diseño legal.
import { copiaParaElConsejo, DECISIONES_BASE, type Decision } from "@/lib/fogon/datos";
import { COMUN_ID } from "./datos";
import { CONSEJO_ID, buscarNodo, type NodoH } from "./holarquia";

/** Sube al consejo, se deriva a un círculo del común o se decide abajo sin subir. */
export type TipoCamino = "sube" | "deriva" | "queda";

export type Camino = { decisionId: string; camino: string[]; tipo: TipoCamino };

export const CAMINOS: readonly Camino[] = [
  { decisionId: "consejo-bomba", camino: ["valle-0", "valle", CONSEJO_ID, COMUN_ID], tipo: "sube" },
  { decisionId: "regalia", camino: ["comun-token", COMUN_ID], tipo: "queda" },
  { decisionId: "siembra", camino: ["valle-0", "valle"], tipo: "queda" },
  { decisionId: "cisterna-compartida", camino: ["agua-0", "agua", CONSEJO_ID, "comun-agua"], tipo: "deriva" },
];

export type CaminoDeDecision = { camino: string[]; tipo: TipoCamino };

/**
 * El camino de una decisión, en este orden: (1) la entrada de `CAMINOS`; (2) si es una copia llevada al consejo, el
 * camino de la decisión original si existe (o su tribu) más el paso Consejo, que sube; (3) si no, null: no se inventa
 * un camino.
 */
export function caminoDe(d: Pick<Decision, "id" | "origen">): CaminoDeDecision | null {
  const propio = CAMINOS.find((c) => c.decisionId === d.id);
  if (propio) return { camino: [...propio.camino], tipo: propio.tipo };
  if (d.origen?.tribuId) {
    const original = CAMINOS.find((c) => c.decisionId === d.id.replace(/^consejo-/, ""));
    const base = original ? original.camino.filter((x) => x !== CONSEJO_ID) : [d.origen.tribuId];
    return { camino: [...base, CONSEJO_ID], tipo: "sube" };
  }
  return null;
}

/** Descarta los ids que no existen en el árbol (con un aviso en desarrollo): un camino roto nunca rompe la página. */
export function caminoEnArbol(raiz: NodoH, camino: readonly string[]): string[] {
  return camino.filter((id) => {
    const existe = buscarNodo(raiz, id) !== null;
    if (!existe && process.env.NODE_ENV !== "production") console.warn(`[gobernanza] el camino nombra un nodo que no existe: ${id}`);
    return existe;
  });
}

/**
 * Las decisiones que lista la lente: las de ejemplo de `CAMINOS` y, al final, las copias que la persona llevó al consejo
 * en su navegador (`alConsejo` son ids de decisiones originales). Una copia ya incluida en `CAMINOS` no se repite.
 */
export function decisionesDeLaLente(alConsejo: readonly string[] = []): Decision[] {
  const base = CAMINOS.flatMap((c) => {
    const d = DECISIONES_BASE.find((x) => x.id === c.decisionId);
    return d ? [d] : [];
  });
  const copias = alConsejo.flatMap((id) => {
    const original = DECISIONES_BASE.find((x) => x.id === id && x.pideAlComun);
    if (!original) return [];
    const copia = copiaParaElConsejo(original);
    return base.some((b) => b.id === copia.id) ? [] : [copia];
  });
  return [...base, ...copias];
}
