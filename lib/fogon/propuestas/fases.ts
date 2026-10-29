// Fases de cada recorrido y qué acciones se ofrecen en cada una (design §2, "Por fase").
import type { Ambito } from "@/lib/fogon/datos";
import { MATERIAS_SIN_URGENCIA } from "./reglas";
import { permiso, type ResultadoPermiso } from "./permisos";
import type { Accion, EstadoPropuesta, Fase, NivelImplicacion, Propuesta, Recorrido } from "./tipos";

export const RECORRIDOS: Readonly<Record<Recorrido, readonly Fase[]>> = {
  simple: ["presentacion", "objetar", "cierre"],
  importante: ["borrador", "presentacion", "preguntas", "discusion", "concerns", "resolver", "llamado", "cierre"],
};

/** Siempre disponibles para los niveles que pueden (si la persona no puede, `permiso` da "no"). */
const SIEMPRE: readonly Accion[] = ["leer-propuesta", "leer-discusion", "recibir-avisos"];

/** Se ofrecen en cualquier fase menos "cierre" (si el contexto lo permite). */
const ANTES_DEL_CIERRE: readonly Accion[] = ["declararse-afectada", "objetar-afectada", "sacar-propio-del-grupo", "objetar-urgencia"];

export const ACCIONES_POR_FASE: Readonly<Record<Fase, readonly Accion[]>> = {
  borrador: ["editar", "pasar-fase", "marcar-urgente"],
  // "preguntar" en la presentación solo vale para la decisión simple (se filtra en `accionesDisponibles`).
  presentacion: ["preguntar", "acusar-conformidad", "pasar-fase", "marcar-urgente", "respaldar-urgencia"],
  preguntas: ["preguntar", "acusar-conformidad", "pasar-fase", "marcar-urgente", "respaldar-urgencia"],
  discusion: ["comentar", "proponer-resolucion", "sugerir-mecanismo", "acusar-conformidad", "pasar-fase", "respaldar-urgencia"],
  concerns: [
    "comentar",
    "levantar-concern",
    "sumarse-concern",
    "agrupar-concerns",
    "sugerir-mecanismo",
    "acusar-conformidad",
    "pasar-fase",
    "respaldar-urgencia",
  ],
  resolver: [
    "comentar",
    "proponer-resolucion",
    "sugerir-mecanismo",
    "editar",
    "derivar-o-pausar",
    "acusar-conformidad",
    "pasar-fase",
    "respaldar-urgencia",
  ],
  llamado: ["hacerse-a-un-lado", "bloquear", "decidir-legitimidad", "derivar-o-pausar", "acusar-conformidad", "pasar-fase"],
  objetar: [
    "preguntar",
    "comentar",
    "levantar-concern",
    "sumarse-concern",
    "agrupar-concerns",
    "sugerir-mecanismo",
    "hacerse-a-un-lado",
    "bloquear",
    "decidir-legitimidad",
    "pedir-recorrido-importante",
    "acusar-conformidad",
    "pasar-fase",
    "marcar-urgente",
    "respaldar-urgencia",
  ],
  cierre: ["escribir-acta", "evaluar"],
};

/** Las acciones propias de una fase (sin las que valen en cualquier fase menos cierre), según el recorrido. */
export function accionesDeFase(fase: Fase, recorrido: Recorrido): Accion[] {
  const base = [...SIEMPRE, ...(fase === "cierre" ? [] : ANTES_DEL_CIERRE), ...ACCIONES_POR_FASE[fase]];
  return base.filter((a) => !(a === "preguntar" && fase === "presentacion" && recorrido === "importante"));
}

export type AccionOfrecida = { accion: Accion; permiso: ResultadoPermiso };

/**
 * Lo único que usa la pantalla: las acciones de la fase que el nivel permite (sí o con condición). La visita no tiene ninguna.
 * En "cierre", quien facilita ve "Abrir la revisión" solo si el resultado es una medida provisoria (D3).
 */
export function accionesDisponibles(
  p: Pick<Propuesta, "recorrido" | "materia">,
  e: Pick<EstadoPropuesta, "fase" | "resultado">,
  niveles: readonly NivelImplicacion[],
  ambito: Ambito,
): AccionOfrecida[] {
  const acciones = accionesDeFase(e.fase, p.recorrido);
  if (e.fase === "cierre" && e.resultado?.tipo === "provisoria" && !e.resultado.enRevision) acciones.push("abrir-revision");
  const sinUrgencia = p.materia !== undefined && (MATERIAS_SIN_URGENCIA as readonly string[]).includes(p.materia);
  const salida: AccionOfrecida[] = [];
  for (const accion of acciones) {
    if (accion === "marcar-urgente" && sinUrgencia) continue;
    const r = permiso(accion, niveles, { ambito });
    if (r.estado !== "no") salida.push({ accion, permiso: r });
  }
  return salida;
}
