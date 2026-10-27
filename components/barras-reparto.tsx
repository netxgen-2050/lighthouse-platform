import { repartoProporcional } from "@/lib/cuadratico/motor";

// Sin estado: sirve en servidor y en cliente. Las barras son decorativas (aria-hidden); todo el dato está en el texto de
// cada barra y en la tabla equivalente. Un solo tono: el nombre del destino está en el texto, nada depende del color.

export type ItemReparto = { id: string; etiqueta: string; valor: number | null };
export type GrupoReparto = { id: string; etiqueta: string; items: ItemReparto[] };

/** Las barras de un grupo: solo los destinos con valor positivo; los porcentajes enteros suman 100. */
export function calcularBarras(items: readonly ItemReparto[]): { id: string; etiqueta: string; valor: number; pct: number }[] {
  const con = items.filter((i): i is ItemReparto & { valor: number } => i.valor !== null && i.valor > 0);
  if (con.length === 0) return [];
  const pcts = repartoProporcional(
    con.map((i) => i.id),
    con.map((i) => i.valor),
    100,
  );
  return con.map((i) => ({ id: i.id, etiqueta: i.etiqueta, valor: i.valor, pct: pcts[i.id] }));
}

export function BarrasReparto({
  titulo,
  grupos,
  formatoValor = (n) => String(n),
  sinBarra = "no tiene",
}: {
  titulo: string;
  grupos: readonly GrupoReparto[];
  formatoValor?: (valor: number) => string;
  /** Texto de la tabla para un destino que la serie no tiene. */
  sinBarra?: string;
}) {
  const barras = grupos.map((g) => ({ grupo: g, barras: calcularBarras(g.items) }));
  const filas = grupos[0]?.items ?? [];
  return (
    <div className="grid gap-4">
      <p className="font-medium">{titulo}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {barras.map(({ grupo, barras: bs }) => {
          const total = bs.reduce((s, b) => s + b.valor, 0);
          return (
            <figure key={grupo.id} className="grid gap-2 text-sm">
              <figcaption className="font-medium">
                {grupo.etiqueta} · total {bs.length === 0 ? "sin dato" : formatoValor(total)}
              </figcaption>
              {bs.length === 0 ? (
                <p>sin dato</p>
              ) : (
                <ol className="grid gap-2">
                  {bs.map((b) => (
                    <li key={b.id} className="grid gap-1">
                      <span>
                        {b.etiqueta} · {formatoValor(b.valor)} · {b.pct} %
                      </span>
                      <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="h-2 w-full">
                        <rect x={0} y={0} width={100} height={4} className="fill-surface-2" />
                        <rect x={0} y={0} width={b.pct} height={4} className="fill-deep" />
                      </svg>
                    </li>
                  ))}
                </ol>
              )}
            </figure>
          );
        })}
      </div>
      <details>
        <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
          Ver como tabla
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{titulo}</caption>
            <thead>
              <tr>
                <th scope="col" className="pr-4">
                  Destino
                </th>
                {grupos.map((g) => (
                  <th key={g.id} scope="col" className="pr-4">
                    {g.etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <th scope="row" className="pr-4 font-normal">
                    {f.etiqueta}
                  </th>
                  {grupos.map((g) => {
                    const v = g.items.find((i) => i.id === f.id)?.valor ?? null;
                    return (
                      <td key={g.id} className="pr-4">
                        {v === null ? sinBarra : formatoValor(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
