import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { EnEspanol } from "@/components/en-espanol";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { BarraSecciones } from "@/components/explorar/barra-secciones";
import { HeroeValle } from "@/components/explorar/heroe-valle";
import { PanelObraBarrio } from "@/components/explorar/panel-obra-barrio";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Indicador } from "@/components/ui/indicador";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { SelloPrototipo } from "@/components/ui/sello-prototipo";
import { VitrinaTerritorio } from "@/app/territorios/[id]/vitrina-territorio";
import { MarcaLoteo } from "@/app/territorios/[id]/vistas/lotes";
import { ListaLotes } from "@/app/lotes/lista-lotes";
import { ESTADOS_BARRIO, vistaBarrioNorte } from "@/lib/barrios/norte";
import { enteroEn } from "@/lib/bien-comun/formato";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";
import { resumenDePrimeros, resumenDelLoteo } from "@/lib/territorios/loteo-textos";
import { buscarTerritorio } from "@/lib/territorios/datos";
import { territorioEn } from "@/lib/territorios/textos";

// Explorar (spec explorar-unificado): Territorio, Barrio Norte y Lotes en una sola página, con el diseño de Barrio Norte
// (héroe con la foto del valle, sello, paneles de vidrio, indicadores con chip). Pública; el panel de la obra pide sesión.
// Ningún número se escribe acá: salen de `lib/barrios/norte.ts`, de `lib/lotes/modelo.ts` y del loteo.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("explorar", await idiomaDelPedido()).titulo };
}

const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const SECCION = "grid scroll-mt-28 content-start gap-4";

export default async function ExplorarPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);
  const tb = textos("barrios", idioma);
  const tl = textos("lotes", idioma);
  const tt = textos("territorio", idioma);
  const vista = vistaBarrioNorte();
  const base = buscarTerritorio("lighthouse");
  const bienesComunes = base ? territorioEn(base, idioma).bienesComunes : [];

  return (
    <div className="min-h-full">
      <HeroeValle leyenda={textos("portada", idioma).leyendaImagen}>
        <SelloPrototipo variante="venta" />
        <div className="grid gap-3">
          <p className="font-mono text-sm uppercase text-ink">{t.sobretitulo}</p>
          <h1 className="text-4xl font-bold sm:text-5xl">{t.titulo}</h1>
          <p className="max-w-2xl text-lg text-ink">{t.bajada}</p>
        </div>
      </HeroeValle>

      <BarraSecciones />

      <div className="mx-auto grid max-w-5xl gap-14 px-6 py-10 sm:px-10">
        {/* Territorio: el mapa del Macrolote 7 con sus capas y los avisos de loteo (lo que mostraba /territorios/lighthouse). */}
        <section id="territorio" aria-labelledby="explorar-territorio" className={SECCION}>
          <h2 id="explorar-territorio" className="text-2xl font-bold">
            {t.territorio.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.territorio.intro}</p>
          <div className="grid gap-1">
            {/* El estado administrativo (Ord. 173) tiene peso legal: sigue en español, marcado, hasta `idioma-legal`. */}
            <EnEspanol>
              <EstadoAdministrativo proyecto="soluna" />
            </EnEspanol>
            <EstadoAdministrativo proyecto="lighthouse-primeros" idioma={idioma} />
            <EstadoAdministrativo proyecto="lighthouse-norte" idioma={idioma} />
          </div>
          <PanelVidrio className="min-w-0">
            <VitrinaTerritorio />
          </PanelVidrio>
          {bienesComunes.length > 0 && (
            <PanelVidrio como="div" className="grid content-start gap-2">
              <h3 className="text-lg font-semibold">{tt.bienesComunes}</h3>
              <ul className="list-disc pl-5 text-sm">
                {bienesComunes.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </PanelVidrio>
          )}
        </section>

        {/* Barrio Norte: lotes por estado, lo que va al bien común y la obra (solo con sesión). */}
        <section id="barrio" aria-labelledby="explorar-barrio" className={SECCION}>
          <h2 id="explorar-barrio" className="text-2xl font-bold">
            {t.barrio.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.barrio.intro}</p>

          <div className="grid gap-3">
            <h3 className="text-xl font-bold">{tb.lotes.titulo}</h3>
            <p className="max-w-3xl text-sm">{tb.lotes.intro}</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ESTADOS_BARRIO.map((estado) => {
                const cantidad = vista.lotesPorEstado[estado];
                return (
                  <PanelVidrio como="li" key={estado} className="grid content-start gap-2">
                    <ChipEstado estado={estado} />
                    <Indicador etiqueta={tb.lotes.etiqueta} valor={cantidad === null ? null : enteroEn(cantidad, idioma)} mono />
                  </PanelVidrio>
                );
              })}
            </ul>
            <p className="text-sm text-muted">{tb.lotes.enCuotasNota}</p>
            <a href="#lotes" className={ENLACE}>
              {tb.lotes.ver}
            </a>
          </div>

          <PanelVidrio como="div" className="grid content-start gap-3">
            <h3 className="text-xl font-bold">{tb.comun.titulo}</h3>
            <p className="max-w-3xl text-sm">{tb.comun.intro}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Indicador etiqueta={tb.comun.parte} valor={porcentajeEn(vista.parteParaElComun, idioma)} mono />
              <div className="flex items-start gap-1">
                <Indicador etiqueta={tb.comun.expensa} valor={usdEn(vista.expensa, idioma)} mono />
                <TerminoLegal clave="expensas" idioma={idioma} />
              </div>
            </div>
            <p className="text-sm text-muted">{tb.comun.version(vista.versionModelo)}</p>
            <Link href="/bien-comun" className={ENLACE}>
              {tb.comun.ver}
            </Link>
          </PanelVidrio>

          <PanelObraBarrio lotesDelPlano={vista.lotesDelPlano} />
        </section>

        {/* Lotes: la lista con enlace a cada ficha (lo que mostraba /lotes). */}
        <section id="lotes" aria-labelledby="explorar-lotes" className={SECCION}>
          <h2 id="explorar-lotes" className="text-2xl font-bold">
            {t.lotes.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.lotes.intro}</p>
          <PanelVidrio className="grid content-start gap-2">
            <MarcaLoteo conFuente />
            {resumenDePrimeros(idioma) && <p className="text-sm font-medium">{resumenDePrimeros(idioma)}</p>}
            <p className="text-sm">{resumenDelLoteo(idioma)}</p>
            <p className="text-sm">
              <Link
                className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                href="/lotes/hibrido"
              >
                {tl.lista.hibrido}
              </Link>
            </p>
          </PanelVidrio>
          <PanelVidrio>
            <ListaLotes />
          </PanelVidrio>
        </section>
      </div>
    </div>
  );
}
