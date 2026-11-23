"use client";

import Link from "next/link";
import { useId, type RefObject } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { RESUMEN } from "@/lib/privacidad/politica";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Qué término legal (⚖) acompaña a cada línea del resumen, por posición. */
const TERMINO_DE_LINEA: Readonly<Record<number, ClaveTermino>> = { 0: "datos", 3: "transferencia" };

export type ValorConsentimiento = { politica: boolean; terminos: boolean; novedades: boolean };

export const SIN_MARCAR: ValorConsentimiento = { politica: false, terminos: false, novedades: false };

export const TEXTO_ERROR_CASILLAS = "Error: para seguir tenés que marcar las dos casillas.";

type Props = {
  valor: ValorConsentimiento;
  alCambiar: (valor: ValorConsentimiento) => void;
  /** Error a mostrar (con `role="alert"`); nunca menciona la casilla opcional. */
  error: string | null;
  /** Enganchan el foco a las casillas obligatorias (el foco va a la primera sin marcar). */
  refPolitica: RefObject<HTMLInputElement | null>;
  refTerminos: RefObject<HTMLInputElement | null>;
  /** ¿Se ofrece la casilla opcional de novedades? */
  mostrarNovedades: boolean;
};

/** Lleva el foco a la primera casilla obligatoria sin marcar. */
export function enfocarPrimeraSinMarcar(
  valor: ValorConsentimiento,
  refPolitica: RefObject<HTMLInputElement | null>,
  refTerminos: RefObject<HTMLInputElement | null>,
) {
  if (!valor.politica) refPolitica.current?.focus();
  else if (!valor.terminos) refTerminos.current?.focus();
}

/**
 * Bloque de consentimiento (primera capa): resumen en palabras simples, enlaces a la política y a los términos (segunda capa),
 * las dos casillas obligatorias sin marcar y, aparte, el grupo opcional de novedades. Lo usan los pasos "Crear tu cuenta" y
 * "Entrar" y la pantalla de consentimiento: los textos son los mismos.
 */
export function BloqueConsentimiento({ valor, alCambiar, error, refPolitica, refTerminos, mostrarNovedades }: Props) {
  const idBase = useId();
  const idError = `${idBase}-error`;
  const idAyuda = `${idBase}-ayuda-novedades`;
  return (
    <>
      <ul className="mt-4 grid list-disc gap-2 pl-5">
        {RESUMEN.map((linea, i) => (
          <li key={linea}>
            {linea}
            {TERMINO_DE_LINEA[i] && <TerminoLegal clave={TERMINO_DE_LINEA[i]} />}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3">
        <fieldset className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
          <legend className="px-1 font-medium">Para seguir tenés que aceptar las dos cosas</legend>
          <label className="flex items-start gap-2">
            <input
              ref={refPolitica}
              type="checkbox"
              checked={valor.politica}
              aria-describedby={error ? idError : undefined}
              onChange={(e) => alCambiar({ ...valor, politica: e.target.checked })}
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
              ref={refTerminos}
              type="checkbox"
              checked={valor.terminos}
              aria-describedby={error ? idError : undefined}
              onChange={(e) => alCambiar({ ...valor, terminos: e.target.checked })}
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

        {mostrarNovedades && (
          <fieldset className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
            <legend className="px-1 font-medium">Opcional</legend>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={valor.novedades}
                aria-describedby={idAyuda}
                onChange={(e) => alCambiar({ ...valor, novedades: e.target.checked })}
                className={`mt-1 size-4 accent-deep ${FOCO}`}
              />
              <span>Quiero recibir novedades por email</span>
            </label>
            <p id={idAyuda} className="text-sm text-muted">
              Te escribimos al email de tu cuenta. Lo podés retirar cuando quieras desde Mis datos. Prototipo: todavía no mandamos emails.
            </p>
          </fieldset>
        )}

        {error && (
          <p id={idError} role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
