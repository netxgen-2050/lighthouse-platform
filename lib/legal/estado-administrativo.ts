// Estado administrativo (loteo y aprobación municipal) de los proyectos con lotes.
// Regla C1: toda vista con lotes lo muestra y no ofrece compra ni reserva sin aprobación.
export type EstadoAdministrativo = {
  proyecto: string;
  titular: string;
  estado: string;
  norma: string;
  normaCorta: string;
  /** Número de expediente. Si falta, la vista escribe "sin dato". */
  expediente?: string;
  aprobacionMunicipal: boolean;
  /** Fecha del dato (AAAA-MM-DD). */
  actualizado: string;
};

export type IdProyecto = "soluna";

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
};

export type AccionDeLote = "consultar" | "comprar" | "reservar";

/**
 * Acciones que una vista puede ofrecer sobre un lote del proyecto.
 * Sin aprobación municipal solo se puede consultar. Habilitar compra o reserva
 * cuando haya aprobación es otro cambio: por ahora devuelve lo mismo en ambos casos.
 */
export function accionesDeLote(proyecto: IdProyecto): AccionDeLote[] {
  void ESTADOS_ADMINISTRATIVOS[proyecto].aprobacionMunicipal;
  return ["consultar"];
}

export function textoExpediente(e: EstadoAdministrativo): string {
  return e.expediente?.trim() ? e.expediente : "sin dato";
}
