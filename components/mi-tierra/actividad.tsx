"use client";

import { useState } from "react";
import { TablaLibro } from "@/components/ui/tabla-libro";
import { enteroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearFecha } from "@/lib/idioma/formatos";
import { usdEn } from "@/lib/lotes/formato";
import type { MovimientoLibro } from "@/lib/mi-tierra/portafolio";

export const FILAS_VISIBLES = 8;
export type FiltroActividad = "todo" | "pagos" | "reservas" | "faro";

export function filtrarLibro(libro: MovimientoLibro[], filtro: FiltroActividad): MovimientoLibro[] {
  switch (filtro) {
    case "pagos":
      return libro.filter((m) => m.tipo !== "reserva");
    case "reservas":
      return libro.filter((m) => m.tipo === "reserva");
    case "faro":
      return libro.filter((m) => m.acreditaFaro);
    default:
      return libro;
  }
}

/** Actividad como explorador (ux-mi-tierra, design §4): 8 filas, "Ver toda la actividad" y filtro por tipo con pastillas `aria-pressed`. */
export function Actividad({ libro }: { libro: MovimientoLibro[] }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra").actividad;
  const [filtro, setFiltro] = useState<FiltroActividad>("todo");
  const [abierta, setAbierta] = useState(false);
  const lista = filtrarLibro(libro, filtro);
  const visibles = abierta ? lista : lista.slice(0, FILAS_VISIBLES);
  const filas = visibles.map((m) => ({
    fecha: formatearFecha(m.fecha, idioma, "corto"),
    motivo: m.tipo === "reserva" ? t.reserva(m.numero) : m.tipo === "primer-pago" ? t.primerPago(m.numero) : t.pago(m.numero),
    monto: m.monto === null ? null : usdEn(m.monto, idioma),
  }));
  const FILTROS: { id: FiltroActividad; texto: string }[] = [
    { id: "todo", texto: t.todo },
    { id: "pagos", texto: t.pagos },
    { id: "reservas", texto: t.reservas },
    { id: "faro", texto: t.faro },
  ];
  return (
    <div className="grid gap-3">
      <div role="group" aria-label={t.filtro} className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`min-h-11 rounded-full border px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep sm:min-h-9 ${
              filtro === f.id ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:bg-surface-2"
            }`}
          >
            {f.texto}
          </button>
        ))}
      </div>
      {filas.length === 0 ? <p className="text-sm text-muted">{t.vacio}</p> : <TablaLibro titulo={t.titulo} filas={filas} />}
      {lista.length > FILAS_VISIBLES && (
        <details open={abierta} onToggle={(e) => setAbierta((e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="w-fit cursor-pointer text-sm font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            {t.verTodo(enteroEn(lista.length, idioma))}
          </summary>
        </details>
      )}
      <p className="text-sm text-muted">{t.nota}</p>
    </div>
  );
}
