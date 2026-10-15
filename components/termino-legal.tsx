"use client";

import { TooltipTermino } from "@/components/tooltip-termino";
import { huella } from "@/lib/demo/bitacora";
import { anotarEnBitacora } from "@/lib/demo/anotar-en-bitacora";
import { TERMINOS, esBorrador, type ClaveTermino } from "@/lib/legal/terminos";

// La explicación de un término legal (⚖) se muestra como tooltip flotante
// (comportamiento compartido en `tooltip-termino.tsx`) y deja constancia en la bitácora.
export function TerminoLegal({ clave, claseBoton = "text-gold-ink hover:bg-gold-soft focus-visible:outline-gold-ink" }: {
  clave: ClaveTermino;
  /** Colores del botón ⚖, para cuando va sobre un fondo propio (por ejemplo el tema del Congreso). */
  claseBoton?: string;
}) {
  const termino = TERMINOS[clave];
  return (
    <TooltipTermino
      titulo={termino.titulo}
      texto={termino.texto}
      simbolo="⚖"
      etiqueta={`Qué significa legalmente: ${termino.titulo}`}
      claseBoton={claseBoton}
      claseBorde="border-gold-ink"
      borrador={esBorrador(clave)}
      alMostrar={() =>
        anotarEnBitacora({
          tipo: "termino-legal",
          clave,
          mostrado: termino.titulo,
          huella: huella(termino.titulo, termino.texto),
          borrador: esBorrador(clave),
        })
      }
    />
  );
}
