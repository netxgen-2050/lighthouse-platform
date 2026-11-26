import type { ReactNode } from "react";

/**
 * Estado vacío (ux-base, design §5): dibujo opcional (decorativo), título en Fraunces, texto, una acción principal opcional
 * y una vista previa opcional atenuada con su etiqueta ("Así se va a ver").
 */
export function EstadoVacio({
  titulo,
  texto,
  dibujo,
  accion,
  vistaPrevia,
  etiquetaVistaPrevia,
  nivel = 2,
}: {
  titulo?: string;
  texto: ReactNode;
  dibujo?: ReactNode;
  accion?: ReactNode;
  vistaPrevia?: ReactNode;
  etiquetaVistaPrevia?: string;
  nivel?: 2 | 3 | 4;
}) {
  const H = `h${nivel}` as "h2";
  return (
    <div data-estado-vacio className="grid justify-items-start gap-3 py-4">
      {dibujo && (
        <div aria-hidden="true" className="text-muted">
          {dibujo}
        </div>
      )}
      {titulo && <H className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">{titulo}</H>}
      <p className="max-w-prose">{texto}</p>
      {accion}
      {vistaPrevia && (
        <div className="grid w-full gap-1">
          {etiquetaVistaPrevia && <p className="text-sm font-medium text-muted">{etiquetaVistaPrevia}</p>}
          <div aria-hidden="true" className="opacity-60">
            {vistaPrevia}
          </div>
        </div>
      )}
    </div>
  );
}
