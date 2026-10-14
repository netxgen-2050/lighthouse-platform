import { Boton } from "./boton";

export type AnclaBarra = { href: string; etiqueta: string };

type Props = {
  nombre: string;
  anclas: AnclaBarra[];
  hrefInicio?: string;
  hrefEntradas?: string;
  idioma?: string;
};

/** Barra flotante del evento. En pantallas angostas las anclas se esconden; el logo y "Entradas" quedan. */
export function BarraEvento({ nombre, anclas, hrefInicio = "#inicio", hrefEntradas = "#entradas", idioma = "ES" }: Props) {
  return (
    <div className="ev-barra">
      <div className="ev-barra-in">
        <a className="ev-logo" href={hrefInicio}>
          <span className="ev-logo-anillo" aria-hidden="true" />
          <span>{nombre}</span>
        </a>
        <nav className="ev-barra-links" aria-label="Secciones del evento">
          {anclas.map((a) => (
            <a key={a.href} href={a.href}>
              {a.etiqueta}
            </a>
          ))}
        </nav>
        <div className="ev-barra-acc">
          <span className="ev-idioma">{idioma}</span>
          <Boton variante="corona" chico href={hrefEntradas}>
            Entradas
          </Boton>
        </div>
      </div>
    </div>
  );
}
