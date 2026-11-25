"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import type { CompraLote, LoVisto } from "@/lib/lotes/compra";
import type { OpcionCompra } from "@/lib/lotes/modelo";
import { crearOrdenDePedidos } from "@/lib/lotes/ultimo-pedido";
import { deshacerLote, leerReservas, pagarLote, reservarLote, type MotivoDeFallo, type RespuestaDeEscritura } from "@/lib/lotes/reservas";
import { origenDelNavegador } from "@/lib/origen/origen";
import { alVolverOCambiar, avisarCambioDeLotes } from "./usar-estados-lotes";

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
  const orden = useRef(crearOrdenDePedidos()).current;

  useEffect(() => {
    if (estado === "cargando") return;
    let vigente = true;
    const pedir = () => {
      const n = orden.nuevo();
      void leerReservas({ estado, cabeceras }).then((leidas) => {
        // Una lectura fallida (null) deja `compras` como estaba: no se muestra como "no tenés reservas". Y solo cuenta la más reciente.
        if (!vigente || !orden.esElUltimo(n) || leidas === null) return;
        setCompras(leidas);
        setListo(true);
      });
    };
    pedir();
    // Si la persona reservó o deshizo en otra pestaña, se relee al volver y cuando una pantalla avisa un cambio de lotes.
    const dejar = alVolverOCambiar(pedir);
    return () => {
      vigente = false;
      dejar();
    };
  }, [estado, cabeceras, orden]);

  // Un lote que cambia de dueño cambia lo que ven todas las pantallas: se avisa también si el servidor dijo "ya está reservado".
  const aplicar = useCallback(async (hacer: () => Promise<RespuestaDeEscritura>): Promise<ResultadoDeAccion> => {
    const r = await hacer();
    if (r.ok) {
      orden.nuevo(); // una lectura que salió antes de esta escritura ya no puede pisar el resultado
      setCompras(r.compras);
    }
    if (r.ok || r.motivo !== "error") avisarCambioDeLotes();
    return r.ok ? { ok: true } : { ok: false, motivo: r.motivo };
  }, [orden]);

  const sesion = useMemo(() => ({ estado, cabeceras }), [estado, cabeceras]);
  const reservar = useCallback(
    (loteId: string, opcion: OpcionCompra, vio: LoVisto) => aplicar(() => reservarLote(sesion, { loteId, opcion, vio, origen: origenDelNavegador() ?? null })),
    [aplicar, sesion],
  );
  const pagar = useCallback((loteId: string) => aplicar(() => pagarLote(sesion, loteId)), [aplicar, sesion]);
  const deshacer = useCallback((loteId: string) => aplicar(() => deshacerLote(sesion, loteId)), [aplicar, sesion]);

  return { compras, reservar, pagar, deshacer, listo };
}
