// Los cuatro planes de Sumarte y su clave en la URL (`?plan=miembro`). Solo presentación: las reglas de cada plan
// siguen en `lib/sumarte/estado.ts` y en `app/sumarte/sumarte-cliente.tsx`.
import type { EstadoSumarte } from "@/lib/sumarte/estado";

export const PLANES = ["explorador", "miembro", "fundador", "comunidad"] as const;
export type PlanVista = (typeof PLANES)[number];

export const PLAN_POR_DEFECTO: PlanVista = "miembro";

/** El plan de la URL, o `null` si falta o no es uno de los cuatro. */
export function leerPlan(valor: string | null | undefined): PlanVista | null {
  return PLANES.find((p) => p === valor) ?? null;
}

/** El plan que la persona ya tiene (con sesión); sin cuenta no hay ninguno. */
export function planDeLaPersona(estado: EstadoSumarte): PlanVista {
  if (estado.tribu) return "comunidad";
  if (estado.pase) return "fundador";
  return estado.plan === "explorador" ? "explorador" : "miembro";
}

/** Columna de la tabla comparativa de cada plan (la tabla no tiene una columna para Comunidad). */
export function columnaDeLaTabla(plan: PlanVista | null): number | null {
  if (plan === null) return null;
  const i = PLANES.indexOf(plan);
  return i < 3 ? i : null;
}
