"use client";

import { useState } from "react";
import Link from "next/link";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

// Todo simulado: no navega, no guarda ni envía nada.
export function Acciones({ pactos }: { pactos: boolean }) {
  const [mensaje, setMensaje] = useState("");
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-3">
        {pactos && (
          <Link className={PRIMARIO} href="/pactos">
            Proponer mi pacto
          </Link>
        )}
        <button
          type="button"
          className={SUAVE}
          onClick={() => setMensaje("Abriríamos la sala de la tribu en Telegram. Podés salir cuando quieras.")}
        >
          Entrar a la sala
        </button>
        <Link className={SUAVE} href="/territorios/lighthouse">
          Ver su barrio en el mapa
        </Link>
      </div>
      <p aria-live="polite" className="text-sm font-medium">
        {mensaje}
      </p>
    </div>
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
