"use client";

import { useEffect, useRef } from "react";
import { PLANES, type PlanVista } from "./planes";

/**
 * Selector de planes (ux-sumarte, design §2): un `radiogroup` con cuatro opciones visibles como segmentos. Son radios nativos:
 * las flechas del teclado cambian de plan y la lectora anuncia "n de 4". En el celular se desliza de costado si no entra, con
 * el elegido siempre a la vista. Lo elegido se ve por la marca ✓, el peso y el relleno, no solo por el color.
 */
export function SelectorPlanes({
  nombre,
  etiquetas,
  actual,
  onCambio,
}: {
  nombre: string;
  etiquetas: Record<PlanVista, string>;
  actual: PlanVista;
  onCambio: (plan: PlanVista) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  // Con el elegido fuera de la vista (se desliza de costado), se lo trae sin mover el resto de la página.
  useEffect(() => {
    const caja = contenedor.current;
    const marcado = caja?.querySelector<HTMLElement>("[data-marcado='true']");
    if (!caja || !marcado || caja.scrollWidth <= caja.clientWidth) return;
    caja.scrollLeft = marcado.offsetLeft - (caja.clientWidth - marcado.offsetWidth) / 2;
  }, [actual]);

  return (
    <div
      ref={contenedor}
      role="radiogroup"
      aria-label={nombre}
      className="relative flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1"
    >
      {PLANES.map((id) => {
        const marcado = actual === id;
        return (
          <label
            key={id}
            data-marcado={marcado}
            className={`flex min-h-11 flex-1 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep ${
              marcado ? "border border-deep bg-deep font-bold text-on-deep" : "border border-transparent font-medium hover:bg-surface"
            }`}
          >
            <input
              type="radio"
              name="plan-vista"
              value={id}
              checked={marcado}
              onChange={() => onCambio(id)}
              className="sr-only"
            />
            {marcado && <span aria-hidden="true">✓&nbsp;</span>}
            {etiquetas[id]}
          </label>
        );
      })}
    </div>
  );
}
