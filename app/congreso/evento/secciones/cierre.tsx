import type { ReactNode } from "react";
import type { Evento } from "@/lib/congreso/evento";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";
import { Boton } from "../boton";

type Props = {
  cierre: Evento["cierre"];
  /** Botón secundario opcional (por ejemplo la página oficial del evento). Sin él no se dibuja nada. */
  accionSecundaria?: ReactNode;
  idioma?: Idioma;
};

/** Cierre: la frase grande, las dos acciones y el pie. */
export function Cierre({ cierre, accionSecundaria, idioma = "es" }: Props) {
  const t = textosEvento(idioma);
  return (
    <section className="ev-cierre" aria-labelledby="t-cierre">
      <div className="ev-cont">
        <h2 id="t-cierre">{cierre.frase}</h2>
        <div className="ev-cierre-acc">
          <Boton variante="corona" href="#entradas">
            {t.reservarMiLugar}
          </Boton>
          <Boton variante="linea-clara" href="#tribus">
            {t.llegarConMiTribu}
          </Boton>
          {accionSecundaria}
        </div>
        <footer className="ev-pie">
          <span>{cierre.convocan}</span>
          <span>{cierre.entradasCon}</span>
        </footer>
      </div>
    </section>
  );
}
