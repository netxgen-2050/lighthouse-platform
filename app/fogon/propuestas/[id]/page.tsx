import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DECISIONES_BASE } from "@/lib/fogon/datos";
import { PROPUESTAS_DE_EJEMPLO, propuestaDe } from "@/lib/fogon/propuestas/ejemplos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { textoEn } from "@/lib/idioma/tipos";
import { PropuestaCliente } from "./propuesta-cliente";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROPUESTAS_DE_EJEMPLO.map((p) => ({ id: p.decisionId }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const idioma = await idiomaDelPedido();
  const decision = DECISIONES_BASE.find((d) => d.id === id);
  return { title: decision ? textoEn(decision.titulo, idioma) : textos("fogonPropuestas", idioma).pagina.titulo };
}

// Esta página NO lee la sesión: la cookie del super admin real solo viaja a /admin (ADR-016). Lo que depende de la sesión
// (el control del ámbito del consejo) lo calcula `propuesta-cliente.tsx` con `useSesion()`.
export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!propuestaDe(id) || !DECISIONES_BASE.some((d) => d.id === id)) notFound();
  const idioma = await idiomaDelPedido();
  const t = textos("fogonPropuestas", idioma);
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <nav aria-label={t.pagina.migas} className="mb-2 text-sm">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link className="underline" href="/fogon">{t.pagina.migaFogon}</Link>
            <span aria-hidden="true"> ›</span>
          </li>
          <li aria-current="page">{textoEn(DECISIONES_BASE.find((d) => d.id === id)!.titulo, idioma)}</li>
        </ol>
      </nav>
      <p className="mb-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {t.pagina.avisoProceso}
      </p>
      <PropuestaCliente id={id} />
    </div>
  );
}
