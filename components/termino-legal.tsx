"use client";

import { useId, useRef, useState } from "react";
import { TERMINOS, type ClaveTermino } from "@/lib/legal/terminos";

export function TerminoLegal({ clave }: { clave: ClaveTermino }) {
  const termino = TERMINOS[clave];
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const boton = useRef<HTMLButtonElement>(null);

  function cerrarConEscape(e: React.KeyboardEvent) {
    if (e.key === "Escape" && abierto) {
      setAbierto(false);
      boton.current?.focus();
    }
  }

  return (
    <span className="relative inline-block align-baseline" onKeyDown={cerrarConEscape}>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? id : undefined}
        aria-label={`Qué significa legalmente: ${termino.titulo}`}
        onClick={() => setAbierto((v) => !v)}
        className="ml-1 rounded px-1 text-gold-ink hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink"
      >
        <span aria-hidden="true">⚖</span>
      </button>
      {abierto && (
        <span
          id={id}
          role="dialog"
          aria-label={termino.titulo}
          className="absolute left-0 top-full z-10 mt-1 block w-72 rounded-lg border border-gold-ink bg-surface p-3 text-sm font-normal text-ink shadow-lg"
        >
          <strong className="block">{termino.titulo}</strong>
          {termino.texto}
        </span>
      )}
    </span>
  );
}
