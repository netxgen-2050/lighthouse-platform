import type { Metadata } from "next";
import Link from "next/link";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { ConfiguracionCliente } from "./configuracion-cliente";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("configuracion", await idiomaDelPedido()).pagina.titulo };
}

export default async function ConfiguracionPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("configuracion", idioma).pagina;
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{t.volverInicio}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">{t.intro}</p>
      <ConfiguracionCliente />
    </div>
  );
}
