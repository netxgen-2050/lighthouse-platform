"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { CLAVES } from "@/lib/demo/claves";
import { confirmarPedido, estadoSumarme, leerPedidos, type EntradaSumarme, type PedidosEquipos } from "@/lib/equipos/equipos";
import { puedeParticiparEnGobernanza } from "@/lib/gobernanza/participar";
import { useTextos } from "@/lib/idioma/cliente";
import { leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { puedeCapacidad } from "@/lib/permisos/niveles";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function leerPedidosDelNavegador(): PedidosEquipos {
  try {
    return leerPedidos(window.localStorage.getItem(CLAVES.equipos));
  } catch {
    return {};
  }
}

/**
 * "Quiero sumarme a <equipo>": pedir ser aspirante de un círculo del común. La regla vive en `lib/equipos/equipos.ts`;
 * acá solo se lee lo del navegador y se dibuja. Antes de hidratar deja un lugar vacío de alto fijo.
 */
export function SumarmeEquipo({ circuloId, nombreEquipo }: { circuloId: string; nombreEquipo: string }) {
  const tx = useTextos("tribus");
  const t = tx.equipos.sumarme;
  const tm = tx.membresia;
  const { estado, nivel, nivelListo } = useSesion();
  const conSesion = estado === "ok";
  const [cargado, setCargado] = useState(false);
  const [pedidos, setPedidos] = useState<PedidosEquipos>({});
  const [adhirio, setAdhirio] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const titulo = useRef<HTMLParagraphElement>(null);
  const resultado = useRef<HTMLParagraphElement>(null);
  const moverAlResultado = useRef(false);

  // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor). Sin sesión no se toca.
  useEffect(() => {
    if (!conSesion) return;
    setPedidos(leerPedidosDelNavegador());
    setAdhirio(puedeParticiparEnGobernanza(leerMembresiaDelNavegador()));
    setCargado(true);
  }, [conSesion]);

  useEffect(() => {
    if (abierto) titulo.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (moverAlResultado.current && resultado.current) {
      moverAlResultado.current = false;
      resultado.current.focus();
    }
  }, [pedidos]);

  const puedeAdherir = conSesion && puedeCapacidad(nivel, "adherir");
  const entrada: EntradaSumarme = { conSesion, puedeAdherir, adhirio, pedidos, circuloId };

  // Alto fijo mientras se verifica la sesión y se lee lo guardado: nada salta ni se muestra un estado equivocado.
  if (estado === "cargando" || (conSesion && (!nivelListo || !cargado))) {
    return <div className="min-h-10" aria-hidden="true" />;
  }

  const e = estadoSumarme(entrada);

  function confirmar() {
    // Se vuelve a leer todo en este momento: una membresía retirada en otra pestaña no deja un pedido escrito.
    const ahora: EntradaSumarme = {
      ...entrada,
      adhirio: puedeParticiparEnGobernanza(leerMembresiaDelNavegador()),
      pedidos: leerPedidosDelNavegador(),
    };
    const siguiente = confirmarPedido(ahora);
    setAbierto(false);
    setAdhirio(ahora.adhirio);
    if (siguiente === null) {
      setPedidos(ahora.pedidos);
      return;
    }
    try {
      window.localStorage.setItem(CLAVES.equipos, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    moverAlResultado.current = true;
    setPedidos(siguiente);
  }

  function cancelar() {
    setAbierto(false);
    // Al cerrar, el foco vuelve al botón que abrió la confirmación.
    requestAnimationFrame(() => boton.current?.focus());
  }

  return (
    <div className="grid min-h-10 gap-2">
      {e.tipo === "sin-sesion" && <EntrarPara texto={t.entrar} />}
      {e.tipo === "sin-capacidad" && (
        <div className="grid gap-2">
          <p className="text-sm">{tm.puedesLeer}</p>
          <EntrarPara texto={tm.sumateAdherir} nivelMinimo="miembro" />
        </div>
      )}
      {e.tipo === "sin-adhesion" && (
        <div className="grid gap-2">
          <p className="text-sm">{t.sinAdhesion}</p>
          <Link className={`${SUAVE} text-sm`} href="/tribus/lighthouse/manifiesto">
            {t.verManifiesto}
          </Link>
        </div>
      )}
      {e.tipo === "puede" && (
        <>
          <button
            ref={boton}
            type="button"
            className={PRIMARIO}
            aria-expanded={abierto}
            onClick={() => setAbierto(true)}
          >
            {t.boton(nombreEquipo)}
          </button>
          {abierto && (
            <div role="group" aria-labelledby={`sumarme-${circuloId}`} className="grid gap-2 rounded-xl border border-faint bg-surface-2 p-3">
              <p id={`sumarme-${circuloId}`} ref={titulo} tabIndex={-1} className={`font-semibold ${FOCO}`}>
                {t.confirmarTitulo(nombreEquipo)}
              </p>
              <p className="text-sm">{t.confirmarTexto}</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={PRIMARIO} onClick={confirmar}>
                  {t.confirmar}
                </button>
                <button type="button" className={SUAVE} onClick={cancelar}>
                  {t.cancelar}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {e.tipo === "pedido" && (
        <p ref={resultado} role="status" tabIndex={-1} className={`font-medium ${FOCO}`}>
          {t.pedido(nombreEquipo)}
        </p>
      )}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium">
          {t.falloAlmacen}
        </p>
      )}
    </div>
  );
}
