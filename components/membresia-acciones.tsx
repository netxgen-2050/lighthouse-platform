"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useMembresia } from "@/lib/membresia/usar-membresia";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

type Props = {
  /** `lighthouse` o el id de la tribu. */
  comunidad: string;
  nombre: string;
  /** Si Pactos está disponible en la navegación. */
  pactos: boolean;
  /** Acciones propias del lugar donde se muestra (por ejemplo, el enlace al mapa). */
  extra?: ReactNode;
};

/**
 * Botones según la membresía simulada de la persona en la comunidad:
 * no miembro (leer / adherir), pedido enviado (esperando) o miembro (proponer pacto / sala).
 */
export function MembresiaAcciones({ comunidad, nombre, pactos, extra }: Props) {
  const { estado, cargado, falloAlmacen, aceptar } = useMembresia(comunidad);
  const [mensaje, setMensaje] = useState("");
  const esLighthouse = comunidad === "lighthouse";
  const de = esLighthouse ? "del Lighthouse" : "de la tribu";
  const manifiesto = `/tribus/${comunidad}/manifiesto`;

  // Hasta leer lo guardado no se muestra ningún botón, para no mostrar "Adherir" a quien ya es miembro.
  if (!cargado) return <div className="min-h-10" aria-hidden="true" />;

  return (
    <div className="grid gap-2">
      {estado === "pedido" && (
        <p role="status" className="rounded-lg border border-faint bg-surface-2 px-3 py-2 text-sm font-medium">
          Tu pedido llegó {esLighthouse ? "al Lighthouse" : `a ${nombre}`}. Quien {esLighthouse ? "lo" : "la"} administra lo va a revisar.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {estado === "miembro" ? (
          <>
            {pactos && (
              <Link className={PRIMARIO} href={`/pactos?comunidad=${comunidad}`}>
                Proponer mi pacto
              </Link>
            )}
            <button
              type="button"
              className={SUAVE}
              onClick={() =>
                setMensaje(
                  esLighthouse
                    ? "Abriríamos la sala del Lighthouse en Telegram. Podés salir cuando quieras."
                    : "Abriríamos la sala de la tribu en Telegram. Podés salir cuando quieras.",
                )
              }
            >
              Entrar a la sala
            </button>
          </>
        ) : (
          <>
            <Link className={SUAVE} href={manifiesto}>
              Leer el manifiesto {de}
            </Link>
            {estado === "no-miembro" ? (
              <Link className={DORADO} href={manifiesto}>
                Adherir al manifiesto {de}
              </Link>
            ) : (
              <button type="button" className={PRIMARIO} onClick={aceptar}>
                Simular: la comunidad me acepta
              </button>
            )}
          </>
        )}
        {extra}
      </div>
      {estado === "no-miembro" && (
        <p className="text-sm text-muted">
          Para adherir hay que leer el manifiesto hasta el final. Es el primer paso antes de cualquier pacto.
        </p>
      )}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium">
          No se pudo guardar en este navegador: la membresía vale solo hasta que recargues la página.
        </p>
      )}
      <p aria-live="polite" className="text-sm font-medium">
        {mensaje}
      </p>
    </div>
  );
}
