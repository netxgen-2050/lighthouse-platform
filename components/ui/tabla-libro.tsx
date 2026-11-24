"use client";

import { useEffect, useRef, useState } from "react";
import { useTextos } from "@/lib/idioma/cliente";

export type FilaLibro = { fecha: string; motivo: string; monto: string | null };

/**
 * Libro de movimientos: fecha, motivo y monto (en monoespaciada, a la derecha). Las celdas ya llegan formateadas.
 * A 390 px el motivo se parte en líneas y, si aun así no entra, la tabla se desplaza dentro de su propio contenedor
 * (con nombre), nunca la página. El contenedor solo es enfocable (y parada de Tab) cuando de verdad desborda.
 */
export function TablaLibro({ titulo, filas }: { titulo: string; filas: FilaLibro[] }) {
  const t = useTextos("marco").ui;
  const comunes = useTextos("comunes");
  const contenedor = useRef<HTMLDivElement>(null);
  const [desborda, setDesborda] = useState(false);
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => setDesborda(el.scrollWidth > el.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [filas]);
  return (
    <div
      ref={contenedor}
      role={desborda ? "region" : undefined}
      aria-label={desborda ? titulo : undefined}
      tabIndex={desborda ? 0 : undefined}
      data-desborda={desborda ? "true" : "false"}
      className="max-w-full overflow-x-auto rounded-lg border border-line"
    >
      <table className="w-full border-collapse text-sm">
        <caption className="border-b border-line bg-surface-2 px-3 py-2 text-left font-display text-base font-semibold text-ink">
          {titulo}
        </caption>
        <thead>
          <tr className="text-left text-muted">
            <th scope="col" className="px-3 py-2 font-normal">
              {t.fecha}
            </th>
            <th scope="col" className="px-3 py-2 font-normal">
              {t.motivo}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-normal">
              {t.monto}
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{f.fecha}</td>
              <td className="px-3 py-2 text-ink">{f.motivo}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-ink">
                {f.monto ?? <span className="text-muted">{comunes.sinDato}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
