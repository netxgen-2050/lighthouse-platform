import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { listarLotes } from "@/lib/territorios/loteo";
import { MarcaLoteo } from "@/app/territorios/[id]/vistas/lotes";
import { FichaCliente } from "./ficha-cliente";

// La ficha de un lote de Lighthouse VRN (spec lotes-ficha). Se ve sin sesión; reservar y hablar con alguien piden entrar.
export const dynamicParams = false;

export function generateStaticParams() {
  return listarLotes().map((l) => ({ id: l.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) return {};
  return { title: textos("territorio", await idiomaDelPedido()).loteo.lote(lote.numero) };
}

export default async function LotePage({ params }: Props) {
  const { id } = await params;
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) notFound();
  const idioma = await idiomaDelPedido();
  const t = textos("lotes", idioma);
  const tx = textos("territorio", idioma);

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/lotes">
          {t.volverALista}
        </Link>
      </p>
      <p className="text-sm text-muted">
        <span translate="no">Lighthouse VRN</span> · {lote.grupo === "primeros" ? t.ficha.primeros : t.ficha.sector}
      </p>
      <h1 className="text-3xl font-semibold">{tx.loteo.lote(lote.numero)}</h1>
      <div className="mt-2 grid gap-2">
        <MarcaLoteo />
        {lote.grupo === "primeros" && <p className="text-sm font-medium">{t.ficha.avisoPrimeros}</p>}
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
      </div>
      <FichaCliente id={lote.id} />
    </div>
  );
}
