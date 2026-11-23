"use client";

import { useTextos } from "@/lib/idioma/cliente";

export type FilaLibro = { fecha: string; motivo: string; monto: string | null };

/**
 * Libro de movimientos: fecha, motivo y monto (en monoespaciada, a la derecha). Las celdas ya llegan formateadas.
 * A 390 px el motivo se parte en líneas y, si aun así no entra, la tabla se desplaza dentro de su propio contenedor
 * (con nombre y foco de teclado), nunca la página.
 */
export function TablaLibro({ titulo, filas }: { titulo: string; filas: FilaLibro[] }) {
  const t = useTextos("marco").ui;
  const comunes = useTextos("comunes");
  return (
    // tabIndex: región desplazable, el teclado necesita enfocarla para recorrerla.
    <div role="region" aria-label={titulo} tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border border-line">
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
