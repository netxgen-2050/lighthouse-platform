import type { Cifra } from "@/lib/congreso/evento";
import type { Idioma } from "@/lib/congreso/idioma";
import { textosEvento } from "@/lib/congreso/interfaz";

/** Franja de cifras del evento. Un valor ausente se muestra como "sin dato", nunca como 0. */
export function Cifras({ cifras, idioma = "es" }: { cifras: Cifra[]; idioma?: Idioma }) {
  const t = textosEvento(idioma);
  return (
    <div className="ev-cifras">
      {cifras.map((c) => (
        <div className="ev-cifra" key={c.etiqueta}>
          <b>{c.valor.trim() === "" ? t.sinDato : c.valor}</b>
          <span>{c.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
