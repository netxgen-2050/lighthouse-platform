import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { SelloTribu } from "@/components/sello-tribu";
import { buscarTerritorio, listarTerritorios, resumenDeTerritorio, tribusDeTerritorio } from "@/lib/territorios/datos";
import { TEXTO_ESTADO } from "@/lib/tribus/tipos";

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
  const resumen = resumenDeTerritorio(id);
  if (!territorio || !resumen) notFound();

  const tribus = tribusDeTerritorio(id);
  const cifras = [
    { etiqueta: "Activas", valor: resumen.activa },
    { etiqueta: "En formación", valor: resumen.formacion },
    { etiqueta: "Vacantes", valor: resumen.vacante },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">{territorio.nombre}</h1>
      <p className="mt-2 text-muted">{territorio.ubicacion}</p>
      <p className="mt-1">{territorio.descripcion}</p>
      <p className="mt-2 mb-4 text-sm">
        <strong>Superficie:</strong> {territorio.superficie ?? "sin dato"}
      </p>
      <AvisoEjemplo />

      <section className="mt-6 grid gap-4">
        <h2 className="text-xl font-semibold">Tribus del territorio</h2>
        <dl className="grid grid-cols-3 gap-3">
          {cifras.map((c) => (
            <div key={c.etiqueta} className={tarjeta}>
              <dt className="text-sm text-muted">{c.etiqueta}</dt>
              <dd className="text-2xl font-semibold">{c.valor}</dd>
            </div>
          ))}
        </dl>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tribus.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tribus/${t.id}`}
                className="flex h-full gap-3 rounded-xl border border-faint bg-surface p-4 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
              >
                <SelloTribu iniciales={t.iniciales} estado={t.estado} />
                <span className="grid gap-1">
                  <span className="text-sm text-muted">Barrio {t.barrio}</span>
                  <span className="font-semibold">{t.estado === "vacante" ? "Busca tribu" : t.nombre}</span>
                  <span className="text-sm text-muted">{t.foco}</span>
                  <span className="text-sm font-medium">Estado: {TEXTO_ESTADO[t.estado]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
