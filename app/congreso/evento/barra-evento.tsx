import type { ReactNode } from "react";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";
import { Boton } from "./boton";

export type AnclaBarra = { href: string; etiqueta: string };

type Props = {
  nombre: string;
  anclas: AnclaBarra[];
  hrefInicio?: string;
  hrefEntradas?: string;
  idioma?: Idioma;
  /** Selector de idioma que pone quien compone la página. Sin él, un indicador fijo del idioma actual. */
  selectorIdioma?: ReactNode;
};

/** Barra flotante del evento. En pantallas angostas las anclas se esconden; el logo, el idioma y "Entradas" quedan. */
export function BarraEvento({
  nombre,
  anclas,
  hrefInicio = "#inicio",
  hrefEntradas = "#entradas",
  idioma = "es",
  selectorIdioma,
}: Props) {
  const t = textosEvento(idioma);
  return (
    <div className="ev-barra">
      <div className="ev-barra-in">
        <a className="ev-logo" href={hrefInicio}>
          <span className="ev-logo-anillo" aria-hidden="true" />
          <span>{nombre}</span>
        </a>
        <nav className="ev-barra-links" aria-label={t.seccionesDelEvento}>
          {anclas.map((a) => (
            <a key={a.href} href={a.href}>
              {a.etiqueta}
            </a>
          ))}
        </nav>
        <div className="ev-barra-acc">
          {selectorIdioma ?? <span className="ev-idioma">{idioma.toUpperCase()}</span>}
          <Boton variante="corona" chico href={hrefEntradas}>
            {t.entradas}
          </Boton>
        </div>
      </div>
    </div>
  );
}
