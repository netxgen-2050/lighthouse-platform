import type { ReactNode } from "react";
import "../tema-evento.css";
import { fuenteTexto, fuenteTitulos } from "./fuentes";

/** Contenedor del tema del evento: todo lo que use tokens `--evento-*` va adentro. */
export function TemaEvento({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`tema-evento ${fuenteTitulos.variable} ${fuenteTexto.variable} ${className}`.trim()}>{children}</div>
  );
}
