import { caminoDe } from "@/lib/gobernanza/caminos";
import { buscarNodo, caminoHasta, nombreDe, recorrer, type NodoH } from "@/lib/gobernanza/holarquia";
import type { Residencia } from "@/lib/pasaporte/datos";
import { copiaParaElConsejo, DECISIONES_BASE, type Decision, type Opcion } from "./datos";

export type VotosPersona = Partial<Record<string, Opcion>>;

/** Los votos de quien mira y las decisiones de tribu que llevó al consejo (simulados, solo en este navegador). */
export type EstadoFogon = {
  votos: VotosPersona;
  /** Ids de decisiones de tribu que la líder de esa tribu llevó al consejo. */
  alConsejo: string[];
};

export const INICIAL: EstadoFogon = { votos: {}, alConsejo: [] };

/**
 * Lo que habilita votar. `residencia` es la que la persona cargó en "Tus datos" (`undefined` si no la cargó: sin dato);
 * el requisito `residente` ya no lo usa ninguna decisión visible (la Asamblea de residentes todavía no existe).
 * `lidera` es la tribu que lidera (dato de Sumarte): es lo que habilita llevar una decisión de esa tribu al consejo.
 */
export type Condicion = {
  residencia: Residencia | undefined;
  /** Adhirió al manifiesto de Lighthouse VRN (la regla vive en `lib/gobernanza/participar.ts`). Obligatorio: si falta el dato, no se asume que adhirió. */
  adhirio: boolean;
  lidera?: string | null;
};

export const SIN_CONDICION: Condicion = { residencia: undefined, adhirio: false };

/**
 * Por qué una persona no puede votar en una decisión. Es una clave: el texto sale del diccionario del Fogón
 * (`textos("fogon", idioma).motivos`), así que se lee igual en los dos idiomas.
 */
export type MotivoSinVoto = "manifiesto" | "residentes" | "sinDato";

/** Las decisiones que se ven: las de siempre más las copias de las que se llevaron al consejo. */
export function decisionesVisibles(e: EstadoFogon): readonly Decision[] {
  const copias = e.alConsejo.flatMap((id) => {
    const d = DECISIONES_BASE.find((x) => x.id === id && x.pideAlComun);
    return d ? [copiaParaElConsejo(d)] : [];
  });
  return [...DECISIONES_BASE, ...copias];
}

/** Voto propio en una decisión; nada si todavía no puede votar ahí. */
export function votoPropio(e: EstadoFogon, d: Decision, condicion: Condicion): Opcion | undefined {
  if (motivoSinVoto(d, condicion)) return undefined;
  return e.votos[d.id];
}

const OPCIONES: readonly string[] = ["favor", "contra", "abstencion"];

/** null si puede votar; si no, la clave del motivo que se muestra. Sin dato de residencia no se asume nada. */
export function motivoSinVoto(d: Pick<Decision, "requisito">, condicion: Condicion): MotivoSinVoto | null {
  // La adhesión al manifiesto va primero de todo, también antes de las decisiones sin requisito (ADR-023): sin ella no
  // se participa en ninguna, y es el único motivo que se muestra.
  if (!condicion.adhirio) return "manifiesto";
  if (d.requisito === "ninguno") return null;
  if (condicion.residencia === "argentina") return null;
  if (condicion.residencia === undefined) return "sinDato";
  return "residentes";
}

/** Una decisión de "En los círculos de adentro" con el lugar donde se decide, para decir "en {círculo} · {tribu}". */
export type DecisionDeAdentro = { decision: Decision; circulo: string; tribu: string | null };

export type DecisionesDelHolon = {
  /** Se deciden en este holón. */
  aca: readonly Decision[];
  /** Nacen o pasan por este holón según su camino de ejemplo, sin decidirse acá. */
  pasa: readonly Decision[];
  /** Se deciden en un círculo o tribu de adentro de este holón. */
  adentro: readonly DecisionDeAdentro[];
};

/**
 * Las decisiones que se ven al lado de la holarquía para el holón enfocado (design §2):
 * - `aca`: `holonId === H`.
 * - `pasa`: se deciden en otro lado, su camino de ejemplo incluye a H y (no es "queda" o nace en H).
 * - `adentro`: se deciden en un descendiente estricto de H y no están en `aca` ni en `pasa`.
 * Las copias llevadas al consejo salen de `decisionesVisibles(estado)`.
 */
