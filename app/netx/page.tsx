import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { anchoBarra, anchoMedidor, conversiones, formatear, porcentaje } from "@/lib/vista-netx/calculos";
import { BandejaPedidos } from "./bandeja-pedidos";
import { PostulacionesComunidades } from "./postulaciones-comunidades";
import { ALERTAS, EMBUDO, EMISION, INDICADORES, TRIBUS_POR_PROYECTO } from "@/lib/vista-netx/datos";

export const metadata: Metadata = { title: "Vista NetX" };

const CARTA = "rounded-xl border border-faint bg-surface p-4";

function Medidor({ etiqueta, actual, maximo, dorado }: { etiqueta: string; actual: number; maximo: number; dorado?: boolean }) {
  const pct = porcentaje(actual, maximo);
  return (
    <div className="mb-3">
      <p className="flex justify-between gap-2 text-sm">
        <span>{etiqueta}</span>
        <span>
          {formatear(actual)} / {formatear(maximo)} · {pct === null ? "sin dato" : `${pct}%`}
        </span>
      </p>
      <div aria-hidden="true" className="mt-1 h-2 rounded-full bg-surface-2">
        <div className={`h-2 rounded-full ${dorado ? "bg-gold" : "bg-green"}`} style={{ width: `${anchoMedidor(pct)}%` }} />
      </div>
    </div>
  );
}

export default function NetxPage() {
  const conv = conversiones(EMBUDO);
  const maximo = Math.max(...EMBUDO.map((e) => e.valor));
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Vista NetX · para Franz</p>
      <h1 className="text-3xl font-semibold">¿Vamos a vender en febrero?</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Embudo, tribus y cumplimiento. Todos los datos de esta vista son de ejemplo.
      </p>

      <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {INDICADORES.map((i) => (
          <li key={i.etiqueta} className={CARTA}>
            <span className="block text-2xl font-semibold">{i.numero}</span>
            <span className="block text-sm text-muted">{i.etiqueta}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="t-embudo" className={CARTA}>
          <h2 id="t-embudo" className="mb-3 text-lg font-semibold">
            Embudo · últimos 30 días <span className="text-sm font-normal text-muted">(ejemplo)</span>
          </h2>
          <ol className="grid gap-3">
            {EMBUDO.map((e, i) => (
              <li key={e.etiqueta}>
                <p className="flex justify-between gap-2 text-sm">
                  <span>{e.etiqueta}</span>
                  <span>
                    <strong>{formatear(e.valor)}</strong>
                    {i > 0 && (
                      <span className="text-muted">
                        {" · "}
                        {conv[i] === null ? "sin dato de la etapa anterior" : `${conv[i]}% de la etapa anterior`}
                      </span>
                    )}
                  </span>
                </p>
                <div aria-hidden="true" className="mt-1 h-3 rounded-full bg-surface-2">
                  <div className="h-3 rounded-full bg-deep" style={{ width: `${anchoBarra(e.valor, maximo)}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="t-cumplimiento" className={CARTA}>
          <h2 id="t-cumplimiento" className="mb-3 text-lg font-semibold">
            Cumplimiento <span className="text-sm font-normal text-muted">(ejemplo)</span>
          </h2>
          <Medidor etiqueta="Lugares del círculo usados (oferta privada)" actual={EMISION.aportantes} maximo={EMISION.cupo} />
          <Medidor
            etiqueta="Lugares para no calificados usados"
            actual={EMISION.noCalificados}
            maximo={EMISION.cupoNoCalificados}
            dorado
          />
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Alertas de cumplimiento</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Alerta</th>
                <th scope="col">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {ALERTAS.map((a) => (
                <tr key={a.etiqueta} className="border-t border-line">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                    {a.etiqueta}
                    {a.termino && <TerminoLegal clave={a.termino} />}
                  </th>
                  <td className="py-1.5 text-right font-semibold">{a.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section aria-labelledby="t-tribus" className={CARTA}>
        <h2 id="t-tribus" className="mb-3 text-lg font-semibold">
          Tribus por proyecto <span className="text-sm font-normal text-muted">(ejemplo)</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Tribus por proyecto: fincas, plata, roles y ritual</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="py-1.5 pr-3">Tribu</th>
                <th scope="col" className="py-1.5 pr-3">Fincas</th>
                <th scope="col" className="py-1.5 pr-3 text-right">Plata</th>
                <th scope="col" className="py-1.5 pr-3 text-right">Roles</th>
                <th scope="col" className="py-1.5">Ritual</th>
              </tr>
            </thead>
            <tbody>
              {TRIBUS_POR_PROYECTO.map((t) => {
                const pct = t.plata ? porcentaje(t.plata[0], t.plata[1]) : null;
                return (
                  <tr key={t.nombre} className="border-t border-line">
                    <th scope="row" className="py-1.5 pr-3 text-left font-normal">{t.nombre}</th>
                    <td className="py-1.5 pr-3">{t.fincas}</td>
                    <td className="py-1.5 pr-3 text-right">{pct === null ? "sin dato" : `${pct}%`}</td>
                    <td className="py-1.5 pr-3 text-right">{t.roles ? `${t.roles[0]}/${t.roles[1]}` : "sin dato"}</td>
                    <td className="py-1.5">{t.ritual}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <PostulacionesComunidades />
      <BandejaPedidos />
    </div>
  );
}
