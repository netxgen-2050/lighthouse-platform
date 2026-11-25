import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { PanelObraBarrio } from "@/components/explorar/panel-obra-barrio";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Indicador } from "@/components/ui/indicador";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { NivelTitulos } from "@/components/ui/titulo";
import { ESTADOS_BARRIO, vistaBarrioNorte } from "@/lib/barrios/norte";
import { enteroEn } from "@/lib/bien-comun/formato";
import { RUTA_SECCION } from "@/lib/explorar/destino";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

// Explorar / Barrio Norte (spec explorar-paginas): lotes por estado, lo que va al bien común y la obra (solo con sesión).
// Pública; el panel de la obra pide sesión. Ningún número se escribe acá: salen de `lib/barrios/norte.ts` y `lib/lotes/modelo.ts`.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("explorar", await idiomaDelPedido()).paginas.barrio };
}

const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function ExplorarBarrioNortePage() {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);
  const tb = textos("barrios", idioma);
  const vista = vistaBarrioNorte();

  return (
    <section aria-labelledby="explorar-barrio" className="grid content-start gap-4">
      <h2 id="explorar-barrio" className="text-2xl font-bold">
        {t.barrio.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{t.barrio.intro}</p>

      <section aria-labelledby="lotes-del-barrio" className="grid gap-3">
        <h3 id="lotes-del-barrio" className="text-xl font-bold">
          {tb.lotes.titulo}
        </h3>
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
        <Link href={RUTA_SECCION.lotes} className={ENLACE}>
          {tb.lotes.ver}
        </Link>
      </section>

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

      <NivelTitulos nivel={3}>
        <PanelObraBarrio lotesDelPlano={vista.lotesDelPlano} />
      </NivelTitulos>
    </section>
  );
}
