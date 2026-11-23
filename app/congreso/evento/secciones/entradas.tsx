import type { ReactNode } from "react";
import type { Evento, TipoEntrada } from "@/lib/congreso/evento";
import type { Idioma } from "@/lib/congreso/idioma";
import { TarjetaEntrada } from "../tarjeta-entrada";

type Props = {
  entradas: Evento["entradas"];
  /**
   * Acción de cada tarjeta (el botón "Comprar …"). La pone quien compone la página: NetX pasa un botón de demostración
   * y una página externa pasaría un enlace a su compra. Sin ella la tarjeta no tiene ningún enlace: esta pieza nunca
   * inventa un destino de compra.
   */
  accion?: (tipo: TipoEntrada) => ReactNode;
  /** Marca legal (⚖) del ticket, junto a la nota. */
  marcaLegal?: ReactNode;
  idioma?: Idioma;
};

/** "Entradas": los tipos de entrada con su precio (con la marca "ejemplo" cuando lo es). */
export function Entradas({ entradas, accion, marcaLegal, idioma = "es" }: Props) {
  return (
    <section className="ev-seccion ev-entradas-seccion" id="entradas" aria-labelledby="t-entradas">
      <div className="ev-cont">
        <h2 id="t-entradas">{entradas.titulo}</h2>
        <p className="ev-bajada">{entradas.bajada}</p>
        <div className="ev-entradas">
          {entradas.tipos.map((t) => (
            <TarjetaEntrada key={t.id} tipo={t} accion={accion?.(t)} idioma={idioma} />
          ))}
        </div>
        <p className="ev-nota-entradas">
          {entradas.nota}
          {marcaLegal}
        </p>
      </div>
    </section>
  );
}
