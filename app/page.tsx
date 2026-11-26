import Link from "next/link";
import { HeroeValle } from "@/components/explorar/heroe-valle";
import { CaminosPublico } from "@/components/inicio/caminos-publico";
import { FranjaCapitales } from "@/components/inicio/franja-capitales";
import { FranjaCifras } from "@/components/inicio/franja-cifras";
import { FranjaPilares } from "@/components/inicio/franja-pilares";
import { Aviso } from "@/components/ui/aviso";
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
  const haySumarte = DESTINOS.some((d) => d.href === "/sumarte" && d.existe);
  const recomendado = caminos.find((c) => params.camino && c.recomendadoPara.includes(params.camino));
  // Orden de la página (ux-inicio, design §1): héroe, pilares, caminos, cifras, capitales, aviso y leyenda.
  return (
    <div className="min-h-full">
      {hayCampana(params) && <GuardarOrigen origen={params} />}
      <HeroeValle leyenda={t.leyendaImagen} alto>
        <div className="grid max-w-[40rem] gap-4">
          <p className="text-sm font-medium uppercase tracking-wide text-ink">{t.sobretitulo}</p>
          <h1 className="text-4xl/10 font-bold sm:text-[56px]/16">
            {t.tituloInicio} <span className="text-deep-2">{t.tituloFin}</span>
          </h1>
          <p className="text-lg text-ink">{t.bajada}</p>
          <p className="flex flex-wrap items-center gap-4">
            <Link
              href="/explorar/territorio"
              className="inline-block rounded-full bg-deep px-5 py-3 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              {t.explorarTerritorio}
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
      <FranjaPilares
        pilares={(["agua", "trabajo", "comunidad"] as const).map((k) => ({ id: k, titulo: t.promesa[k].titulo, texto: t.promesa[k].texto }))}
      />
      <CaminosPublico
        idTitulo="por-donde-empezar"
        titulo={t.porDondeEmpezar}
        caminos={caminos}
        recomendadoId={recomendado?.id}
        textoRecomendado={t.recomendado}
        legal={{
          invertir: (
            <>
              {t.sobreRetorno} <TerminoLegal clave="sinretorno" idioma={idioma} />
            </>
          ),
        }}
      />
      <FranjaCifras
        titulo={t.cifras.titulo}
        etiquetaFuente={t.cifras.fuente}
        cifras={cifras.map((c) => ({ id: c.id, valor: c.valor, texto: c.texto, fuente: c.fuente }))}
      />
      <FranjaCapitales
        titulo={t.capitales.titulo}
        etiquetaFuente={t.capitales.fuente}
        fuente={FUENTE_CAPITALES}
        capitales={capitales.map((c) => ({ id: c.id, nombre: c.nombre, texto: c.texto }))}
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-12 sm:px-10">
        <section aria-labelledby="argentina">
          <Aviso tono="info" rol={null}>
            <h2 id="argentina" className="text-base font-bold">
              {t.argentina.titulo}
            </h2>
            <p>
              {t.argentina.texto} <TerminoLegal clave="ribera" idioma={idioma} />
            </p>
          </Aviso>
        </section>
        <p className="text-xs text-ink">{t.notaImagen}</p>
      </div>
    </div>
  );
}
