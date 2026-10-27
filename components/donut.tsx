import { repartoProporcional } from "@/lib/cuadratico/motor";

// Sin estado: sirve en servidor y en cliente. El dibujo es decorativo (aria-hidden); todo el dato está en el texto:
// la leyenda numerada y la tabla equivalente.

export type PorcionDonut = { id: string; etiqueta: string; valor: number };

/** Tonos de los tokens del tema, en orden; con más porciones se repiten (el número las distingue). */
export const TONOS_DONUT = ["stroke-deep", "stroke-gold", "stroke-blue", "stroke-violet", "stroke-clay", "stroke-rose", "stroke-green"] as const;

export type ArcoDonut = {
  id: string;
  etiqueta: string;
  valor: number;
  /** Porcentaje entero (los de todas las porciones suman 100). */
  pct: number;
  /** Número que une la porción con la leyenda; `null` para el resto ("Sin usar"). */
  numero: number | null;
  /** Fracciones de vuelta (0 a 1), desde las 12 en sentido horario. */
  desde: number;
  hasta: number;
  tono: string;
  esResto: boolean;
};

/** Calcula los arcos, en el orden de la leyenda (porciones y, al final, el resto). Sin valores positivos: lista vacía. */
export function calcularArcos(porciones: readonly PorcionDonut[], resto?: { etiqueta: string; valor: number }): ArcoDonut[] {
  const items = [
    ...porciones.filter((p) => p.valor > 0).map((p) => ({ ...p, esResto: false })),
    ...(resto && resto.valor > 0 ? [{ id: "resto", etiqueta: resto.etiqueta, valor: resto.valor, esResto: true }] : []),
  ];
  const total = items.reduce((s, i) => s + i.valor, 0);
  if (total === 0) return [];
  // Los porcentajes se redondean por resto mayor (suman 100); los arcos usan la fracción exacta.
  const pcts = repartoProporcional(
    items.map((i) => i.id),
    items.map((i) => i.valor),
    100,
  );
  let acumulado = 0;
  let numero = 0;
  return items.map((i) => {
    const desde = acumulado / total;
    acumulado += i.valor;
    return {
      id: i.id,
      etiqueta: i.etiqueta,
      valor: i.valor,
      pct: pcts[i.id],
      numero: i.esResto ? null : ++numero,
      desde,
      hasta: acumulado / total,
      tono: i.esResto ? "stroke-faint" : TONOS_DONUT[(numero - 1) % TONOS_DONUT.length],
      esResto: i.esResto,
    };
  });
}

const R = 15.9155; // circunferencia 100
const C = 21;

function punto(fraccion: number, radio: number) {
  const a = fraccion * 2 * Math.PI;
  return { x: C + radio * Math.sin(a), y: C - radio * Math.cos(a) };
}

function trazo(desde: number, hasta: number): string {
  const a = punto(desde, R);
  const b = punto(hasta, R);
  const grande = hasta - desde > 0.5 ? 1 : 0;
  return `M ${a.x.toFixed(3)} ${a.y.toFixed(3)} A ${R} ${R} 0 ${grande} 1 ${b.x.toFixed(3)} ${b.y.toFixed(3)}`;
}

export function Donut({
  titulo,
  porciones,
  resto,
  formatoValor = (n) => String(n),
  sinDato = "sin dato",
  columnaEtiqueta = "Opción",
}: {
  titulo: string;
  porciones: readonly PorcionDonut[];
  resto?: { etiqueta: string; valor: number };
  formatoValor?: (valor: number) => string;
  sinDato?: string;
  /** Encabezado de la primera columna de la tabla equivalente. */
  columnaEtiqueta?: string;
}) {
  const arcos = calcularArcos(porciones, resto);
  return (
    <figure className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:items-center">
      <svg viewBox="0 0 42 42" aria-hidden="true" focusable="false" className="mx-auto h-40 w-40">
        {arcos.length === 0 ? (
          <circle cx={C} cy={C} r={R} fill="none" strokeWidth={6} className="stroke-line" />
        ) : (
          arcos.map((a) =>
            a.hasta - a.desde > 0.9999 ? (
              <circle key={a.id} cx={C} cy={C} r={R} fill="none" strokeWidth={6} className={a.tono} />
            ) : (
              <path
                key={a.id}
                d={trazo(a.desde, a.hasta)}
                fill="none"
                strokeWidth={6}
                pathLength={100}
                strokeDasharray={a.esResto ? "1.2 1.2" : undefined}
                className={a.tono}
              />
            ),
          )
        )}
        {arcos
          .filter((a) => a.numero !== null && a.pct >= 5)
          .map((a) => {
            const p = punto((a.desde + a.hasta) / 2, R);
            return (
              <text
                key={`n-${a.id}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={3.6}
                fontWeight={700}
                strokeWidth={0.9}
                paintOrder="stroke"
                className="fill-ink stroke-surface"
              >
                {a.numero}
              </text>
            );
          })}
      </svg>
      <div className="grid gap-2 text-sm">
        <figcaption className="font-medium">{titulo}</figcaption>
        {arcos.length === 0 ? (
          <p>{sinDato}</p>
        ) : (
          <ol className="grid gap-1">
            {arcos.map((a) => (
              <li key={a.id}>
                {a.numero !== null ? `${a.numero} · ` : ""}
                {a.etiqueta} · {a.pct} %
                {a.esResto && <span className="sr-only"> (créditos que no usaste)</span>}
              </li>
            ))}
          </ol>
        )}
        {arcos.length > 0 && (
          <details>
            <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              Ver como tabla
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left">
                <caption className="sr-only">{titulo}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="pr-4">{columnaEtiqueta}</th>
                    <th scope="col" className="pr-4">Valor</th>
                    <th scope="col">%</th>
                  </tr>
                </thead>
                <tbody>
                  {arcos.map((a) => (
                    <tr key={a.id}>
                      <th scope="row" className="pr-4 font-normal">{a.etiqueta}</th>
                      <td className="pr-4">{formatoValor(a.valor)}</td>
                      <td>{a.pct} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    </figure>
  );
}
