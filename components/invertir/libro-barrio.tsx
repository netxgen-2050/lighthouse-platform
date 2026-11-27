"use client";

import { useState } from "react";
import { TablaLibro } from "@/components/ui/tabla-libro";
import { enteroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { MotivoLibro, MovimientoLibro } from "@/lib/invertir/barrios";
import { usdEn } from "@/lib/lotes/formato";

export const FILAS_VISIBLES = 8;
export type FiltroLibro = "todo" | MotivoLibro;

export function filtrarLibroBarrio(libro: MovimientoLibro[], filtro: FiltroLibro): MovimientoLibro[] {
  return filtro === "todo" ? libro : libro.filter((m) => m.motivo === filtro);
}

/** Libro del barrio como explorador (ux-invertir, design §3): 8 filas, "Ver todo el libro (N movimientos)" y filtro por motivo con pastillas `aria-pressed`. */
export function LibroBarrio({ libro, abiertoInicial = false }: { libro: MovimientoLibro[]; abiertoInicial?: boolean }) {
  const idioma = useIdioma();
  const t = useTextos("invertir").libro;
  const [filtro, setFiltro] = useState<FiltroLibro>("todo");
  const [abierto, setAbierto] = useState(abiertoInicial);
  const lista = filtrarLibroBarrio(libro, filtro);
  const visibles = abierto ? lista : lista.slice(0, FILAS_VISIBLES);
  const filas = visibles.map((f) => ({
    fecha: t.mes(enteroEn(f.mes, idioma)),
    motivo: t.motivos[f.motivo],
    monto: f.monto === null ? null : usdEn(f.monto, idioma),
  }));
  const FILTROS: { id: FiltroLibro; texto: string }[] = [
    { id: "todo", texto: t.todo },
    { id: "cuotas", texto: t.filtros.cuotas },
    { id: "devolucion", texto: t.filtros.devolucion },
    { id: "comun", texto: t.filtros.comun },
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
            {filtro === f.id && <span aria-hidden="true">✓ </span>}
            {f.texto}
          </button>
        ))}
      </div>
      {filas.length === 0 ? <p className="text-sm text-muted">{t.vacio}</p> : <TablaLibro titulo={t.titulo} filas={filas} dosLineasEnCelular />}
      {lista.length > FILAS_VISIBLES && (
        <details open={abierto} onToggle={(e) => setAbierto((e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="w-fit cursor-pointer text-sm font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            {t.verTodo(enteroEn(lista.length, idioma))}
          </summary>
        </details>
      )}
      <p className="text-sm text-muted">{t.nota}</p>
    </div>
  );
}
