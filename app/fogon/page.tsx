import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { construirHolarquia } from "@/lib/gobernanza/holarquia";
import { interpretarLugar, type ParametroDeDireccion } from "@/lib/gobernanza/lugar";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { LENTES } from "./gobernanza/lentes";
import { FogonPortada } from "./fogon-portada";

type Props = { searchParams: Promise<Record<string, ParametroDeDireccion>> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("fogon", await idiomaDelPedido()).pagina.titulo };
}

const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function FogonPage({ searchParams }: Props) {
  const idioma = await idiomaDelPedido();
  const t = textos("fogon", idioma).pagina;
  const tx = textos("gobernanza", idioma);
  const params = await searchParams;
  // El mismo árbol que dibuja el navegador: no depende de nada del navegador, así no hay diferencias al hidratar.
  const raiz = construirHolarquia(idioma);
  // Lo que llega por la dirección se valida contra el árbol y las lentes: nunca se muestra tal cual.
  const lugar = interpretarLugar(raiz, LENTES.map((l) => l.id), params);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className={ENLACE} href="/">{t.volverInicio}</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <p className="text-sm font-medium text-muted">{t.sobretitulo}</p>
      <h1 className="text-3xl font-semibold">{t.h1}</h1>
      <p className="mt-2 mb-4 max-w-3xl text-muted">{t.intro}</p>

      <FogonPortada raiz={raiz} focoInicial={lugar.focoId} lenteInicial={lugar.lenteId} />

      <p role="note" className="mt-6 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium">
        {tx.avisoEjemplo}
        <TerminoLegal clave="consejo" idioma={idioma} />
        <span className="mt-1 block font-normal">{tx.avisoPersonas}</span>
      </p>

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

      <section aria-labelledby="otras-herramientas" className="mt-6 grid gap-3">
        <h2 id="otras-herramientas" className="text-lg font-semibold">{t.herramientas.titulo}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          <li className="grid gap-1 rounded-xl border border-deep bg-green-soft p-4 text-sm">
            <Link className={ENLACE} href="/fogon/consultas">{t.herramientas.consultas.enlace}</Link>
            <span>{t.herramientas.consultas.texto}</span>
          </li>
          <li className="grid gap-1 rounded-xl border border-deep bg-green-soft p-4 text-sm">
            <Link className={ENLACE} href="/netx/simulador">{t.herramientas.simulador.enlace}</Link>
            <span>{t.herramientas.simulador.texto}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
