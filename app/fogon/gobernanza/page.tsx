import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { construirVista } from "@/lib/gobernanza/vista";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { EstructuraSvg } from "./estructura-svg";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("gobernanza", await idiomaDelPedido()).titulo };
}

const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CHIP = "rounded-full border border-faint px-2 py-0.5 text-xs";

export default async function GobernanzaPage() {
  const idioma = await idiomaDelPedido();
  const tx = textos("gobernanza", idioma);
  const estado = textos("comunes", idioma).estadoTribu;
  const vista = construirVista(idioma);
  const y = new Intl.ListFormat(idioma, { style: "long", type: "conjunction" });
  const l = tx.lista;
  const glifo = { activa: "●", formacion: "◐", vacante: "○" } as const;

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
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

      <section aria-labelledby="dibujo" className="mt-6 hidden sm:block">
        <h2 id="dibujo" className="mb-3 text-lg font-semibold">{tx.dibujo.titulo}</h2>
        <EstructuraSvg vista={vista} tx={tx} />
      </section>

      <section aria-labelledby="lista" className="mt-6">
        <h2 id="lista" className="mb-3 text-lg font-semibold">{l.titulo}</h2>
        <ul className="grid gap-3">
          <li className="rounded-xl border border-faint bg-surface p-4">
            <p className="font-semibold" translate="no">{l.comun}</p>
            <h3 className="mt-3 text-sm font-semibold">{l.tribus}</h3>
            <ul className="mt-2 grid gap-3">
              {vista.tribus.map((t) => (
                <li key={t.id} className="rounded-lg border border-faint p-3">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link className={`${ENLACE} font-medium`} href={`/tribus/${t.id}`} translate="no">{t.nombre}</Link>
                    <span className={CHIP}>
                      {l.estado} <span aria-hidden="true">{glifo[t.estado]} </span>
                      {estado[t.estado]}
                    </span>
                    <span className={CHIP}>
                      {t.validada ? tx.ficha.validadaComun : tx.ficha.noValidadaComun} {tx.ficha.ejemplo}
                    </span>
                    {!t.tieneLugar && <span className={CHIP}>{tx.consejo.sinLugar}</span>}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {l.circulos}
                    <TerminoLegal clave="circulotrabajo" idioma={idioma} />
                  </p>
                  {t.circulos.length > 0 ? (
                    <ul className="mt-1 flex flex-wrap gap-2 text-sm">
                      {t.circulos.map((c) => (
                        <li key={c} className="rounded-full border border-faint px-3 py-0.5">{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-muted">{l.sinCirculos}</p>
                  )}
                </li>
              ))}
              <li className="rounded-lg border border-deep p-3">
                <h3 className="text-sm font-semibold">{l.transversales}</h3>
                <ul className="mt-2 grid gap-2">
                  {vista.transversales.map((c) => (
                    <li key={c.id}>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-sm">{c.tribus.length > 0 ? l.participan(y.format(c.tribus)) : l.sinTribus}</p>
                      <p className="text-sm text-muted">{c.zona ? c.zona : l.zonaSinDato}</p>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section aria-labelledby="consejo" className="mt-6 grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <h2 id="consejo" className="text-lg font-semibold">
          {tx.consejo.titulo}
          <TerminoLegal clave="consejo" idioma={idioma} />
        </h2>
        <p className="text-sm">{tx.consejo.intro}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {vista.lugares.map((lugar) => (
            <li key={lugar.tribuId} className="rounded-lg border border-faint px-3 py-2 text-sm">
              <span className="font-medium">{tx.consejo.lugarDe(lugar.tribu)}</span>
              <span className="block text-muted">
                {lugar.representante ?? tx.consejo.sinRepresentante}
                {lugar.representante === null && <TerminoLegal clave="representante" idioma={idioma} />}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">{tx.consejo.votan}</p>
      </section>

      <p className="mt-6">
        <Link className={ENLACE} href="/fogon">{tx.verDecisiones}</Link>
      </p>
    </div>
  );
}
