import type { ReactNode } from "react";
import "../tema-evento.css";
import { fuenteTexto, fuenteTitulos } from "./fuentes";

/** Contenedor del tema del evento: todo lo que use tokens `--evento-*` va adentro. `lang` es el idioma de la vitrina. */
export function TemaEvento({ children, className = "", lang }: { children: ReactNode; className?: string; lang?: string }) {
  return (
    <div lang={lang} className={`tema-evento ${fuenteTitulos.variable} ${fuenteTexto.variable} ${className}`.trim()}>
      {children}
    </div>
  );
}
