"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

// El HTML estático trae el año del servidor (anioRespaldo, se ve sin JS); en el navegador
// se actualiza al año en curso. useSyncExternalStore hidrata con el valor del servidor y
// luego re-renderiza con el del cliente, sin error de hidratación.
export function Pie({ anioRespaldo }: { anioRespaldo: number }) {
  const anio = useSyncExternalStore(
    sinSuscripcion,
    () => new Date().getFullYear(),
    () => anioRespaldo,
  );
  return (
    <footer className="border-t border-line bg-surface-2 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-6 py-4 sm:px-10">
        <p>Prototipo en desarrollo. Datos de ejemplo.</p>
        <p className="flex flex-wrap gap-x-4">
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/privacidad">
            Privacidad
          </Link>
          <span>© {anio} NetX</span>
        </p>
      </div>
    </footer>
  );
}
