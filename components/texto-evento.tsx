"use client";

import { partesDeTexto, textoDeEvento, type EventoActividad } from "@/lib/actividad/actividad";
import { useIdioma } from "@/lib/idioma/cliente";

/**
 * El texto de un evento de la actividad en el idioma de la página. El nombre de la comunidad no se traduce
 * (`translate="no"`) y lo que escribió la persona va marcado como español en la página en inglés. Un evento guardado
 * antes (solo con texto) se muestra con su texto original y `lang="es"`.
 */
export function TextoEvento({ evento }: { evento: EventoActividad }) {
  const idioma = useIdioma();
  const { texto, idioma: idiomaDelTexto } = textoDeEvento(evento, idioma);
  if (idiomaDelTexto !== idioma) return <span lang={idiomaDelTexto}>{texto}</span>;

  if (!evento.mensaje || !evento.datos) return <>{texto}</>;
  const { antes, dato, despues } = partesDeTexto(evento.mensaje, evento.datos, idioma);
  if (dato === null) return <>{texto}</>;
  const propio = Boolean(evento.datos.descripcion);
  return (
    <>
      {antes}
      <span translate="no" lang={propio && idioma === "en" ? "es" : undefined}>
        {dato}
      </span>
      {despues}
    </>
  );
}
