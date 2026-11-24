import type { ComponentType } from "react";
import { mancha } from "../geometria";
import { Agua } from "./agua";
import { Contratistas } from "./contratistas";
import { Cuidado } from "./cuidado";
import { Gobernanza } from "./gobernanza";
import { Legal } from "./legal";
import { Marketing } from "./marketing";
import { Permacultura } from "./permacultura";
import { C, Capas, TRAZO } from "./piezas";
import { Plataforma } from "./plataforma";
import { Token } from "./token";

/** Parcela nueva: lo que se dibuja cuando se suma un círculo que todavía no tiene su forma (estacas, hilo y un brote). */
export function ParcelaNueva() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 8, 100, 46, 91, 0.06, 10)} fill={C.arena} fillOpacity={0.7} />
          <path d="M-70 0L40 -18L80 20L-30 40Z" fill="none" stroke={C.arcilla} strokeWidth={2} strokeDasharray="6 5" strokeLinecap="round" />
        </>
      }
    >
      {[
        [-70, 0],
        [40, -18],
        [80, 20],
        [-30, 40],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y}V${y - 18}`} stroke={C.ocre} strokeWidth={3} strokeLinecap="round" />
      ))}
      <path d="M-70 -18L40 -36L80 2L-30 22Z" fill="none" stroke={C.trazo} strokeOpacity={0.4} strokeWidth={1} />
      <path d="M5 14Q4 4 6 -2" fill="none" stroke={C.verdeHondo} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M6 -1Q-3 -8 -4 0Q2 2 6 -1Z" fill={C.verde} {...TRAZO} strokeOpacity={0.4} />
      <path d="M6 -2Q14 -10 15 -1Q9 1 6 -2Z" fill={C.salvia} {...TRAZO} strokeOpacity={0.4} />
    </Capas>
  );
}

/** La forma de cada círculo del común, por id. */
export const FORMAS: Record<string, ComponentType> = {
  "comun-permacultura": Permacultura,
  "comun-agua": Agua,
  "comun-legal": Legal,
  "comun-token": Token,
  "comun-marketing": Marketing,
  "comun-cuidado": Cuidado,
  "comun-plataforma": Plataforma,
  "comun-contratistas": Contratistas,
  "comun-gobernanza": Gobernanza,
};

/** La forma de un círculo: la suya, o la parcela nueva si todavía no la tiene. */
export function formaDe(circuloId: string): ComponentType {
  return Object.hasOwn(FORMAS, circuloId) ? FORMAS[circuloId] : ParcelaNueva;
}
