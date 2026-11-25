import type { ElementType, ReactNode } from "react";

/**
 * Contenedor de vidrio para ir sobre una foto: fondo translúcido con desenfoque (ver `.panel-vidrio` en app/globals.css).
 * Sin soporte de desenfoque o con transparencia reducida, el fondo es el sólido de la superficie.
 */
export function PanelVidrio({
  children,
  como: Etiqueta = "div",
  className = "",
}: {
  children: ReactNode;
  como?: ElementType;
  className?: string;
}) {
  return <Etiqueta className={`panel-vidrio rounded-xl p-4 ${className}`.trim()}>{children}</Etiqueta>;
}
