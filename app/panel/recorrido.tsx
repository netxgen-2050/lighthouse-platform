"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { listarActividad, type EventoActividad } from "@/lib/actividad/actividad";
import { EVENTO_CAMBIO, leerActividadDelNavegador } from "@/lib/actividad/almacen";
import { agruparPorDia } from "@/lib/panel/linea-tiempo";
import { leerProgreso, proximoPaso, type ProximoPaso } from "@/lib/panel/proximo-paso";
import { TablaBitacora } from "./bitacora/tabla-bitacora";

export type Pestana = "camino" | "bitacora";

const PESTANAS: readonly [Pestana, string][] = [
  ["camino", "Tu camino"],
  ["bitacora", "Bitácora"],
];

const ENLACE_PRINCIPAL =
  "w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

const hora = new Intl.DateTimeFormat("es-AR", { timeStyle: "short" });
const diaLargo = new Intl.DateTimeFormat("es-AR", { dateStyle: "full" });

function horaDe(e: EventoActividad): string {
  return hora.format(new Date(e.visibleDesde ?? e.fecha));
}

export function Recorrido({ pestanaInicial = "camino" }: { pestanaInicial?: Pestana }) {
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [paso, setPaso] = useState<ProximoPaso | null>(null);
  const [actividad, setActividad] = useState<EventoActividad[]>([]);
  const [pestana, setPestana] = useState<Pestana>(pestanaInicial);

  useEffect(() => {
    const leerActividad = () => setActividad(listarActividad(leerActividadDelNavegador(), new Date()));
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setPaso(proximoPaso(leerProgreso((c) => window.localStorage.getItem(c))));
    } catch {
      setFalloAlmacen(true);
    }
    leerActividad();
    setListo(true);
    window.addEventListener(EVENTO_CAMBIO, leerActividad);
    // Los avisos simulados "un rato después" aparecen solos.
    const reloj = window.setInterval(leerActividad, 5000);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, leerActividad);
      window.clearInterval(reloj);
    };
  }, []);

  function alTeclear(e: KeyboardEvent, i: number) {
    let destino = -1;
    if (e.key === "ArrowRight") destino = (i + 1) % PESTANAS.length;
    else if (e.key === "ArrowLeft") destino = (i - 1 + PESTANAS.length) % PESTANAS.length;
    else if (e.key === "Home") destino = 0;
    else if (e.key === "End") destino = PESTANAS.length - 1;
    if (destino < 0) return;
    e.preventDefault();
    setPestana(PESTANAS[destino][0]);
    document.getElementById(`pestana-${PESTANAS[destino][0]}`)?.focus();
  }

  const aviso = (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      Modo demostración: este panel lee lo que guardaste en este navegador.
    </p>
  );

  if (!listo) return <p role="status">Cargando…</p>;

  if (falloAlmacen) {
    return (
      <div className="grid gap-4">
        {aviso}
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite leer los datos guardados en este sitio, así que el panel no puede
          mostrar tu recorrido. Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      </div>
    );
  }

  const grupos = agruparPorDia(actividad);

  return (
    <div className="grid gap-6">
      <section aria-labelledby="proximo" className="grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
        <h2 id="proximo" className="text-xl font-semibold">Tu próximo paso</h2>
        {paso ? (
          <>
            <p className="font-medium">{paso.titulo}</p>
            <p>{paso.detalle}</p>
            <Link href={paso.href} className={ENLACE_PRINCIPAL}>{paso.boton}</Link>
          </>
        ) : (
          <p>Ya recorriste todo lo que hay por ahora.</p>
        )}
      </section>

      <div className="grid gap-4">
        <div role="tablist" aria-label="Mi recorrido" className="flex flex-wrap gap-2 border-b border-line pb-2">
          {PESTANAS.map(([clave, titulo], i) => {
            const activa = pestana === clave;
            return (
              <button
                key={clave}
                id={`pestana-${clave}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${clave}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => setPestana(clave)}
                onKeyDown={(e) => alTeclear(e, i)}
                className={`rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  activa ? "bg-deep text-on-deep" : "border border-muted hover:bg-surface-2"
                }`}
              >
                {titulo}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="panel-camino"
          aria-labelledby="pestana-camino"
          hidden={pestana !== "camino"}
          tabIndex={0}
          className="grid gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          {pestana === "camino" &&
            (grupos.length === 0 ? (
              <p className="rounded-xl border border-faint bg-surface p-4">
                Todavía no hay nada en tu camino. Lo que hagas en la plataforma va a aparecer acá.
              </p>
            ) : (
              <div className="grid gap-5">
                {grupos.map((g) => (
                  <section key={g.dia} aria-labelledby={`dia-${g.dia}`} className="grid gap-2">
                    <h3 id={`dia-${g.dia}`} className="font-semibold">
                      <time dateTime={g.dia}>{diaLargo.format(new Date(`${g.dia}T12:00:00`))}</time>
                    </h3>
                    <ul className="grid gap-2">
                      {g.eventos.map((e) => (
                        <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 rounded-xl border border-faint bg-surface px-4 py-2">
                          <time className="text-sm text-muted" dateTime={e.visibleDesde ?? e.fecha}>{horaDe(e)}</time>
                          <Link href={e.enlace} className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
                            {e.texto}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ))}
        </div>

        <div
          role="tabpanel"
          id="panel-bitacora"
          aria-labelledby="pestana-bitacora"
          hidden={pestana !== "bitacora"}
          tabIndex={0}
          className="grid gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          {pestana === "bitacora" && (
            <>
              <p className="max-w-2xl text-muted">
                Lo que te mostramos: anotamos qué estado del loteo y qué explicaciones legales viste, y cuándo,
                para poder probar con qué información contabas al decidir.
                <TerminoLegal clave="bitacora" />
              </p>
              <p className="max-w-2xl text-sm text-muted">
                En el prototipo la bitácora queda solo en este navegador y la podés borrar: todavía no sirve como
                prueba. Con el login y la base de datos se va a guardar de verdad.
              </p>
              <TablaBitacora />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {aviso}
        <p className="text-sm">
          Para borrar lo que guardaste en este navegador, andá a{" "}
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/configuracion">
            Configuración, en Tus datos
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
