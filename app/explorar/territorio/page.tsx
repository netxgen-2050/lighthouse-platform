import type { Metadata } from "next";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EstadosAdministrativos } from "@/components/estados-administrativos";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { NivelTitulos } from "@/components/ui/titulo";
import { VitrinaTerritorio } from "@/app/territorios/[id]/vitrina-territorio";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { buscarTerritorio, textoSuperficie } from "@/lib/territorios/datos";
import { territorioEn } from "@/lib/territorios/textos";

// Explorar / Territorio (spec explorar-paginas): el mapa del Macrolote 7 con sus capas y los avisos de loteo
// (lo que mostraba /territorios/lighthouse). Pública. Ningún número se escribe acá.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("explorar", await idiomaDelPedido()).paginas.territorio };
}

export default async function ExplorarTerritorioPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);
  const tt = textos("territorio", idioma);
  const base = buscarTerritorio("lighthouse");
  const territorio = base ? territorioEn(base, idioma) : null;
  const bienesComunes = territorio?.bienesComunes ?? [];

  return (
    <section aria-labelledby="explorar-territorio" className="grid content-start gap-4">
      <h2 id="explorar-territorio" className="text-2xl font-bold">
        {t.territorio.titulo}
      </h2>
      <p className="max-w-3xl text-sm">{t.territorio.intro}</p>
      {territorio && (
        <div className="grid max-w-3xl gap-1 text-sm">
          <p className="text-muted">{territorio.ubicacion}</p>
          <p>{territorio.descripcion}</p>
          <p>
            <strong>{tt.superficie}</strong> {textoSuperficie(territorio, idioma)}
          </p>
        </div>
      )}
      <AvisoEjemplo />
      {/* El estado administrativo (Ord. 173) tiene peso legal: el de Soluna sigue en español, marcado, hasta `idioma-legal`. */}
      <EstadosAdministrativos proyectos={["soluna", "lighthouse-primeros", "lighthouse-norte"]} idioma={idioma} />
      <div className="min-w-0">
        <NivelTitulos nivel={3}>
          <VitrinaTerritorio />
        </NivelTitulos>
      </div>
      {bienesComunes.length > 0 && (
        <PanelVidrio como="div" className="grid content-start gap-2">
          <h3 className="text-xl font-bold">{tt.bienesComunes}</h3>
          <ul className="list-disc pl-5 text-sm">
            {bienesComunes.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </PanelVidrio>
      )}
    </section>
  );
}
