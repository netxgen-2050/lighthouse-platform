import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { urlExplorar } from "@/lib/explorar/destino";
import { buscarTerritorio, listarTerritorios } from "@/lib/territorios/datos";

export const dynamicParams = false;

export function generateStaticParams() {
  return listarTerritorios().map((t) => ({ id: t.id }));
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = buscarTerritorio((await params).id);
  if (!t) return {};
  return { title: t.nombre };
}

export default async function TerritorioPage({ params, searchParams }: Props) {
  const { id } = await params;
  // Lighthouse ahora es la sección Territorio de Explorar (spec explorar-unificado); el mapa conserva vista, fase y sel.
  if (id === "lighthouse") redirect(urlExplorar("territorio", await searchParams));
  // Hay un solo territorio y `dynamicParams = false`: cualquier otro id no existe.
  notFound();
}
