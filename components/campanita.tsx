"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { contarNoLeidas, nombreCampanita } from "@/lib/actividad/actividad";
import { EVENTO_CAMBIO, leerActividadDelNavegador } from "@/lib/actividad/almacen";

/** Cada cuánto se revisa si llegó un aviso simulado que estaba esperando. */
const REVISION_MS = 5000;

/** Campanita con la cantidad de notificaciones sin leer. Lleva a /bandeja. */
export function Campanita() {
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    const revisar = () => setNoLeidas(contarNoLeidas(leerActividadDelNavegador(), new Date()));
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
  }, []);

  return (
    <Link
      href="/bandeja"
      aria-label={nombreCampanita(noLeidas)}
      className="mx-auto mb-3 flex h-9 w-12 items-center justify-center gap-0.5 rounded-full hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <Bell aria-hidden="true" size={20} />
      {noLeidas > 0 && (
        <span aria-hidden="true" className="rounded-full bg-gold px-1.5 text-xs font-bold text-deep">
          {noLeidas}
        </span>
      )}
    </Link>
  );
}
