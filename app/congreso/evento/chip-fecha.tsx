import { rangoFechas } from "@/lib/congreso/formatos";

/** Fechas del evento como chip: días en grande y mes y año al lado. */
export function ChipFecha({ inicio, fin }: { inicio: string; fin: string }) {
  const { dias, mesAnio } = rangoFechas(inicio, fin);
  return (
    <div className="ev-chip-fecha">
      <b>{dias}</b>
      <span>{mesAnio}</span>
    </div>
  );
}
