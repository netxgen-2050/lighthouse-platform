"use client";

import { Donut } from "@/components/donut";
import { costoReparto, ordenar, porcentajes, repartirPresupuesto } from "@/lib/cuadratico/motor";
import { TerminoLegal } from "@/components/termino-legal";
import { fechaCierre, fechaDe, formatoPlata, textoCuandoSeVe } from "@/lib/fogon/consultas/reglas";
import { nombreDePersona } from "@/lib/fogon/consultas/personas";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { fraseConsultiva } from "@/lib/legal/mostrar-termino";
import { textoVotos, votosDe } from "@/lib/fogon/consultas/reparto";
import type { PadronVista, VistaConsulta } from "@/lib/fogon/consultas/tipos";

// Todo esto solo dibuja lo que trae el repositorio: nunca decide qué se puede ver (eso lo decide la fuente de datos).

const CAJA = "grid gap-3 rounded-xl border border-faint bg-surface p-4";

/** Filas del resultado ordenadas, con porcentaje, monto y apoyo; se usa en la pantalla y en el acta. */
function filasDelResultado(vista: VistaConsulta, idioma: Idioma) {
  const { consulta, resultado } = vista;
  if (!resultado.visible) return null;
  const etiqueta = Object.fromEntries(consulta.opciones.map((o) => [o.id, textoEn(o.etiqueta, idioma)]));
  // Los porcentajes se calculan sobre las filas ya ordenadas, igual que la leyenda del donut (que recibe ese orden),
  // para que con empates en el redondeo cada opción muestre un solo porcentaje.
  const ordenadas = ordenar(resultado.agregado);
  const pct = porcentajes(ordenadas);
  const plata =
    consulta.modo === "presupuesto" && consulta.presupuesto
      ? repartirPresupuesto({
          montoCentavos: consulta.presupuesto.montoCentavos,
          opciones: consulta.opciones.map((o) => ({
            id: o.id,
            peso: Math.max(0, resultado.agregado.find((f) => f.opcion === o.id)?.neto ?? 0),
            topeCentavos: o.topeCentavos,
            pisoCentavos: o.pisoCentavos,
          })),
        })
      : null;
  return {
    pct,
    plata,
    filas: ordenadas.map((f) => ({
      ...f,
      etiqueta: etiqueta[f.opcion],
      pct: pct ? pct[f.opcion] : null,
      monto: plata ? plata.partes[f.opcion] : undefined,
    })),
  };
}

/** Los textos fijos del gráfico de dona en el idioma de la página. */
export function useTextosDonut() {
  const d = useTextos("fogonConsultas").donut;
  return { verComoTabla: d.verComoTabla, valor: d.valor, restoAria: d.restoAria };
}

