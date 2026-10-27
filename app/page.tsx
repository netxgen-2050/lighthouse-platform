import Link from "next/link";
import { caminosDePortada } from "@/lib/portada";
import { DESTINOS } from "@/lib/navegacion";
import { GuardarOrigen } from "@/components/guardar-origen";
import { hayCampana, leerParametros } from "@/lib/origen/origen";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Home({ searchParams }: Props) {
  const params = leerParametros(await searchParams);
  const idioma = await idiomaDelPedido();
  const t = textos("portada", idioma);
  const caminos = caminosDePortada(idioma);
  const haySumarte = DESTINOS.some((d) => d.href === "/sumarte" && d.existe);
  return (
    <div className="mx-auto grid max-w-3xl content-center gap-6 px-6 py-16 sm:px-10">
      {hayCampana(params) && <GuardarOrigen origen={params} />}
      <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <div className="grid gap-4">
        <p className="font-mono text-sm uppercase text-muted">{t.sobretitulo}</p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          {t.tituloInicio} <span className="text-deep-2">{t.tituloFin}</span>
        </h1>
        <p className="text-lg text-muted">{t.bajada}</p>
        <p className="flex flex-wrap items-center gap-4">
          <Link
            href="/territorios/lighthouse"
            className="inline-block rounded-full bg-deep px-5 py-3 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            {t.explorar}
          </Link>
          {haySumarte && (
            <Link
              href="/sumarte"
              className="rounded-full border border-line px-5 py-3 font-medium text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              {t.sumarte}
            </Link>
          )}
        </p>
      </div>
      <section aria-labelledby="por-donde-empezar" className="grid gap-3">
        <h2 id="por-donde-empezar" className="text-xl font-bold">
          {t.porDondeEmpezar}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {caminos.map((c) => (
            <li key={c.href} className="grid">
              <Link
                href={c.href}
                className={`grid content-start gap-1 rounded-xl bg-surface text-ink hover:border-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  c.id === params.camino ? "border-2 border-deep p-[15px]" : "border border-line p-4"
                }`}
              >
                {c.id === params.camino && (
                  <span className="w-fit rounded-full bg-deep px-2 py-0.5 text-xs font-medium text-on-deep">
                    {t.recomendado}
                  </span>
                )}
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
