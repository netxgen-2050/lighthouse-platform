"use client";

import { TooltipTermino } from "@/components/tooltip-termino";
import { entradaBitacoraTermino, terminoMostrado, type IdiomaTermino } from "@/lib/legal/mostrar-termino";
import { anotarEnBitacora } from "@/lib/demo/anotar-en-bitacora";
import type { ClaveTermino } from "@/lib/legal/terminos";

// La explicación de un término legal (⚖) se muestra como tooltip flotante
// (comportamiento compartido en `tooltip-termino.tsx`) y deja constancia en la bitácora.
export function TerminoLegal({
  clave,
  claseBoton = "text-gold-ink hover:bg-gold-soft focus-visible:outline-gold-ink",
  idioma = "es",
}: {
  clave: ClaveTermino;
  /** Colores del botón ⚖, para cuando va sobre un fondo propio (por ejemplo el tema del Congreso). */
  claseBoton?: string;
  /** Idioma de la página. En inglés se muestra la versión en inglés (siempre borrador); sin ella, el español avisado. */
  idioma?: IdiomaTermino;
}) {
  const m = terminoMostrado(clave, idioma);
  return (
    <TooltipTermino
      titulo={m.titulo}
      texto={m.texto}
      simbolo="⚖"
      etiqueta={m.etiqueta}
      claseBoton={claseBoton}
      claseBorde="border-gold-ink"
      borrador={m.borrador}
      textoBorrador={m.textoBorrador}
      lang={m.langTexto}
      aviso={m.aviso}
      alMostrar={() => anotarEnBitacora(entradaBitacoraTermino(clave, idioma))}
    />
  );
}
