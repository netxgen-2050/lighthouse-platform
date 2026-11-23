"use client";

import type { NodoH } from "@/lib/gobernanza/holarquia";
import { HolarquiaCliente } from "./gobernanza/holarquia-cliente";
import { PropuestasDelHolon } from "./propuestas-del-holon";
import { useFogon } from "./usar-fogon";

/** La holarquía con las propuestas del holón al lado. El estado del Fogón vive acá, arriba, para que no se pierda al hacer zoom. */
export function FogonPortada({ raiz, focoInicial, lenteInicial }: { raiz: NodoH; focoInicial: string; lenteInicial: string }) {
  const fogon = useFogon();
  return (
    <HolarquiaCliente
      raiz={raiz}
      focoInicial={focoInicial}
      lenteInicial={lenteInicial}
      // `key` por holón: "Solo las de {holón}" vuelve a no presionado en cada holón.
      adyacente={({ foco, raiz: r, lente }) => <PropuestasDelHolon key={foco.id} foco={foco} raiz={r} lente={lente} fogon={fogon} />}
    />
  );
}
