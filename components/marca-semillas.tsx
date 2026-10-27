"use client";

import { Fragment } from "react";
import { useIdioma } from "@/lib/idioma/cliente";

/**
 * Un texto de la interfaz donde "Semillas" y "Semillas (seeds)" no se traducen (glosario): en inglés cada mención va
 * marcada con `translate="no"` para que un traductor automático no la cambie. En español devuelve el texto tal cual.
 */
export function MarcaSemillas({ texto }: { texto: string }) {
  const idioma = useIdioma();
  if (idioma !== "en") return <>{texto}</>;
  return (
    <>
      {texto.split(/(Semillas(?: \(seeds\))?)/).map((trozo, i) =>
        i % 2 === 1 ? (
          <span key={i} translate="no">
            {trozo}
          </span>
        ) : (
          <Fragment key={i}>{trozo}</Fragment>
        ),
      )}
    </>
  );
}
