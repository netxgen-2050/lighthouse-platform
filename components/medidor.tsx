"use client";

import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearNumero } from "@/lib/idioma/formatos";

// Sin estado propio. La barra es decorativa; el dato está en el texto ("3 de 10" / "3 of 10").
export function Medidor({
  titulo,
  actual,
  tope,
  unidad = "",
  dorado = false,
}: {
  titulo: string;
  actual: number;
  tope: number;
  unidad?: string;
  dorado?: boolean;
}) {
  const idioma = useIdioma();
  const comunes = useTextos("comunes");
  const pct = Math.max(0, Math.min(100, Math.round((actual / tope) * 100)));
  return (
    <div className="grid gap-1 text-sm">
      <p className="flex flex-wrap justify-between gap-x-2">
        <span>{titulo}</span>
        <span className="font-medium">
          {unidad}
          {formatearNumero(actual, idioma)} {comunes.de} {unidad}
          {formatearNumero(tope, idioma)} · {pct}%
        </span>
      </p>
      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full ${dorado ? "bg-gold" : "bg-green"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
