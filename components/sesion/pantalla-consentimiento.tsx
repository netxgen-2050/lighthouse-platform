"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { registrarConsentimiento } from "@/lib/privacidad/consentimiento";
import { RESUMEN } from "@/lib/privacidad/politica";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { CLAVE_PENDIENTE_HORA, leerPendiente, renovarPendiente } from "@/lib/sesion/nivel";
import { useSesion } from "./contexto";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-faint hover:bg-surface-2`;
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Qué término legal (⚖) acompaña a cada línea del resumen, por posición. */
const TERMINO_DE_LINEA: Readonly<Record<number, ClaveTermino>> = { 0: "datos", 3: "transferencia" };

/**
 * Pantalla de consentimiento: se ve la primera vez que la persona entra y cada vez que cambia la versión de la política.
 * Sin aceptar las dos casillas no se usa la plataforma con sesión (las páginas públicas de Descubrir siguen abiertas).
 */
export function PantallaConsentimiento() {
  const { sesion, salir } = useSesion();
  const { registro } = useConsentimiento(sesion?.idPersona ?? null);
  const idBase = useId();
  const [politica, setPolitica] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const primera = useRef<HTMLInputElement>(null);
  // ¿Había un plan elegido en Sumarte todavía vigente cuando apareció esta pantalla? (se mira una sola vez, al montar)
  const [pedidoVigenteAlLlegar] = useState(() => {
    try {
      return leerPendiente(window.sessionStorage).length > 0;
    } catch {
      return false;
    }
  });

  function aceptar() {
    if (!politica || !terminos) {
      setError("Error: para seguir tenés que marcar las dos casillas.");
      primera.current?.focus();
      return;
    }
    // El plan elegido en Sumarte espera esta pantalla: si estaba vigente al llegar, se renueva su plazo (antes de registrar,
    // que destraba Sumarte) para que no venza mientras la persona leía. Un pedido que ya había vencido no se revive.
    let horaPrevia: string | null = null;
    let renovado = false;
    if (pedidoVigenteAlLlegar) {
      try {
        horaPrevia = window.sessionStorage.getItem(CLAVE_PENDIENTE_HORA);
        renovarPendiente(window.sessionStorage);
        renovado = true;
      } catch {
        // Sin almacenamiento de la pestaña no hay pedido pendiente.
      }
    }
    let guardado = false;
    try {
      guardado = registrarConsentimiento(window.localStorage, { politica, terminos });
    } catch {
      guardado = false;
    }
    if (!guardado) {
      // No se registró nada: el pedido queda como estaba.
      if (renovado) {
        try {
          if (horaPrevia === null) window.sessionStorage.removeItem(CLAVE_PENDIENTE_HORA);
          else window.sessionStorage.setItem(CLAVE_PENDIENTE_HORA, horaPrevia);
        } catch {
          // Sin almacenamiento de la pestaña no hay nada que restaurar.
        }
      }
      setError("Error: tu navegador no permite guardar datos en este sitio, así que no podemos registrar tu consentimiento. Revisá la configuración de privacidad o probá en otro navegador.");
      return;
    }
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl p-6 sm:p-10">
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-2xl font-semibold">Antes de seguir: tu privacidad</h1>
      {registro ? (
        <p role="status" className="mt-3 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium">
          Cambió la política de privacidad desde la última vez que la aceptaste. Leé el resumen y volvé a aceptarla para seguir.
        </p>
      ) : (
        <p className="mt-3 text-muted">
          Para usar la plataforma con tu cuenta necesitamos tu consentimiento. Esto es lo principal, en palabras simples.
        </p>
      )}
      <p className="mt-2 text-sm font-medium text-warn-ink">Borrador: los textos legales los revisa un abogado antes de cualquier uso real.</p>

      <ul className="mt-4 grid list-disc gap-2 pl-5">
        {RESUMEN.map((linea, i) => (
          <li key={linea}>
            {linea}
            {TERMINO_DE_LINEA[i] && <TerminoLegal clave={TERMINO_DE_LINEA[i]} />}
          </li>
        ))}
      </ul>

      <form
        className="mt-6 grid gap-3"
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault();
          aceptar();
        }}
      >
        <fieldset className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
          <legend className="px-1 font-medium">Para seguir tenés que aceptar las dos cosas</legend>
          <label className="flex items-start gap-2">
            <input
              ref={primera}
              type="checkbox"
              checked={politica}
              aria-describedby={error ? `${idBase}-error` : undefined}
              onChange={(e) => setPolitica(e.target.checked)}
              className={`mt-1 size-4 accent-deep ${FOCO}`}
            />
            <span>
              Leí y acepto la{" "}
              <Link className={`underline ${FOCO}`} href="/privacidad" target="_blank" rel="noopener noreferrer">
                política de privacidad<span className="sr-only"> (se abre en otra pestaña)</span>
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={terminos}
              aria-describedby={error ? `${idBase}-error` : undefined}
              onChange={(e) => setTerminos(e.target.checked)}
              className={`mt-1 size-4 accent-deep ${FOCO}`}
            />
            <span>
              Acepto los{" "}
              <Link className={`underline ${FOCO}`} href="/privacidad#terminos" target="_blank" rel="noopener noreferrer">
                términos de uso del prototipo<span className="sr-only"> (se abre en otra pestaña)</span>
              </Link>
              .
            </span>
          </label>
        </fieldset>
        {error && (
          <p id={`${idBase}-error`} role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={BOTON_PRIMARIO}>
            Aceptar y continuar
          </button>
          <button type="button" className={BOTON_SECUNDARIO} onClick={() => void salir()}>
            No acepto, salir
          </button>
        </div>
        <p className="text-sm text-muted">
          Si no aceptás, podés seguir mirando las páginas públicas de Descubrir (el mapa, las tribus) sin cuenta.
        </p>
      </form>
    </div>
  );
}
