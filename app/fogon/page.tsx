import type { Metadata } from "next";
import Link from "next/link";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { FogonCliente } from "./fogon-cliente";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("fogon", await idiomaDelPedido()).pagina.titulo };
}

export default async function FogonPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("fogon", idioma).pagina;
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{t.volverInicio}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="text-sm font-medium text-muted">{t.sobretitulo}</p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">{t.intro}</p>
      <div className="mb-5 rounded-xl border border-deep bg-green-soft p-4 text-sm">
        <p className="font-semibold">{t.decidimos.titulo}</p>
        <p className="mt-1">{t.decidimos.texto}</p>
        <p className="mt-2">
          <Link className="underline" href="/fogon/gobernanza">{t.decidimos.enlace}</Link>
        </p>
      </div>
      <div className="mb-5 rounded-xl border border-deep bg-green-soft p-4 text-sm">
        <p className="font-semibold">{t.consultas.titulo}</p>
        <p className="mt-1">{t.consultas.texto}</p>
        <p className="mt-2">
          <Link className="underline" href="/fogon/consultas">{t.consultas.enlace}</Link>
        </p>
      </div>
      <FogonCliente />
    </div>
  );
}
