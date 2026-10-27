import type { Residencia } from "@/lib/pasaporte/datos";
import { copiaParaElConsejo, DECISIONES_BASE, type Ambito, type Decision, type Opcion } from "./datos";

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
 * `pase` es si tiene el Pase Fundador (cualquier nivel): es lo que habilita el Fideicomiso.
 * `lidera` es la tribu que lidera (dato de Sumarte): es lo que habilita llevar una decisión de esa tribu al consejo.
 */
export type Condicion = { residencia: Residencia | undefined; pase: boolean; lidera?: string | null };

export const SIN_CONDICION: Condicion = { residencia: undefined, pase: false };

/**
 * Por qué una persona no puede votar en una decisión. Es una clave: el texto sale del diccionario del Fogón
 * (`textos("fogon", idioma).motivos`), así que se lee igual en los dos idiomas.
 */
export type MotivoSinVoto = "pase" | "residentes" | "sinDato";

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
  if (d.requisito === "ninguno") return null;
  if (d.requisito === "pase") return condicion.pase ? null : "pase";
  if (condicion.residencia === "argentina") return null;
  if (condicion.residencia === undefined) return "sinDato";
  return "residentes";
}

export function filtrar(ambito: Ambito | null, e: EstadoFogon = INICIAL): readonly Decision[] {
  const todas = decisionesVisibles(e);
  return ambito ? todas.filter((d) => d.ambito === ambito) : todas;
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
