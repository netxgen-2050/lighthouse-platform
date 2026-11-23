import type { Metadata } from "next";
import Link from "next/link";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { PerfilCliente } from "./perfil-cliente";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("perfil", await idiomaDelPedido()).pagina.titulo };
}

export default async function PerfilPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("perfil", idioma).pagina;
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{t.volverInicio}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="text-sm font-medium text-muted">{t.sobretitulo}</p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">{t.intro}</p>
      <PerfilCliente />
    </div>
  );
}