export function ResultadoDelGrupo({ vista }: { vista: VistaConsulta }) {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas");
  const r = t.resultado;
  const textosDonut = useTextosDonut();
  const { consulta, resultado, miReparto } = vista;
  const calculo = filasDelResultado(vista, idioma);
  const participantes = (p: { repartieron: number; padron: number } | null) =>
    p ? t.lista.repartieron(p.repartieron, p.padron) : t.lista.repartieronSinDato;
  return (
    <section aria-labelledby="h-resultado" className={CAJA}>
      <h2 id="h-resultado" className="font-semibold">{r.titulo}</h2>
      {!resultado.visible || !calculo ? (
        <p>
          {textoCuandoSeVe(consulta, idioma)}. {participantes(resultado.participantes)}.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {resultado.participantes
              ? r.repartieron(resultado.participantes.repartieron, resultado.participantes.padron)
              : r.repartieronSinDato}{" "}
            {r.sumaVotos}
          </p>
          <Donut
            titulo={r.votosDelGrupo}
            porciones={calculo.filas.map((f) => ({ id: f.opcion, etiqueta: f.etiqueta, valor: Math.max(0, f.neto) }))}
            formatoValor={(n) => textoVotos(n, idioma)}
            sinDato={t.donut.sinDato}
            columnaEtiqueta={t.donut.opcion}
            textos={textosDonut}
          />
          {calculo.pct === null && <p>{r.votosSinDato}</p>}
          <ol className="grid gap-3">
            {calculo.filas.map((f) => (
              <li key={f.opcion} className="grid gap-1">
                <p className="flex flex-wrap justify-between gap-x-3 font-medium">
                  <span>{f.etiqueta}</span>
                  <span>
                    {textoVotos(f.neto, idioma)} · {f.pct === null ? r.sinDato : `${f.pct} %`}
                  </span>
                </p>
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-green" style={{ width: `${f.pct ?? 0}%` }} />
                </div>
                <p className="flex flex-wrap gap-x-4 text-sm text-muted">
                  <span>{r.apoyo(f.apoyos)}</span>
                  {f.enContra > 0 && <span>{r.enContra(t.unidades.persona(f.enContra))}</span>}
                  {f.monto !== undefined && consulta.presupuesto && (
                    <span>{r.monto(formatoPlata(f.monto, consulta.presupuesto.moneda, idioma))}</span>
                  )}
                  {miReparto && (
                    <span className="font-medium text-deep">
                      <span aria-hidden="true">● </span>{r.tuVoto(textoVotos(votosDe(miReparto, f.opcion), idioma))}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ol>
          {calculo.plata && consulta.presupuesto && (calculo.plata.sinAsignar !== 0 || calculo.plata.avisos.length > 0) && (
            <div className="grid gap-1 text-sm">
              {calculo.plata.sinAsignar !== 0 && (
                <p>{r.sinAsignar(formatoPlata(calculo.plata.sinAsignar, consulta.presupuesto.moneda, idioma))}</p>
              )}
              {calculo.plata.avisos.map((a) => (
                <p key={a} role="note">{r.avisos[a]}</p>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** "Cómo repartió cada persona": solo llega con voto abierto y resultado visible. */
export function TablaDeRepartos({ vista }: { vista: VistaConsulta }) {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas");
  const repartos = vista.padron?.repartos;
  if (!repartos) return null;
  const { consulta } = vista;
  return (
    <section aria-labelledby="h-repartos" className={CAJA}>
      <h2 id="h-repartos" className="font-semibold">{t.repartos.titulo}</h2>
      <div
        role="region"
        tabIndex={0}
        aria-label={t.repartos.aria}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        <table className="w-full min-w-max text-left text-sm">
          <caption className="mb-2 text-left font-medium">{t.repartos.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="pr-4">{t.repartos.persona}</th>
              {consulta.opciones.map((o) => (
                <th key={o.id} scope="col" className="pr-4">{textoEn(o.etiqueta, idioma)}</th>
              ))}
              <th scope="col">{t.repartos.creditosUsados}</th>
            </tr>
          </thead>
          <tbody>
            {repartos.map(({ persona, reparto, propio }) => {
              const nombre = nombreDePersona(persona, idioma);
              return (
                <tr key={persona.id}>
                  <th scope="row" className={`pr-4 ${propio ? "font-semibold" : "font-normal"}`}>
                    {propio && persona.nombre !== "Vos" ? t.personas.yoJunto(nombre) : nombre}
                  </th>
                  {consulta.opciones.map((o) => (
                    <td key={o.id} className="pr-4">{votosDe(reparto, o.id)}</td>
                  ))}
                  <td>{costoReparto(reparto)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** "Faltan votar" (o "No repartieron" si ya cerró); solo con voto abierto. */
export function QuienFalta({ padron, cerrada }: { padron: PadronVista; cerrada: boolean }) {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas").padron;
  const titulo = cerrada ? t.noRepartieron : t.faltan;
  return (
    <section aria-labelledby="h-faltan" className={CAJA}>
      <h2 id="h-faltan" className="font-semibold">{titulo}</h2>
      {padron.faltan.length === 0 && padron.sinAceptar === 0 ? (
        <p>{t.todoElPadron}</p>
      ) : (
        <>
          {padron.faltan.length > 0 && (
            <ul className="list-disc pl-5">
              {padron.faltan.map((p) => (
                <li key={p.id}>{nombreDePersona(p, idioma)}</li>
              ))}
            </ul>
          )}
          {padron.sinAceptar > 0 && <p className="text-sm text-muted">{t.sinAceptar(padron.sinAceptar)}</p>}
        </>
      )}
    </section>
  );
}

/** Acta de ejemplo de una consulta cerrada. */
export function Acta({ vista }: { vista: VistaConsulta }) {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas");
  const a = t.acta;
  const { consulta, resultado, cierreManual } = vista;
  const calculo = filasDelResultado(vista, idioma);
  const sinDato = t.resultado.sinDato;
  return (
    <section aria-labelledby="h-acta" className={CAJA}>
      <h2 id="h-acta" className="font-semibold">{a.titulo}</h2>
      <dl className="grid gap-1 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="font-medium">{a.consulta}</dt>
        <dd>{textoEn(consulta.titulo, idioma)}</dd>
        <dt className="font-medium">{a.cierre}</dt>
        <dd>{cierreManual ? t.cierre.manual(fechaDe(cierreManual, idioma)) : fechaCierre(consulta, idioma)}</dd>
        <dt className="font-medium">{a.regla}</dt>
        <dd>{a.reglaTexto}</dd>
        <dt className="font-medium">{a.participantes}</dt>
        <dd>
          {resultado.participantes ? a.participantesTexto(resultado.participantes.repartieron, resultado.participantes.padron) : sinDato}
        </dd>
        <dt className="font-medium">{a.resultado}</dt>
        <dd>
          {calculo ? (
            <ol className="list-decimal pl-5">
              {calculo.filas.map((f) => (
                <li key={f.opcion}>
                  {f.etiqueta} · {textoVotos(f.neto, idioma)} · {f.pct === null ? sinDato : `${f.pct} %`}
                  {f.monto !== undefined && consulta.presupuesto && ` · ${formatoPlata(f.monto, consulta.presupuesto.moneda, idioma)}`}
                </li>
              ))}
            </ol>
          ) : (
            sinDato
          )}
        </dd>
      </dl>
      <p className="text-sm">
        <span>{fraseConsultiva(idioma)}</span> <TerminoLegal clave="consultivo" idioma={idioma} />
      </p>
    </section>
  );
}
