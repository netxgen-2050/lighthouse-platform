// Los números de la vista "Barrio Norte" (`/barrios/norte`). Puro: no escribe ninguno, los arma de los módulos con versión
// (`lib/territorios/loteo*.ts`, `lib/lotes/modelo.ts`). La obra (infraestructura, devolución, común por año) NO se arma
// acá: sale de `resumenObraBarrio()` de `lib/bien-comun/barrio.ts` y solo se calcula con sesión.
import { MODELO_LOTES, VERSION_MODELO_LOTES } from "@/lib/lotes/modelo";
import { estadoDeLote } from "@/lib/territorios/loteo-estados";
import { listarLotes } from "@/lib/territorios/loteo";

export type EstadoBarrio = "disponible" | "reservado" | "enCuotas" | "vendido";

export const ESTADOS_BARRIO: readonly EstadoBarrio[] = ["disponible", "reservado", "enCuotas", "vendido"];

export type VistaBarrioNorte = {
  /** Total por estado, del loteo base. "En cuotas" no existe en el loteo base: null = "sin dato" (nunca 0). */
  lotesPorEstado: Record<EstadoBarrio, number | null>;
  /** Proporción de cada pago que va al común (aporte único). */
  parteParaElComun: number;
  /** USD por lote por año. */
  expensa: number;
  versionModelo: string;
  /** Lotes que trae el plano (todos los del loteo vigente). */
  lotesDelPlano: number;
};

/** Lo que se ve sin sesión. Las compras simuladas del navegador no entran: solo se leen los estados del loteo base. */
export function vistaBarrioNorte(): VistaBarrioNorte {
  const lotes = listarLotes();
  const cuenta = (e: "disponible" | "reservado" | "vendido") => lotes.filter((l) => estadoDeLote(l.id) === e).length;
  return {
    lotesPorEstado: {
      disponible: cuenta("disponible"),
      reservado: cuenta("reservado"),
      enCuotas: null,
      vendido: cuenta("vendido"),
    },
    parteParaElComun: MODELO_LOTES.aporteUnico,
    expensa: MODELO_LOTES.expensaAnual,
    versionModelo: VERSION_MODELO_LOTES.version,
    lotesDelPlano: lotes.length,
  };
}

/** ¿El cálculo de la obra usa otra cantidad de lotes que el plano? */
export const difierenLosLotes = (delModelo: number, delPlano: number): boolean => delModelo !== delPlano;
