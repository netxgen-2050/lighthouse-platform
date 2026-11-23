"use client";

import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";
import { VERSIONES_POLITICA } from "@/lib/privacidad/politica";

/** Cambios de la versión vigente, o una lista vacía si es la primera. */
export function cambiosVigentes(): readonly string[] {
  return VERSIONES_POLITICA.find((v) => v.version === VERSION_POLITICA)?.cambios ?? [];
}

/** "Qué cambió" en palabras simples, de la versión vigente. No dibuja nada si la versión vigente es la primera. */
export function QueCambio({ abierto = true }: { abierto?: boolean }) {
  const cambios = cambiosVigentes();
  if (cambios.length === 0) return null;
  return (
    <details open={abierto} className="mt-3 rounded-lg border border-faint bg-surface-2 p-3 text-sm">
      <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
        Qué cambió
      </summary>
      <ul className="mt-2 grid list-disc gap-1 pl-5">
        {cambios.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </details>
  );
}
