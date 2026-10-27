import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { Recorrido } from "./recorrido";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("recorrido", await idiomaDelPedido()).pagina.titulo };
}

export default async function PanelPage() {
  const t = textos("recorrido", await idiomaDelPedido()).pagina;
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{t.volverInicio}</Link>
      </p>
      <p className="text-sm font-medium text-muted">{t.sobretitulo}</p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">{t.intro}</p>
      <AvisoEjemplo />
      <div className="mt-6">
        <Recorrido />
      </div>
    </div>
  );
}
