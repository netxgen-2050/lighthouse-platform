import type { EstadoSesion } from "@/components/sesion/contexto";
import { alcanza, type Nivel } from "@/lib/permisos/niveles";
import type { EstadoConsentimiento } from "@/lib/privacidad/usar-consentimiento";

export type QueMostrarEnTicket = "nada" | "sumate" | "politica" | "formulario";

/**
 * Qué ve la persona en el bloque del ticket de /congreso (spec "Vincular el ticket pide cuenta").
 * El formulario aparece SOLO con sesión ok, nivel ya leído y suficiente (Explorador) y política vigente.
 * Todo estado en carga, o que no sea de una persona que pueda sumarse desde acá, es "nada".
 */
export function queMostrarEnTicket(
  estado: EstadoSesion,
  nivel: Nivel,
  nivelListo: boolean,
  consentimiento: EstadoConsentimiento,
): QueMostrarEnTicket {
  if (estado === "sin-sesion") return "sumate";
  if (estado !== "ok") return "nada";
  if (!nivelListo) return "nada";
  if (!alcanza(nivel, "explorador")) return "sumate";
  if (consentimiento === "cargando") return "nada";
  if (consentimiento === "pendiente") return "politica";
  return consentimiento === "vigente" ? "formulario" : "nada";
}
