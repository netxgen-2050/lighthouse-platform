import type { NivelPase } from "./datos";

// Nombres internos (sumarte-planes-v2, design §5): `miembro` es el plan Amigo y `lider` es Aliado. Cambian los nombres que
// se ven, no los identificadores, para no romper las funciones en pausa ni lo guardado en el navegador.
export type Plan = "explorador" | "miembro";
export type Facturacion = "mensual" | "anual";

export type EstadoSumarte = {
  plan: Plan;
  facturacion: Facturacion;
  /** Fundador activo (simulado), o null. */
  pase: NivelPase | null;
  invitacion: boolean;
  /** Pedido de contacto de Aliados enviado (simulado). */
  charla: boolean;
  /** Aliado (antes Plan Tribu): ya no se elige en Sumarte; queda para lo guardado antes. */
  tribu: boolean;
  /** Tribu que administra, o null. */
  tribuId: string | null;
};

export type Accion =
  | { tipo: "plan"; plan: Plan }
  | { tipo: "facturacion"; facturacion: Facturacion }
  | { tipo: "pase" }
  | { tipo: "invitacion" }
  | { tipo: "charla" }
  /** Aliado; sin `tribuId` no hay tribu elegida. */
  | { tipo: "tribu"; tribuId?: string | null };

export const INICIAL: EstadoSumarte = {
  plan: "explorador",
  facturacion: "anual",
  pase: null,
  invitacion: false,
  charla: false,
  tribu: false,
  tribuId: null,
};

export function reducir(e: EstadoSumarte, a: Accion): EstadoSumarte {
  switch (a.tipo) {
    case "plan":
      // Volver a Explorador (darse de baja) deshace también el Fundador; hacerse Amigo lo conserva. Cambiar de plan deja de ser Aliado.
      return a.plan === "explorador"
        ? { ...e, plan: "explorador", pase: null, tribu: false, tribuId: null }
        : { ...e, plan: "miembro", tribu: false, tribuId: null };
    case "facturacion":
      return { ...e, facturacion: a.facturacion };
    case "tribu":
      return { ...e, plan: "miembro", tribu: true, tribuId: a.tribuId ?? null };
    case "pase":
      // El Fundador incluye todo lo de Amigo.
      return { ...e, pase: "fundador", plan: "miembro" };
    case "invitacion":
      return { ...e, invitacion: true };
    case "charla":
      return { ...e, charla: true };
  }
}

/** Los pases del modelo anterior (Semilla, Brote, Raíz) y el nuevo: todos pasan a Fundador. */
const PASES_GUARDADOS: readonly string[] = ["semilla", "brote", "raiz", "fundador"];

/**
 * Lee lo guardado; cualquier cosa rara vuelve al estado inicial campo por campo. Migra el estado del modelo anterior:
 * un `pase` de nivel Semilla, Brote o Raíz pasa a `fundador`, y `tribu: true` pasa a Aliado sin tribu elegida.
 */
export function leer(crudo: string | null): EstadoSumarte {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const tribu = o.tribu === true;
    const pase = typeof o.pase === "string" && PASES_GUARDADOS.includes(o.pase) ? "fundador" : null;
    return {
      plan: o.plan === "miembro" || tribu || pase ? "miembro" : "explorador",
      facturacion: o.facturacion === "mensual" ? "mensual" : "anual",
      pase,
      invitacion: o.invitacion === true,
      charla: o.charla === true,
      tribu,
      tribuId: null,
    };
  } catch {
    return INICIAL;
  }
}
