"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contarNoLeidas, listarNotificaciones, type EventoActividad } from "@/lib/actividad/actividad";
import { EVENTO_CAMBIO, leerActividadDelNavegador, marcarTodasLeidasEnNavegador } from "@/lib/actividad/almacen";

import { usePreferencias } from "@/lib/configuracion/almacen";
import { tiposOcultos } from "@/lib/configuracion/preferencias";

const fecha =new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });

export function BandejaCliente() {
  const [lista, setLista] = useState<EventoActividad[]>([]);
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const leer = () => setLista(leerActividadDelNavegador());
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    leer();
    setListo(true);
    window.addEventListener(EVENTO_CAMBIO, leer);
    window.addEventListener("storage", leer);
    const reloj = window.setInterval(leer, 5000);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, leer);
      window.removeEventListener("storage", leer);
      window.clearInterval(reloj);
    };
  }, []);

  const ocultos = tiposOcultos(usePreferencias());
  const ahora = new Date();
  const notificaciones = listarNotificaciones(lista, ahora, ocultos);
  const sinLeer = contarNoLeidas(lista, ahora, ocultos);

  function marcar() {
    const guardo = marcarTodasLeidasEnNavegador();
    setFalloAlmacen(!guardo);
    setAviso(guardo ? "Todas las notificaciones quedaron como leídas." : "");
  }

  return (
    <div className="grid gap-8">
      <section aria-labelledby="notificaciones" className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="notificaciones" className="text-xl font-semibold">
            Notificaciones
          </h2>
          <button
            type="button"
            onClick={marcar}
            disabled={sinLeer === 0}
            className="rounded-lg border border-muted px-4 py-1.5 font-medium hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            Marcar todas como leídas
          </button>
        </div>
        <p role="status" className="text-sm text-muted">
          {aviso}
        </p>
        {falloAlmacen && (
          <p role="alert" className="text-sm font-medium">
            No se pudo guardar en este navegador: las notificaciones vuelven a figurar sin leer al recargar.
          </p>
        )}
        {!listo ? null : notificaciones.length === 0 ? (
          <p className="rounded-xl border border-faint bg-surface p-4">
            Todavía no tenés notificaciones. Cuando una comunidad responda a lo que hiciste, te avisamos acá.
          </p>
        ) : (
          <ul className="grid gap-2">
            {notificaciones.map((n) => (
              <li key={n.id} className="rounded-xl border border-faint bg-surface p-4">
                <Link href={n.enlace} className="font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
                  {n.texto}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  <time dateTime={n.visibleDesde ?? n.fecha}>{fecha.format(new Date(n.visibleDesde ?? n.fecha))}</time>
                  {" · "}
                  <span className="font-medium">{n.leida ? "Leída" : "Sin leer"}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="mensajes" className="grid gap-3">
        <h2 id="mensajes" className="text-xl font-semibold">
          Mensajes
        </h2>
        <p className="rounded-xl border border-faint bg-surface-2 p-4">
          Pronto vas a poder recibir mensajes de tu comunidad y del equipo
        </p>
      </section>
    </div>
  );
}
