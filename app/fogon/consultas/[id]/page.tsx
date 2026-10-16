import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarConsulta, CONSULTAS } from "@/lib/fogon/consultas/ejemplo";
import { ConsultaCliente } from "./consulta-cliente";

export const dynamicParams = false;

export function generateStaticParams() {
  return CONSULTAS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: buscarConsulta(id)?.titulo ?? "Consulta" };
}

export default async function ConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Hoy las consultas son de ejemplo y se conocen al construir; con la base, el repositorio decide (ver `ConsultaCliente`).
  if (!buscarConsulta(id)) notFound();
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/fogon/consultas">← Consultas</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <ConsultaCliente id={id} />
    </div>
  );
}
