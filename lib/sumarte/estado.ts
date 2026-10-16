import { listarTribus } from "@/lib/tribus/datos";
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
  /** Tribus existentes que lidera con el Plan Tribu (simulado), sin repetir. */
  tribus: string[];
  /** Hay una tribu nueva por proponer (todavía no existe). Solo puede haber una. */
  tribuNueva: boolean;
};

/** ¿Lidera alguna tribu (existente o nueva por proponer)? */
export function esLiderDeTribu(e: Pick<EstadoSumarte, "tribus" | "tribuNueva">): boolean {
  return e.tribus.length > 0 || e.tribuNueva;
}

export type Accion =
  | { tipo: "plan"; plan: Plan }
  | { tipo: "facturacion"; facturacion: Facturacion }
  | { tipo: "nivel"; nivel: NivelPase }
  | { tipo: "pase" }
  | { tipo: "invitacion" }
  | { tipo: "charla" }
  /** Plan Tribu: primera tribu o sumar otra; sin `tribuId` es una tribu nueva por proponer. */
  | { tipo: "tribu"; tribuId?: string | null }
  /** Deja de liderar una tribu ("nueva" = la tribu nueva por proponer). */
  | { tipo: "dejarTribu"; tribuId: string };

export const INICIAL: EstadoSumarte = {
  plan: "explorador",
  facturacion: "anual",
  nivelPase: "brote",
  pase: null,
  invitacion: false,
  charla: false,
  tribus: [],
  tribuNueva: false,
};

const NIVELES: readonly string[] = ["semilla", "brote", "raiz"];

/** Tribus que se pueden liderar: las activas y las en formación. */
function idsLiderables(): string[] {
  return listarTribus()
    .filter((t) => t.estado === "activa" || t.estado === "formacion")
    .map((t) => t.id);
}

export function reducir(e: EstadoSumarte, a: Accion): EstadoSumarte {
  switch (a.tipo) {
    case "plan":
      // Volver a Explorador deshace también el pase; hacerse Miembro lo conserva. Cambiar de plan deja de ser líder de tribu.
      return a.plan === "explorador"
        ? { ...e, plan: "explorador", pase: null, tribus: [], tribuNueva: false }
        : { ...e, plan: "miembro", tribus: [], tribuNueva: false };
    case "facturacion":
      return { ...e, facturacion: a.facturacion };
    case "nivel":
      // Con un pase activo el nivel no cambia: primero hay que deshacerlo.
      return e.pase ? e : { ...e, nivelPase: a.nivel };
    case "tribu":
      // El Plan Tribu incluye todo lo de Miembro.
      if (!a.tribuId) return { ...e, plan: "miembro", tribuNueva: true };
      return { ...e, plan: "miembro", tribus: e.tribus.includes(a.tribuId) ? e.tribus : [...e.tribus, a.tribuId] };
    case "dejarTribu":
      // Dejar la última deja a la persona como Miembro (el plan y el pase no cambian).
      return a.tribuId === "nueva"
        ? { ...e, tribuNueva: false }
        : { ...e, tribus: e.tribus.filter((id) => id !== a.tribuId) };
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
    // Formato anterior: { tribu: true, tribuId: "valle" | null }.
    const validos = idsLiderables();
    let tribus: string[] = [];
    let tribuNueva = false;
    if (Array.isArray(o.tribus) || o.tribuNueva === true) {
      if (Array.isArray(o.tribus)) {
        tribus = o.tribus.filter((id, i, l): id is string => typeof id === "string" && validos.includes(id) && l.indexOf(id) === i);
      }
      tribuNueva = o.tribuNueva === true;
    } else if (o.tribu === true) {
      if (typeof o.tribuId === "string" && o.tribuId !== "") {
        if (validos.includes(o.tribuId)) tribus = [o.tribuId];
      } else {
        tribuNueva = true;
      }
    }
    return {
      plan: o.plan === "miembro" || tribus.length > 0 || tribuNueva ? "miembro" : "explorador",
      facturacion: o.facturacion === "mensual" ? "mensual" : "anual",
      nivelPase: typeof o.nivelPase === "string" && NIVELES.includes(o.nivelPase) ? (o.nivelPase as NivelPase) : INICIAL.nivelPase,
      pase: typeof o.pase === "string" && NIVELES.includes(o.pase) ? (o.pase as NivelPase) : null,
      invitacion: o.invitacion === true,
      charla: o.charla === true,
      tribus,
      tribuNueva,
    };
  } catch {
    return INICIAL;
  }
}
