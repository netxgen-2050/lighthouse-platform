"use client";

import { useState } from "react";
import Link from "next/link";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

// Los botones de membresía viven en components/membresia-acciones.tsx.
export function VerBarrio() {
  return (
    <Link className={SUAVE} href="/territorios/lighthouse">
      Ver su barrio en el mapa
    </Link>
  );
}

export function ProponerTribu() {
  const [mensaje, setMensaje] = useState("");
  return (
    <div className="grid gap-2">
      <button
        type="button"
        className={DORADO}
        onClick={() => setMensaje("Abriríamos el formulario para proponer una tribu (simulado).")}
      >
        Proponer mi tribu
      </button>
      <p aria-live="polite" className="text-sm font-medium">
        {mensaje}
      </p>
    </div>
  );
}
