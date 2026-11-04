"use client";

import { useCallback, useEffect, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { CLAVES } from "@/lib/demo/claves";
import { leerCompras, type CompraLote } from "@/lib/lotes/compra";

/**
 * Las reservas y pagos SIMULADOS de la persona en sesión, guardados solo en este navegador (clave `lh-lotes`).
 * Sin sesión no se lee ni se guarda nada. Lo guardado que no se puede leer cuenta como "sin compras".
 * `listo` es falso hasta que se leyó el navegador: el servidor dibuja el estado de ejemplo y el cliente lo actualiza.
 */
export function useCompras(): { compras: CompraLote[]; guardar: (nuevas: CompraLote[]) => boolean; listo: boolean } {
  const { estado } = useSesion();
  const [compras, setCompras] = useState<CompraLote[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (estado === "cargando") return;
    let leidas: CompraLote[] = [];
    if (estado === "ok") {
      try {
        leidas = leerCompras(window.localStorage.getItem(CLAVES.lotes));
      } catch {
        leidas = [];
      }
    }
    setCompras(leidas);
    setListo(true);
  }, [estado]);

  const guardar = useCallback(
    (nuevas: CompraLote[]): boolean => {
      if (estado !== "ok") return false;
      try {
        if (nuevas.length === 0) window.localStorage.removeItem(CLAVES.lotes);
        else window.localStorage.setItem(CLAVES.lotes, JSON.stringify(nuevas));
        setCompras(nuevas);
        return true;
      } catch {
        return false;
      }
    },
    [estado],
  );

  return { compras, guardar, listo };
}
