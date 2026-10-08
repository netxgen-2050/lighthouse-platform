import type { Residencia } from "@/lib/pasaporte/datos";
import { DECISIONES, type Ambito, type Decision, type Opcion } from "./datos";

export type VotosPersona = Partial<Record<string, Opcion>>;

/** Los votos de quien mira (simulados, solo en este navegador). */
export type EstadoFogon = {
  votos: VotosPersona;
};

export const INICIAL: EstadoFogon = { votos: {} };

/**
 * Residencia fiscal que la persona cargó en "Tus datos"; `undefined` si no la cargó (sin dato).
 * Por ahora, en el prototipo, residir fiscalmente en Argentina habilita la asamblea y el fideicomiso (simulado).
 */
export type Condicion = Residencia | undefined;

/** Voto propio en una decisión; nada si todavía no puede votar ahí. */
export function votoPropio(e: EstadoFogon, d: Decision, condicion: Condicion): Opcion | undefined {
  if (motivoSinVoto(d, condicion)) return undefined;
  return e.votos[d.id];
}

const OPCIONES: readonly string[] = ["favor", "contra", "abstencion"];

/** null si puede votar; si no, el motivo que se muestra. Sin dato de residencia no se asume nada. */
export function motivoSinVoto(d: Decision, condicion: Condicion): string | null {
  if (d.requisito === "ninguno") return null;
  if (condicion === "argentina") return null;
  if (condicion === undefined) return "Sin dato de tu residencia";
  return d.requisito === "residente" ? "Solo residentes" : "No sos beneficiaria/o";
}

export function filtrar(ambito: Ambito | null): readonly Decision[] {
  return ambito ? DECISIONES.filter((d) => d.ambito === ambito) : DECISIONES;
}

/** Conteo de ejemplo más el voto propio, si lo hay. */
export function contar(d: Decision, propio: Opcion | undefined): Record<Opcion, number> {
  const c = { ...d.votos };
  if (propio) c[propio] += 1;
  return c;
}

export function votar(e: EstadoFogon, id: string, opcion: Opcion, condicion: Condicion): EstadoFogon {
  const d = DECISIONES.find((x) => x.id === id);
  if (!d || motivoSinVoto(d, condicion)) return e;
  return { votos: { ...e.votos, [id]: opcion } };
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo (incluido el formato viejo con personas de ejemplo). */
export function leer(crudo: string | null): EstadoFogon {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const crudos = o.votos && typeof o.votos === "object" ? (o.votos as Record<string, unknown>) : {};
    const votos: Record<string, Opcion> = {};
    for (const d of DECISIONES) {
      const v = crudos[d.id];
      if (typeof v === "string" && OPCIONES.includes(v)) votos[d.id] = v as Opcion;
    }
    return { votos };
  } catch {
    return INICIAL;
  }
}
