import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarManifiesto, buscarManifiestoBilingue, idsConManifiesto } from "@/lib/manifiestos/datos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { nombreDelComun } from "@/lib/manifiestos/lighthouse-vrn";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { destinosDisponibles } from "@/lib/navegacion";
import { LecturaManifiesto } from "./lectura";

export const dynamicParams = false;

export function generateStaticParams() {
  return idsConManifiesto().map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = buscarManifiesto((await params).id, await idiomaDelPedido());
  return m ? { title: m.titulo } : {};
}

export default async function ManifiestoPage({ params }: Props) {
  const { id } = await params;
  const m = buscarManifiestoBilingue(id);
  if (!m) notFound();
  const idioma = await idiomaDelPedido();
  const esLighthouse = id === COMUNIDAD_LIGHTHOUSE;

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href={`/tribus/${id}`}>
          ← <span translate="no">{esLighthouse ? nombreDelComun(idioma) : m.comunidad}</span>
        </Link>
      </p>
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <LecturaManifiesto manifiesto={m} pactos={destinosDisponibles().some((d) => d.href === "/pactos")} />
    </div>
  );
}
