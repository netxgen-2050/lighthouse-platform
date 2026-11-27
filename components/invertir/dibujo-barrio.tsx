/** Dibujo del estado vacío de Invertir (ux-invertir, design §5): calles y lotes de un barrio, con los colores `ilus-*` del mapa de Participa. Decorativo. */
export function DibujoBarrio() {
  const lotes = [
    [14, 12],
    [48, 12],
    [82, 12],
    [14, 62],
    [48, 62],
    [82, 62],
  ] as const;
  return (
    <svg viewBox="0 0 160 96" width={160} height={96} focusable="false">
      <rect x="4" y="4" width="152" height="88" rx="8" className="fill-ilus-salvia" />
      <rect x="4" y="42" width="152" height="12" className="fill-ilus-arena" />
      <rect x="124" y="4" width="12" height="88" className="fill-ilus-arena" />
      <path d="M8 48 H152" className="stroke-ilus-arcilla" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      {lotes.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="28" height="24" rx="3" className="fill-ilus-ocre" />
      ))}
      <circle cx="146" cy="20" r="6" className="fill-ilus-fuego" />
      <path d="M130 84 C130 74 140 70 150 72 C150 82 142 86 130 84 Z" className="fill-ilus-verde-hondo" />
    </svg>
  );
}
