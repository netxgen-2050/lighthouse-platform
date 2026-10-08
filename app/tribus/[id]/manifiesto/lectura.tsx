"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import type { Manifiesto } from "@/lib/manifiestos/datos";
import { useMembresia } from "@/lib/membresia/usar-membresia";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2 disabled:cursor-not-allowed disabled:opacity-60`;
const SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;

const HUELGA = 8; // píxeles de tolerancia para dar por llegado al final

export function LecturaManifiesto({ manifiesto: m, pactos }: { manifiesto: Manifiesto; pactos: boolean }) {
  const { estado, cargado, falloAlmacen, adherir, aceptar } = useMembresia(m.id);
  const esLighthouse = m.id === "lighthouse";
  const texto = useRef<HTMLDivElement>(null);
  const [llegoAlFinal, setLlegoAlFinal] = useState(false);
  const [leyo, setLeyo] = useState(false);
  const [cuidar, setCuidar] = useState(false);

  const revisarFinal = useCallback(() => {
    const el = texto.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= HUELGA) setLlegoAlFinal(true);
  }, []);

  // Si el texto entra entero en pantalla, ya está "leído hasta el final".
  useEffect(() => {
    revisarFinal();
    window.addEventListener("resize", revisarFinal);
    return () => window.removeEventListener("resize", revisarFinal);
  }, [revisarFinal, cargado]);

  const puede = llegoAlFinal && leyo && cuidar;
  const faltan: string[] = [];
  if (!llegoAlFinal) faltan.push("llegar al final del texto");
  if (!leyo || !cuidar) faltan.push("marcar las dos casillas");

  return (
    <>
      <h1 className="mt-4 text-3xl font-semibold">{m.titulo}</h1>
      <p className="mt-1 text-sm text-muted">
        Versión del {m.version} <span className="rounded-full border border-faint px-2 py-0.5 text-xs">(ejemplo)</span>
        <TerminoLegal clave="adhesion" />
      </p>

      <div
        ref={texto}
        onScroll={revisarFinal}
        role="region"
        aria-label="Texto del manifiesto"
        tabIndex={0}
        className="mt-4 grid max-h-[28rem] gap-4 overflow-y-auto rounded-xl border border-faint bg-surface p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <p>{m.introduccion}</p>
        <ol className="grid gap-3">
          {m.compromisos.map((c, i) => (
            <li key={c.titulo} className="grid gap-1">
              <h2 className="font-semibold">
                {i + 1}. {c.titulo}
              </h2>
              <p>{c.texto}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">Fin del manifiesto.</p>
      </div>

      {!cargado ? null : estado === "no-miembro" ? (
        <form
          className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (puede) adherir();
          }}
        >
          <h2 className="text-lg font-semibold">Antes de adherir</h2>
          <p className="text-sm">
            Sumarte a {esLighthouse ? "el Lighthouse" : m.comunidad} es pertenecer a un grupo de personas reales. Tomate el tiempo
            que necesites.
          </p>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 size-4" checked={leyo} onChange={(e) => setLeyo(e.target.checked)} />
            <span>Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 size-4" checked={cuidar} onChange={(e) => setCuidar(e.target.checked)} />
            <span>
              Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos
            </span>
          </label>
          <button type="submit" className={PRIMARIO} disabled={!puede} aria-describedby="adherir-ayuda">
            Adherir
          </button>
          <p id="adherir-ayuda" className="text-sm text-muted">
            {puede
              ? "Tu pedido le llega a quien administra la comunidad, que decide si te acepta."
              : `Para adherir falta ${faltan.join(" y ")}.`}
          </p>
        </form>
      ) : estado === "pedido" ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
          <p role="status" className="font-medium">
            Tu pedido llegó {esLighthouse ? "al Lighthouse" : `a ${m.comunidad}`}. Quien {esLighthouse ? "lo" : "la"} administra lo va a
            revisar.
          </p>
          <button type="button" className={PRIMARIO} onClick={aceptar}>
            Simular: la comunidad me acepta
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
          <p role="status" className="font-medium">
            Ya sos parte de {esLighthouse ? "el Lighthouse" : m.comunidad}.
          </p>
          <div className="flex flex-wrap gap-3">
            {pactos && (
              <Link className={PRIMARIO} href={`/pactos?comunidad=${m.id}`}>
                Proponer mi pacto
              </Link>
            )}
            <Link className={SUAVE} href={esLighthouse ? "/territorios/lighthouse" : `/tribus/${m.id}`}>
              Volver
            </Link>
          </div>
        </div>
      )}
      {falloAlmacen && (
        <p role="alert" className="mt-2 text-sm font-medium">
          No se pudo guardar en este navegador: la membresía vale solo hasta que recargues la página.
        </p>
      )}
    </>
  );
}
