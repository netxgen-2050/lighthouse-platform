"use client";

import { useTextos } from "@/lib/idioma/cliente";

/**
 * Número grande con su etiqueta. El valor llega ya formateado (lib/lotes/formato.ts, lib/bien-comun/formato.ts);
 * sin valor se dice "sin dato", nunca 0. En el DOM la etiqueta va antes que el número para que se lean juntos.
 */
export function Indicador({ etiqueta, valor, mono = false }: { etiqueta: string; valor: string | null; mono?: boolean }) {
  const comunes = useTextos("comunes");
  return (
    <dl className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-muted">{etiqueta}</dt>
      <dd className={`m-0 text-3xl font-semibold text-ink ${mono ? "font-mono" : "font-display"}`}>
        {valor ?? <span className="text-lg font-normal text-muted">{comunes.sinDato}</span>}
      </dd>
    </dl>
  );
}
