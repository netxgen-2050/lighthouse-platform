import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EnEspanol } from "@/components/en-espanol";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { buscarTerritorio, listarTerritorios, textoSuperficie } from "@/lib/territorios/datos";
import { territorioEn } from "@/lib/territorios/textos";
import { VitrinaTerritorio } from "./vitrina-territorio";

export const dynamicParams = false;

export function generateStaticParams() {
  return listarTerritorios().map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = buscarTerritorio((await params).id);
  if (!t) return {};
  return { title: t.nombre };
}

const tarjeta = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";

export default async function TerritorioPage({ params }: Props) {
  const { id } = await params;
  const idioma = await idiomaDelPedido();
  const base = buscarTerritorio(id);
  if (!base) notFound();
  const territorio = territorioEn(base, idioma);
  const tx = textos("territorio", idioma);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{tx.volverInicio}</Link>
      </p>
      <h1 className="text-3xl font-semibold" translate="no">{territorio.nombre}</h1>
      <p className="mt-2 text-muted">{territorio.ubicacion}</p>
      <p className="mt-1">{territorio.descripcion}</p>
      <p className="mt-2 mb-4 text-sm">
        <strong>{tx.superficie}</strong> {textoSuperficie(territorio, idioma)}
      </p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      {/* El estado administrativo (Ord. 173) tiene peso legal: sigue en español, marcado, hasta `idioma-legal`. */}
      <EnEspanol>
        <EstadoAdministrativo proyecto="soluna" />
      </EnEspanol>

      <VitrinaTerritorio />

      <section className={`${tarjeta} mt-6`}>
        <h2 className="text-xl font-semibold">{tx.bienesComunes}</h2>
        <ul className="list-disc pl-5">
          {territorio.bienesComunes.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
