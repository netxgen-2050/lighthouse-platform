import Link from "next/link";
import { Rangos } from "@/components/rangos";
import { TerminoLegal } from "@/components/termino-legal";
import { textos } from "@/lib/idioma/textos";
import { GRUPOS_PRINCIPIO, MANIFIESTO_VRN, principiosDelGrupo, principiosLighthouseVrn } from "@/lib/manifiestos/lighthouse-vrn";
import {
  FUTUROS_SIMULADOS,
  MONTE_CARLO,
  SUPUESTOS_MONTE_CARLO,
  type SerieRiesgo,
} from "@/lib/financiamiento/riesgo";
import { RETORNO_SERIE_MADRE, recorridoVino, valorFuturo } from "@/lib/financiamiento/recorridos";
import {
  A_VERIFICAR_CON_ABOGADO,
  GRUPOS_SUPUESTOS,
  HALLAZGOS_RIESGO,
  LOTES_INTRO,
  LOTES_VS_MODELO,
  PROPUESTA_PARA_QUIEN_VENDE,
  SUPUESTOS_A_CONFIRMAR,
} from "@/lib/financiamiento/relato";
import { SIN_DATO, multiplo, numero, pct, usd } from "@/lib/series/formato";
import { CARTA, H2, SECCION, TD, TH, pctEntero, signoMenos } from "./estilos";

const SERIES: { id: SerieRiesgo; etiqueta: string }[] = [
  { id: "vinedo", etiqueta: "Viñedo" },
  { id: "agrovoltaica", etiqueta: "Agrovoltaica" },
];

