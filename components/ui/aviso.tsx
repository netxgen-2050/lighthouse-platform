import { Info, Scale, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export type TonoAviso = "info" | "atencion" | "legal";

const ICONOS = { info: Info, atencion: TriangleAlert, legal: Scale } as const;

const FONDO: Record<TonoAviso, string> = {
  info: "bg-surface-2 text-ink",
  atencion: "bg-warn-bg text-warn-ink",
  legal: "bg-warn-bg text-warn-ink",
};

/**
 * Aviso de la app (ux-base, design §4): ícono de línea, texto y, si hace falta, un enlace.
 * Borde sólido, nunca punteado. Nada se comunica solo con color: el ícono y el texto llevan el mensaje.
 * Con `role="note"` por defecto; el estado administrativo usa su propio `section` con `aria-label`.
 */
export function Aviso({
  tono = "info",
  children,
  enlace,
  className = "",
  rol = "note",
  ...resto
}: {
  tono?: TonoAviso;
  children: ReactNode;
  enlace?: ReactNode;
  className?: string;
  rol?: "note" | "status" | "alert" | null;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children" | "role">) {
  const Icono = ICONOS[tono];
  return (
    <div
      role={rol ?? undefined}
      data-tono={tono}
      className={`flex items-start gap-2 rounded-[var(--radius-m)] border border-line px-3 py-2 text-sm ${FONDO[tono]} ${className}`}
      {...resto}
    >
      <Icono aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div>{children}</div>
        {enlace && <div className="mt-1 font-medium underline">{enlace}</div>}
      </div>
    </div>
  );
}
