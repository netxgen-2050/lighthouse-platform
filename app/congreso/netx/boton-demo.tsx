"use client";

import { useRef } from "react";
import { DialogoDemo, type TextosDialogo } from "./dialogo-demo";

type Props = {
  texto: string;
  variante: "corona" | "linea" | "linea-clara";
  dialogo: TextosDialogo;
};

/**
 * Botón que abre el diálogo de demostración. Siempre es un `<button>`, nunca un enlace: no navega, no cobra ni abre
 * nada externo. Al cerrar el diálogo, el foco vuelve a este botón.
 */
export function BotonDemo({ texto, variante, dialogo }: Props) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className={`ev-boton ev-boton-${variante}`}
        onClick={() => dialogoRef.current?.showModal()}
      >
        {texto}
      </button>
      <DialogoDemo dialogoRef={dialogoRef} textos={dialogo} alCerrar={() => botonRef.current?.focus()} />
    </>
  );
}
