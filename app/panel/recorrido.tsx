"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoEvento } from "@/components/texto-evento";
import { listarActividad, type EventoActividad } from "@/lib/actividad/actividad";
import { EVENTO_CAMBIO, leerActividadDelNavegador } from "@/lib/actividad/almacen";
import { personaEnSesion } from "@/lib/demo/claves";
import { guardarRegistros, leerRegistrosDelNavegador, sincronizarValidaciones, tribusQueValidan } from "@/lib/gobernanza/registros";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { agruparPorDia, etiquetaDelDia, horaDelEvento } from "@/lib/panel/linea-tiempo";
import { leerProgreso, proximoPaso, type Progreso } from "@/lib/panel/proximo-paso";
import { buscarTribu } from "@/lib/tribus/datos";
import { TablaBitacora } from "./bitacora/tabla-bitacora";

export type Pestana = "camino" | "bitacora";

const PESTANAS: readonly Pestana[] = ["camino", "bitacora"];

const ENLACE_PRINCIPAL =
  "w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function Recorrido({ pestanaInicial = "camino" }: { pestanaInicial?: Pestana }) {
  const idioma = useIdioma();
  const t = useTextos("recorrido");
  const comunes = useTextos("comunes");
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  // Se guarda el progreso y no el paso ya armado: así el paso cambia de idioma sin volver a leer el navegador.
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [actividad, setActividad] = useState<EventoActividad[]>([]);
  const [pestana, setPestana] = useState<Pestana>(pestanaInicial);
  // Tribus que validan a la persona (simulado): su membresía aceptada, guardada como registro que no se edita.
  const [validaciones, setValidaciones] = useState<string[]>([]);
  const gob = useTextos("gobernanza").recorrido;

  useEffect(() => {
    const leerActividad = () => setActividad(listarActividad(leerActividadDelNavegador(), new Date()));
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setProgreso(leerProgreso((c) => window.localStorage.getItem(c)));
      const miembro = comunidadesDondeEsMiembro(leerMembresiaDelNavegador()).filter(
        (c) => c !== COMUNIDAD_LIGHTHOUSE && buscarTribu(c) !== undefined,
      );
      const persona = personaEnSesion() ?? "yo";
      const previos = leerRegistrosDelNavegador();
      const actual = sincronizarValidaciones(previos, persona, miembro, new Date().toISOString());
      if (actual.length !== previos.length) guardarRegistros(actual);
      setValidaciones(tribusQueValidan(persona, actual));
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
    setPestana(PESTANAS[destino]);
    document.getElementById(`pestana-${PESTANAS[destino]}`)?.focus();
  }

  const aviso = (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">{t.modoDemo}</p>
  );

  if (!listo) return <p role="status">{comunes.cargando}</p>;

  if (falloAlmacen) {
    return (
      <div className="grid gap-4">
        {aviso}
        <p role="alert" className="text-sm font-medium text-danger">
          Error: {t.errorLectura}
        </p>
      </div>
    );
  }

  const paso = progreso ? proximoPaso(progreso, idioma) : null;
  const grupos = agruparPorDia(actividad);

  return (
    <div className="grid gap-6">
      <section aria-labelledby="proximo" className="grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
        <h2 id="proximo" className="text-xl font-semibold">{t.proximo.titulo}</h2>
        {paso ? (
          <>
            <p className="font-medium">{paso.titulo}</p>
            <p>{paso.detalle}</p>
            <Link href={paso.href} className={ENLACE_PRINCIPAL}>{paso.boton}</Link>
          </>
        ) : (
          <p>{t.proximo.todoHecho}</p>
        )}
      </section>

      <div className="grid gap-4">
        <div role="tablist" aria-label={t.pestanas.aria} className="flex flex-wrap gap-2 border-b border-line pb-2">
          {PESTANAS.map((clave, i) => {
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
                {t.pestanas[clave]}
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
              <p className="rounded-xl border border-faint bg-surface p-4">{t.vacio}</p>
            ) : (
              <div className="grid gap-5">
                {grupos.map((g) => (
                  <section key={g.dia} aria-labelledby={`dia-${g.dia}`} className="grid gap-2">
                    <h3 id={`dia-${g.dia}`} className="font-semibold">
                      <time dateTime={g.dia}>{etiquetaDelDia(g.dia, idioma)}</time>
                    </h3>
                    <ul className="grid gap-2">
                      {g.eventos.map((e) => (
                        <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 rounded-xl border border-faint bg-surface px-4 py-2">
                          <time className="text-sm text-muted" dateTime={e.visibleDesde ?? e.fecha}>{horaDelEvento(e, idioma)}</time>
                          <Link href={e.enlace} className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
                            <TextoEvento evento={e} />
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
                {t.bitacora.intro}
                <TerminoLegal clave="bitacora" idioma={idioma} />
              </p>
              <p className="max-w-2xl text-sm text-muted">{t.bitacora.prototipo}</p>
              <TablaBitacora />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {aviso}
        <p className="text-sm">
          {t.borrarAntes}
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/configuracion">
            {t.borrarEnlace}
          </Link>
          .
        </p>
      </div>

      <section aria-labelledby="validaciones" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <h2 id="validaciones" className="text-xl font-semibold">
          {gob.titulo}
          <TerminoLegal clave="validacioncomun" idioma={idioma} />
        </h2>
        {validaciones.length === 0 ? (
          <p>{gob.ninguna}</p>
        ) : (
          <ul className="grid gap-1">
            {validaciones.map((id) => (
              <li key={id}>
                <span aria-hidden="true">✓ </span>
                {gob.validadaPor(buscarTribu(id)?.nombre ?? id)}
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted">{gob.nota}</p>
      </section>
    </div>
  );
}
