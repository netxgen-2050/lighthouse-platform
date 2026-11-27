import type { ReactNode } from "react";

/** Sección de página (ux-base, design §5): `h2`, bajada opcional y contenido. Sin borde ni fondo; 48 px entre secciones en compu, 32 en celular. */
export function Seccion({
  id,
  titulo,
  bajada,
  children,
  className = "",
}: {
  id: string;
  titulo: string;
  bajada?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`mt-8 grid gap-4 sm:mt-12 ${className}`}>
      <div>
        <h2 id={id} className="text-2xl font-semibold">
          {titulo}
        </h2>
        {bajada && <p className="mt-1 max-w-3xl text-muted">{bajada}</p>}
      </div>
      {children}
    </section>
  );
}
