import Link from "next/link";

export type CaminoSumarte = { id: string; href: string; etiqueta: string; titulo: string; texto: string };

/** Los tres caminos de arriba de Sumarte (ux-sumarte, design §1): llevan a la parte de la página de cada público. */
export function CaminosSumarte({ titulo, caminos }: { titulo: string; caminos: readonly CaminoSumarte[] }) {
  return (
    <section aria-labelledby="caminos-sumarte" className="grid gap-3">
      <h2 id="caminos-sumarte" className="text-lg font-semibold">{titulo}</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {caminos.map((c) => (
          <li key={c.id} className="grid">
            <Link
              href={c.href}
              className="grid content-start gap-1 rounded-xl border border-line bg-surface p-4 text-ink hover:border-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              <span className="font-mono text-xs uppercase text-muted">{c.etiqueta}</span>
              <span className="text-lg font-bold">{c.titulo}</span>
              <span className="text-sm text-muted">{c.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
