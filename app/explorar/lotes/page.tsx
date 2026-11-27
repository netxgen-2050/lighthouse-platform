import type { Metadata } from "next";
import Link from "next/link";
import { EstadosAdministrativos } from "@/components/estados-administrativos";
import { ExploradorLotes } from "@/components/explorar/explorador-lotes";
import { MarcaLoteo } from "@/app/territorios/[id]/vistas/lotes";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { resumenDePrimeros, resumenDelLoteo } from "@/lib/territorios/loteo-textos";

// Explorar / Lotes (specs explorar-paginas y ux-explorar): lista de tarjetas y mapa juntos. Pública.
// Ningún número se escribe acá: salen de `lib/lotes/modelo.ts` y del loteo.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("explorar", await idiomaDelPedido()).paginas.lotes };
}

const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function ExplorarLotesPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);
  const tl = textos("lotes", idioma);

  return (
    <section aria-labelledby="explorar-lotes" className="min-w-0">
      <ExploradorLotes
        encabezado={
          <div className="grid content-start gap-2">
            <h2 id="explorar-lotes" className="text-2xl font-bold">
              {t.lotes.titulo}
            </h2>
            <p className="max-w-3xl text-sm">{t.lotes.intro}</p>
            <MarcaLoteo conFuente />
            {resumenDePrimeros(idioma) && <p className="text-sm font-medium">{resumenDePrimeros(idioma)}</p>}
            <p className="text-sm">{resumenDelLoteo(idioma)}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link className={ENLACE} href="/lotes/hibrido">
                {tl.lista.hibrido}
              </Link>
              <Link className={ENLACE} href="/bien-comun">
                {textos("biencomun", idioma).enlace}
              </Link>
            </p>
          </div>
        }
        // Toda vista con lotes muestra el estado administrativo de sus loteos (`lib/legal/vistas-con-lotes.ts`).
        legal={<EstadosAdministrativos proyectos={["lighthouse-primeros", "lighthouse-norte"]} idioma={idioma} />}
      />
    </section>
  );
}
