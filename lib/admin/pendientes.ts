import type { Pedido } from "@/lib/contactos/tipos";
import type { Postulacion } from "@/lib/postulaciones/tipos";

/**
 * Pendientes de la administración: hoy nada se responde, así que pendiente = guardado en este navegador. `null` si el
 * navegador no dejó leer las postulaciones ("sin dato", no 0). Cuando exista responder (backlog B6), solo cambia esta función.
 */
export function contarPendientes(postulaciones: Postulacion[] | null, pedidos: Pedido[]): number | null {
  if (postulaciones === null) return null;
  return postulaciones.length + pedidos.length;
}
