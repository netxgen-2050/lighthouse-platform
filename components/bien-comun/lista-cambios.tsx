import { TARJETA } from "./estilos";

// Lo que salió del modelo anterior, una línea cada uno.
export type CambioModelo = { id: string; texto: string };

export function ListaCambios({ titulo, intro, items }: { titulo: string; intro: string; items: CambioModelo[] }) {
  return (
    <section aria-labelledby="h-cambios" className={TARJETA}>
      <h2 id="h-cambios" className="text-xl font-semibold">
        {titulo}
      </h2>
      <p className="max-w-3xl text-sm">{intro}</p>
      <ul className="grid list-disc gap-1 pl-5 text-sm">
        {items.map((i) => (
          <li key={i.id}>{i.texto}</li>
        ))}
      </ul>
    </section>
  );
}
