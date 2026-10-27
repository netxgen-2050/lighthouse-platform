"use client";

import { textoDeEvento, type EventoActividad } from "@/lib/actividad/actividad";
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

  const propio = evento.datos?.descripcion;
  const dato = evento.datos?.comunidad || propio;
  const i = dato ? texto.indexOf(dato) : -1;
  if (!dato || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span translate="no" lang={propio && idioma === "en" ? "es" : undefined}>
        {dato}
      </span>
      {texto.slice(i + dato.length)}
    </>
  );
}
