"use client";

import { useTextos } from "@/lib/idioma/cliente";
import { estadoConCompras, type EstadoMostrado } from "@/lib/lotes/compra";
import { useCompras } from "./usar-compras";

const GLIFO: Record<EstadoMostrado, string> = {
  disponible: "●",
  reservado: "◐",
  vendido: "✕",
  "reservado-por-vos": "◐",
  "vendido-a-vos": "✕",
};

/** El estado se dice con palabras; el símbolo es decorativo (nunca solo color ni solo forma). */
export function TextoEstado({ estado }: { estado: EstadoMostrado }) {
  const t = useTextos("lotes").estado;
  const texto = {
    disponible: t.disponible,
    reservado: t.reservado,
    vendido: t.vendido,
    "reservado-por-vos": t.reservadoPorVos,
    "vendido-a-vos": t.vendidoAVos,
  }[estado];
  return (
    <>
      <span aria-hidden="true">{GLIFO[estado]} </span>
      {texto}
    </>
  );
}

/**
 * El estado de un lote con lo que la persona reservó o "pagó" en la simulación. El servidor dibuja el estado de ejemplo
 * y el cliente lo actualiza al leer lo guardado, sin mover el diseño.
 */
export function EstadoDeUnLote({ id }: { id: string }) {
  const { compras } = useCompras();
  return <TextoEstado estado={estadoConCompras(id, compras)} />;
}
