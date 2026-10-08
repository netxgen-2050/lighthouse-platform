"use client";

import Link from "next/link";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

// Los botones de membresía viven en components/membresia-acciones.tsx.
export function VerBarrio() {
  return (
    <Link className={SUAVE} href="/territorios/lighthouse">
      Ver su barrio en el mapa
    </Link>
  );
}
