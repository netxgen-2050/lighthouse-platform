/** Dibujo del estado vacío (ux-mi-tierra, design §5): un lote con su cerco y un brote, con los colores `ilus-*` del mapa de Participa. Decorativo. */
export function DibujoLote() {
  return (
    <svg viewBox="0 0 160 96" width={160} height={96} focusable="false">
      <rect x="4" y="52" width="152" height="40" rx="8" className="fill-ilus-salvia" />
      <rect x="4" y="76" width="152" height="16" rx="8" className="fill-ilus-arena" />
      <path d="M12 74 H148" className="stroke-ilus-arcilla" strokeWidth="2" fill="none" />
      {[20, 44, 68, 92, 116, 140].map((x) => (
        <rect key={x} x={x - 3} y="58" width="6" height="22" rx="2" className="fill-ilus-ocre" />
      ))}
      <path d="M80 56 V36" className="stroke-ilus-verde-hondo" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M80 42 C64 42 58 32 58 24 C70 24 80 30 80 42 Z" className="fill-ilus-verde" />
      <path d="M80 36 C94 36 102 28 102 18 C90 18 80 24 80 36 Z" className="fill-ilus-verde-hondo" />
      <circle cx="132" cy="22" r="8" className="fill-ilus-fuego" />
    </svg>
  );
}
