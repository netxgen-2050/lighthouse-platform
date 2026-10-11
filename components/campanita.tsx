"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contarNoLeidas, nombreCampanita } from "@/lib/actividad/actividad";
import { EVENTO_CAMBIO, leerActividadDelNavegador } from "@/lib/actividad/almacen";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { tiposOcultos } from "@/lib/configuracion/preferencias";

/** Cada cuánto se revisa si llegó un aviso simulado que estaba esperando. */
const REVISION_MS = 5000;

/** Campanita con la cantidad de notificaciones sin leer. Lleva a /bandeja. */
export function Campanita() {
  const [noLeidas, setNoLeidas] = useState(0);
  const preferencias = usePreferencias();
  const ocultos = useMemo(() => tiposOcultos(preferencias), [preferencias]);

  useEffect(() => {
    const revisar = () => setNoLeidas(contarNoLeidas(leerActividadDelNavegador(), new Date(), ocultos));
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    revisar();
    window.addEventListener(EVENTO_CAMBIO, revisar);
    window.addEventListener("storage", revisar);
    const reloj = window.setInterval(revisar, REVISION_MS);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, revisar);
      window.removeEventListener("storage", revisar);
      window.clearInterval(reloj);
    };
  }, [ocultos]);

  return (
    <Link
      href="/bandeja"
      aria-label={nombreCampanita(noLeidas)}
      className="flex h-9 min-w-9 items-center justify-center gap-0.5 rounded-full px-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
    >
      <Bell aria-hidden="true" size={20} />
      {noLeidas > 0 && (
        <span aria-hidden="true" className="rounded-full bg-gold px-1.5 text-xs font-bold text-ink">
          {noLeidas}
        </span>
      )}
    </Link>
  );
}
