"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { LeyendaLotes, MapaLotes } from "@/components/explorar/mapa-lotes";
import { TarjetaLote } from "@/components/explorar/tarjeta-lote";
import { AvisoEstadosLotes } from "@/components/lotes/estado-del-lote";
import { useCompras } from "@/components/lotes/usar-compras";
import { useEstadosLotes } from "@/components/lotes/usar-estados-lotes";
import { Boton } from "@/components/ui/boton";
import { Hoja } from "@/components/ui/hoja";
import {
  ESTADOS_FILTRO,
  ORDENES,
  aplicarFiltro,
  contarPorEstado,
  escribirFiltro,
  estadoBase,
  leerFiltro,
  type FiltroLotes,
  type LoteConEstado,
  type Orden,
} from "@/lib/explorar/lotes-lista";
import { useTextos } from "@/lib/idioma/cliente";
import { estadoConCompras } from "@/lib/lotes/compra";
import { listarLotes } from "@/lib/territorios/loteo";
import type { EstadoLote } from "@/lib/territorios/loteo-estados";

const CONSULTA_COMPU = "(min-width: 768px)";

/** null = todavía no se sabe (servidor e hidratación): no se arma ninguna de las dos vistas ni se carga el mapa. */
function useEsCompu(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    (avisar) => {
      const m = window.matchMedia(CONSULTA_COMPU);
      m.addEventListener("change", avisar);
      return () => m.removeEventListener("change", avisar);
    },
    () => window.matchMedia(CONSULTA_COMPU).matches,
    () => null,
  );
}

const PASTILLA =
  "inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-surface px-4 text-sm text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-pressed:border-2 aria-pressed:border-deep aria-pressed:font-semibold sm:min-h-9";

