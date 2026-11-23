import { SUBTARJETA, TARJETA } from "./estilos";

// Las tres puertas para tener FARO. Solo se describen: no hay ningún botón para comprar ni prepagar.
export type PuertaFaro = { id: string; nombre: string; texto: string };

export function ListaPuertas({ titulo, intro, puertas }: { titulo: string; intro: string; puertas: PuertaFaro[] }) {
  return (
    <section aria-labelledby="h-puertas" className={TARJETA}>
      <h2 id="h-puertas" className="text-xl font-semibold">
        {titulo}
      </h2>
      <p className="max-w-3xl text-sm font-medium">{intro}</p>
      <ol className="grid gap-2 md:grid-cols-3">
        {puertas.map((p) => (
          <li key={p.id} className={SUBTARJETA}>
            <strong>{p.nombre}</strong>
            <span>{p.texto}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
