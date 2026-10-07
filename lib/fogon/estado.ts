import { DECISIONES, PERSONAS, type Ambito, type Decision, type Opcion, type PersonaId } from "./datos";

export type VotosPersona = Partial<Record<string, Opcion>>;

export type EstadoFogon = {
  persona: PersonaId;
  /** Voto propio por persona y por decisión (simulado). */
  votos: Record<PersonaId, VotosPersona>;
};

export const INICIAL: EstadoFogon = { persona: "lucia", votos: { lucia: {}, lucas: {} } };

/** Voto de la persona activa en una decisión; nada si esa persona no puede votar ahí. */
export function votoPropio(e: EstadoFogon, d: Decision): Opcion | undefined {
  if (motivoSinVoto(d, e.persona)) return undefined;
  return e.votos[e.persona][d.id];
}

const OPCIONES: readonly string[] = ["favor", "contra", "abstencion"];

/** null si puede votar; si no, el motivo que se muestra (como en el mock-up). */
export function motivoSinVoto(d: Decision, persona: PersonaId): string | null {
  const p = PERSONAS[persona];
  if (d.requisito === "residente" && !p.residente) return "Solo residentes";
  if (d.requisito === "beneficiario" && !p.beneficiaria) return "No sos beneficiaria/o";
  return null;
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

export function votar(e: EstadoFogon, id: string, opcion: Opcion): EstadoFogon {
  const d = DECISIONES.find((x) => x.id === id);
  if (!d || motivoSinVoto(d, e.persona)) return e;
  return { ...e, votos: { ...e.votos, [e.persona]: { ...e.votos[e.persona], [id]: opcion } } };
}

export function cambiarPersona(e: EstadoFogon, persona: PersonaId): EstadoFogon {
  return { ...e, persona };
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo. */
export function leer(crudo: string | null): EstadoFogon {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const persona: PersonaId = o.persona === "lucas" ? "lucas" : "lucia";
    const votos: Record<PersonaId, Record<string, Opcion>> = { lucia: {}, lucas: {} };
    const crudos = o.votos && typeof o.votos === "object" ? (o.votos as Record<string, unknown>) : {};
    // Formato viejo: votos planos por decisión, de la persona que estaba activa.
    const porPersona = (id: PersonaId): Record<string, unknown> => {
      const v = crudos[id];
      if (v && typeof v === "object") return v as Record<string, unknown>;
      return id === persona && !("lucia" in crudos) && !("lucas" in crudos) ? crudos : {};
    };
    for (const id of ["lucia", "lucas"] as const) {
      const mios = porPersona(id);
      for (const d of DECISIONES) {
        const v = mios[d.id];
        if (typeof v === "string" && OPCIONES.includes(v)) votos[id][d.id] = v as Opcion;
      }
    }
    return { persona, votos };
  } catch {
    return INICIAL;
  }
}
