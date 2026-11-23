import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarConsulta, CONSULTAS } from "@/lib/fogon/consultas/ejemplo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { textoEn } from "@/lib/idioma/tipos";
import { ConsultaCliente } from "./consulta-cliente";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONSULTAS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const idioma = await idiomaDelPedido();
  const consulta = buscarConsulta(id);
  return { title: consulta ? textoEn(consulta.titulo, idioma) : textos("fogonConsultas", idioma).pagina.tituloConsulta };
}

export default async function ConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Hoy las consultas son de ejemplo y se conocen al construir; con la base, el repositorio decide (ver `ConsultaCliente`).
  if (!buscarConsulta(id)) notFound();
  const idioma = await idiomaDelPedido();
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/fogon/consultas">{textos("fogonConsultas", idioma).pagina.volverConsultas}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <ConsultaCliente id={id} />
    </div>
  );
}
