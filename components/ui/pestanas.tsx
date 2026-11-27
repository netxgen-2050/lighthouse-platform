"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";

export type ItemPestana = { clave: string; etiqueta: string; href?: string };

/** Estilo único (design §5): `muted`; la activa en `ink`, negrita y subrayado de 2 px. Lo activo se ve por forma y peso, no solo por color. */
export function clasePestana(activa: boolean): string {
  return `-mb-px inline-flex min-h-11 items-center border-b-2 px-1 transition-colors duration-[var(--dur)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
    activa ? "border-ink font-bold text-ink" : "border-transparent font-medium text-muted hover:text-ink"
  }`;
}

const CONTENEDOR = "flex flex-wrap gap-6 border-b border-line";

/** Destino de la tecla en un `tablist`: flechas con vuelta, Inicio y Fin. `null` si la tecla no mueve. */
export function destinoDeTecla(tecla: string, i: number, total: number): number | null {
  if (tecla === "ArrowRight") return (i + 1) % total;
  if (tecla === "ArrowLeft") return (i - 1 + total) % total;
  if (tecla === "Home") return 0;
  if (tecla === "End") return total - 1;
  return null;
}

/**
 * Pestañas (ux-base, design §5). Dos modos según los ítems:
 * - con `href` en todos: navegación (`nav` con `aria-current="page"` en la actual);
 * - sin `href`: `tablist` con `role="tab"`, `aria-selected`, flechas del teclado y paneles `panel-<clave>` / pestaña `pestana-<clave>`.
 */
export function Pestanas({
  aria,
  items,
  actual,
  onCambio,
  className = "",
  prefijo = "",
}: {
  aria: string;
  items: readonly ItemPestana[];
  actual: string;
  onCambio?: (clave: string) => void;
  className?: string;
  /** Prefijo de los ids (`<prefijo>pestana-<clave>`, `<prefijo>panel-<clave>`) para tener varias pestañas en una página. */
  prefijo?: string;
}) {
  if (items.length > 0 && items.every((it) => it.href)) {
    return (
      <nav aria-label={aria} className={`${CONTENEDOR} ${className}`}>
        {items.map((it) => (
          <Link key={it.clave} href={it.href!} aria-current={it.clave === actual ? "page" : undefined} className={clasePestana(it.clave === actual)}>
            {it.etiqueta}
          </Link>
        ))}
      </nav>
    );
  }

  function alTeclear(e: KeyboardEvent, i: number) {
    const destino = destinoDeTecla(e.key, i, items.length);
    if (destino === null) return;
    e.preventDefault();
    onCambio?.(items[destino].clave);
    document.getElementById(`${prefijo}pestana-${items[destino].clave}`)?.focus();
  }

  return (
    <div role="tablist" aria-label={aria} className={`${CONTENEDOR} ${className}`}>
      {items.map((it, i) => {
        const activa = it.clave === actual;
        return (
          <button
            key={it.clave}
            id={`${prefijo}pestana-${it.clave}`}
            type="button"
            role="tab"
            aria-selected={activa}
            aria-controls={`${prefijo}panel-${it.clave}`}
            tabIndex={activa ? 0 : -1}
            onClick={() => onCambio?.(it.clave)}
            onKeyDown={(e) => alTeclear(e, i)}
            className={clasePestana(activa)}
          >
            {it.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
