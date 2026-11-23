"use client";

import { TooltipTermino } from "@/components/tooltip-termino";
import { terminoEconomico, type ClaveEconomica } from "@/lib/economia/terminos";
import { useIdioma } from "@/lib/idioma/cliente";

// Tooltip económico (🌱): explica un término de la economía de la comunidad.
// Es distinto del legal (⚖) pero se comporta igual: mouse, teclado (Escape) y toque.
// En inglés muestra el texto en inglés, siempre marcado como borrador.
export function TerminoEconomico({ clave }: { clave: ClaveEconomica }) {
  const idioma = useIdioma();
  const termino = terminoEconomico(clave, idioma);
  return (
    <TooltipTermino
      titulo={termino.titulo}
      texto={termino.texto}
      simbolo="🌱"
      etiqueta={
        idioma === "en"
          ? `What it means in the community economy: ${termino.titulo}`
          : `Qué significa en la economía de la comunidad: ${termino.titulo}`
      }
      claseBoton="text-deep hover:bg-green-soft focus-visible:outline-deep"
      claseBorde="border-deep"
      borrador={termino.borrador}
      textoBorrador={idioma === "en" ? "Draft: text under review" : undefined}
    />
  );
}
