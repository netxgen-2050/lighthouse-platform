"use client";

import { useId, useMemo, useState } from "react";
import { Donut, type PorcionDonut } from "@/components/donut";
import { TerminoLegal } from "@/components/termino-legal";
import {
  CLAVES_DECIDIDAS,
  ESCENARIOS,
  FUENTE_SUPUESTOS,
  FUENTE_VAGNER,
  IDS_ESCENARIOS,
  QUIEN_DECIDE_VIVIENDA,
  VERSION_MODELO,
  estadoDePartida,
  parametrosDesde,
  type ClaveDecidida,
  type ClaveSupuestoNum,
  type EstadoControles,
} from "@/lib/series/escenarios";
import { numeroCorto, textoPartida, textoValor } from "@/lib/series/etiquetas";
import { SIN_DATO, multiplo, numero, pct, usd } from "@/lib/series/formato";
import { correrSerie, porMil } from "@/lib/series/modelo";
import { convertirSafu } from "@/lib/series/safu";
import type { IdEscenario, Metadato, ResultadoClase } from "@/lib/series/tipos";

const NOTA_TIR = "«sin dato» en la TIR: la clase no recupera lo que puso, así que no hay una tasa que calcular.";

const NOMBRE_CORTO: Record<IdEscenario, string> = { vinedo: "del viñedo", agrovoltaica: "de la agrovoltaica" };

function Control({
  meta,
  valor,
  alCambiar,
  textoActual,
}: {
  meta: Metadato;
  valor: number;
  alCambiar: (v: number) => void;
  /** Reemplaza el texto del valor (por ejemplo el reparto "80 % procomún · 20 % Unidades"). */
  textoActual?: string;
}) {
  const id = useId();
  const texto = textoValor(meta, valor);
  return (
    <div className="min-w-0 border-t border-line py-3">
      <label htmlFor={id} className="block font-medium">
        {meta.etiqueta}
      </label>
      <output htmlFor={id} className="mt-1 block text-lg font-semibold">
        {textoActual ?? texto}
      </output>
      <input
        id={id}
        type="range"
        className="my-2 block w-full min-w-0 accent-deep"
        min={meta.min}
        max={meta.max}
        step={meta.paso}
        value={valor}
        aria-valuetext={textoActual ? `${texto}. ${textoActual}` : texto}
        aria-describedby={`${id}-info`}
        onChange={(e) => alCambiar(Number(e.target.value))}
      />
      <div id={`${id}-info`} className="grid gap-0.5 text-sm text-muted">
        <p>Valor de partida: {textoPartida(meta)}</p>
        {meta.quienDecide && <p>Quién decide (propuesta, a discutir): {meta.quienDecide}</p>}
        {meta.fuente && <p>Fuente: {meta.fuente}</p>}
        {meta.ayuda && <p>{meta.ayuda}</p>}
      </div>
    </div>
  );
}

const celda = "whitespace-nowrap py-1 pr-4 text-right";
const celdaTexto = "whitespace-nowrap py-1 pr-4 text-left font-normal";

function FilaClase({
  nombre,
  clase,
  recibe,
}: {
  nombre: React.ReactNode;
  clase?: ResultadoClase;
  recibe?: number;
}) {
  const pone = clase ? clase.pone : 0;
  const recibido = clase ? clase.recibe : (recibe ?? 0);
  const conCapital = clase !== undefined && clase.pone > 0;
  return (
    <tr className="border-t border-line">
      <th scope="row" className={celdaTexto}>{nombre}</th>
      <td className={celda}>{usd(pone)}</td>
      <td className={celda}>{usd(recibido)}</td>
      <td className={celda}>{conCapital ? multiplo(clase.multiplo) : "—"}</td>
      <td className={celda}>{conCapital ? pct(clase.tir) : "—"}</td>
    </tr>
  );
}

