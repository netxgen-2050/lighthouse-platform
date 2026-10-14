import type { Cifra } from "@/lib/congreso/evento";

/** Franja de cifras del evento. Un valor ausente se muestra como "sin dato", nunca como 0. */
export function Cifras({ cifras }: { cifras: Cifra[] }) {
  return (
    <div className="ev-cifras">
      {cifras.map((c) => (
        <div className="ev-cifra" key={c.etiqueta}>
          <b>{c.valor.trim() === "" ? "sin dato" : c.valor}</b>
          <span>{c.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
