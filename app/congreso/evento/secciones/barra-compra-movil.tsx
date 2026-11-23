import type { TipoEntrada } from "@/lib/congreso/evento";
import { textoPrecio } from "@/lib/congreso/formatos";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";
import { Boton } from "../boton";

type Props = { tipos: TipoEntrada[]; hrefEntradas?: string; idioma?: Idioma };

/** Barra fija de abajo en pantallas angostas: precio de la entrada destacada (con "ejemplo") y enlace a Entradas. */
export function BarraCompraMovil({ tipos, hrefEntradas = "#entradas", idioma = "es" }: Props) {
  const t = textosEvento(idioma);
  const tipo = tipos.find((x) => x.destacado) ?? tipos[0];
  const conPrecio = tipo?.precio && tipo.precio.monto > 0;
  return (
    <div className="ev-barra-compra">
      <span>
        {tipo ? (conPrecio ? `${t.desde} ${textoPrecio(tipo, idioma)}` : t.precioSinDato) : t.entradas}
        {conPrecio && tipo.esEjemplo ? <small> {t.ejemplo}</small> : null}
      </span>
      <Boton variante="corona" chico href={hrefEntradas}>
        {t.entradas}
      </Boton>
    </div>
  );
}
