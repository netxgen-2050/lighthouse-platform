"use client";

import { useEffect, useState } from "react";
import { leerPostulacionesDelNavegador } from "@/lib/postulaciones/almacen";
import { FORMAS_JURIDICAS } from "@/lib/postulaciones/postulaciones";
import type { Postulacion } from "@/lib/postulaciones/tipos";

const CARTA = "rounded-xl border border-faint bg-surface p-4";

export function PostulacionesComunidades() {
  // null = todavía no se leyó el navegador (evita romper la hidratación).
  const [lista, setLista] = useState<Postulacion[] | null>(null);

  useEffect(() => {
    setLista(leerPostulacionesDelNavegador());
  }, []);

  return (
    <section aria-labelledby="t-postulaciones" className={`mt-4 ${CARTA}`}>
      <h2 id="t-postulaciones" className="mb-1 text-lg font-semibold">
        Postulaciones de comunidades · este navegador (simulado)
      </h2>
      <p className="mb-3 text-sm text-muted">En el producto real las revisaría un administrador del Lighthouse.</p>
      {lista === null ? (
        <p>Cargando postulaciones…</p>
      ) : (
        <>
          <p>
            <strong data-testid="total-postulaciones">{lista.length}</strong>{" "}
            {lista.length === 1 ? "postulación" : "postulaciones"}
          </p>
          {lista.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Postulaciones de comunidades, de la más nueva a la más vieja</caption>
                <thead>
                  <tr className="text-left">
                    <th scope="col" className="py-1.5 pr-3">Comunidad</th>
                    <th scope="col" className="py-1.5 pr-3">Barrio</th>
                    <th scope="col" className="py-1.5 pr-3">Hogares</th>
                    <th scope="col" className="py-1.5 pr-3">Forma jurídica</th>
                    <th scope="col" className="py-1.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((p) => (
                    <tr key={p.id} className="border-t border-line align-top">
                      <th scope="row" className="py-1.5 pr-3 text-left font-normal">{p.nombreComunidad}</th>
                      <td className="py-1.5 pr-3">Barrio {p.barrio}</td>
                      <td className="py-1.5 pr-3">{p.hogares}</td>
                      <td className="py-1.5 pr-3">{FORMAS_JURIDICAS[p.formaJuridica]}</td>
                      <td className="py-1.5">Recibida (simulado)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
