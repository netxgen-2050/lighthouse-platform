import type { Metadata } from "next";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { resumenDePrimeros, resumenDelLoteo } from "@/lib/territorios/loteo-textos";
import { MarcaLoteo } from "@/app/territorios/[id]/vistas/lotes";
import { ListaLotes } from "./lista-lotes";

// La lista de lotes de Lighthouse VRN (spec lotes-ficha). Se ve sin sesión.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("lotes", await idiomaDelPedido()).lista.titulo };
}

export default async function LotesPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("lotes", idioma);

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.lista.titulo}</h1>
      <p className="mt-2 text-muted">{t.lista.bajada}</p>
      <div className="mt-3 grid gap-2">
        <MarcaLoteo conFuente />
        {resumenDePrimeros(idioma) && <p className="text-sm font-medium">{resumenDePrimeros(idioma)}</p>}
        <p className="text-sm">{resumenDelLoteo(idioma)}</p>
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
      </div>
      <EstadoAdministrativo proyecto="lighthouse-primeros" idioma={idioma} />
      <EstadoAdministrativo proyecto="lighthouse-norte" idioma={idioma} />
      <ListaLotes />
    </div>
  );
}
