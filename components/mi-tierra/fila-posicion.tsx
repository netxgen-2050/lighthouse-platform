import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Fila de una posición (ux-mi-tierra, design §3): ícono en cuadrado, nombre, detalle y valor a la derecha en mono.
 * Sin caja por fila; con `href`, toda la fila es el enlace. Un `ul` las agrupa (el padre pone el `li`).
 */
export function FilaPosicion({
  icono,
  nombre,
  detalle,
  valor,
  href,
  extra,
}: {
  icono: ReactNode;
  nombre: string;
  detalle: string;
  valor: string;
  href?: string;
  extra?: ReactNode;
}) {
  const cuerpo = (
    <>
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-s)] bg-surface-2 text-ink">
        {icono}
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="font-[family-name:var(--font-inter-tight)] text-base text-ink">{nombre}</span>
        <span className="text-[13px] text-muted">{detalle}</span>
      </span>
      {extra}
      <span className="shrink-0 text-right font-mono text-sm tabular-nums text-ink">{valor}</span>
    </>
  );
  const base = "flex items-center gap-3 py-3";
  return href ? (
    <Link href={href} className={`${base} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep hover:bg-surface-2`}>
      {cuerpo}
    </Link>
  ) : (
    <div className={base}>{cuerpo}</div>
  );
}
