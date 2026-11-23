import type { Idioma } from "@/lib/idioma/tipos";
import { formatearFecha } from "@/lib/idioma/formatos";
import type { EstadoDecision } from "./modelo";

/** Los dos textos que hacen falta para decir el estado de una decisión (vienen del diccionario). */
export type TextosEstado = { abierta: string; decidida: (fecha: string, quien: string) => string };

/**
 * El estado de una decisión, dicho con palabras: "abierta", o "decidida el <fecha> por <quién>" con la fecha en el idioma de la
 * página. Es una función aparte para poder probar el cambio de estado sin tocar el módulo (hoy las ocho están abiertas).
 */
export function textoDeEstado(d: EstadoDecision, t: TextosEstado, idioma: Idioma): string {
  return d.estado === "abierta" ? t.abierta : t.decidida(formatearFecha(d.decidida.fecha, idioma, "largo"), d.decidida.quien);
}
