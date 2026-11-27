/**
 * Mini curva de lo acumulado (ux-mi-tierra, design §3). Solo se dibuja con 2 o más puntos; con menos no devuelve nada.
 * Es un resumen de valores que ya están escritos en la fila: el SVG lleva título y no comunica nada solo con el trazo.
 */
export function MiniCurva({ puntos, titulo }: { puntos: number[]; titulo: string }) {
  if (puntos.length < 2) return null;
  const ancho = 64;
  const alto = 24;
  const max = Math.max(...puntos);
  const min = Math.min(...puntos);
  const rango = max - min || 1;
  const trazo = puntos
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (puntos.length - 1)) * ancho).toFixed(1)},${(alto - 2 - ((v - min) / rango) * (alto - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg role="img" aria-label={titulo} data-mini-curva viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} className="shrink-0 text-ink">
      <path d={trazo} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
