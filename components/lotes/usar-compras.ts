"use client";

import { useCallback, useEffect, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import type { CompraLote } from "@/lib/lotes/compra";
import { guardarReservas, leerReservas } from "@/lib/lotes/reservas";

/**
 * Las reservas y pagos SIMULADOS de la persona en sesión. Se leen y se guardan solo por `lib/lotes/reservas.ts`
 * (hoy el navegador, mañana la base). Sin sesión no se lee ni se guarda nada. Lo guardado que no se puede leer cuenta como "sin compras".
 * `listo` es falso hasta que se leyó: el servidor dibuja el estado de ejemplo y el cliente lo actualiza.
 */
export function useCompras(): { compras: CompraLote[]; guardar: (nuevas: CompraLote[]) => Promise<boolean>; listo: boolean } {
  const { estado } = useSesion();
  const [compras, setCompras] = useState<CompraLote[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (estado === "cargando") return;
    let vigente = true;
    void leerReservas({ estado }).then((leidas) => {
      if (!vigente) return;
      setCompras(leidas);
      setListo(true);
    });
    return () => {
      vigente = false;
    };
  }, [estado]);

  const guardar = useCallback(
    async (nuevas: CompraLote[]): Promise<boolean> => {
      const ok = await guardarReservas({ estado }, nuevas);
      if (ok) setCompras(nuevas);
      return ok;
    },
    [estado],
  );

  return { compras, guardar, listo };
}
