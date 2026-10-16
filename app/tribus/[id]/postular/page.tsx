import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { TerminoLegal } from "@/components/termino-legal";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { REQUISITOS_LEGALES } from "@/lib/postulaciones/postulaciones";
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
  return { title: textos("tribus", await idiomaDelPedido()).postulacion.titulo(t.barrio) };
}

export default async function PostularPage({ params }: Props) {
  const idioma = await idiomaDelPedido();
  const t = buscarTribu((await params).id, idioma);
  if (!t || t.estado !== "vacante") notFound();
  const tx = textos("tribus", idioma);
  const p = tx.postulacion;

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href={`/tribus/${t.id}`}>{p.volver(t.barrio)}</Link>
      </p>
      <h1 className="text-3xl font-semibold">{p.titulo(t.barrio)}</h1>
      <p className="mt-2 mb-4 text-muted">
        {p.introAntes}<strong>{t.foco}</strong>{p.introConHogares}{t.hogares}{p.introFin}
      </p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <section aria-labelledby="t-requisitos" className="mt-6 grid gap-2 rounded-xl border border-gold-ink bg-gold-soft p-4">
        <h2 id="t-requisitos" className="text-lg font-semibold">
          {p.requisitos} <span className="text-sm font-normal">{tx.ejemplo}</span>
        </h2>
        <ul className="list-disc pl-5">
          {p.listaRequisitos.map((texto, i) => {
            const legal = REQUISITOS_LEGALES[i];
            return (
              <li key={texto}>
                {texto}
                {legal && <TerminoLegal clave={legal} />}
              </li>
            );
          })}
        </ul>
      </section>
      <FormularioPostulacion tribuId={t.id} barrio={t.barrio} />
    </div>
  );
}
