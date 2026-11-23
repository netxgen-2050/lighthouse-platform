import { rangoFechas } from "@/lib/congreso/formatos";
import type { Idioma } from "@/lib/congreso/idioma";

/** Fechas del evento como chip: días en grande y mes y año al lado. */
export function ChipFecha({ inicio, fin, idioma = "es" }: { inicio: string; fin: string; idioma?: Idioma }) {
  const { dias, mesAnio } = rangoFechas(inicio, fin, idioma);
  return (
    <div className="ev-chip-fecha">
      <b>{dias}</b>
      <span>{mesAnio}</span>
    </div>
  );
}
