import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { HeroeValle } from "@/components/explorar/heroe-valle";
import { PanelObraBarrio } from "@/components/explorar/panel-obra-barrio";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Indicador } from "@/components/ui/indicador";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { SelloPrototipo } from "@/components/ui/sello-prototipo";
import { ESTADOS_BARRIO, vistaBarrioNorte } from "@/lib/barrios/norte";
import { enteroEn } from "@/lib/bien-comun/formato";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

// Barrio Norte (spec explorar-valle): lotes por estado y lo que va al bien común, públicos; la obra del barrio, solo con sesión.
// Ningún número se escribe acá: salen de `lib/barrios/norte.ts` y de los módulos con versión.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("barrios", await idiomaDelPedido()).titulo };
}

const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function BarrioNortePage() {
  const idioma = await idiomaDelPedido();
  const t = textos("barrios", idioma);
  const vista = vistaBarrioNorte();
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
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 sm:px-10">
        <section aria-labelledby="lotes-del-barrio" className="grid gap-3">
          <h2 id="lotes-del-barrio" className="text-xl font-bold">
            {t.lotes.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.lotes.intro}</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESTADOS_BARRIO.map((estado) => {
              const cantidad = vista.lotesPorEstado[estado];
              return (
                <PanelVidrio como="li" key={estado} className="grid content-start gap-2">
                  <ChipEstado estado={estado} />
                  <Indicador etiqueta={t.lotes.etiqueta} valor={cantidad === null ? null : enteroEn(cantidad, idioma)} mono />
                </PanelVidrio>
              );
            })}
          </ul>
          <p className="text-sm text-muted">{t.lotes.enCuotasNota}</p>
          <Link href="/lotes" className={ENLACE}>
            {t.lotes.ver}
          </Link>
        </section>

        <PanelVidrio como="section" className="grid content-start gap-3">
          <h2 className="text-xl font-bold">{t.comun.titulo}</h2>
          <p className="max-w-3xl text-sm">{t.comun.intro}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Indicador etiqueta={t.comun.parte} valor={porcentajeEn(vista.parteParaElComun, idioma)} mono />
            <div className="flex items-start gap-1">
              <Indicador etiqueta={t.comun.expensa} valor={usdEn(vista.expensa, idioma)} mono />
              <TerminoLegal clave="expensas" idioma={idioma} />
            </div>
          </div>
          <p className="text-sm text-muted">{t.comun.version(vista.versionModelo)}</p>
          <Link href="/bien-comun" className={ENLACE}>
            {t.comun.ver}
          </Link>
        </PanelVidrio>

        <PanelObraBarrio lotesDelPlano={vista.lotesDelPlano} />
      </div>
    </div>
  );
}
