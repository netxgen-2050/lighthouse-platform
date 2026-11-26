"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Sección que se despliega (`details`): abierta en compu y cerrada en el celular (ux-explorar, design §7). El título es un `h2` dentro
 * del `summary`, así que sigue en el esquema de la página aunque esté cerrada. Sin JavaScript queda abierta.
 */
export function Desplegable({ id, titulo, children, className = "" }: { id: string; titulo: ReactNode; children: ReactNode; className?: string }) {
  const [abierta, setAbierta] = useState(true);
  useEffect(() => {
    // La preferencia de partida se lee una vez, al hidratar (no existe en el servidor).
    setAbierta(window.matchMedia("(min-width: 768px)").matches);
  }, []);
  return (
    <details open={abierta} onToggle={(e) => setAbierta(e.currentTarget.open)} className={className}>
      <summary className="flex min-h-11 cursor-pointer items-center rounded-[var(--radius-s)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
        <h2 id={id} className="text-lg font-semibold">
          {titulo}
        </h2>
      </summary>
      <div className="grid gap-3 pt-2">{children}</div>
    </details>
  );
}
