"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import type { CompraLote, LoVisto } from "@/lib/lotes/compra";
import type { OpcionCompra } from "@/lib/lotes/modelo";
import { deshacerLote, leerReservas, pagarLote, reservarLote, type MotivoDeFallo, type RespuestaDeEscritura } from "@/lib/lotes/reservas";
import { origenDelNavegador } from "@/lib/origen/origen";
import { avisarCambioDeLotes } from "./usar-estados-lotes";

export type ResultadoDeAccion = { ok: true } | { ok: false; motivo: MotivoDeFallo };

/**
 * Las reservas y pagos SIMULADOS de la persona en sesión, guardados en el servidor (`lotes-en-la-base`). Se leen y se escriben
 * solo por `lib/lotes/reservas.ts`. Sin sesión no se lee ni se escribe nada. `reservar`, `pagar` y `deshacer` esperan al servidor:
 * si falla, `compras` no cambia y devuelven el motivo (para avisar "Alguien reservó este lote hace un momento." o el error).
 * `listo` es falso hasta que se leyó: el servidor dibuja el estado de ejemplo y el cliente lo actualiza.
 */
export function useCompras(): {
  compras: CompraLote[];
  reservar: (loteId: string, opcion: OpcionCompra, vio: LoVisto) => Promise<ResultadoDeAccion>;
  pagar: (loteId: string) => Promise<ResultadoDeAccion>;
  deshacer: (loteId: string) => Promise<ResultadoDeAccion>;
  listo: boolean;
} {
  const { estado, cabeceras } = useSesion();
  const [compras, setCompras] = useState<CompraLote[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (estado === "cargando") return;
    let vigente = true;
    void leerReservas({ estado, cabeceras }).then((leidas) => {
      if (!vigente) return;
      setCompras(leidas);
      setListo(true);
    });
    return () => {
      vigente = false;
    };
  }, [estado, cabeceras]);

  // Un lote que cambia de dueño cambia lo que ven todas las pantallas: se avisa también si el servidor dijo "ya está reservado".
  const aplicar = useCallback(async (hacer: () => Promise<RespuestaDeEscritura>): Promise<ResultadoDeAccion> => {
    const r = await hacer();
    if (r.ok) setCompras(r.compras);
    if (r.ok || r.motivo !== "error") avisarCambioDeLotes();
    return r.ok ? { ok: true } : { ok: false, motivo: r.motivo };
  }, []);

  const sesion = useMemo(() => ({ estado, cabeceras }), [estado, cabeceras]);
  const reservar = useCallback(
    (loteId: string, opcion: OpcionCompra, vio: LoVisto) => aplicar(() => reservarLote(sesion, { loteId, opcion, vio, origen: origenDelNavegador() ?? null })),
    [aplicar, sesion],
  );
  const pagar = useCallback((loteId: string) => aplicar(() => pagarLote(sesion, loteId)), [aplicar, sesion]);
  const deshacer = useCallback((loteId: string) => aplicar(() => deshacerLote(sesion, loteId)), [aplicar, sesion]);

  return { compras, reservar, pagar, deshacer, listo };
}
