"use client";

import type { ReactNode } from "react";
import { ProveedorIdioma, useIdioma, useTextos } from "@/lib/idioma/cliente";

/**
 * Un bloque que todavía no tiene traducción (por ejemplo el aviso del estado administrativo, que tiene peso legal y llega
 * con `idioma-legal`). En español no cambia nada. En inglés se muestra en español, marcado con `lang="es"`, con el
 * idioma del contenido fijado en español (para que lo que pida adentro, como un ⚖, salga en español) y con un aviso
 * solo para lectores de pantalla. No va dentro de un párrafo: el envoltorio es un `div`.
 */
export function EnEspanol({ children }: { children: ReactNode }) {
  const idioma = useIdioma();
  const comunes = useTextos("comunes");
  if (idioma !== "en") return <>{children}</>;
  return (
    <div lang="es" className="contents">
      <span className="sr-only" lang="en">
        {comunes.soloEnEspanol}
      </span>
      <ProveedorIdioma idioma="es" soloContenido>
        {children}
      </ProveedorIdioma>
    </div>
  );
}
