import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { construirHolarquia } from "@/lib/gobernanza/holarquia";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { HolarquiaCliente } from "./holarquia-cliente";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("gobernanza", await idiomaDelPedido()).titulo };
}

const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function GobernanzaPage() {
  const idioma = await idiomaDelPedido();
  const tx = textos("gobernanza", idioma);
  // El mismo árbol que dibuja el navegador: no depende de nada del navegador, así no hay diferencias al hidratar.
  const raiz = construirHolarquia(idioma);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className={ENLACE} href="/fogon">{tx.volver}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="text-sm font-medium text-muted">{tx.sobre}</p>
      <h1 className="text-3xl font-semibold">{tx.titulo}</h1>
      <p className="mt-2 max-w-3xl text-muted">{tx.intro}</p>
      <p
        role="note"
        className="mt-4 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium"
      >
        {tx.avisoEjemplo}
        <TerminoLegal clave="consejo" idioma={idioma} />
        <span className="mt-1 block font-normal">{tx.avisoPersonas}</span>
      </p>

      <div className="mt-6">
        <HolarquiaCliente raiz={raiz} />
      </div>

      <section aria-labelledby="capas" className="mt-6 grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <h2 id="capas" className="text-lg font-semibold">
          {tx.capas.titulo}
          <TerminoLegal clave="validacioncomun" idioma={idioma} />
        </h2>
        <ul className="list-disc pl-5 text-sm">
          <li>{tx.capas.comunTribus}</li>
          <li>{tx.capas.tribusPersonas}</li>
          <li>{tx.capas.sube}</li>
        </ul>
        <p className="text-sm text-muted">{tx.capas.nota}</p>
      </section>

      <p className="mt-6">
        <Link className={ENLACE} href="/fogon">{tx.verDecisiones}</Link>
      </p>
    </div>
  );
}
