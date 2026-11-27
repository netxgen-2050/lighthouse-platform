import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Sección que se despliega (ux-bien-comun, design §3): un `details` con el `h2` dentro del `summary` y una línea que dice
 * qué hay adentro. Sin borde ni fondo: solo una línea arriba. El `id` es el del `h2` (el índice de la página apunta ahí).
 */
export function SeccionPlegable({
  id,
  titulo,
  resumen,
  children,
}: {
  id: string;
  titulo: string;
  resumen: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-4 border-t border-line pt-2 sm:mt-6">
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-3 py-2 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep [&::-webkit-details-marker]:hidden">
          <div>
            <h2 id={id} className="text-2xl font-semibold">
              {titulo}
            </h2>
            <p className="mt-1 max-w-[68ch] text-muted">{resumen}</p>
          </div>
          <ChevronDown aria-hidden="true" size={24} className="mt-1.5 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 pb-4 pt-3">{children}</div>
      </details>
    </section>
  );
}
