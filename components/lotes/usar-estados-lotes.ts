"use client";

import { useEffect, useState } from "react";
import type { EstadosDeLaBase } from "@/lib/lotes/compra";
import { leerEstados } from "@/lib/lotes/reservas";
import { crearOrdenDePedidos } from "@/lib/lotes/ultimo-pedido";

const EVENTO = "lh-lotes-cambio";

/** Avisa a las pantallas de lotes que algo cambió (una reserva propia o un choque): vuelven a pedir los estados. */
export function avisarCambioDeLotes(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO));
}

/**
 * Llama a `pedir` cuando la persona vuelve a la pestaña y cuando alguna pantalla avisa un cambio de lotes.
 * Devuelve la función que lo deja de escuchar.
 */
export function alVolverOCambiar(pedir: () => void): () => void {
  const alVolver = () => {
    if (document.visibilityState === "visible") pedir();
  };
  document.addEventListener("visibilitychange", alVolver);
  window.addEventListener(EVENTO, pedir);
  return () => {
    document.removeEventListener("visibilitychange", alVolver);
    window.removeEventListener(EVENTO, pedir);
  };
}

/**
 * Los estados de los lotes según el servidor (`GET /api/lotes/estados`, sin ninguna identidad). Se piden al montar, cuando la
 * persona vuelve a la pestaña y cuando alguna pantalla avisa un cambio. Mientras no llegan, `estados` es `undefined` y se dibujan
 * los de ejemplo (el mismo patrón que `listo` en `useCompras`). Si fallan, quedan los de ejemplo y `fallo` es true: la pantalla
 * avisa "No pudimos traer el estado actual de los lotes." y nunca da un lote por disponible por eso.
 */
export function useEstadosLotes(): { estados: EstadosDeLaBase | undefined; fallo: boolean } {
  const [estados, setEstados] = useState<EstadosDeLaBase | undefined>(undefined);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    const orden = crearOrdenDePedidos();
    const pedir = () => {
      const n = orden.nuevo();
      void leerEstados().then((e) => {
        if (!vigente || !orden.esElUltimo(n)) return;
        if (e) {
          setEstados(e);
          setFallo(false);
        } else setFallo(true);
      });
    };
    pedir();
    const dejar = alVolverOCambiar(pedir);
    return () => {
      vigente = false;
      dejar();
    };
  }, []);

  return { estados, fallo };
}
