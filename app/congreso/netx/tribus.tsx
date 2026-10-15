import Link from "next/link";
import { tribusConTicket } from "@/lib/congreso/tribus-con-ticket";
import { TEXTO_ESTADO } from "@/lib/tribus/tipos";
import { TEXTO_TRIBUS } from "./textos";

/** "Tribus": cuántas personas de cada tribu ya tienen ticket (cifras de ejemplo), en texto y con una barra decorativa. */
export function Tribus() {
  const tribus = tribusConTicket();
  return (
    <section className="ev-seccion ev-tribus-seccion" id="tribus" aria-labelledby="t-tribus">
      <div className="ev-cont ev-tribus-grid">
        <div>
          <h2 id="t-tribus">{TEXTO_TRIBUS.titulo}</h2>
          <p className="ev-bajada">{TEXTO_TRIBUS.bajada}</p>
          <div className="ev-tribus-acciones">
            <Link className="ev-boton ev-boton-noche" href="/tribus">
              {TEXTO_TRIBUS.encontrar}
            </Link>
            <a className="ev-boton ev-boton-linea" href="#entradas">
              {TEXTO_TRIBUS.precio}
            </a>
          </div>
        </div>
        <ul className="ev-tribus-lista" aria-label={TEXTO_TRIBUS.lista}>
          {tribus.map(({ tribu, conTicket, total }) => (
            <li className="ev-tribu" key={tribu.id}>
              <b>{tribu.nombre}</b>
              <span className="ev-tribu-n">
                {conTicket} de {total} van
              </span>
              <div className="ev-tribu-barra" aria-hidden="true">
                <i style={{ width: `${Math.round((conTicket / total) * 100)}%` }} />
              </div>
              <small>
                {TEXTO_ESTADO[tribu.estado]} · {TEXTO_TRIBUS.ejemplo}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
