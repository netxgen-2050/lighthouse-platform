"use client";

import { useEffect, useState } from "react";
import { leerBandejaDelNavegador } from "@/lib/contactos/almacen";
import { CANALES, MOMENTOS, MOTIVOS } from "@/lib/contactos/pedidos";
import type { Pedido } from "@/lib/contactos/tipos";

const CARTA = "rounded-xl border border-faint bg-surface p-4";

function fecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "sin dato";
  return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

export function BandejaPedidos() {
  // null = todavía no se leyó el navegador (evita romper la hidratación).
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  useEffect(() => {
    setPedidos(leerBandejaDelNavegador());
  }, []);

  return (
    <section aria-labelledby="t-pedidos" className={`mt-4 ${CARTA}`}>
      <h2 id="t-pedidos" className="mb-1 text-lg font-semibold">
        Pedidos de contacto · este navegador (simulado)
      </h2>
      <p className="mb-3 text-sm text-muted">En el producto real irían al CRM.</p>
      {pedidos === null ? (
        <p>Cargando pedidos…</p>
      ) : pedidos.length === 0 ? (
        <p>Todavía no hay pedidos en este navegador.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Pedidos de contacto, del más nuevo al más viejo</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="py-1.5 pr-3">Fecha</th>
                <th scope="col" className="py-1.5 pr-3">Motivo</th>
                <th scope="col" className="py-1.5 pr-3">Referencia</th>
                <th scope="col" className="py-1.5 pr-3">Canal</th>
                <th scope="col" className="py-1.5 pr-3">Mejor momento</th>
                <th scope="col" className="py-1.5 pr-3">Mensaje</th>
                <th scope="col" className="py-1.5 pr-3">Destino</th>
                <th scope="col" className="py-1.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-t border-line align-top">
                  <td className="py-1.5 pr-3">{fecha(p.fecha)}</td>
                  <td className="py-1.5 pr-3">{MOTIVOS[p.motivo].etiqueta}</td>
                  <td className="py-1.5 pr-3">
                    {p.referencia}
                    {p.estadoMostrado && <span className="block text-muted">{p.estadoMostrado}</span>}
                  </td>
                  <td className="py-1.5 pr-3">{CANALES[p.canal]}</td>
                  <td className="py-1.5 pr-3">{p.momento && p.momento in MOMENTOS ? MOMENTOS[p.momento] : "sin dato"}</td>
                  <td className="py-1.5 pr-3">{p.mensaje ?? "sin dato"}</td>
                  <td className="py-1.5 pr-3">{p.destino}</td>
                  <td className="py-1.5">Recibido (simulado)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
