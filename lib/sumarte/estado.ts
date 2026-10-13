import type { NivelPase } from "./datos";

export type Plan = "explorador" | "miembro";
export type Facturacion = "mensual" | "anual";

export type EstadoSumarte = {
  plan: Plan;
  facturacion: Facturacion;
  nivelPase: NivelPase;
  /** Pase activo (simulado), o null. */
  pase: NivelPase | null;
  invitacion: boolean;
  charla: boolean;
  /** Plan Tribu elegido: la persona es líder de tribu (simulado). */
  tribu: boolean;
  /** Tribu que lidera, o null si propuso una tribu nueva (todavía no existe). */
  tribuId: string | null;
};

export type Accion =
  | { tipo: "plan"; plan: Plan }
  | { tipo: "facturacion"; facturacion: Facturacion }
  | { tipo: "nivel"; nivel: NivelPase }
  | { tipo: "pase" }
  | { tipo: "invitacion" }
  | { tipo: "charla" }
  /** Plan Tribu; sin `tribuId` es una tribu nueva por proponer. */
  | { tipo: "tribu"; tribuId?: string | null };

export const INICIAL: EstadoSumarte = {
  plan: "explorador",
  facturacion: "anual",
  nivelPase: "brote",
  pase: null,
  invitacion: false,
  charla: false,
  tribu: false,
  tribuId: null,
};

const NIVELES: readonly string[] = ["semilla", "brote", "raiz"];

export function reducir(e: EstadoSumarte, a: Accion): EstadoSumarte {
  switch (a.tipo) {
    case "plan":
      // Volver a Explorador deshace también el pase; hacerse Miembro lo conserva. Cambiar de plan deja de ser líder de tribu.
      return a.plan === "explorador"
        ? { ...e, plan: "explorador", pase: null, tribu: false, tribuId: null }
        : { ...e, plan: "miembro", tribu: false, tribuId: null };
    case "facturacion":
      return { ...e, facturacion: a.facturacion };
    case "nivel":
      // Con un pase activo el nivel no cambia: primero hay que deshacerlo.
      return e.pase ? e : { ...e, nivelPase: a.nivel };
    case "tribu":
      // El Plan Tribu incluye todo lo de Miembro.
      return { ...e, plan: "miembro", tribu: true, tribuId: a.tribuId ?? null };
    case "pase":
      // El pase incluye la membresía (como en el mock-up); si ya lidera una tribu, lo sigue haciendo.
      return { ...e, pase: e.nivelPase, plan: "miembro" };
    case "invitacion":
      return { ...e, invitacion: true };
    case "charla":
      return { ...e, charla: true };
  }
}

/** Lee lo guardado; cualquier cosa rara vuelve al estado inicial campo por campo. */
export function leer(crudo: string | null): EstadoSumarte {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const tribu = o.tribu === true;
    return {
      plan: o.plan === "miembro" || tribu ? "miembro" : "explorador",
      facturacion: o.facturacion === "mensual" ? "mensual" : "anual",
      nivelPase: typeof o.nivelPase === "string" && NIVELES.includes(o.nivelPase) ? (o.nivelPase as NivelPase) : INICIAL.nivelPase,
      pase: typeof o.pase === "string" && NIVELES.includes(o.pase) ? (o.pase as NivelPase) : null,
      invitacion: o.invitacion === true,
      charla: o.charla === true,
      tribu,
      tribuId: tribu && typeof o.tribuId === "string" && o.tribuId !== "" ? o.tribuId : null,
    };
  } catch {
    return INICIAL;
  }
}
