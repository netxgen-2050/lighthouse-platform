"use client";

import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { DetalleEquipo } from "./detalle-equipo";
import { formaDe } from "./formas";
import { C } from "./formas/piezas";
import "./participa.css";
import { DefsIlustracion, PapelGranulado, Territorio, type NombresMapa } from "./territorio";
import type { EquipoVista } from "./tipos";
import { ALTO_MAPA, ANCHO_MAPA, lineasDeNombre, ubicacionDe } from "./ubicaciones";

const ZOOMS = [1, 1.5, 2, 3] as const;
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Cambia `?equipo=` en la barra de direcciones sin recargar y sin sumar entradas al historial. */
function escribirEquipoEnLaUrl(corto: string | null) {
  const url = new URL(window.location.href);
  if (corto) url.searchParams.set("equipo", corto);
  else url.searchParams.delete("equipo");
  window.history.replaceState(window.history.state, "", url);
}

/** El cartel con el nombre del equipo, como una banderita de madera: dos líneas como mucho y la cantidad de posiciones. */
function Cartel({ nombre, cantidad }: { nombre: string; cantidad: number }) {
  const lineas = lineasDeNombre(nombre);
  const fs = 27;
  const ancho = Math.round(Math.max(...lineas.map((l) => l.length)) * fs * 0.55 + 34);
  const alto = lineas.length * 31 + 14;
  const y0 = 64;
  return (
    <g>
      <rect x={-ancho / 2 + 18} y={y0 - 10} width={7} height={alto + 22} rx={2} fill={C.arcilla} />
      <rect x={ancho / 2 - 25} y={y0 - 10} width={7} height={alto + 22} rx={2} fill={C.arcilla} />
      <rect x={-ancho / 2 + 3} y={y0 + 4} width={ancho} height={alto} rx={12} fill={C.trazo} fillOpacity={0.2} />
      <rect className="forma-cartel-caja" x={-ancho / 2} y={y0} width={ancho} height={alto} rx={12} />
      {lineas.map((l, i) => (
        <text key={l} className="forma-cartel-texto" x={0} y={y0 + 29 + i * 31} fontSize={fs} textAnchor="middle">
          {l}
        </text>
      ))}
      <circle className="forma-cartel-numero" cx={ancho / 2 - 4} cy={y0 + 2} r={17} />
      <text className="forma-cartel-cifra" x={ancho / 2 - 4} y={y0 + 9} fontSize={21} textAnchor="middle">
        {cantidad}
      </text>
    </g>
  );
}

