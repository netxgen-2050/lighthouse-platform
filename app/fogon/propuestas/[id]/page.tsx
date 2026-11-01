import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DECISIONES_BASE } from "@/lib/fogon/datos";
import { PROPUESTAS_DE_EJEMPLO, propuestaDe } from "@/lib/fogon/propuestas/ejemplos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { PropuestaCliente } from "./propuesta-cliente";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROPUESTAS_DE_EJEMPLO.map((p) => ({ id: p.decisionId }));
}

// El título genérico: el de la decisión solo se muestra a quien puede ver la propuesta (la visita no ve nada, A2), y eso
// depende del nivel que elige la persona en el navegador.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("fogonPropuestas", await idiomaDelPedido()).pagina.titulo };
}

// Esta página NO lee la sesión: la cookie del super admin real solo viaja a /admin (ADR-016). Lo que depende de la sesión
// o del nivel (migas con el título, ámbito del consejo) lo calcula `propuesta-cliente.tsx`.
export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!propuestaDe(id) || !DECISIONES_BASE.some((d) => d.id === id)) notFound();
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <PropuestaCliente id={id} />
    </div>
  );
}
