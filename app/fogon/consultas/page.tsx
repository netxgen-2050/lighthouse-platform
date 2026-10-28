import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { ListaConsultas } from "./lista-consultas";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("fogonConsultas", await idiomaDelPedido()).pagina.titulo };
}

export default async function ConsultasPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("fogonConsultas", idioma).pagina;
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/fogon">{t.volverFogon}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="text-sm font-medium text-muted">{t.sobretitulo}</p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        {t.introAntes} <TerminoLegal clave="consultivo" idioma={idioma} />. {t.introDespues}
      </p>
      <ListaConsultas />
    </div>
  );
}
