import type { ReactNode } from "react";
import type { Evento } from "@/lib/congreso/evento";

type Props = {
  encuentro: Evento["encuentro"];
  /** Marcas (por ejemplo el ⚖) que se dibujan al final del párrafo con ese índice. Las pone quien compone la página. */
  marcasParrafo?: Record<number, ReactNode>;
};

/** "El encuentro": manifiesto sobre el amanecer y dos columnas de texto. */
export function Encuentro({ encuentro, marcasParrafo = {} }: Props) {
  return (
    <section className="ev-seccion ev-acerca" id="acerca" aria-labelledby="t-acerca">
      <div className="ev-cont">
        <h2 id="t-acerca" className="ev-manifiesto">
          {encuentro.manifiesto} <em>{encuentro.destacado}</em>
        </h2>
        <div className="ev-acerca-grid">
          {encuentro.parrafos.map((p, i) => (
            <p key={p}>
              {p}
              {marcasParrafo[i]}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
