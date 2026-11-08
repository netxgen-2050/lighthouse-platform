import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { TerminoLegal } from "@/components/termino-legal";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import {
  ESCENARIOS_COSTO,
  MASTERPLAN_PRIMER_ANIO_USD,
  coberturaDeEscenario,
  lotesDelSector,
  parteDelSectorPrivada,
} from "@/lib/lotes/escenarios";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";
import {
  RESGUARDOS,
  RUBROS,
  apartadoDeResguardo,
  costoDeRubro,
  estadoDeResguardo,
  nombreDeResguardo,
  nombreDeRubro,
  textoDeResguardo,
  textoQuienCuida,
  textoQuienPaga,
  textoTipo,
} from "@/lib/lotes/hibrido";
import { MODELO_LOTES, VERSION_MODELO_LOTES, aporteDe, paquetePromedio } from "@/lib/lotes/modelo";
import { Calculadora } from "./calculadora";

// Qué es tuyo y qué es de todos (spec modelo-hibrido). Se ve sin sesión. Ningún número se escribe acá: salen de
// `lib/lotes/modelo.ts`, `lib/lotes/escenarios.ts` y `lib/lotes/hibrido.ts`.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("hibrido", await idiomaDelPedido()).titulo };
}

const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const MARCA = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";
const TH = "px-2 py-1.5 text-left font-semibold";
const TD = "px-2 py-1.5 align-top";