export function decisionesDelHolon(raiz: NodoH, holonId: string, e: EstadoFogon = INICIAL): DecisionesDelHolon {
  const todas = decisionesVisibles(e);
  const nodo = buscarNodo(raiz, holonId);
  const aca: Decision[] = [];
  const pasa: Decision[] = [];
  const adentro: DecisionDeAdentro[] = [];
  const abajo = new Set<string>();
  const ancestros = new Set<string>(caminoHasta(raiz, holonId).map((n) => n.id));
  if (nodo) {
    recorrer(nodo, (n) => {
      if (n.id !== nodo.id) abajo.add(n.id);
    });
  }
  for (const d of todas) {
    if (d.holonId === holonId) {
      aca.push(d);
      continue;
    }
    const c = caminoDe(d);
    if (c && c.camino.includes(holonId) && (c.tipo !== "queda" || c.camino[0] === holonId)) {
      pasa.push(d);
      continue;
    }
    if (abajo.has(d.holonId)) {
      const camino = caminoHasta(raiz, d.holonId);
      const lugar = camino[camino.length - 1];
      const tribu = camino.find((n) => n.tipo === "tribu");
      // En una tribu (o dentro de una) solo se dice "en {círculo}": la tribu es la que ya se está mirando.
      const tribuYaVista = tribu ? ancestros.has(tribu.id) || tribu.id === holonId : true;
      adentro.push({
        decision: d,
        circulo: lugar ? nombreDe(lugar) : d.holonId,
        tribu: tribu && !tribuYaVista && tribu.id !== lugar?.id ? nombreDe(tribu) : null,
      });
    }
  }
  return { aca, pasa, adentro };
}

/** Conteo de ejemplo más el voto propio, si lo hay. */
export function contar(d: Decision, propio: Opcion | undefined): Record<Opcion, number> {
  const c = { ...d.votos };
  if (propio) c[propio] += 1;
  return c;
}

export function votar(e: EstadoFogon, id: string, opcion: Opcion, condicion: Condicion): EstadoFogon {
  const d = decisionesVisibles(e).find((x) => x.id === id);
  if (!d || motivoSinVoto(d, condicion)) return e;
  return { ...e, votos: { ...e.votos, [id]: opcion } };
}

/** ¿Quien mira puede llevar esta decisión al consejo? Solo la líder de la tribu de origen, una vez, y si ya se aprobó en la tribu. */
export function puedeLlevarAlConsejo(e: EstadoFogon, d: Decision, condicion: Condicion): boolean {
  return (
    condicion.adhirio &&
    d.ambito === "tribu" &&
    d.pideAlComun === true &&
    d.tribuId !== undefined &&
    condicion.lidera === d.tribuId &&
    !e.alConsejo.includes(d.id)
  );
}

/** Lleva la decisión al consejo. Si quien mira no lidera esa tribu (o ya se llevó) devuelve el mismo estado. */
export function llevarAlConsejo(e: EstadoFogon, id: string, condicion: Condicion): EstadoFogon {
  const d = DECISIONES_BASE.find((x) => x.id === id);
  if (!d || !puedeLlevarAlConsejo(e, d, condicion)) return e;
  return { ...e, alConsejo: [...e.alConsejo, id] };
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo (incluido el formato viejo con personas de ejemplo). */
export function leer(crudo: string | null): EstadoFogon {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    // Cualquier formato con "persona" es de cuando había personas de ejemplo: no es un voto de quien mira.
    if ("persona" in o) return INICIAL;
    const llevadas = Array.isArray(o.alConsejo) ? (o.alConsejo as unknown[]) : [];
    const alConsejo = DECISIONES_BASE.filter((d) => d.pideAlComun && llevadas.includes(d.id)).map((d) => d.id);
    const crudos = o.votos && typeof o.votos === "object" ? (o.votos as Record<string, unknown>) : {};
    const votos: Record<string, Opcion> = {};
    // Solo se leen decisiones que existen (incluidas las llevadas al consejo): un voto en una que salió se ignora.
    for (const d of decisionesVisibles({ votos: {}, alConsejo })) {
      const v = crudos[d.id];
      if (typeof v === "string" && OPCIONES.includes(v)) votos[d.id] = v as Opcion;
    }
    return { votos, alConsejo };
  } catch {
    return INICIAL;
  }
}