export function SeccionRecorridos() {
  const monto = 10000;
  const finales = RETORNO_SERIE_MADRE.valores.map((r) => valorFuturo(monto, r, 10));
  const tasas = RETORNO_SERIE_MADRE.valores.map((r) => Math.round(r * 100)).join(" · ");
  const montos = finales.map((v, i) => (v === null ? SIN_DATO : i === 0 ? usd(v) : numero(v))).join(" · ");
  const vino = recorridoVino();
  return (
    <section aria-labelledby="m-recorridos" className={SECCION}>
      <h2 id="m-recorridos" className={H2}>
        Recorridos de inversores
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={CARTA}>
          <h3 className="text-lg font-semibold">A · &quot;Invierto hoy y en 10 años vivo acá&quot;</h3>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
            <li>
              {usd(monto)} en la Serie Madre <TerminoLegal clave="seriemadre" /> a {tasas} % por año, a 10 años: {montos}.
            </li>
            <li>Entrada a la vivienda: {SIN_DATO} (se define después de la aprobación municipal).</li>
            <li>
              Antes de la aprobación no hay prioridad ni reserva de ningún lote <TerminoLegal clave="ordenanza173" />.
            </li>
          </ul>
          <p className="mt-2 text-sm text-muted">
            El retorno de la Serie Madre es un parámetro, no un resultado del modelo: {RETORNO_SERIE_MADRE.fuente}. A confirmar
            con {RETORNO_SERIE_MADRE.aConfirmar}.
          </p>
        </div>

        <div className={CARTA}>
          <h3 className="text-lg font-semibold">B · &quot;USD 1.000 en el vino&quot;</h3>
          {vino === null ? (
            <p className="mt-2 text-sm">{SIN_DATO}</p>
          ) : (
            <>
              <p className="mt-2">
                {usd(vino.total)} en {vino.anios} años (TIR {pct(vino.tir)}) en Unidades de Regeneración{" "}
                <TerminoLegal clave="unidadesregeneracion" /> del viñedo.
              </p>
              <p className="mt-2 text-sm">
                {vino.camino === null
                  ? `Camino del vino: ${SIN_DATO}.`
                  : `Camino del vino: si lo que cobrás del año 1 al ${vino.anios - 1} lo tomás en botellas a ${usd(vino.precioBotella)} cada una, son unas ${numero(vino.camino.botellas)} botellas más ${usd(vino.camino.plataUltimoAnio)} el año ${vino.camino.anioUltimo}.`}
              </p>
              <details className="mt-2">
                <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
                  Ver año por año
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Lo que recibe quien pone USD 1.000 en el viñedo, año por año</caption>
                    <thead>
                      <tr>
                        <th scope="col" className={TH}>
                          Año
                        </th>
                        <th scope="col" className={TH}>
                          Recibís
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vino.flujos.map((f, t) => (
                        <tr key={t}>
                          <th scope="row" className={`${TD} text-left font-normal`}>
                            {t === 0 ? "0 (ponés)" : t}
                          </th>
                          <td className={TD}>{t === 0 ? usd(-f) : usd(f)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function SeccionRiesgo() {
  const filasTir = SERIES.map((s) => ({ id: s.id, etiqueta: s.etiqueta, ...MONTE_CARLO[s.id].tirUnidades }));
  const porcentajes = SERIES.map((s) => pctEntero(MONTE_CARLO[s.id].pPrimeraNoSeRecupera)).join(" · ");
  const pctRango = (n: number) => signoMenos(pct(n));
  return (
    <section aria-labelledby="m-riesgo" className={SECCION}>
      <h2 id="m-riesgo" className={H2}>
        ¿Y si sale mal?
      </h2>
      <p className="mb-3 max-w-3xl text-muted">
        {numero(FUTUROS_SIMULADOS)} futuros simulados por serie, con heladas, demoras y precios inciertos. P10 es un mal futuro,
        P50 el del medio y P90 uno muy bueno. No es un pronóstico.
      </p>
      <div className="grid gap-4">
        {SERIES.map((s) => {
          const m = MONTE_CARLO[s.id];
          const filas = [
            { id: "tir", etiqueta: "TIR de las Unidades", r: m.tirUnidades, f: pctRango },
            { id: "fundacion", etiqueta: "Lo que recibe la Fundación", r: m.fundacionRecibe, f: usd },
            { id: "pp", etiqueta: "Múltiplo de la primera pérdida", r: m.multiploPrimeraPerdida, f: multiplo },
          ];
          return (
            <div key={s.id} className={CARTA}>
              <h3 className="mb-2 text-lg font-semibold">{s.etiqueta}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-sm">
                  <caption className="sr-only">{`${s.etiqueta}: resultados de los futuros simulados (P10, P50, P90)`}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className={TH}>
                        Qué
                      </th>
                      {["P10", "P50", "P90"].map((p) => (
                        <th key={p} scope="col" className={TH}>
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr key={f.id}>
                        <th scope="row" className={`${TD} text-left font-normal`}>
                          {f.etiqueta}
                        </th>
                        <td className={TD}>{f.f(f.r.p10)}</td>
                        <td className={TD}>{f.f(f.r.p50)}</td>
                        <td className={TD}>{f.f(f.r.p90)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
                <li>{pctEntero(m.pPierden)} de los futuros: las Unidades pierden plata</li>
                <li>{pctEntero(m.pLleganAlTope)} de los futuros: las Unidades llegan al tope</li>
                <li>
                  {pctEntero(m.pPrimeraNoSeRecupera)} de los futuros: la primera pérdida{" "}
                  <TerminoLegal clave="primeraperdida" /> no se recupera completa
                </li>
              </ul>
              <p className="mt-2 text-sm text-muted">Supuestos de incertidumbre: {SUPUESTOS_MONTE_CARLO[s.id]}</p>
            </div>
          );
        })}
      </div>

      <div className={`mt-4 ${CARTA}`}>
        <Rangos titulo="TIR de las Unidades por serie (P10 · P50 · P90)" filas={filasTir} formato={pctRango} />
      </div>

      <h3 className="mt-5 mb-2 text-lg font-semibold">Tres hallazgos que cambian el diseño</h3>
      <ol className="grid list-decimal gap-3 pl-6">
        {HALLAZGOS_RIESGO.map((h) => (
          <li key={h.id} className={`${CARTA} ml-2`}>
            <strong>{h.titulo}.</strong> {h.texto.replace("{pct}", porcentajes)}
            <span className="block text-xs text-muted">Fuente: {h.fuente}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-muted">Se muestran todos, también los que no ayudan al relato.</p>
    </section>
  );
}

export function SeccionJuegos() {
  return (
    <section aria-labelledby="m-juegos" className={SECCION}>
      <h2 id="m-juegos" className={H2}>
        Juego A o Juego B
      </h2>
      <p className="mb-3 max-w-3xl">{LOTES_INTRO}</p>
      <div className={`overflow-x-auto ${CARTA}`}>
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">Comparación entre el Juego A y el Juego B</caption>
          <thead>
            <tr>
              <th scope="col" className={TH}>
                Tema
              </th>
              <th scope="col" className={TH}>
                Juego A · vender lotes ahora
              </th>
              <th scope="col" className={TH}>
                Juego B · el procomún
              </th>
            </tr>
          </thead>
          <tbody>
            {LOTES_VS_MODELO.map((f) => (
              <tr key={f.id}>
                <th scope="row" className={`${TD} text-left font-semibold`}>
                  {f.titulo}
                </th>
                <td className={TD}>
                  {f.juegoA} {f.id === "ley" && <TerminoLegal clave="ordenanza173" />}
                  {f.aVerificar && <span className="block text-xs text-muted">{A_VERIFICAR_CON_ABOGADO}</span>}
                </td>
                <td className={TD}>
                  {f.juegoB} {f.id === "tierra" && <TerminoLegal clave="fundaciontierra" />}
                  {f.aVerificar && <span className="block text-xs text-muted">{A_VERIFICAR_CON_ABOGADO}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-3xl">
        <strong>Para quien quiere vender.</strong> {PROPUESTA_PARA_QUIEN_VENDE}
      </p>
      <BloqueManifiesto />
    </section>
  );
}

/** "Las decisiones, con la vida en el centro": el propósito y los cinco grupos de Lighthouse VRN, leídos de la misma fuente que la ficha. */
function BloqueManifiesto() {
  // Esta página está solo en español, como el resto de la Vista NetX.
  const t = textos("manifiestoVrn", "es");
  const total = principiosLighthouseVrn().length;
  return (
    <div aria-labelledby="m-manifiesto" role="group" className={`mt-6 grid gap-2 ${CARTA}`}>
      <h3 id="m-manifiesto" className="text-lg font-semibold">
        {t.netx.titulo}
      </h3>
      <p className="max-w-3xl">{t.netx.intro}</p>
      <p className="max-w-3xl font-medium">
        {MANIFIESTO_VRN.proposito.es}
      </p>
      <p className="text-sm font-medium">{t.netx.grupos}</p>
      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        {GRUPOS_PRINCIPIO.map((g) => (
          <li key={g}>
            {t.grupos[g]}: {t.netx.cantidad(principiosDelGrupo(g).length)}
          </li>
        ))}
      </ul>
      <p className="text-sm">{t.netx.total(total)}</p>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border border-faint px-2 py-0.5 text-xs">{t.borrador}</span>
        <TerminoLegal clave="manifiestovrn" />
      </p>
      <p>
        <Link className="underline" href="/tribus/lighthouse">
          {t.netx.ver}
        </Link>
      </p>
    </div>
  );
}

export function SeccionSupuestos() {
  return (
    <section aria-labelledby="m-supuestos" className={SECCION}>
      <h2 id="m-supuestos" className={H2}>
        Supuestos a confirmar
      </h2>
      <p className="mb-3 max-w-3xl text-muted">
        Todo lo que esta vista usa y todavía nadie confirmó, agrupado por quién lo confirma. Lo que no tiene valor dice
        &quot;{SIN_DATO}&quot;.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {GRUPOS_SUPUESTOS.map((g) => (
          <section key={g.quien} aria-labelledby={`m-sup-${g.quien}`} className={CARTA}>
            <h3 id={`m-sup-${g.quien}`} className="mb-2 text-lg font-semibold">
              {g.titulo}
            </h3>
            <ul className="grid gap-2 text-sm">
              {SUPUESTOS_A_CONFIRMAR.filter((s) => s.quien === g.quien).map((s) => (
                <li key={s.etiqueta}>
                  {s.etiqueta}: {s.valor}
                  {s.nota ? ` ${s.nota}` : ""}
                  <span className="block text-xs text-muted">Fuente: {s.fuente}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
