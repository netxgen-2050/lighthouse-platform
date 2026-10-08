import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { TerminoLegal } from "@/components/termino-legal";
import { REQUISITOS } from "@/lib/postulaciones/postulaciones";
import { buscarTribu, listarTribus } from "@/lib/tribus/datos";
import { FormularioPostulacion } from "./formulario";

// Solo los barrios vacantes tienen formulario: cualquier otro id da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return listarTribus()
    .filter((t) => t.estado === "vacante")
    .map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = buscarTribu((await params).id);
  if (!t || t.estado !== "vacante") return {};
  return { title: `Proponer una comunidad para el Barrio ${t.barrio}` };
}

export default async function PostularPage({ params }: Props) {
  const t = buscarTribu((await params).id);
  if (!t || t.estado !== "vacante") notFound();

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href={`/tribus/${t.id}`}>← Barrio {t.barrio}</Link>
      </p>
      <h1 className="text-3xl font-semibold">Proponer una comunidad para el Barrio {t.barrio}</h1>
      <p className="mt-2 mb-4 text-muted">
        El barrio busca una tribu de <strong>{t.foco}</strong>, con {t.hogares}. Contanos quiénes son.
      </p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <section aria-labelledby="t-requisitos" className="mt-6 grid gap-2 rounded-xl border border-gold-ink bg-gold-soft p-4">
        <h2 id="t-requisitos" className="text-lg font-semibold">
          Requisitos para postular <span className="text-sm font-normal">(ejemplo)</span>
        </h2>
        <ul className="list-disc pl-5">
          {REQUISITOS.map((r) => (
            <li key={r.texto}>
              {r.texto}
              {r.legal && <TerminoLegal clave={r.legal} />}
            </li>
          ))}
        </ul>
      </section>
      <FormularioPostulacion tribuId={t.id} barrio={t.barrio} />
    </div>
  );
}
