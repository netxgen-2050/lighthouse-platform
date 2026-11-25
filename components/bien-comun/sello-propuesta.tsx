import type { ReactNode } from "react";

// El sello de "propuesta en discusión": va primero en la página, después del título y antes de cualquier número. No es
// `sticky`: un elemento pegado arriba puede tapar el foco del teclado. El estado se lee en texto, no solo con color.
export type PropsSello = {
  etiqueta: string;
  texto: string;
  fecha: string;
  simulacion: string;
  /** El ⚖ de "no es una oferta", que va pegado al final de la línea de simulación. */
  terminoSimulacion?: ReactNode;
};

export function SelloPropuesta({ etiqueta, texto, fecha, simulacion, terminoSimulacion }: PropsSello) {
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className="grid w-fit max-w-3xl gap-1 rounded-lg border-2 border-dashed border-muted bg-warn-bg px-3 py-2 text-warn-ink"
    >
      <p className="font-semibold">{texto}</p>
      <p className="text-sm">{fecha}</p>
      <p className="text-sm">
        {simulacion}
        {terminoSimulacion}
      </p>
    </div>
  );
}
