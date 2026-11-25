import type { Metadata } from "next";
import Link from "next/link";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { NivelTitulos } from "@/components/ui/titulo";
import { MarcaLoteo } from "@/app/territorios/[id]/vistas/lotes";
import { ListaLotes } from "@/app/lotes/lista-lotes";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { resumenDePrimeros, resumenDelLoteo } from "@/lib/territorios/loteo-textos";

// Explorar / Lotes (spec explorar-paginas): el resumen del loteo y la lista con enlace a cada ficha (lo que mostraba /lotes).
// Pública. Ningún número se escribe acá: salen de `lib/lotes/modelo.ts` y del loteo.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("explorar", await idiomaDelPedido()).paginas.lotes };
}

export default async function ExplorarLotesPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);
  const tl = textos("lotes", idioma);

  return (
    <section aria-labelledby="explorar-lotes" className="grid content-start gap-4">
      <h2 id="explorar-lotes" className="text-2xl font-bold">
        {t.lotes.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{t.lotes.intro}</p>
      {/* Toda vista con lotes muestra el estado administrativo de sus loteos (`lib/legal/vistas-con-lotes.ts`). */}
      <div className="grid gap-1">
        <EstadoAdministrativo proyecto="lighthouse-primeros" idioma={idioma} />
        <EstadoAdministrativo proyecto="lighthouse-norte" idioma={idioma} />
      </div>
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
        <p className="text-sm">
          <Link
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            href="/bien-comun"
          >
            {textos("biencomun", idioma).enlace}
          </Link>
        </p>
      </PanelVidrio>
      <PanelVidrio>
        <NivelTitulos nivel={3}>
          <ListaLotes />
        </NivelTitulos>
      </PanelVidrio>
    </section>
  );
}
