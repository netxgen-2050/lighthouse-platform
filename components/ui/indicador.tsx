"use client";

import { useTextos } from "@/lib/idioma/cliente";

/**
 * Número grande con su etiqueta. El valor llega ya formateado (lib/lotes/formato.ts, lib/bien-comun/formato.ts);
 * sin valor se dice "sin dato", nunca 0. En el DOM la etiqueta va antes que el número para que se lean juntos.
 */
export function Indicador({
  etiqueta,
  valor,
  mono = false,
  tamano = "medio",
}: {
  etiqueta: string;
  valor: string | null;
  mono?: boolean;
  /** `grande` (40 px, el número que manda) y `chico` (20 px, los secundarios); `medio` es el de siempre. */
  tamano?: "grande" | "medio" | "chico";
}) {
  const comunes = useTextos("comunes");
  const clase = tamano === "grande" ? "text-[40px] leading-tight" : tamano === "chico" ? "text-xl" : "text-3xl";
  const claseSinDato = tamano === "chico" ? "text-base" : "text-lg";
  return (
    <dl className="flex flex-col-reverse gap-1">
      <dt className="text-sm text-muted">{etiqueta}</dt>
      <dd className={`m-0 font-semibold text-ink ${clase} ${mono ? "font-mono" : "font-display"}`}>
        {valor ?? <span className={`${claseSinDato} font-normal text-muted`}>{comunes.sinDato}</span>}
      </dd>
    </dl>
  );
}
