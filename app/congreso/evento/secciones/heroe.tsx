import type { Evento } from "@/lib/congreso/evento";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";
import { Boton } from "../boton";
import { ChipFecha } from "../chip-fecha";
import { CuentaRegresiva } from "../cuenta-regresiva";
import { Eclipse } from "../eclipse";

type Props = {
  evento: Pick<Evento, "nombre" | "sobreTitulo" | "lema" | "bajada" | "fechas" | "momentoClave" | "lugar">;
  idioma?: Idioma;
};

/** Héroe del evento: eclipse decorativo, fechas, cuenta regresiva, el único h1 de la página y la tarjeta del lugar. */
export function Heroe({ evento, idioma = "es" }: Props) {
  const t = textosEvento(idioma);
  return (
    <header className="ev-hero" id="inicio">
      <div className="ev-estrellas" aria-hidden="true" />
      <Eclipse />
      <svg className="ev-horizonte" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          className="ev-horizonte-1"
          d="M0 170 L120 150 L170 120 L260 118 L300 150 L420 160 L520 130 L600 128 L640 150 L780 158 L860 120 L980 116 L1020 146 L1200 140 L1200 300 L0 300Z"
        />
        <path
          className="ev-horizonte-2"
          d="M0 220 L200 205 L340 214 L500 196 L700 210 L900 192 L1060 206 L1200 198 L1200 300 L0 300Z"
        />
        <path className="ev-horizonte-3" d="M0 250 C200 236 420 262 640 246 C840 232 1000 258 1200 244 L1200 300 L0 300Z" />
      </svg>
      <div className="ev-hero-cont">
        <div className="ev-hero-top">
          <ChipFecha inicio={evento.fechas.inicio} fin={evento.fechas.fin} idioma={idioma} />
          <CuentaRegresiva momentoIso={evento.momentoClave.iso} etiqueta={evento.momentoClave.etiqueta} idioma={idioma} />
        </div>
        <div className="ev-hero-titulo">
          <p className="ev-hero-sobre">{evento.sobreTitulo}</p>
          <h1>
            {evento.nombre}
            <span className="ev-fina">{evento.lema}</span>
          </h1>
        </div>
        <div className="ev-hero-pie">
          <p>{evento.bajada}</p>
          <div className="ev-tarjeta-lugar">
            <small>{evento.lugar.detalle}</small>
            <strong>{evento.lugar.region}</strong>
            <div className="ev-fila">
              <Boton variante="corona" href="#entradas">
                {t.quieroIr}
              </Boton>
              <Boton variante="linea" href="#recorrido">
                {t.verElRecorrido}
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