export function MapaEquipos({ equipos, inicial, nombres }: { equipos: EquipoVista[]; inicial: string | null; nombres: NombresMapa }) {
  const t = useTextos("participa");
  const idUnico = useId();
  const idTitulo = `${idUnico}-titulo`;
  const idDesc = `${idUnico}-desc`;
  const idDialogo = `${idUnico}-equipo`;
  const [zoom, setZoom] = useState<number>(1);
  const [activo, setActivo] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(() => (equipos.some((e) => e.id === inicial) ? inicial : null));
  const dialogo = useRef<HTMLDialogElement>(null);
  const disparador = useRef<Element | null>(null);

  const equipoAbierto = equipos.find((e) => e.id === abierto) ?? null;

  const abrir = useCallback(
    (id: string, origen?: Element | null) => {
      disparador.current = origen ?? document.activeElement;
      setAbierto(id);
      const e = equipos.find((x) => x.id === id);
      if (e) escribirEquipoEnLaUrl(e.corto);
    },
    [equipos],
  );

  // El diálogo nativo se abre y se cierra según el estado: el foco queda atrapado adentro y Escape lo cierra.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    else if (!abierto && d.open) d.close();
  }, [abierto]);

  const cerrar = useCallback(() => {
    const id = abierto;
    setAbierto(null);
    escribirEquipoEnLaUrl(null);
    // El foco vuelve a la forma (o al botón) que abrió el detalle; con un enlace directo, a la forma del equipo.
    const origen = disparador.current instanceof HTMLElement && disparador.current.isConnected ? disparador.current : null;
    const destino = origen ?? (id ? document.querySelector<HTMLElement>(`[data-equipo="${id}"]`) : null);
    destino?.focus();
  }, [abierto]);

  function alTeclear(e: KeyboardEvent, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir(id, e.currentTarget);
    }
  }

  const indice = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number]);
  const cambiarZoom = (delta: number) => setZoom(ZOOMS[Math.min(Math.max(indice + delta, 0), ZOOMS.length - 1)]);
  const globo = equipos.find((e) => e.id === activo) ?? null;
  const posGlobo = globo ? ubicacionDe(globo.id, equipos.indexOf(globo)) : null;

  return (
    <div className="grid gap-8">
      <div className="relative">
        <div
          role="region"
          aria-label={t.mapa.regionAria}
          tabIndex={zoom > 1 ? 0 : undefined}
          className={`overflow-auto rounded-2xl border-2 border-faint bg-surface ${FOCO}`}
        >
          <div className="relative" style={{ width: `${zoom * 100}%` }}>
            <svg
              viewBox={`0 0 ${ANCHO_MAPA} ${ALTO_MAPA}`}
              role="group"
              aria-labelledby={idTitulo}
              aria-describedby={idDesc}
              className="mapa-ilus"
              data-activo={activo ?? undefined}
            >
              <title id={idTitulo}>{t.mapa.svgTitulo}</title>
              <desc id={idDesc}>{t.mapa.svgDesc}</desc>
              <DefsIlustracion />
              <g aria-hidden="true">
                <Territorio nombres={nombres} />
                <rect className="mapa-velo" width={ANCHO_MAPA} height={ALTO_MAPA} />
              </g>
              {equipos.map((e, i) => {
                const { x, y } = ubicacionDe(e.id, i);
                const Forma = formaDe(e.id);
                const cantidad = e.posiciones.length;
                return (
                  <g
                    key={e.id}
                    className="forma"
                    role="button"
                    tabIndex={0}
                    aria-label={t.mapa.etiquetaForma(e.nombre, cantidad)}
                    data-equipo={e.id}
                    data-activa={activo === e.id ? "" : undefined}
                    transform={`translate(${x} ${y})`}
                    onClick={(ev) => abrir(e.id, ev.currentTarget)}
                    onKeyDown={(ev) => alTeclear(ev, e.id)}
                    onPointerEnter={() => setActivo(e.id)}
                    onPointerLeave={() => setActivo((a) => (a === e.id ? null : a))}
                    onFocus={() => setActivo(e.id)}
                    onBlur={() => setActivo((a) => (a === e.id ? null : a))}
                  >
                    {/* Zona sensible: más grande que el dibujo, para que sea fácil acertar. */}
                    <ellipse cx={0} cy={-26} rx={124} ry={96} fill="none" pointerEvents="all" />
                    <g className="forma-contorno">
                      <ellipse className="forma-contorno-luz" cx={0} cy={-18} rx={122} ry={84} />
                      <ellipse className="forma-contorno-acento" cx={0} cy={-18} rx={122} ry={84} />
                    </g>
                    <Forma />
                    <Cartel nombre={e.nombre} cantidad={cantidad} />
                  </g>
                );
              })}
            </svg>
            <PapelGranulado />
            {globo && posGlobo && (
              <p
                aria-hidden="true"
                className="pointer-events-none absolute z-10 w-max max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-3 py-1.5 text-center text-sm font-semibold text-surface shadow-lg"
                style={{
                  left: `clamp(8rem, ${(posGlobo.x / ANCHO_MAPA) * 100}%, calc(100% - 8rem))`,
                  top: `${((posGlobo.y - 150) / ALTO_MAPA) * 100}%`,
                }}
              >
                {t.mapa.globo(globo.nombre, globo.posiciones.length)}
              </p>
            )}
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-faint bg-surface px-3 py-1 text-xs font-medium text-ink">
          {t.mapa.marca}
        </p>
        <div role="group" aria-label={t.mapa.controlesAria} className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-faint bg-surface p-1">
          <button
            type="button"
            onClick={() => cambiarZoom(-1)}
            disabled={indice <= 0}
            aria-label={t.mapa.alejar}
            className={`grid size-9 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40 ${FOCO}`}
          >
            <Minus aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            onClick={() => cambiarZoom(1)}
            disabled={indice >= ZOOMS.length - 1}
            aria-label={t.mapa.acercar}
            className={`grid size-9 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40 ${FOCO}`}
          >
            <Plus aria-hidden="true" size={18} />
          </button>
          <span className="sr-only" role="status">
            {t.mapa.zoom(Math.round(zoom * 100))}
          </span>
        </div>
      </div>

      <section aria-labelledby={`${idUnico}-lista`} className="grid gap-3">
        <h3 id={`${idUnico}-lista`} className="text-xl font-semibold">
          {t.lista.titulo}
        </h3>
        <p className="text-sm text-muted">{t.lista.intro}</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                data-lista-equipo={e.id}
                onClick={(ev) => abrir(e.id, ev.currentTarget)}
                className={`flex min-h-14 w-full flex-col items-start justify-center rounded-xl border border-faint bg-surface px-4 py-3 text-left hover:bg-surface-2 ${FOCO}`}
              >
                <span className="font-display text-base font-semibold">{e.nombre}</span>
                <span className="text-sm text-muted">{t.mapa.posiciones(e.posiciones.length)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <dialog
        ref={dialogo}
        id={idDialogo}
        className="dialogo-equipo"
        aria-labelledby={equipoAbierto ? `${idUnico}-nombre` : undefined}
        onClose={() => {
          // Escape o `close()`: si el estado sigue abierto, es la persona quien cerró.
          if (abierto) cerrar();
        }}
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) dialogo.current?.close();
        }}
      >
        {equipoAbierto && <DetalleEquipo equipo={equipoAbierto} idTitulo={`${idUnico}-nombre`} onCerrar={() => dialogo.current?.close()} />}
      </dialog>
    </div>
  );
}
