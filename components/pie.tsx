"use client";

import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

// El año se resuelve en el navegador: el HTML estático no queda con el año del build.
function useAnio() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => String(new Date().getFullYear()),
    () => "",
  );
}

export function Pie() {
  const anio = useAnio();
  return (
    <footer className="border-t border-line bg-surface-2 text-sm text-muted">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-6 py-4 sm:px-10">
        <p>Prototipo en desarrollo. Datos de ejemplo.</p>
        <p>© {anio} NetX</p>
      </div>
    </footer>
  );
}
