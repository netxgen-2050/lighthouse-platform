"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { ModoAlta } from "@/lib/privacidad/consentimiento";
import {
  BloqueConsentimiento,
  enfocarPrimeraSinMarcar,
  SIN_MARCAR,
  TEXTO_ERROR_CASILLAS,
  type ValorConsentimiento,
} from "./bloque-consentimiento";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-faint hover:bg-surface-2`;

type Props = {
  abierto: boolean;
  modo: ModoAlta;
  /** Las dos casillas obligatorias están marcadas; `novedades` es la casilla opcional. */
  alAceptar: (datos: { novedades: boolean }) => boolean;
  /** Cancelar o Escape: no se guarda nada y no se abre el login. */
  alCancelar: () => void;
  /** Con Neon Auth, el formulario propio de login (login-neon-auth): reemplaza a las casillas, en el mismo diálogo, una vez aceptado. */
  formulario?: ReactNode;
};

/**
 * Diálogo de entrada. Modo `alta` ("Crear tu cuenta", Sumarte): el bloque de consentimiento con las casillas sin marcar; recién
 * al aceptar se abre el login (lo decide el proveedor de sesión). Modo `entrar` (casillas-una-sola-vez): sin casillas, muestra
 * el formulario de login directo; si es la primera vez, la pantalla de consentimiento sale después del login. Diálogo modal
 * nativo: Escape cierra y el foco vuelve a quien lo abrió.
 */
export function PasoAlta({ abierto, modo, alAceptar, alCancelar, formulario }: Props) {
  const idBase = useId();
  const dialogo = useRef<HTMLDialogElement | null>(null);
  const titulo = useRef<HTMLHeadingElement | null>(null);
  const refPolitica = useRef<HTMLInputElement | null>(null);
  const refTerminos = useRef<HTMLInputElement | null>(null);
  const [valor, setValor] = useState<ValorConsentimiento>(SIN_MARCAR);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      // Cada vez que se abre, las casillas arrancan sin marcar.
      setValor(SIN_MARCAR);
      setError(null);
      d.showModal();
      titulo.current?.focus();
    }
    if (!abierto && d.open) d.close();
  }, [abierto]);

  const enAlta = modo === "alta";
  const titulo_ = enAlta ? "Crear tu cuenta" : "Entrar";

  function aceptar() {
    if (!valor.politica || !valor.terminos) {
      setError(TEXTO_ERROR_CASILLAS);
      enfocarPrimeraSinMarcar(valor, refPolitica, refTerminos);
      return;
    }
    // Sin lugar donde guardar la aceptación en la pestaña, el login no se abre (nunca se abre sin aceptación guardada).
    if (!alAceptar({ novedades: valor.novedades })) {
      setError("Error: tu navegador no permite guardar datos en este sitio, así que no podemos registrar tu aceptación. Revisá la configuración de privacidad o probá en otro navegador.");
      return;
    }
    setError(null);
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={`${idBase}-titulo`}
      onCancel={(ev) => {
        // Escape: se cierra desde el estado del proveedor (así el foco vuelve a donde estaba).
        ev.preventDefault();
        alCancelar();
      }}
      className="m-auto max-h-[90dvh] w-[min(40rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-line bg-surface p-5 text-ink backdrop:bg-ink/50 sm:p-8"
    >
      {abierto && formulario && (
        <div>
          <h2 id={`${idBase}-titulo`} ref={titulo} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
            {titulo_}
          </h2>
          <p className="mt-3 mb-4 text-muted">
            {enAlta
              ? "Aceptaste la política y los términos. Ahora elegí cómo entrar."
              : "Elegí cómo entrar. Si es tu primera vez, después te pedimos aceptar la política y los términos."}
          </p>
          {formulario}
        </div>
      )}
      {abierto && !formulario && (
        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            aceptar();
          }}
        >
          <h2 id={`${idBase}-titulo`} ref={titulo} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
            {titulo_}
          </h2>
          <p className="mt-3 text-muted">Antes de crear tu cuenta necesitamos tu consentimiento. Esto es lo principal, en palabras simples.</p>
          <p className="mt-2 text-sm font-medium text-warn-ink">Borrador: los textos legales los revisa un abogado antes de cualquier uso real.</p>

          <BloqueConsentimiento
            valor={valor}
            alCambiar={setValor}
            error={error}
            refPolitica={refPolitica}
            refTerminos={refTerminos}
            mostrarNovedades
          />

          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className={BOTON_PRIMARIO}>
              Aceptar y crear mi cuenta
            </button>
            <button type="button" className={BOTON_SECUNDARIO} onClick={alCancelar}>
              Cancelar
            </button>
          </div>
          <p className="mt-3 text-sm text-muted">
            ¿Ya tenés cuenta? Usá “Entrar” arriba.
          </p>
        </form>
      )}
    </dialog>
  );
}
