import { COMUNIDAD_LIGHTHOUSE, estadoDe, type Membresias } from "@/lib/membresia/estado";

/**
 * Única definición de "adhirió al Lighthouse" (ADR-023): participar en la gobernanza exige haber pedido sumarse
 * (`pedido`) o ser miembro de la comunidad del Lighthouse. Pura: sin `window` ni `localStorage`.
 */
export function puedeParticiparEnGobernanza(membresias: Membresias): boolean {
  return estadoDe(membresias, COMUNIDAD_LIGHTHOUSE) !== "no-miembro";
}