function escribirUrl(filtro: FiltroLotes, sel: string | null) {
  const url = new URL(window.location.href);
  const params = escribirFiltro(url.searchParams, filtro);
  if (sel) params.set("sel", sel);
  else params.delete("sel");
  url.search = params.toString();
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Lista y mapa de lotes (spec ux-explorar). En compu, dos columnas con el mapa fijo; en el celular, el mapa y la lista en una hoja
 * persistente. El bloque legal llega ya armado desde el servidor y va antes del mapa en el orden del DOM.
 */
export function ExploradorLotes({ encabezado, legal }: { encabezado: ReactNode; legal: ReactNode }) {
  const t = useTextos("explorar");
  const tl = useTextos("lotes").estado;
  const { compras } = useCompras();
  // Los estados según el servidor (lotes-en-la-base): lo que reservó otra persona se ve reservado.
  const { estados, fallo: falloEstados } = useEstadosLotes();
  const esCompu = useEsCompu();
  const [filtro, setFiltro] = useState<FiltroLotes>({ estados: [], orden: "numero" });
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [hojaAbierta, setHojaAbierta] = useState(false);

  useEffect(() => {
    // Enlace compartible: una sola lectura de ?estado=, ?orden= y ?sel= al hidratar.
    const params = new URLSearchParams(window.location.search);
    setFiltro(leerFiltro(params));
    setSeleccion(params.get("sel"));
  }, []);

  const todos: LoteConEstado[] = useMemo(
    () => listarLotes().map((lote) => ({ lote, estado: estadoBase(estadoConCompras(lote.id, compras, estados)) })),
    [compras, estados],
  );
  const mostrados = useMemo(() => aplicarFiltro(todos, filtro), [todos, filtro]);
  const conteo = contarPorEstado(todos);
  const visibles = useMemo(() => (filtro.estados.length === 0 ? null : new Set(mostrados.map((l) => l.lote.id))), [filtro, mostrados]);
  const elegido = seleccion ? (todos.find((l) => l.lote.id === seleccion) ?? null) : null;

  function elegir(id: string | null) {
    setSeleccion(id);
    escribirUrl(filtro, id);
  }

  function cambiar(nuevo: FiltroLotes) {
    // Si el filtro deja afuera al lote elegido, se suelta la selección (si no, quedaría resaltado y con su tarjeta flotante).
    const sigue = seleccion !== null && aplicarFiltro(todos, nuevo).some((l) => l.lote.id === seleccion);
    const sel = sigue ? seleccion : null;
    setFiltro(nuevo);
    if (sel !== seleccion) setSeleccion(sel);
    escribirUrl(nuevo, sel);
  }

  function alternarEstado(e: EstadoLote) {
    const estados = filtro.estados.includes(e) ? filtro.estados.filter((x) => x !== e) : ESTADOS_FILTRO.filter((x) => x === e || filtro.estados.includes(x));
    cambiar({ ...filtro, estados });
  }

  // Elegir un lote en el mapa lleva a su tarjeta.
  useEffect(() => {
    if (seleccion) document.getElementById(`tarjeta-de-${seleccion}`)?.scrollIntoView({ block: "nearest" });
  }, [seleccion]);

  const etiquetasEstado: Record<EstadoLote, string> = { disponible: tl.disponible, reservado: tl.reservado, vendido: tl.vendido };

  const controles = (
    <div className="grid gap-3">
      <div role="group" aria-label={t.lista.filtroEstado} className="flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map((e) => (
          <button key={e} type="button" aria-pressed={filtro.estados.includes(e)} onClick={() => alternarEstado(e)} className={PASTILLA}>
            {etiquetasEstado[e]}
          </button>
        ))}
      </div>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span>{t.lista.orden}</span>
        <select
          value={filtro.orden}
          onChange={(ev) => cambiar({ ...filtro, orden: ev.target.value as Orden })}
          className="min-h-11 rounded-[var(--radius-s)] border border-line bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep sm:min-h-9"
        >
          {ORDENES.map((o) => (
            <option key={o} value={o}>
              {t.lista.ordenes[o]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  const tarjetas = (
    <>
      <AvisoEstadosLotes fallo={falloEstados} />
      <p role="status" className="sr-only">
        {t.lista.cantidad(mostrados.length)}
      </p>
      {mostrados.length === 0 ? (
        <p className="text-sm text-muted">{t.lista.sinResultados}</p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {mostrados.map(({ lote }) => (
            <li key={lote.id}>
              <TarjetaLote lote={lote} estado={estadoConCompras(lote.id, compras, estados)} seleccionada={seleccion === lote.id} alEnfocar={elegir} />
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const mapa = (
    <MapaLotes seleccion={seleccion} alElegir={elegir} visibles={visibles} elegido={elegido} conteo={conteo} />
  );

  if (esCompu === null) {
    // Servidor e hidratación: el encabezado y el bloque legal ya salen en el HTML; el mapa llega cuando se sabe el tamaño de pantalla.
    return (
      <div className="grid gap-4">
        {encabezado}
        {legal}
        <div className="min-h-80" aria-hidden="true" />
      </div>
    );
  }

  if (!esCompu) {
    return (
      <div className="grid gap-3">
        {encabezado}
        {/* La hoja va antes del mapa en el DOM: el lector anuncia primero el estado administrativo. */}
        <Hoja
          persistente
          abierta
          alCerrar={() => setHojaAbierta(false)}
          titulo={t.lista.resumen(todos.length, conteo.disponible)}
          etiquetaCerrar={t.lista.verMapa}
          etiquetaAsa={t.lista.asa}
          expandida={hojaAbierta}
          alExpandir={setHojaAbierta}
        >
          <div className="grid gap-4 pb-6">
            {legal}
            {/* En reposo la hoja deja ver ~2rem: filtros y tarjetas no se recorren con Tab hasta que se abre. */}
            <div className="grid gap-4" inert={!hojaAbierta}>
              {controles}
              {tarjetas}
            </div>
          </div>
        </Hoja>
        {/* Se descuentan los 7rem de la hoja en reposo (max-h-28) para que la tarjeta flotante no quede tapada. */}
        <div className="relative h-[calc(100dvh-var(--alto-fijo,4.5rem)-var(--alto-barra-inferior)-7rem)] min-h-80">
          {mapa}
          <div className="absolute right-3 top-3 z-10">
            <Boton variante="secundario" tamano="s" aria-expanded={hojaAbierta} onClick={() => setHojaAbierta((a) => !a)}>
              {hojaAbierta ? t.lista.verMapa : t.lista.verLista}
            </Boton>
          </div>
        </div>
        <LeyendaLotes />
        {/* La hoja en reposo (7rem) tapa el pie, que solo reserva 4.5rem: esta marca hace que el pie (globals.css) reserve 7rem y se pueda ver y enfocar al llegar al final. */}
        <div className="h-0" aria-hidden="true" data-espacio-hoja="" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="grid min-w-0 content-start gap-4">
        {encabezado}
        {legal}
        {controles}
        {tarjetas}
      </div>
      <div className="order-first grid content-start gap-2 lg:order-none">
        <div className="h-[60dvh] lg:sticky lg:top-[calc(var(--alto-fijo,4.5rem)+3.5rem)] lg:h-[calc(100dvh-var(--alto-fijo,4.5rem)-5rem)]">
          {mapa}
        </div>
        <LeyendaLotes />
      </div>
    </div>
  );
}
