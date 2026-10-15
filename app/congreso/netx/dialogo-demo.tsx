"use client";

import { useId, type RefObject } from "react";

export type TextosDialogo = { titulo: string; texto: string; prototipo: string; cerrar: string };

/**
 * Diálogo de demostración (nativo, modal). El navegador deja inerte el resto de la página mientras está abierto,
 * así que el foco no sale; Escape lo cierra. No hace pedidos, no tiene formulario y no guarda nada.
 */
export function DialogoDemo({
  dialogoRef,
  textos,
  alCerrar,
}: {
  dialogoRef: RefObject<HTMLDialogElement | null>;
  textos: TextosDialogo;
  alCerrar: () => void;
}) {
  const id = useId();
  return (
    <dialog ref={dialogoRef} className="ev-dialogo ev-sobre-claro" aria-labelledby={`${id}-titulo`} onClose={alCerrar}>
      <h3 id={`${id}-titulo`}>{textos.titulo}</h3>
      <p>{textos.texto}</p>
      <p className="ev-dialogo-chico">{textos.prototipo}</p>
      <button type="button" className="ev-boton ev-boton-corona" onClick={() => dialogoRef.current?.close()}>
        {textos.cerrar}
      </button>
    </dialog>
  );
}
