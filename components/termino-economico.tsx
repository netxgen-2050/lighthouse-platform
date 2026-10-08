"use client";

import { TooltipTermino } from "@/components/tooltip-termino";
import { TERMINOS_ECONOMICOS, esBorradorEconomico, type ClaveEconomica } from "@/lib/economia/terminos";

// Tooltip económico (🌱): explica un término de la economía de la comunidad.
// Es distinto del legal (⚖) pero se comporta igual: mouse, teclado (Escape) y toque.
export function TerminoEconomico({ clave }: { clave: ClaveEconomica }) {
  const termino = TERMINOS_ECONOMICOS[clave];
  return (
    <TooltipTermino
      titulo={termino.titulo}
      texto={termino.texto}
      simbolo="🌱"
      etiqueta={`Qué significa en la economía de la comunidad: ${termino.titulo}`}
      claseBoton="text-deep hover:bg-green-soft focus-visible:outline-deep"
      claseBorde="border-deep"
      borrador={esBorradorEconomico(clave)}
    />
  );
}
