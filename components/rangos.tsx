// Rangos P10–P50–P90 por fila. Sin estado: sirve en servidor y en cliente. El dibujo es decorativo (aria-hidden); todo el
// dato está en el texto de cada fila y en la tabla equivalente. Escala común a todas las filas, siempre con el 0.

export type FilaRango = { id: string; etiqueta: string; p10: number | null; p50: number | null; p90: number | null };

const MARGEN = 0.05;

function esNumero(n: number | null): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function completa(f: FilaRango): f is FilaRango & { p10: number; p50: number; p90: number } {
  return esNumero(f.p10) && esNumero(f.p50) && esNumero(f.p90);
}

/** Escala común a las filas con datos: de min(0, menor P10) a max(0, mayor P90), con 5 % de margen. */
export function escalaRangos(filas: readonly FilaRango[]): { min: number; max: number } {
  const con = filas.filter(completa);
  const bajo = Math.min(0, ...con.map((f) => f.p10));
  const alto = Math.max(0, ...con.map((f) => f.p90));
  const margen = (alto - bajo || 1) * MARGEN;
  return { min: bajo - margen, max: alto + margen };
}

export function Rangos({
  titulo,
  filas,
  formato,
}: {
  titulo: string;
  filas: readonly FilaRango[];
  formato: (n: number) => string;
}) {
  const { min, max } = escalaRangos(filas);
  const x = (v: number) => ((v - min) / (max - min)) * 100;
  const texto = (v: number | null) => (esNumero(v) ? formato(v) : "sin dato");
  return (
    <div className="grid gap-4">
      <p className="font-medium">{titulo}</p>
      <ul className="grid gap-3 text-sm">
        {filas.map((f) => (
          <li key={f.id} className="grid gap-1">
            {completa(f) ? (
              <>
                <span>
                  {f.etiqueta} · P10 {formato(f.p10)} · P50 {formato(f.p50)} · P90 {formato(f.p90)}
                </span>
                <svg viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="h-3 w-full">
                  <line x1={0} y1={3} x2={100} y2={3} className="stroke-line" strokeWidth={0.6} />
                  <line x1={x(0)} y1={0} x2={x(0)} y2={6} className="stroke-faint" strokeWidth={0.4} strokeDasharray="1 1" />
                  <line x1={x(f.p10)} y1={3} x2={x(f.p90)} y2={3} className="stroke-deep" strokeWidth={1.6} />
                  <circle cx={x(f.p50)} cy={3} r={1.4} className="fill-gold stroke-ink" strokeWidth={0.4} />
                </svg>
              </>
            ) : (
              <span>{f.etiqueta} · sin dato</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">La línea punteada marca el 0 %: a la izquierda se pierde plata.</p>
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
                  Serie
                </th>
                <th scope="col" className="pr-4">
                  P10
                </th>
                <th scope="col" className="pr-4">
                  P50
                </th>
                <th scope="col" className="pr-4">
                  P90
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <th scope="row" className="pr-4 font-normal">
                    {f.etiqueta}
                  </th>
                  <td className="pr-4">{texto(f.p10)}</td>
                  <td className="pr-4">{texto(f.p50)}</td>
                  <td className="pr-4">{texto(f.p90)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
