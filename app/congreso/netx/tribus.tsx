import Link from "next/link";
import type { Idioma } from "@/lib/congreso/idioma";
import { tribusConTicket } from "@/lib/congreso/tribus-con-ticket";
import { textosNetx } from "./textos";

/** "Tribus": cuántas personas de cada tribu ya tienen ticket (cifras de ejemplo), en texto y con una barra decorativa. */
export function Tribus({ idioma = "es" }: { idioma?: Idioma }) {
  const t = textosNetx(idioma).tribus;
  const tribus = tribusConTicket();
  return (
    <section className="ev-seccion ev-tribus-seccion" id="tribus" aria-labelledby="t-tribus">
      <div className="ev-cont ev-tribus-grid">
        <div>
          <h2 id="t-tribus">{t.titulo}</h2>
          <p className="ev-bajada">{t.bajada}</p>
          <div className="ev-tribus-acciones">
            <Link className="ev-boton ev-boton-noche" href="/tribus" hrefLang={idioma === "en" ? "es" : undefined}>
              {t.encontrar}
            </Link>
            <a className="ev-boton ev-boton-linea" href="#entradas">
              {t.precio}
            </a>
          </div>
        </div>
        <ul className="ev-tribus-lista" aria-label={t.lista}>
          {tribus.map(({ tribu, conTicket, total }) => (
            <li className="ev-tribu" key={tribu.id}>
              {/* El nombre de la tribu es un nombre propio del catálogo de NetX, que sigue en español. */}
              <b lang={idioma === "en" ? "es" : undefined}>{tribu.nombre}</b>
              <span className="ev-tribu-n">{t.van(conTicket, total)}</span>
              <div className="ev-tribu-barra" aria-hidden="true">
                <i style={{ width: `${Math.round((conTicket / total) * 100)}%` }} />
              </div>
              <small>
                {t.estado[tribu.estado]} · {t.ejemplo}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