export function SimuladorCliente() {
  const [escenario, setEscenario] = useState<IdEscenario>("vinedo");
  const [estados, setEstados] = useState<Record<IdEscenario, EstadoControles>>({
    vinedo: estadoDePartida("vinedo"),
    agrovoltaica: estadoDePartida("agrovoltaica"),
  });
  const [anuncio, setAnuncio] = useState("");
  const def = ESCENARIOS[escenario];
  const estado = estados[escenario];

  function cambiar(f: (e: EstadoControles) => EstadoControles) {
    setAnuncio("");
    setEstados((prev) => ({ ...prev, [escenario]: f(prev[escenario]) }));
  }
  const setDecidido = (k: ClaveDecidida, v: number) => cambiar((e) => ({ ...e, decididos: { ...e.decididos, [k]: v } }));
  const setMedido = (k: string, v: number) => cambiar((e) => ({ ...e, medidos: { ...e.medidos, [k]: v } }));
  const setSupuesto = (k: ClaveSupuestoNum, v: number) => cambiar((e) => ({ ...e, supuestos: { ...e.supuestos, [k]: v } }));

  function volver() {
    setEstados((prev) => ({ ...prev, [escenario]: estadoDePartida(escenario) }));
    setAnuncio("Volviste a los valores de partida");
  }

  const { resultado, mil, safu } = useMemo(() => {
    const p = parametrosDesde(escenario, estado);
    const r = correrSerie(escenario, p.decididos, p.medidos as never, p.supuestos);
    return { resultado: r, mil: porMil(r.flujosUnidades), safu: convertirSafu(1000, p.decididos.descuentoSafu) };
  }, [escenario, estado]);

  const parteNotas = def.supuestos.parteNotas ? (estado.supuestos.parteNotas ?? 0) : 0;
  const partePp = estado.supuestos.partePrimeraPerdida ?? 0;
  const parteUnidades = 100 - parteNotas - partePp;
  const parteExcedente = estado.decididos.parteExcedenteUnidades;

  const clases = [resultado.notas, resultado.primeraPerdida, resultado.unidades].filter((c): c is ResultadoClase => c !== null);
  const hayTirSinDato = clases.some((c) => c.pone > 0 && c.tir === null);

  const porciones: PorcionDonut[] = [
    { id: "procomun", etiqueta: "Procomún · Fundación", valor: resultado.procomun.recibe },
    { id: "unidades", etiqueta: "Unidades de Regeneración", valor: resultado.unidades.recibe },
    { id: "primera-perdida", etiqueta: "Primera pérdida", valor: resultado.primeraPerdida.recibe },
    ...(resultado.notas ? [{ id: "notas", etiqueta: "Notas Verdes", valor: resultado.notas.recibe }] : []),
    { id: "netx", etiqueta: "NetX", valor: resultado.netx.recibe },
  ];

  const resumen = `Procomún ${usd(resultado.procomun.recibe)}, Unidades TIR ${pct(resultado.unidades.tir)}, NetX ${usd(resultado.netx.recibe)}`;
  const horizonte = def.horizonte;
  const idCurva = "curva-escalada";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <fieldset className="rounded-xl border border-line p-4">
        <legend className="px-2 font-semibold">Escenario</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {IDS_ESCENARIOS.map((id) => (
            <label key={id} className="flex items-center gap-2">
              <input
                type="radio"
                name="escenario"
                className="size-4 accent-deep"
                checked={escenario === id}
                onChange={() => {
                  setAnuncio("");
                  setEscenario(id);
                }}
              />
              {ESCENARIOS[id].etiqueta}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={volver}
          className="rounded-lg border border-deep px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          Volver a los valores de partida
        </button>
        <p role="status" className="text-sm text-muted">{anuncio}</p>
      </div>

      <fieldset className="min-w-0 rounded-xl border border-line p-4">
        <legend className="px-2 font-semibold">Valores que se deciden</legend>
        {CLAVES_DECIDIDAS.map((k) => (
          <Control
            key={k}
            meta={def.decididos[k]}
            valor={estado.decididos[k]}
            alCambiar={(v) => setDecidido(k, v)}
            textoActual={
              k === "parteExcedenteUnidades"
                ? `${numeroCorto(100 - parteExcedente)} % procomún · ${numeroCorto(parteExcedente)} % Unidades`
                : undefined
            }
          />
        ))}
      </fieldset>

      <fieldset className="min-w-0 rounded-xl border border-line p-4">
        <legend className="px-2 font-semibold">Datos que se miden (no se votan)</legend>
        <p className="mb-2 text-sm text-muted">
          Se pueden mover para probar los casos posibles; no los decide nadie con un voto.
        </p>
        {Object.entries(def.medidos).map(([k, meta]) => (
          <Control key={k} meta={meta} valor={estado.medidos[k]} alCambiar={(v) => setMedido(k, v)} />
        ))}
        <fieldset className="mt-3 min-w-0 rounded-lg border border-line p-3">
          <legend className="px-2 font-semibold">Supuestos del modelo · a confirmar con Vagner</legend>
          {(Object.entries(def.supuestos) as [ClaveSupuestoNum, Metadato][]).map(([k, meta]) => (
            <Control
              key={k}
              meta={meta}
              valor={estado.supuestos[k] ?? meta.partida}
              alCambiar={(v) => setSupuesto(k, v)}
            />
          ))}
          {def.curvaEscaladaControl && (
            <div className="border-t border-line py-3">
              <label className="flex items-start gap-2 font-medium">
                <input
                  id={idCurva}
                  type="checkbox"
                  className="mt-1 size-4 accent-deep"
                  checked={estado.curvaEscalada}
                  aria-describedby={`${idCurva}-info`}
                  onChange={(e) => cambiar((s) => ({ ...s, curvaEscalada: e.target.checked }))}
                />
                La curva de los primeros años escala con el rendimiento en madurez
              </label>
              <div id={`${idCurva}-info`} className="mt-1 grid gap-0.5 text-sm text-muted">
                <p>Valor de partida: sí</p>
                <p>Fuente: {FUENTE_VAGNER}</p>
                <p>Apagada, los años 1 a 5 quedan en 0, 0, 2, 4 y 6 t por ha, como en el modelo original.</p>
              </div>
            </div>
          )}
          <p className="border-t border-line pt-3 font-medium">
            Unidades: el resto ({numeroCorto(parteUnidades)} %)
          </p>
        </fieldset>
      </fieldset>

      <section aria-labelledby="h-fijos" className="grid gap-2">
        <h2 id="h-fijos" className="text-xl font-semibold">Supuestos fijos</h2>
        <details>
          <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Ver los supuestos fijos de este escenario
          </summary>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {def.fijos.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted">Fuente: {FUENTE_SUPUESTOS}</p>
        </details>
        <details>
          <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Ver los supuestos generales del modelo
          </summary>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>Todo valor es ilustrativo: no es un pronóstico ni una oferta.</li>
            <li>La Fundación cobra antes que cualquier inversor.</li>
            <li>La serie no paga impuestos en el modelo; no hay inflación ni tipo de cambio.</li>
            <li>La salida vende lo que queda de la serie a un múltiplo de la caja operativa del último año.</li>
            <li>El vino se vende al año siguiente de la cosecha; la energía pierde 0,5 % por año.</li>
            <li>
              La curva del viñedo escala con el rendimiento en madurez (supuesto de la plataforma, no del modelo original,
              a confirmar con Vagner).
            </li>
            <li>Agregados de la plataforma que no están en el modelo original: la conversión del SAFU y la TIR por encima de 100 % anual.</li>
          </ul>
        </details>
      </section>

      <section aria-labelledby="h-vivienda" className="grid gap-1">
        <h2 id="h-vivienda" className="text-xl font-semibold">Vivienda</h2>
        <p>Entrada: {SIN_DATO}</p>
        <p>Canon anual: {SIN_DATO}</p>
        <p className="text-sm text-muted">Quién decide: {QUIEN_DECIDE_VIVIENDA}</p>
      </section>

      <section aria-labelledby="h-resultado" className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <h2 id="h-resultado" className="text-xl font-semibold">Resultado: {def.etiqueta}</h2>
        <p aria-live="polite" className="rounded-lg bg-green-soft px-3 py-2 font-medium">
          {resumen}
        </p>
        <p className="text-sm text-muted">
          La serie levanta {usd(resultado.levantado)} en {horizonte} años. Modelo: {VERSION_MODELO.fuente} · {VERSION_MODELO.version} ·{" "}
          17-oct-2026.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="pb-2 text-left font-medium">Lo que pone y lo que recibe cada clase</caption>
            <thead>
              <tr>
                <th scope="col" className="py-1 pr-4 text-left">Clase</th>
                <th scope="col" className="py-1 pr-4 text-right">Pone</th>
                <th scope="col" className="py-1 pr-4 text-right">Recibe</th>
                <th scope="col" className="py-1 pr-4 text-right">Múltiplo</th>
                <th scope="col" className="py-1 pr-4 text-right">TIR</th>
              </tr>
            </thead>
            <tbody>
              <FilaClase nombre="Procomún · Fundación" recibe={resultado.procomun.recibe} />
              <FilaClase
                nombre={<>Unidades de Regeneración <TerminoLegal clave="unidadesregeneracion" /></>}
                clase={resultado.unidades}
              />
              <FilaClase
                nombre={<>Primera pérdida <TerminoLegal clave="primeraperdida" /></>}
                clase={resultado.primeraPerdida}
              />
              {resultado.notas && (
                <FilaClase nombre={<>Notas Verdes <TerminoLegal clave="notasverdes" /></>} clase={resultado.notas} />
              )}
              <FilaClase nombre="NetX" recibe={resultado.netx.recibe} />
            </tbody>
          </table>
        </div>
        {hayTirSinDato && <p className="text-sm">{NOTA_TIR}</p>}

        <Donut
          titulo="Cómo se reparte lo que paga la serie"
          porciones={porciones}
          formatoValor={usd}
          columnaEtiqueta="Clase"
        />

        <p>
          USD 1.000 en Unidades {NOMBRE_CORTO[escenario]} devuelven {usd(mil.total)} en {horizonte} años (TIR {pct(mil.tir)})
        </p>
        <p>
          USD 1.000 en SAFU se convierten en {usd(safu)} de Unidades de la Serie Madre (descuento{" "}
          {numeroCorto(estado.decididos.descuentoSafu)} %) · cálculo de la plataforma, no está en el modelo. Qué es el SAFU:{" "}
          <TerminoLegal clave="safu" />
        </p>

        <details>
          <summary className="w-fit cursor-pointer underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Ver año por año
          </summary>
          <div className="mt-2 max-w-full overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Año por año: {def.etiqueta}</caption>
              <thead>
                <tr>
                  <th scope="col" className="py-1 pr-4 text-left">Año</th>
                  <th scope="col" className="py-1 pr-4 text-right">Ingresos</th>
                  <th scope="col" className="py-1 pr-4 text-right">Costos</th>
                  <th scope="col" className="py-1 pr-4 text-right">A la Fundación</th>
                  <th scope="col" className="py-1 pr-4 text-right">Comisión de NetX</th>
                  {resultado.notas && <th scope="col" className="py-1 pr-4 text-right">Notas Verdes</th>}
                  <th scope="col" className="py-1 pr-4 text-right">Unidades</th>
                  <th scope="col" className="py-1 pr-4 text-right">Primera pérdida</th>
                  <th scope="col" className="py-1 pr-4 text-right">Excedente al procomún</th>
                </tr>
              </thead>
              <tbody>
                {resultado.filas.map((f) => (
                  <tr key={f.anio} className="border-t border-line">
                    <th scope="row" className={celdaTexto}>{f.anio}</th>
                    <td className={celda}>{numero(f.ingresos)}</td>
                    <td className={celda}>{numero(f.costos)}</td>
                    <td className={celda}>{numero(f.aFundacion)}</td>
                    <td className={celda}>{numero(f.comisionNetx)}</td>
                    {resultado.notas && <td className={celda}>{numero(f.notas)}</td>}
                    <td className={celda}>{numero(f.unidades)}</td>
                    <td className={celda}>{numero(f.primeraPerdida)}</td>
                    <td className={celda}>{numero(f.excedenteProcomun)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-muted">Montos en USD.</p>
        </details>
      </section>
    </div>
  );
}
