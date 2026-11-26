"use client";

import Link from "next/link";
import { PlanoLote } from "@/components/explorar/plano-lote";
import { ChipEstado, type EstadoChip } from "@/components/ui/chip-estado";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { EstadoMostrado } from "@/lib/lotes/compra";
import { usdEn } from "@/lib/lotes/formato";
import { precioLote } from "@/lib/lotes/modelo";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import type { Lote } from "@/lib/territorios/loteo";

const CHIP: Record<EstadoMostrado, EstadoChip> = {
  disponible: "disponible",
  reservado: "reservado",
  vendido: "vendido",
  "reservado-por-vos": "reservado",
  "vendido-a-vos": "vendido",
  "en-cuotas-tuyo": "enCuotas",
};

type TextosEstado = { reservadoPorVos: string; vendidoAVos: string; enCuotasTuyo: string };
/** Lo que la persona hizo en la simulación, en palabras; null si el estado es el de ejemplo. */
function textoDeLaPersona(estado: EstadoMostrado, t: TextosEstado): string | null {
  if (estado === "reservado-por-vos") return t.reservadoPorVos;
  if (estado === "vendido-a-vos") return t.vendidoAVos;
  if (estado === "en-cuotas-tuyo") return t.enCuotasTuyo;
  return null;
}

type Props = {
  lote: Lote;
  estado: EstadoMostrado;
  /** Elegida desde la lista o desde el mapa: borde grueso y `aria-current`. */
  seleccionada?: boolean;
  /** Foco sobre la tarjeta (teclado o toque): el lote se resalta en el mapa. */
  alEnfocar?: (id: string) => void;
};

/**
 * Tarjeta de un lote (spec ux-explorar): plano, número, superficie, estado en texto y, si el modelo lo tiene, el precio de ejemplo.
 * Toda la tarjeta es un solo enlace a la ficha (sin enlaces anidados). Es el único objeto con caja de la lista.
 */
export function TarjetaLote({ lote, estado, seleccionada = false, alEnfocar }: Props) {
  const idioma = useIdioma();
  const t = useTextos("explorar").lista;
  const tl = useTextos("territorio").loteo;
  const tle = useTextos("lotes").estado;
  const propio = textoDeLaPersona(estado, tle);
  const idTitulo = `tarjeta-${lote.id}`;
  const precio = precioLote(lote.superficieM2);
  return (
    <article
      id={`tarjeta-de-${lote.id}`}
      aria-labelledby={idTitulo}
      aria-current={seleccionada ? "true" : undefined}
      data-lote={lote.id}
      className={`scroll-mt-24 rounded-[var(--radius-m)] bg-surface shadow-[var(--sombra-1)] transition-shadow hover:shadow-[var(--sombra-2)] focus-within:shadow-[var(--sombra-2)] ${
        seleccionada ? "border-2 border-deep" : "border border-line"
      }`}
      onFocus={() => alEnfocar?.(lote.id)}
    >
      <Link
        href={`/lotes/${lote.id}`}
        className="flex items-center gap-4 rounded-[var(--radius-m)] p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <PlanoLote anillo={lote.anillo} />
        <span className="grid min-w-0 gap-1">
          <span id={idTitulo} className="font-display text-lg font-semibold text-ink">
            {tl.lote(lote.numero)}
          </span>{" "}
          <span className="font-mono text-sm text-ink">
            {lote.superficieM2 === undefined ? t.sinSuperficie : textoSuperficieM2(lote.superficieM2, idioma)}
          </span>{" "}
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ChipEstado estado={CHIP[estado]} />{" "}
            {/* Lo que la persona reservó o "pagó" en la simulación lo dice en palabras, además del chip. */}
            {propio && <span className="text-sm text-muted">{propio}</span>}{" "}
            {precio !== null && <span className="text-sm text-muted">{t.precioEjemplo(usdEn(precio, idioma))}</span>}
          </span>
        </span>
      </Link>
    </article>
  );
}
