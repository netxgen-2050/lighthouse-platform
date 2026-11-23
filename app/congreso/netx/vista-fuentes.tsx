"use client";

import { useState, type ReactNode } from "react";
import type { Idioma } from "@/lib/congreso/idioma";
import { TEXTOS_NETX } from "./textos";

/**
 * Cinta de prototipo con el botón "¿Qué viene de UnityHub?" (visible para todas las personas, con o sin cuenta) y el
 * contenedor que enciende el modo de origen. El estado vive solo en memoria: al recargar vuelve a estar apagado.
 * En inglés, el aviso va en inglés junto al original en español (`lang="es"`).
 */
export function VistaFuentes({ children, idioma = "es" }: { children: ReactNode; idioma?: Idioma }) {
  const [ver, setVer] = useState(false);
  const cinta = TEXTOS_NETX[idioma].cinta;
  return (
    <div className="ev-vista" data-ver-fuentes={ver ? "si" : "no"}>
      <div className="ev-cinta flex flex-wrap items-center justify-between gap-2 bg-deep px-4 py-2 text-sm text-on-deep">
        <span>
          <b>{cinta.aviso}</b>
          {idioma === "en" ? (
            <>
              {" / "}
              <span lang="es">{TEXTOS_NETX.es.cinta.aviso}</span>
            </>
          ) : null}
        </span>
        <button
          type="button"
          aria-pressed={ver}
          onClick={() => setVer((v) => !v)}
          className="rounded-full border border-on-deep px-3 py-1 text-xs font-medium aria-pressed:bg-on-deep aria-pressed:text-deep"
        >
          {ver ? <span aria-hidden="true">✓ </span> : null}
          {cinta.boton}
        </button>
      </div>
      {children}
    </div>
  );
}
