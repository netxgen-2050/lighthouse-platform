import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { Formulario } from "./formulario";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("compromisos", await idiomaDelPedido()).pagina.titulo };
}

export default async function CompromisosPage() {
  const t = textos("compromisos", await idiomaDelPedido()).pagina;
  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{t.volverInicio}</Link>
      </p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-4 text-muted">{t.intro}</p>
      <div className="grid gap-2">
        <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {t.modoDemo}
        </p>
        <AvisoEjemplo />
      </div>
      <Formulario />
    </div>
  );
}
