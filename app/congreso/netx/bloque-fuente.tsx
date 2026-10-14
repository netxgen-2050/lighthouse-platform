import type { ReactNode } from "react";

export type Fuente = "unityhub" | "netx";

const NOMBRE: Record<Fuente, string> = { unityhub: "UnityHub", netx: "NetX" };

/**
 * Marca de dónde viene una sección: el atributo `data-fuente` pinta el contorno (violeta o verde) cuando el modo
 * "¿Qué viene de UnityHub?" está activo, y el texto de origen lo dice con palabras, para no depender del color.
 * Con el modo apagado el texto queda en `display: none`, así el lector de pantalla no lo lee.
 */
export function BloqueFuente({ fuente, detalle, children }: { fuente: Fuente; detalle: string; children: ReactNode }) {
  return (
    <div data-fuente={fuente}>
      <span className="ev-fuente">
        Viene de {NOMBRE[fuente]} · {detalle}
      </span>
      {children}
    </div>
  );
}
