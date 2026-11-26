"use client";

import { useEffect, useRef, useState } from "react";
import { DibujoCapital } from "./dibujos";

export type CapitalFranja = { id: string; nombre: string; texto: string };

/**
 * Los cinco capitales (ux-inicio, design §3): ícono, nombre y una línea, sin borde. En el celular van en una fila con scroll horizontal
 * y `scroll-snap`; cada ítem mide el 72 % del ancho, así el siguiente asoma y se nota que hay más. La fila se alcanza con el teclado
 * (`tabIndex=0`) para poder desplazarla con las flechas, pero solo mientras de verdad se desplaza: en compu es una grilla de cinco y no
 * es una parada de Tab. La fuente va al final.
 */
export function FranjaCapitales({
  titulo,
  etiquetaFuente,
  fuente,
  capitales,
}: {
  titulo: string;
  etiquetaFuente: string;
  fuente: string;
  capitales: CapitalFranja[];
}) {
  const fila = useRef<HTMLUListElement>(null);
  const [seDesplaza, setSeDesplaza] = useState(false);
  useEffect(() => {
    const el = fila.current;
    if (!el) return;
    const medir = () => setSeDesplaza(el.scrollWidth > el.clientWidth + 1);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return (
    <section aria-labelledby="capitales" className="mx-auto grid max-w-5xl gap-6 px-6 py-12 sm:px-10">
      <h2 id="capitales" className="text-xl font-bold">
        {titulo}
      </h2>
      <ul
        ref={fila}
        tabIndex={seDesplaza ? 0 : undefined}
        aria-labelledby="capitales"
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0"
      >
        {capitales.map((c) => (
          <li key={c.id} className="grid w-[72%] shrink-0 snap-start content-start gap-2 text-ink sm:w-auto">
            <span className="text-deep-2">
              <DibujoCapital id={c.id} tamano={32} />
            </span>
            <h3 className="font-bold">{c.nombre}</h3>
            <p className="text-sm text-muted">{c.texto}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        {etiquetaFuente}: <span lang="es">{fuente}</span>
      </p>
    </section>
  );
}
