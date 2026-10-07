import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { buscarTerritorio, listarTerritorios, textoSuperficie } from "@/lib/territorios/datos";
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
  const territorio = buscarTerritorio(id);
  if (!territorio) notFound();

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">{territorio.nombre}</h1>
      <p className="mt-2 text-muted">{territorio.ubicacion}</p>
      <p className="mt-1">{territorio.descripcion}</p>
      <p className="mt-2 mb-4 text-sm">
        <strong>Superficie:</strong> {textoSuperficie(territorio)}
      </p>
      <AvisoEjemplo />

      <VitrinaTerritorio />

      <section className={`${tarjeta} mt-6`}>
        <h2 className="text-xl font-semibold">Bienes comunes</h2>
        <ul className="list-disc pl-5">
          {territorio.bienesComunes.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
