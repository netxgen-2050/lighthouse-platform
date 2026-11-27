/**
 * Esqueleto de carga (ux-base, design §5): rectángulos `surface-2` con brillo suave (la clase `esqueleto` lo quita con
 * movimiento reducido). El contenedor lleva `aria-busy` y un texto oculto para el lector de pantalla.
 */
export function Esqueleto({
  lineas = 3,
  cargando = "Cargando…",
  className = "",
}: {
  lineas?: number;
  /** Texto para el lector de pantalla; pasarlo ya traducido. */
  cargando?: string;
  className?: string;
}) {
  return (
    <div aria-busy="true" role="status" data-esqueleto className={`grid gap-2 ${className}`}>
      <span className="sr-only">{cargando}</span>
      {Array.from({ length: lineas }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`esqueleto h-4 rounded-[var(--radius-s)] bg-surface-2 ${i === lineas - 1 && lineas > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
