import Link from "next/link";
import { HeroeValle } from "@/components/explorar/heroe-valle";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { caminosDePortada } from "@/lib/portada";
import { capitalesDePortada, cifrasDePortada, FUENTE_CAPITALES } from "@/lib/portada-vrn";
import { TerminoLegal } from "@/components/termino-legal";
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
  const cifras = cifrasDePortada(idioma);
  const capitales = capitalesDePortada(idioma);
  const haySumarte =DESTINOS.some((d) => d.href === "/sumarte" && d.existe);
  return (
    <div className="min-h-full">
      {hayCampana(params) && <GuardarOrigen origen={params} />}
      {/* Dirección A "Valle de noche": primero el territorio (foto a sangre, título encima), después los números en vidrio. */}
      <HeroeValle leyenda={t.leyendaImagen}>
      <div className="grid gap-4">
        <p className="font-mono text-sm uppercase text-ink">{t.sobretitulo}</p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          {t.tituloInicio} <span className="text-deep-2">{t.tituloFin}</span>
        </h1>
        <p className="text-lg text-ink">{t.bajada}</p>
        <p className="flex flex-wrap items-center gap-4">
          <Link
            href="/explorar#lotes"
            className="inline-block rounded-full bg-deep px-5 py-3 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            {t.verLotes}
          </Link>
          {haySumarte && (
            <Link
              href="/sumarte"
              className="rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              {t.sumarte}
            </Link>
          )}
        </p>
      </div>
      </HeroeValle>
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 sm:px-10">
      <ul className="grid gap-3 sm:grid-cols-3">
        {(["agua", "trabajo", "comunidad"] as const).map((k) => (
          <li key={k} className="rounded-xl border border-line bg-surface p-4 text-ink">
            <strong>{t.promesa[k].titulo}</strong> {t.promesa[k].texto}
          </li>
        ))}
      </ul>
      <section aria-labelledby="argentina" className="grid gap-2 rounded-xl border border-line bg-surface p-4 text-ink">
        <h2 id="argentina" className="text-xl font-bold">
          {t.argentina.titulo}
        </h2>
        <p>
          {t.argentina.texto} <TerminoLegal clave="ribera" idioma={idioma} />
        </p>
      </section>
      <section aria-labelledby="capitales" className="grid gap-3">
        <h2 id="capitales" className="text-xl font-bold">
          {t.capitales.titulo}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-5">
          {capitales.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-surface p-3 text-ink">
              <h3 className="font-bold">{c.nombre}</h3>
              <p className="text-sm text-muted">{c.texto}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          {t.capitales.fuente}: <span lang="es">{FUENTE_CAPITALES}</span>
        </p>
      </section>
      {cifras.length > 0 && (
        <section aria-labelledby="cifras" className="grid gap-3">
          <h2 id="cifras" className="text-xl font-bold">
            {t.cifras.titulo}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {cifras.map((c) => (
              <PanelVidrio como="li" key={c.id}>
                <p>
                  <strong className="text-2xl">{c.valor}</strong> {c.texto}
                </p>
                <p className="text-xs text-muted">
                  {t.cifras.fuente}: <span lang="es">{c.fuente}</span>
                </p>
              </PanelVidrio>
            ))}
          </ul>
        </section>
      )}
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
      <p className="text-xs text-ink">{t.notaImagen}</p>
      </div>
    </div>
  );
}
