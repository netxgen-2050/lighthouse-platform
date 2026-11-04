"use client";

import { useTextos } from "@/lib/idioma/cliente";
import { vistaDeLote } from "@/lib/lotes/vista";
import { lotesDelGrupo, type Lote } from "@/lib/territorios/loteo";

/** La imagen del lote: mosaicos satelitales con su contorno. Si no cargan, queda el contorno sobre el fondo: nunca solo color. */
export function ImagenLote({ lote }: { lote: Lote }) {
  const t = useTextos("lotes").ficha;
  const tl = useTextos("territorio").loteo;
  const vecinos = [...lotesDelGrupo("primeros"), ...lotesDelGrupo("norte")].filter((l) => l.id !== lote.id);
  const v = vistaDeLote(lote.anillo, vecinos.map((l) => l.anillo));
  const contorno = v.contorno.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <figure className="grid gap-1">
      <svg
        role="img"
        aria-label={t.imagenAlt(tl.lote(lote.numero))}
        viewBox={v.viewBox}
        className="aspect-[16/9] w-full rounded-xl border border-faint bg-surface-2"
      >
        {v.mosaicos.map((m) => (
          <image key={m.href} href={m.href} x={m.x} y={m.y} width={m.lado} height={m.lado} />
        ))}
        {v.vecinos.map((a, i) => (
          <polygon
            key={i}
            points={a.map(([x, y]) => `${x},${y}`).join(" ")}
            className="fill-none stroke-surface/60"
            strokeWidth={v.trazo / 2}
          />
        ))}
        <polygon points={contorno} className="fill-surface/15 stroke-ink" strokeWidth={v.trazo * 2} strokeLinejoin="round" />
        <polygon points={contorno} className="fill-none stroke-gold" strokeWidth={v.trazo} strokeLinejoin="round" />
      </svg>
      <figcaption className="text-xs text-muted">{t.imagenNota}</figcaption>
    </figure>
  );
}
