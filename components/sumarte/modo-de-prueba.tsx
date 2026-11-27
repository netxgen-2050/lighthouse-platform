"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Cajón "Modo de prueba" (ux-sumarte, design §4): un `details` cerrado al final de la página con el panel "Entrar como…" adentro.
 * El panel decide solo si se muestra (modo de prueba activo, sin sesión): si no hay nada adentro (`#entrar-como`), el cajón
 * tampoco se ve. Se abre solo cuando algo lo necesita: la dirección `#entrar-como` (así llega el login) o `abrir` (un pedido
 * de entrar hecho desde esta página).
 */
export function ModoDePrueba({ titulo, abrir, children }: { titulo: string; abrir: number; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const segunLaDireccion = () => {
      if (window.location.hash === "#entrar-como") setAbierto(true);
    };
    segunLaDireccion();
    window.addEventListener("hashchange", segunLaDireccion);
    return () => window.removeEventListener("hashchange", segunLaDireccion);
  }, []);

  useEffect(() => {
    if (abrir > 0) setAbierto(true);
  }, [abrir]);

  return (
    <details
      open={abierto}
      onToggle={(e) => setAbierto(e.currentTarget.open)}
      className="group hidden border-t border-line pt-2 has-[#entrar-como]:block"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">{titulo}</span>
        <ChevronDown aria-hidden="true" size={20} className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 pt-2">{children}</div>
    </details>
  );
}
