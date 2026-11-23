import type { ClaveTermino } from "./terminos";

// Estado administrativo (loteo y aprobación municipal) de los proyectos con lotes.
// Regla C1: toda vista con lotes muestra este estado. Lo que se ofrece sobre un lote
// depende de `ventaSimulada` (ADR-030), nunca de `aprobacionMunicipal`: la aprobación
// no está otorgada en ningún proyecto y ningún dato ni texto puede decir que lo está.
export type EstadoAdministrativo = {
  proyecto: string;
  /** Si falta, la vista escribe "sin dato". */
  titular?: string;
  estado: string;
  norma: string;
  normaCorta: string;
  /** Número de expediente. Si falta, la vista escribe "sin dato". */
  expediente?: string;
  aprobacionMunicipal: boolean;
  /** Habilita reservar y comprar SOLO simulados (ADR-030). Nunca implica aprobación. */
  ventaSimulada?: true;
  /** Texto que reemplaza a "aprobada/pendiente" cuando se trabaja con un supuesto. */
  supuestoDeTrabajo?: string;
  /** El ⚖ del aviso, si no es el de siempre. */
  terminoLegal?: ClaveTermino;
  /** Fecha de la aprobación. Si falta, "sin dato". */
  fechaAprobacion?: string;
  /** Fecha del dato (AAAA-MM-DD). */
  actualizado: string;
  en?: {
    proyecto: string;
    estado: string;
    norma: string;
    normaCorta: string;
    supuestoDeTrabajo?: string;
  };
};

export type IdProyecto = "soluna" | "lighthouse-norte" | "lighthouse-primeros";

export const ESTADOS_ADMINISTRATIVOS: Record<IdProyecto, EstadoAdministrativo> = {
  soluna: {
    proyecto: "Chacras de Soluna",
    titular: "BioPueblo",
    estado: "Loteo en trámite",
    norma: "Ord. 173/2026 de Mainqué",
    normaCorta: "Ord. 173/2026",
    // El expediente no figura en la Memoria Técnica: lo da Gabriel o Diego.
    aprobacionMunicipal: false,
    actualizado: "2026-10-07",
  },
  "lighthouse-norte": {
    proyecto: "Lighthouse VRN · sector norte",
    estado: "Loteo provisorio",
    norma: "Ord. 173/2026 de Mainqué",
    normaCorta: "Ord. 173/2026",
    // Sin titular, expediente ni fecha de aprobación: se muestran "sin dato".
    aprobacionMunicipal: false,
    ventaSimulada: true,
    supuestoDeTrabajo: "supuesto de trabajo, no otorgada",
    actualizado: "2026-11-02",
    en: {
      proyecto: "Lighthouse VRN · north sector",
      estado: "Provisional subdivision",
      norma: "Ord. 173/2026 of Mainqué",
      normaCorta: "Ord. 173/2026",
      supuestoDeTrabajo: "working assumption, not granted",
    },
  },
  // Los primeros que se venden, fuera del 7A: la excepción a "Soluna es vitrina" (R40, Gus, 4-nov-2026).
  // Nos informaron que están aprobados, pero no hay documento: no se muestra como otorgada.
  "lighthouse-primeros": {
    proyecto: "Primeros 4 lotes · junto a Lighthouse VRN",
    titular: "BioPueblo",
    estado: "Loteo de Chacras de Soluna",
    norma: "Ord. 173/2026 de Mainqué",
    normaCorta: "Ord. 173/2026",
    aprobacionMunicipal: false,
    ventaSimulada: true,
    supuestoDeTrabajo: "informada, sin documento a la vista",
    terminoLegal: "primeroslotes",
    actualizado: "2026-11-04",
    en: {
      proyecto: "First 4 lots · next to Lighthouse VRN",
      estado: "Chacras de Soluna subdivision",
      norma: "Ord. 173/2026 of Mainqué",
      normaCorta: "Ord. 173/2026",
      supuestoDeTrabajo: "reported, no document on hand",
    },
  },
};

/** El proyecto cuyo estado administrativo le corresponde a un lote. */
export const proyectoDeGrupo = (grupo: "primeros" | "norte"): IdProyecto =>
  grupo === "primeros" ? "lighthouse-primeros" : "lighthouse-norte";

export type AccionDeLote = "consultar" | "comprar" | "reservar";

/**
 * Acciones que una vista puede ofrecer sobre un lote del proyecto.
 * Depende solo de `ventaSimulada` (ADR-030): reservar y comprar son siempre simulados.
 * No lee `aprobacionMunicipal`.
 */
export function accionesDeLote(proyecto: IdProyecto): AccionDeLote[] {
  return ESTADOS_ADMINISTRATIVOS[proyecto].ventaSimulada
    ? ["consultar", "reservar", "comprar"]
    : ["consultar"];
}

export function textoExpediente(e: EstadoAdministrativo): string {
  return e.expediente?.trim() ? e.expediente : "sin dato";
}

export function textoTitular(e: EstadoAdministrativo): string {
  return e.titular?.trim() ? e.titular : "sin dato";
}

export function textoFechaAprobacion(e: EstadoAdministrativo): string {
  return e.fechaAprobacion?.trim() ? e.fechaAprobacion : "sin dato";
}
