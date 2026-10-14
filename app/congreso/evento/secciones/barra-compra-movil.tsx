import type { TipoEntrada } from "@/lib/congreso/evento";
import { textoPrecio } from "@/lib/congreso/formatos";
import { Boton } from "../boton";

/** Barra fija de abajo en pantallas angostas: precio de la entrada destacada (con "ejemplo") y enlace a Entradas. */
export function BarraCompraMovil({ tipos, hrefEntradas = "#entradas" }: { tipos: TipoEntrada[]; hrefEntradas?: string }) {
  const tipo = tipos.find((t) => t.destacado) ?? tipos[0];
  const conPrecio = tipo?.precio && tipo.precio.monto > 0;
  return (
    <div className="ev-barra-compra">
      <span>
        {tipo ? (conPrecio ? `Desde ${textoPrecio(tipo)}` : "Precio sin dato") : "Entradas"}
        {conPrecio && tipo.esEjemplo ? <small> ejemplo</small> : null}
      </span>
      <Boton variante="corona" chico href={hrefEntradas}>
        Entradas
      </Boton>
    </div>
  );
}
