"use client";

import { useTextos } from "@/lib/idioma/cliente";

export type TonoDeAvance = 1 | 2 | 3 | 4 | 5;

/**
 * Tono de la escala de regeneración por quinto del porcentaje que se ve (redondeado): menos de 20 % es 1 (terracota),
 * 80 % o más es 5 (verde). Así el color nunca contradice el número escrito. Fuera de rango o sin dato, null.
 */
export function tonoDeAvance(fraccion: number | null): TonoDeAvance | null {
  if (fraccion === null || !Number.isFinite(fraccion) || fraccion < 0 || fraccion > 1) return null;
  return Math.min(5, Math.floor(Math.round(fraccion * 100) / 20) + 1) as TonoDeAvance;
}

// Clases completas para que Tailwind las vea.
const RELLENO: Record<TonoDeAvance, string> = {
  1: "bg-regen-1",
  2: "bg-regen-2",
  3: "bg-regen-3",
  4: "bg-regen-4",
  5: "bg-regen-5",
};

/** Barra de avance (0 a 1) con la escala de regeneración. Siempre lleva el porcentaje o "sin dato" escrito al lado. */
export function BarraAvance({ etiqueta, fraccion }: { etiqueta: string; fraccion: number | null }) {
  const t = useTextos("marco").ui;
  const comunes = useTextos("comunes");
  const tono = tonoDeAvance(fraccion);
  const pct = tono === null || fraccion === null ? null : Math.round(fraccion * 100);
  const texto = pct === null ? comunes.sinDato : t.avance(String(pct));
  return (
    <div className="flex flex-col gap-1">
      {/* Con barra, el lector ya oye etiqueta y valor por el meter: la fila visible se oculta para no repetirlos. */}
      <div aria-hidden={pct === null ? undefined : true} className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{etiqueta}</span>
        <span className="font-mono text-muted">{texto}</span>
      </div>
      {pct === null ? (
        <div aria-hidden="true" className="h-2 w-full rounded-full border border-line bg-surface-2" />
      ) : (
        <div
          role="meter"
          aria-label={etiqueta}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={texto}
          className="h-2 w-full overflow-hidden rounded-full border border-line bg-surface-2"
        >
          <div className={`h-full ${RELLENO[tono!]}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
