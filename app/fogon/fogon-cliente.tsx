"use client";

import { useEffect, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import Link from "next/link";
import { CLAVES } from "@/lib/demo/claves";
import { AMBITOS, DECISIONES, OPCIONES, type Ambito, type Opcion } from "@/lib/fogon/datos";
import { contar, filtrar, INICIAL, leer, motivoSinVoto, votar, votoPropio, type Condicion, type EstadoFogon } from "@/lib/fogon/estado";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";

// Todo queda solo en este navegador: no hay pedidos de red.

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_ACTIVO = `${BOTON} border-deep bg-deep text-on-deep`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

export function FogonCliente() {
  const [estado, setEstado] = useState<EstadoFogon>(INICIAL);
  const [ambito, setAmbito] = useState<Ambito | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [condicion, setCondicion] = useState<Condicion>(undefined);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setCondicion(leerPasaporteDelNavegador().residencia);
    try {
      setEstado(leer(window.localStorage.getItem(CLAVES.fogon)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function guardar(siguiente: EstadoFogon): boolean {
    try {
      window.localStorage.setItem(CLAVES.fogon, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
      return false;
    }
    setEstado(siguiente);
    return true;
  }

  function elegir(id: string, opcion: Opcion) {
    const d = DECISIONES.find((x) => x.id === id);
    if (!d || !guardar(votar(estado, id, opcion, condicion))) return;
    setAbierta(null);
    // Se vacía primero y se escribe en el próximo tick: si el texto es igual al anterior (mismo voto
    // repetido), React no tocaría el DOM y el lector de pantalla no anunciaría nada.
    const texto = `Tu voto quedó registrado: ${OPCIONES.find((o) => o.id === opcion)!.etiqueta} en «${d.titulo}» (simulado).`;
    setAnuncio("");
    setTimeout(() => setAnuncio(texto), 50);
    // El grupo de opciones se cierra: el foco vuelve al botón que lo abrió, en la misma decisión.
    document.getElementById(`abrir-${id}`)?.focus();
  }

  const lista = filtrar(ambito);

  return (
    <div className="grid gap-5">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el voto no se puede guardar. Revisá la
          configuración de privacidad o probá en otro navegador.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar por ámbito" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={ambito === null} onClick={() => setAmbito(null)} className={ambito === null ? BOTON_ACTIVO : BOTON_SUAVE}>
            {ambito === null && <span aria-hidden="true">✓ </span>}Todas
          </button>
          {AMBITOS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={ambito === a.id}
              onClick={() => setAmbito(a.id)}
              className={ambito === a.id ? BOTON_ACTIVO : BOTON_SUAVE}
            >
              {ambito === a.id && <span aria-hidden="true">✓ </span>}
              {a.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3">
        {lista.map((d) => {
          // Hasta terminar de leer lo guardado (residencia) no se muestra ni el motivo ni el botón.
          const motivo = listo ? motivoSinVoto(d, condicion) : null;
          const propio = votoPropio(estado, d, condicion);
          const c = contar(d, propio);
          const idTitulo = `dec-${d.id}`;
          return (
            <li key={d.id} aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <h2 id={idTitulo} className="font-semibold">{d.titulo}</h2>
                  <p className="flex flex-wrap gap-2">
                    <span className={CHIP}>{d.donde}</span>
                    <span className={`${CHIP} border-deep text-deep`}>
                      {d.regla}
                      <TerminoLegal clave={d.base} />
                    </span>
                    {d.ambito === "tribu" && <span className={CHIP}>Tribu</span>}
                  </p>
                </div>
                <div className="text-right">
                  {!listo ? null : motivo ? (
                    <span className={`${CHIP} text-muted`}>{motivo}</span>
                  ) : (
                    <button
                      type="button"
                      id={`abrir-${d.id}`}
                      aria-expanded={abierta === d.id}
                      aria-controls={`votar-${d.id}`}
                      onClick={() => setAbierta(abierta === d.id ? null : d.id)}
                      className={BOTON_SUAVE}
                    >
                      {propio ? "Cambiar voto" : "Votar"}
                    </button>
                  )}
                </div>
              </div>

              {abierta === d.id && !motivo && (
                <div id={`votar-${d.id}`} role="group" aria-label={`Tu voto: ${d.titulo}`} className="flex flex-wrap gap-2">
                  {OPCIONES.map((o) => (
                    <button key={o.id} type="button" onClick={() => elegir(d.id, o.id)} className={BOTON_SUAVE}>
                      {o.etiqueta}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted">
                Votos de ejemplo: A favor {c.favor} · En contra {c.contra} · Abstención {c.abstencion}
              </p>
              {listo && propio && (
                <p className="rounded-lg border border-deep bg-green-soft px-3 py-2 text-sm text-deep">
                  <span aria-hidden="true">✓ </span>
                  Tu voto: {OPCIONES.find((o) => o.id === propio)!.etiqueta} (simulado)
                  <span className="block">
                    Acta (ejemplo): votaste {OPCIONES.find((o) => o.id === propio)!.etiqueta.toLowerCase()} en
                    «{d.titulo}». Tu voto quedó registrado en el historial del acta (simulado).
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p role="status" className="sr-only">
        {anuncio}
      </p>

      {listo && (
        <p className="text-sm text-muted">
          {condicion === "argentina"
            ? "Con tu residencia fiscal en Argentina (simulado) votás en la Asamblea y en la asamblea del fideicomiso."
            : condicion === "exterior"
              ? "Con tu residencia fiscal en el exterior participás en tu tribu y ves las actas de la Asamblea; no votás en la asamblea del fideicomiso."
              : (
                <>
                  Todavía no cargaste tu residencia fiscal, así que no sabemos en qué asambleas podés votar.{" "}
                  <Link className="underline" href="/pasaporte">Cargala en Tus datos</Link>.
                </>
              )}
        </p>
      )}
    </div>
  );
}
