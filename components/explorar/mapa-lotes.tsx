"use client";

import MapaCliente from "@/app/territorios/[id]/mapa-cliente";
import { Boton } from "@/components/ui/boton";
import { ChipEstado, type EstadoChip } from "@/components/ui/chip-estado";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { FASE_ACTUAL } from "@/lib/territorios/fases";
import type { Lote } from "@/lib/territorios/loteo";
import type { EstadoLote } from "@/lib/territorios/loteo-estados";

type Props = {
  seleccion: string | null;
  /** Elegir un lote en el mapa. Los que el filtro dejó afuera no llegan acá. */
  alElegir: (id: string | null) => void;
  /** Lotes que entran en el filtro; null = todos. */
  visibles: ReadonlySet<string> | null;
  /** El lote elegido y su estado, para la tarjeta flotante. */
  elegido: { lote: Lote; estado: EstadoLote } | null;
  conteo: Record<EstadoLote, number>;
  className?: string;
};

/**
 * Mapa de los lotes (spec ux-explorar, design §4). Envuelve el mapa Leaflet del territorio en su vista Lotes: no duplica capas ni datos.
 * El borde ya distingue el estado (lleno, trazos, puntos). Los polígonos no son tabulables: se elige desde la lista y el mapa lo refleja.
 */
export function MapaLotes({ seleccion, alElegir, visibles, elegido, conteo, className = "h-full" }: Props) {
  const idioma = useIdioma();
  const t = useTextos("explorar");
  const tl = useTextos("territorio").loteo;

  function alElegirEnMapa(id: string) {
    if (visibles && !visibles.has(id)) return;
    if (!id.startsWith("lote-")) return;
    alElegir(id);
  }

  return (
    <div className={`relative isolate min-w-0 ${className}`}>
      <MapaCliente
        seleccion={seleccion}
        alElegir={alElegirEnMapa}
        vista="lotes"
        fase={FASE_ACTUAL}
        className="h-full min-h-64"
        etiqueta={t.mapaLotes.aria(conteo.disponible, conteo.reservado, conteo.vendido)}
        lotesVisibles={visibles}
      />
      {elegido && (
        <div
          role="group"
          aria-label={t.lista.elegido}
          className="absolute inset-x-3 bottom-3 z-[500] grid max-w-xs gap-2 rounded-[var(--radius-m)] bg-surface p-3 text-ink shadow-[var(--sombra-2)]"
        >
          <p className="font-display text-lg font-semibold">{tl.lote(elegido.lote.numero)}</p>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono">{textoSuperficieM2(elegido.lote.superficieM2, idioma)}</span>
            <ChipEstado estado={elegido.estado as EstadoChip} />
          </p>
          <div className="flex gap-2">
            <Boton href={`/lotes/${elegido.lote.id}`} tamano="s">
              {t.lista.verElLote}
            </Boton>
            <Boton variante="texto" tamano="s" onClick={() => alElegir(null)}>
              {t.lista.cerrarTarjeta}
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}

/** Leyenda compacta debajo del mapa: el estado se dice con texto y con la forma del borde (nunca solo color). */
export function LeyendaLotes() {
  const t = useTextos("explorar").mapaLotes;
  return (
    <ul aria-label={t.leyenda} className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
      <li>● {t.disponible}</li>
      <li>◐ {t.reservado}</li>
      <li>✕ {t.vendido}</li>
    </ul>
  );
}
