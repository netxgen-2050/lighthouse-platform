import Link from "next/link";
import { caminosDePortada } from "@/lib/portada";
import { DESTINOS } from "@/lib/navegacion";

export default function Home() {
  const caminos = caminosDePortada();
  const haySumarte = DESTINOS.some((d) => d.href === "/sumarte" && d.existe);
  return (
    <div className="mx-auto grid max-w-3xl content-center gap-6 px-6 py-16 sm:px-10">
      <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <div className="grid gap-4">
        <p className="font-mono text-sm uppercase text-muted">Corredor regenerativo patagónico</p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Encontrá tu tribu. <span className="text-deep-2">Construí en común.</span>
        </h1>
        <p className="text-lg text-muted">
          Conocé a las personas con quienes vale la pena invertir, trabajar y quizás vivir.
          Pónganse de acuerdo antes de comprometer capital, y avancen juntos sobre un territorio
          real. Explorar es gratis.
        </p>
        <p className="flex flex-wrap items-center gap-4">
          <Link
            href="/territorios/lighthouse"
            className="inline-block rounded-full bg-deep px-5 py-3 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            Explorar el Lighthouse
          </Link>
          {haySumarte && (
            <Link
              href="/sumarte"
              className="rounded-full border border-line px-5 py-3 font-medium text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              Elegí cómo sumarte
            </Link>
          )}
        </p>
      </div>
      <section aria-labelledby="por-donde-empezar" className="grid gap-3">
        <h2 id="por-donde-empezar" className="text-xl font-bold">
          Por dónde empezar
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {caminos.map((c) => (
            <li key={c.href} className="grid">
              <Link
                href={c.href}
                className="grid content-start gap-1 rounded-xl border border-line bg-surface p-4 text-ink hover:border-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
              >
                <span className="font-mono text-xs uppercase text-muted">{c.etiqueta}</span>
                <h3 className="text-lg font-bold">{c.titulo}</h3>
                <span className="text-sm text-muted">{c.descripcion}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
