import type { ReactNode } from "react";
import type { Evento } from "@/lib/congreso/evento";

type Props = {
  recorrido: Evento["recorrido"];
  /** Marcas (por ejemplo el ⚖) por id de parada. Las pone quien compone la página. */
  marcasParada?: Record<string, ReactNode>;
  /** Etiqueta visible de la parada destacada: el destaque no se comunica solo con color. */
  etiquetaDestacada?: string;
};

/** "Recorrido": las paradas como lista ordenada, de la primera a la última. */
export function Recorrido({ recorrido, marcasParada = {}, etiquetaDestacada = "Día del eclipse" }: Props) {
  return (
    <section className="ev-seccion ev-recorrido" id="recorrido" aria-labelledby="t-recorrido">
      <div className="ev-cont">
        <h2 id="t-recorrido">{recorrido.titulo}</h2>
        <p className="ev-bajada">{recorrido.bajada}</p>
        <div className="ev-ruta">
          <svg className="ev-ruta-linea" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M30 30 C220 0 300 60 500 30 S780 0 970 30" />
          </svg>
          <ol className="ev-paradas">
            {recorrido.paradas.map((p) => (
              <li key={p.id} className={`ev-parada${p.destacada ? " ev-parada-destacada" : ""}`}>
                <div className="ev-parada-punto">{p.etiquetaCorta}</div>
                <div className="ev-parada-cuando">{p.cuando}</div>
                {p.destacada ? <span className="ev-parada-etiqueta">{etiquetaDestacada}</span> : null}
                <h3>{p.titulo}</h3>
                <p>
                  {p.texto}
                  {marcasParada[p.id]}
                </p>
                <span className="ev-parada-lugar">{p.lugar}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
