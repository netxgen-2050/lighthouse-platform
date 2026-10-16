import type { ReactNode } from "react";
import type { TipoEntrada } from "@/lib/congreso/evento";
import { textoPrecio } from "@/lib/congreso/formatos";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";
import { Boton } from "./boton";

type Props = {
  tipo: TipoEntrada;
  /** Marca legal (⚖) que pone quien compone la página; sin ella la tarjeta se dibuja igual. */
  marcaLegal?: ReactNode;
  /** Reemplaza el botón por defecto. */
  accion?: ReactNode;
  /** Acción del botón por defecto cuando la tarjeta está dentro de un componente cliente. */
  alComprar?: () => void;
  /** Destino del botón por defecto, si es un enlace. */
  hrefComprar?: string;
  idioma?: Idioma;
};

export function TarjetaEntrada({ tipo, marcaLegal, accion, alComprar, hrefComprar, idioma = "es" }: Props) {
  const t = textosEvento(idioma);
  const sinDato = !tipo.precio || !(tipo.precio.monto > 0);
  return (
    <article className={`ev-entrada${tipo.destacado ? " ev-entrada-destacada" : ""}`} data-entrada={tipo.id}>
      <span className="ev-entrada-etiqueta">
        {tipo.destacado ? <span className="ev-solo-lectores">{t.destacado}</span> : null}
        {tipo.etiqueta}
      </span>
      <h3>{tipo.nombre}</h3>
      <p>{tipo.descripcion}</p>
      <div className={`ev-precio${sinDato ? " ev-precio-sin-dato" : ""}`}>
        {textoPrecio(tipo, idioma)}
        {!sinDato && tipo.esEjemplo ? <small>{t.ejemplo}</small> : null}
        {marcaLegal}
      </div>
      <div className="ev-entrada-acciones">
        {accion ?? (
          <Boton variante={tipo.destacado ? "corona" : "linea-clara"} href={hrefComprar} onClick={alComprar}>
            {tipo.textoBoton}
          </Boton>
        )}
      </div>
    </article>
  );
}
