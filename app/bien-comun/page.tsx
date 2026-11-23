import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { TerminoLegal } from "@/components/termino-legal";
import { enteroEn, faroEn, porcentajeEntero, usdConDecimales } from "@/lib/bien-comun/formato";
import {
  APORTE_DE_ENTRADA,
  AVANCE_DE_EJEMPLO,
  FARO_POR_M2,
  LIBERACION_NETXGEN,
  STAKING,
  SUMINISTRO,
  VERSION_BIEN_COMUN,
  reparto,
  totalPorTramo,
} from "@/lib/bien-comun/modelo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { porcentajeEn } from "@/lib/lotes/formato";
import { parteDelSectorPrivada } from "@/lib/lotes/escenarios";
import { parcelasPorUso } from "@/lib/territorios/loteo-textos";
import { Calculadora } from "./calculadora";

// El bien común con tokens, como simulación para el equipo (spec bien-comun-tokens). Se ve sin sesión. Ningún número se
// escribe acá: salen de `lib/bien-comun/modelo.ts`. No se emite, no se cobra y no está decidido.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("biencomun", await idiomaDelPedido()).titulo };
}

const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const TH = "px-2 py-1.5 text-left font-semibold";
const TD = "px-2 py-1.5 align-top";
const MARCA = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";
const REGION =
  "overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export default async function BienComunPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("biencomun", idioma);
  const parte = parteDelSectorPrivada();
  const grupos = reparto();
  const tramos = totalPorTramo();
  const usos = parcelasPorUso(idioma);
  const anios = enteroEn(LIBERACION_NETXGEN.anios, idioma);
  const espera = t.esperaAnios(LIBERACION_NETXGEN.esperaAnios);

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.titulo}</h1>
      {/* El aviso de simulación va antes de cualquier número, también del de la bajada. */}
      <div className="mt-3 grid gap-2">
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm font-medium text-warn-ink">
          {t.aviso}
          <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
        </p>
        <p className="max-w-3xl text-muted">
          {parte === null ? t.bajadaSinDato : t.bajada(porcentajeEn(parte, idioma, 1))}
        </p>
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        <section aria-labelledby="h-ostrom" className={TARJETA}>
          <h2 id="h-ostrom" className="text-xl font-semibold">
            {t.ostrom.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.ostrom.intro}</p>
          <div role="region" tabIndex={0} aria-label={t.ostrom.caption} className={REGION}>
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">{t.ostrom.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.ostrom.principio}
                  </th>
                  <th scope="col" className={TH}>
                    {t.ostrom.como}
                  </th>
                  <th scope="col" className={TH}>
                    {t.ostrom.estado}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.ostrom.filas.map((f) => (
                  <tr key={f.principio} className="border-t border-line">
                    <th scope="row" className={`${TD} text-left font-medium`}>
                      {f.principio}
                    </th>
                    <td className={TD}>{f.como}</td>
                    <td className={TD}>
                      <span className={MARCA}>{t.ostrom.idea}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="h-tokens" className={TARJETA}>
          <h2 id="h-tokens" className="text-xl font-semibold">
            {t.tokens.titulo}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <article className="grid content-start gap-2 rounded-lg border border-faint p-3 text-sm">
              <h3 className="font-semibold">
                {t.tokens.nft.titulo}
                <TerminoLegal clave="nftlote" idioma={idioma} />
              </h3>
              <p>{t.tokens.nft.texto}</p>
              <p className="text-muted">{t.tokens.nft.porM2(faroEn(FARO_POR_M2, idioma))}</p>
            </article>
            <article className="grid content-start gap-2 rounded-lg border border-faint p-3 text-sm">
              <h3 className="font-semibold">
                {t.tokens.faro.titulo}
                <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
              </h3>
              <p>{t.tokens.faro.texto}</p>
              <p>{t.tokens.faro.usos}</p>
              <p className="text-sm text-muted">{t.tokens.faro.conElLote}</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="h-parcelas" className={TARJETA}>
          <h2 id="h-parcelas" className="text-xl font-semibold">
            {t.parcelas.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.parcelas.texto}</p>
          <h3 className="font-medium">{t.parcelas.delPlano}</h3>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {usos.map((u) => (
              <li key={u.uso}>
                <strong>{u.codigos.join(", ")}</strong> · {u.uso}
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium">{t.parcelas.aSumar}</p>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.parcelas.aSumarItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-reparto" className={TARJETA}>
          <h2 id="h-reparto" className="text-xl font-semibold">
            {t.reparto.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.reparto.intro(faroEn(SUMINISTRO, idioma))}</p>
          <div role="region" tabIndex={0} aria-label={t.reparto.caption} className={REGION}>
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">{t.reparto.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.reparto.grupo}
                  </th>
                  <th scope="col" className={TH}>
                    {t.reparto.porcentaje}
                  </th>
                  <th scope="col" className={TH}>
                    {t.reparto.cantidad}
                  </th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((g) => {
                  const d = t.reparto.grupos[g.id];
                  return (
                    <tr key={g.id} className="border-t border-line">
                      <th scope="row" className={`${TD} text-left font-medium`}>
                        {d.nombre}
                        {g.id === "netxgen" && <TerminoLegal clave="partenetxgen" idioma={idioma} />}
                        <span className="block font-normal text-muted">
                          {typeof d.linea === "function" ? d.linea(anios, espera) : d.linea}
                        </span>
                      </th>
                      <td className={TD}>
                        {porcentajeEntero(g.pct, idioma)}
                        {/* La barra es decorativa: el dato está en el texto de la celda. */}
                        <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="mt-1 h-2 w-full">
                          <rect x={0} y={0} width={100} height={4} className="fill-surface-2" />
                          <rect x={0} y={0} width={g.pct} height={4} className="fill-deep" />
                        </svg>
                      </td>
                      <td className={TD}>{faroEn(g.faro, idioma)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="h-tramos" className={TARJETA}>
          <h2 id="h-tramos" className="text-xl font-semibold">
            {t.tramos.titulo}
            <TerminoLegal clave="ventatramos" idioma={idioma} />
          </h2>
          <p className="max-w-3xl text-sm">{t.tramos.intro}</p>
          <div role="region" tabIndex={0} aria-label={t.tramos.caption} className={REGION}>
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">{t.tramos.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.tramos.tramo}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tramos.cantidad}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tramos.precio}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tramos.total}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tramos.map((tr, i) => (
                  <tr key={i} className="border-t border-line">
                    <th scope="row" className={`${TD} text-left font-medium`}>
                      {enteroEn(i + 1, idioma)}
                    </th>
                    <td className={TD}>{faroEn(tr.cantidad, idioma)}</td>
                    <td className={TD}>{usdConDecimales(tr.precio, idioma, 2)}</td>
                    <td className={TD}>{usdConDecimales(tr.totalUsd, idioma, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium">
            {t.tramos.avance(
              porcentajeEn(AVANCE_DE_EJEMPLO.fraccion, idioma),
              enteroEn(AVANCE_DE_EJEMPLO.tramo + 1, idioma),
            )}
          </p>
          <h3 className="font-semibold">{t.tramos.calculadora.titulo}</h3>
          <Calculadora />
        </section>

        <section aria-labelledby="h-staking" className={TARJETA}>
          <h2 id="h-staking" className="text-xl font-semibold">
            {t.staking.titulo}
            <TerminoLegal clave="stakingbiencomun" idioma={idioma} />
          </h2>
          <div role="region" tabIndex={0} aria-label={t.staking.caption} className={REGION}>
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">{t.staking.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.staking.opcion}
                  </th>
                  <th scope="col" className={TH}>
                    {t.staking.que}
                  </th>
                  <th scope="col" className={TH}>
                    {t.staking.favorece}
                  </th>
                  <th scope="col" className={TH}>
                    {t.staking.riesgo}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <th scope="row" className={`${TD} text-left font-medium`}>
                    {t.staking.a.nombre}
                  </th>
                  <td className={TD}>{t.staking.a.que(enteroEn(STAKING.mesesA, idioma))}</td>
                  <td className={TD}>{t.staking.a.favorece}</td>
                  <td className={TD}>{t.staking.a.riesgo}</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className={`${TD} text-left font-medium`}>
                    {t.staking.b.nombre}
                  </th>
                  <td className={TD}>{t.staking.b.que(porcentajeEntero(Math.round(STAKING.anualB * 100), idioma))}</td>
                  <td className={TD}>{t.staking.b.favorece}</td>
                  <td className={TD}>{t.staking.b.riesgo}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium">{t.staking.cierre}</p>
        </section>

        <section aria-labelledby="h-plata" className={TARJETA}>
          <h2 id="h-plata" className="text-xl font-semibold">
            {t.plata.titulo}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <article className="grid content-start gap-2 rounded-lg border border-faint p-3 text-sm">
              <h3 className="font-semibold">{t.plata.capex.titulo}</h3>
              <p>{t.plata.capex.texto}</p>
            </article>
            <article className="grid content-start gap-2 rounded-lg border border-faint p-3 text-sm">
              <h3 className="font-semibold">{t.plata.opex.titulo}</h3>
              <p>{t.plata.opex.texto}</p>
            </article>
          </div>
          <p className="text-sm font-medium">{t.plata.montos}</p>
          <p className="text-sm">{t.plata.aporteEntrada(porcentajeEn(APORTE_DE_ENTRADA, idioma))}</p>
          <h3 className="font-semibold">{t.plata.referentesTitulo}</h3>
          <p className="text-sm text-muted">{t.plata.referentesNota}</p>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.plata.referentes.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-riesgos" className={TARJETA}>
          <h2 id="h-riesgos" className="text-xl font-semibold">
            {t.riesgos.titulo}
          </h2>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.riesgos.items.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted">
          {t.version(VERSION_BIEN_COMUN.fuente, VERSION_BIEN_COMUN.version, VERSION_BIEN_COMUN.fecha)}{" "}
          <Link
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            href="/lotes/hibrido"
          >
            {t.volver}
          </Link>
        </p>
      </div>
    </div>
  );
}
