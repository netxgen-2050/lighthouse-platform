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
  tribu: boolean;
};

export type Accion =
  | { tipo: "plan"; plan: Plan }
  | { tipo: "facturacion"; facturacion: Facturacion }
  | { tipo: "nivel"; nivel: NivelPase }
  | { tipo: "pase" }
  | { tipo: "invitacion" }
  | { tipo: "charla" }
  | { tipo: "tribu" };

export const INICIAL: EstadoSumarte = {
  plan: "explorador",
  facturacion: "anual",
  nivelPase: "brote",
  pase: null,
  invitacion: false,
  charla: false,
  tribu: false,
};

const NIVELES: readonly string[] = ["semilla", "brote", "raiz"];

export function reducir(e: EstadoSumarte, a: Accion): EstadoSumarte {
  switch (a.tipo) {
    case "plan":
      // Volver a Explorador deshace también el pase; hacerse Miembro lo conserva.
      return a.plan === "explorador" ? { ...e, plan: "explorador", pase: null } : { ...e, plan: "miembro" };
    case "facturacion":
      return { ...e, facturacion: a.facturacion };
    case "nivel":
      // Con un pase activo el nivel no cambia: primero hay que deshacerlo.
      return e.pase ? e : { ...e, nivelPase: a.nivel };
    case "tribu":
      return { ...e, tribu: true };
    case "pase":
      // El pase incluye la membresía (como en el mock-up).
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
    return {
      plan: o.plan === "miembro" ? "miembro" : "explorador",
      facturacion: o.facturacion === "mensual" ? "mensual" : "anual",
      nivelPase: typeof o.nivelPase === "string" && NIVELES.includes(o.nivelPase) ? (o.nivelPase as NivelPase) : INICIAL.nivelPase,
      pase: typeof o.pase === "string" && NIVELES.includes(o.pase) ? (o.pase as NivelPase) : null,
      invitacion: o.invitacion === true,
      charla: o.charla === true,
      tribu: o.tribu === true,
    };
  } catch {
    return INICIAL;
  }
}
