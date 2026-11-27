// Los tres planes de Sumarte y su clave en la URL (`?plan=amigo`). Solo presentación: las reglas de cada plan
// siguen en `lib/sumarte/estado.ts` y en `app/sumarte/sumarte-cliente.tsx`. Aliados no es un plan: es una franja aparte.
import type { EstadoSumarte } from "@/lib/sumarte/estado";

export const PLANES = ["explorador", "amigo", "fundador"] as const;
export type PlanVista = (typeof PLANES)[number];

export const PLAN_POR_DEFECTO: PlanVista = "amigo";

/** Direcciones del modelo anterior: `plan=miembro` lleva a Amigo y `plan=comunidad`, a la franja de Aliados. */
export type DireccionVieja = "miembro" | "comunidad";

export function direccionVieja(valor: string | null | undefined): DireccionVieja | null {
  return valor === "miembro" || valor === "comunidad" ? valor : null;
}

/** El plan de la URL (con las direcciones viejas ya traducidas), o `null` si falta o no es uno de los tres. */
export function leerPlan(valor: string | null | undefined): PlanVista | null {
  if (direccionVieja(valor)) return PLAN_POR_DEFECTO;
  return PLANES.find((p) => p === valor) ?? null;
}

/** El plan que la persona ya tiene (con sesión); sin cuenta no hay ninguno. */
export function planDeLaPersona(estado: EstadoSumarte): PlanVista {
  if (estado.pase) return "fundador";
  return estado.plan === "explorador" ? "explorador" : "amigo";
}

/** Columna de la tabla comparativa de cada plan. */
export function columnaDeLaTabla(plan: PlanVista | null): number | null {
  if (plan === null) return null;
  return PLANES.indexOf(plan);
}