export default async function HibridoPage() {
  const idioma = await idiomaDelPedido();
  const t = textos("hibrido", idioma);
  const en = idioma === "en";

  const lotes = lotesDelSector();
  const parte = parteDelSectorPrivada();
  const promedio = paquetePromedio();
  const anios = String(MODELO_LOTES.aniosDeVenta);

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/lotes">
          {t.volverALista}
        </Link>
      </p>
      <h1 className="text-3xl font-semibold">{t.titulo}</h1>
      <p className="mt-2 max-w-3xl text-muted">{t.bajada}</p>
      <div className="mt-3 grid gap-2">
        <AvisoEjemplo />
        <p className="w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          {textos("marco", idioma).aviso}
        </p>
        <EstadoAdministrativo proyecto="lighthouse-norte" compacto idioma={idioma} />
      </div>

      <div className="mt-6 grid gap-6">
        <section aria-labelledby="h-tabla" className={TARJETA}>
          <h2 id="h-tabla" className="text-xl font-semibold">
            {t.tabla.titulo}
          </h2>
          <p className="max-w-3xl text-sm">
            {t.tabla.propuesta}
            <TerminoLegal clave="consorciofundacion" idioma={idioma} />
          </p>
          <p className="text-sm font-medium">
            {t.tabla.fundacion}
            <TerminoLegal clave="fundaciontierra" idioma={idioma} />
          </p>
          <div
            role="region"
            tabIndex={0}
            aria-label={t.tabla.caption}
            className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">{t.tabla.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={TH}>
                    {t.tabla.rubro}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tabla.tipo}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tabla.quienPaga}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tabla.costo}
                  </th>
                  <th scope="col" className={TH}>
                    {t.tabla.cuida}
                  </th>
                </tr>
              </thead>
              <tbody>
                {RUBROS.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <th scope="row" className={`${TD} text-left font-medium`}>
                      {nombreDeRubro(r, idioma)}
                    </th>
                    <td className={`${TD} font-medium`}>{textoTipo(r, idioma)}</td>
                    <td className={TD}>{textoQuienPaga(r, idioma)}</td>
                    <td className={TD}>
                      {costoDeRubro(r, idioma)}
                      {r.tipo === "privado" && (
                        <span className="ml-1 text-xs text-muted">({t.tabla.deEjemplo})</span>
                      )}
                    </td>
                    <td className={TD}>{textoQuienCuida(r, idioma)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">{t.tabla.nota}</p>
        </section>

        <section aria-labelledby="h-aporte" className={TARJETA}>
          <h2 id="h-aporte" className="text-xl font-semibold">
            {t.aporte.titulo}
          </h2>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            <li>
              {t.aporte.unico(
                porcentajeEn(MODELO_LOTES.aporteUnico, idioma),
                usdEn(promedio, idioma),
                usdEn(aporteDe(promedio), idioma),
              )}
              <TerminoLegal clave="aporteunico" idioma={idioma} />
            </li>
            <li>
              {t.aporte.expensas(usdEn(MODELO_LOTES.expensaAnual, idioma))}
              <TerminoLegal clave="expensas" idioma={idioma} />
            </li>
            <li>{t.aporte.incluido}</li>
            <li>{t.aporte.primeros}</li>
          </ul>
        </section>

        <section aria-labelledby="h-alcanza" className={TARJETA}>
          <h2 id="h-alcanza" className="text-xl font-semibold">
            {t.alcanza.titulo}
          </h2>
          <p className="max-w-3xl text-sm font-medium">{t.alcanza.intro}</p>

          <h3 className="font-semibold">{t.alcanza.paraQueTitulo}</h3>
          <p className="max-w-3xl text-sm">
            {parte === null ? t.alcanza.paraQueSinDato : t.alcanza.paraQue(porcentajeEn(parte, idioma, 1), String(lotes))}
          </p>

          <h3 className="font-semibold">{t.alcanza.queCuestaTitulo}</h3>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            <li>{t.alcanza.masterplan(usdEn(MASTERPLAN_PRIMER_ANIO_USD, idioma))}</li>
            {t.alcanza.rubros.map((r) => (
              <li key={r}>{t.alcanza.rubroSinDato(r)}</li>
            ))}
          </ul>

          <h3 className="font-semibold">{t.alcanza.escenariosTitulo}</h3>
          <ul className="grid gap-3 md:grid-cols-3">
            {ESCENARIOS_COSTO.map((e) => {
              const c = coberturaDeEscenario(e.id);
              return (
                <li key={e.id} className="grid content-start gap-2 rounded-lg border border-faint p-3 text-sm">
                  <h4 className="font-semibold">{en ? e.nombre.en : e.nombre.es}</h4>
                  <p className="font-medium">{t.alcanza.costoAnual(usdEn(e.costoAnual, idioma))}</p>
                  <p className={MARCA}>{t.alcanza.marca}</p>
                  <p className="text-muted">
                    {t.alcanza.fuente} {en ? e.fuente.en : e.fuente.es}
                  </p>
                  {c === null ? (
                    <p>{t.alcanza.sinDato}</p>
                  ) : (
                    <>
                      <p>
                        {t.alcanza.cubreVenta(
                          anios,
                          String(lotes),
                          usdEn(c.duranteLaVenta, idioma),
                          porcentajeEn(c.fraccionDuranteLaVenta, idioma),
                        )}
                      </p>
                      <p>{t.alcanza.cubreDespues(usdEn(c.despues, idioma), porcentajeEn(c.fraccionDespues, idioma))}</p>
                      <p>{c.fraccionDespues >= 1 ? t.alcanza.cubreTodo : t.alcanza.resto}</p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted">{t.alcanza.lotesNota}</p>

          <h3 className="font-semibold">{t.calculadora.titulo}</h3>
          <p className="max-w-3xl text-sm">{t.calculadora.intro}</p>
          <Calculadora expensaInicial={MODELO_LOTES.expensaAnual} lotesIniciales={lotes} />

          <h3 className="font-semibold">{t.vagner.titulo}</h3>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.vagner.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <p className="text-sm">
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/bien-comun">
            {textos("biencomun", idioma).enlace}
          </Link>
        </p>

        <section aria-labelledby="h-resguardos" className={TARJETA}>
          <h2 id="h-resguardos" className="text-xl font-semibold">
            {t.resguardos.titulo}
          </h2>
          <p className="max-w-3xl text-sm">{t.resguardos.intro}</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {RESGUARDOS.map((r) => {
              const aparte = apartadoDeResguardo(r, idioma);
              return (
                <li key={r.id} className="grid content-start gap-1 rounded-lg border border-faint p-3 text-sm">
                  <h3 className="font-semibold">{nombreDeResguardo(r, idioma)}</h3>
                  <p>{textoDeResguardo(r, idioma)}</p>
                  <p className="font-medium">
                    <span aria-hidden="true">▲ </span>
                    {t.resguardos.estado} {estadoDeResguardo(r, idioma)}
                    <TerminoLegal clave="resguardoshibrido" idioma={idioma} />
                  </p>
                  {aparte && (
                    <p className="text-muted">
                      {aparte}
                      <TerminoLegal clave="ribera" idioma={idioma} />
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <p className="text-sm text-muted">
          {t.version(VERSION_MODELO_LOTES.fuente, VERSION_MODELO_LOTES.version, VERSION_MODELO_LOTES.fecha)}
        </p>
      </div>
    </div>
  );
}
