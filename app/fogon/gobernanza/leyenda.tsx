"use client";

import { resolverTexto, type EntradaLeyenda, type Pintura, type TokenColor } from "@/lib/gobernanza/lentes";
import { useTextos } from "@/lib/idioma/cliente";

const color = (t: TokenColor | "ninguno") => (t === "ninguno" ? "none" : `var(--color-${t})`);

function Muestra({ pintura }: { pintura: Pintura }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false" className="shrink-0">
      <circle
        cx="11"
        cy="11"
        r="9"
        fill={color(pintura.relleno)}
        stroke={color(pintura.borde)}
        strokeWidth={pintura.grosor}
        strokeDasharray={pintura.punteado ? "4 3" : undefined}
        opacity={pintura.atenuado ? 0.4 : 1}
      />
    </svg>
  );
}

/** La leyenda de la lente elegida: cada muestra de color lleva su texto (y, si tiene, un símbolo). */
export function Leyenda({ entradas }: { entradas: readonly EntradaLeyenda[] }) {
  const tx = useTextos("gobernanza");
  return (
    <section aria-labelledby="leyenda-titulo" className="grid gap-2">
      <h3 id="leyenda-titulo" className="text-sm font-semibold">
        {tx.leyenda.titulo}
      </h3>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {entradas.map((e) => (
          <li key={e.texto} className="flex items-center gap-2">
            <Muestra pintura={e.muestra} />
            {e.glifo && <span aria-hidden="true">{e.glifo}</span>}
            <span>{resolverTexto(tx, e.texto) ?? ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
