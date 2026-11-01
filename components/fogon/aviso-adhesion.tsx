"use client";

import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";

/**
 * El aviso que ocupa el lugar de una acción de gobernanza cuando falta la adhesión al manifiesto de Lighthouse VRN:
 * texto (no solo un ícono o un color), con un enlace que se alcanza con el teclado y el ⚖ que lo explica. No mueve el
 * foco por sí solo. El texto lo pone quien lo usa (el motivo del Fogón o el aviso de las consultas).
 */
export function AvisoAdhesion({ texto, clase = "" }: { texto: string; clase?: string }) {
  const idioma = useIdioma();
  const t = useTextos("manifiestoVrn").aviso;
  return (
    <span className={clase}>
      {texto}
      {" · "}
      <Link className="underline" href="/tribus/lighthouse/manifiesto">
        {t.enlace}
      </Link>
      <TerminoLegal clave="adhesiongobernanza" idioma={idioma} />
    </span>
  );
}
