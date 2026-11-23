"use client";

import { useId, useState, type ReactNode } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import {
  ANIOS_DEL_HORIZONTE,
  CAMPOS,
  alComunPorAnio,
  camposInvalidos,
  cobrandoConLasCuotas,
  coberturaAFechaFija,
  montoALevantar,
  parteDelPresupuestoQueCubren,
  parteQueQuedaEnElFideicomiso,
  type CampoEntrada,
  type Entradas,
} from "@/lib/bien-comun/barrio";
import { enteroEn } from "@/lib/bien-comun/formato";
import { BARRIO, VERSION_SIM_BARRIO } from "@/lib/bien-comun/modelo";
import { formatearFecha, sinDato } from "@/lib/idioma/formatos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { Idioma } from "@/lib/idioma/tipos";
import { porcentajeEn } from "@/lib/lotes/formato";
import { REGION, TARJETA, TD, TH } from "./estilos";

// "Los números del barrio" (spec bien-comun-numeros-barrio). Solo con sesión, hasta la revisión R14. Nada se guarda:
// sin almacenamiento local ni parámetros en la dirección. El cálculo vive en `lib/bien-comun/barrio.ts`.

type TextosBarrio = ReturnType<typeof useTextos<"biencomun">>["barrio"];

const CLASE_CAMPO =
  "w-full rounded-lg border border-faint bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CLASE_BOTON =
  "w-fit rounded-lg border border-faint px-4 py-1.5 font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Un número escrito por la persona: acepta el separador de miles del idioma y una coma o punto decimal. Lo demás es NaN. */
export function leerNumero(texto: string, idioma: Idioma): number {
  const t = texto.trim();
  if (t === "") return NaN;
  // Miles con su separador y, opcionalmente, decimales con el separador del idioma (en español, punto de miles y coma decimal; en inglés, al revés).
  const conMiles = idioma === "en" ? /^(\d{1,3}(?:,\d{3})+)(\.\d+)?$/ : /^(\d{1,3}(?:\.\d{3})+)(,\d+)?$/;
  const m = conMiles.exec(t);
  const limpio = m ? m[1].replace(/[.,]/g, "") + (m[2] ? "." + m[2].slice(1) : "") : t.replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : NaN;
}

const aTexto = (e: Entradas): Record<CampoEntrada, string> => ({
  precioLote: String(e.precioLote),
  ritmo: String(e.ritmo),
  cuotas: String(e.cuotas),
  infraestructuraPorLote: String(e.infraestructuraPorLote),
  // La prima se escribe en por ciento.
  prima: String(Math.round(e.prima * 10_000) / 100),
});

function deTexto(v: Record<CampoEntrada, string>, idioma: Idioma): Entradas {
  const prima = leerNumero(v.prima, idioma);
  return {
    precioLote: leerNumero(v.precioLote, idioma),
    ritmo: leerNumero(v.ritmo, idioma),
    cuotas: leerNumero(v.cuotas, idioma),
    infraestructuraPorLote: leerNumero(v.infraestructuraPorLote, idioma),
    prima: prima / 100,
  };
}

const usdEn = (n: number | null | undefined, idioma: Idioma) =>
  typeof n === "number" && Number.isFinite(n) ? `USD ${enteroEn(n, idioma)}` : sinDato(idioma);

type PropsCalculadora = {
  t: TextosBarrio;
  idioma: Idioma;
  /** Valores de partida, leídos del módulo por la página. */
  partida: Entradas;
};

/** La calculadora: recibe valores de partida y textos por props; lo único que decide es qué mostrar. */
export function CalculadoraBarrio({ t, idioma, partida }: PropsCalculadora) {
  const id = useId();
  const [valores, setValores] = useState(() => aTexto(partida));
  const entradas = deTexto(valores, idioma);
  const malos = camposInvalidos(entradas);
  const sin = sinDato(idioma);

  const monto = montoALevantar(entradas);
  const cobrando = cobrandoConLasCuotas(entradas);
  const fija = coberturaAFechaFija(entradas, BARRIO.fechaFijaMeses.valor);
  const comun = alComunPorAnio(entradas);

  const mes = !cobrando.ok
    ? sin
    : cobrando.mes === null
      ? t.resultados.noEnAnios(enteroEn(ANIOS_DEL_HORIZONTE, idioma))
      : t.resultados.mes(enteroEn(cobrando.mes, idioma));

  return (
    <div className="grid gap-4">
      <form className="grid gap-3" onSubmit={(ev) => ev.preventDefault()} aria-labelledby={`${id}-campos`}>
        <h3 id={`${id}-campos`} className="font-medium">
          {t.camposTitulo}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPOS.map((campo) => {
            const invalido = malos.includes(campo);
            const valorDePartida = campo === "prima" ? aTexto(partida).prima : String(partida[campo]);
            const mostrado = campo === "prima" ? `${enteroEn(Number(valorDePartida), idioma)} %` : enteroEn(Number(valorDePartida), idioma);
            return (
              <div key={campo} className="grid content-start gap-1">
                <div className="flex flex-wrap items-center gap-1">
                  <label htmlFor={`${id}-${campo}`} className="text-sm font-medium">
                    {t.campos[campo]}
                  </label>
                  {campo === "prima" ? <TerminoLegal clave="primaobjetivo" idioma={idioma} /> : null}
                </div>
                <input
                  id={`${id}-${campo}`}
                  name={campo}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={valores[campo]}
                  onChange={(ev) => setValores((v) => ({ ...v, [campo]: ev.target.value }))}
                  aria-invalid={invalido}
                  aria-describedby={`${id}-${campo}-ayuda${invalido ? ` ${id}-${campo}-error` : ""}`}
                  className={CLASE_CAMPO}
                />
                <span id={`${id}-${campo}-ayuda`} className="text-xs text-muted">
                  {t.dePartida(mostrado)}
                </span>
                {invalido ? (
                  <span id={`${id}-${campo}-error`} className="text-sm font-medium text-warn-ink">
                    {t.errores[campo]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <button type="button" className={CLASE_BOTON} onClick={() => setValores(aTexto(partida))}>
          {t.restablecer}
        </button>
      </form>

      <div className="grid gap-4" data-resultados>
        <section aria-labelledby={`${id}-res`} className="grid gap-2">
          <h3 id={`${id}-res`} className="font-medium">
            {t.resultados.titulo}
          </h3>
          <dl aria-live="polite" aria-atomic="true" className="grid gap-2 text-sm sm:grid-cols-2">
            <Dato etiqueta={t.resultados.aLevantar} valor={usdEn(monto.ok ? monto.valor : null, idioma)} id="monto" />
            <Dato etiqueta={t.resultados.devuelve} valor={mes} id="mes" />
            <Dato
              etiqueta={t.resultados.totalRecibido}
              valor={usdEn(cobrando.ok ? cobrando.totalRecibido : null, idioma)}
              id="total"
            />
          </dl>
          <p className="text-sm">
            <TerminoLegal clave="tokeninversor" idioma={idioma} />
          </p>
          <p className="max-w-3xl text-sm" data-dato="fija">
            {fija.ok
              ? t.resultados.fechaFija(enteroEn(BARRIO.fechaFijaMeses.valor, idioma), porcentajeEn(fija.valor, idioma))
              : `${t.resultados.fechaFija(enteroEn(BARRIO.fechaFijaMeses.valor, idioma), sin)}`}
            <TerminoLegal clave="fideicomisobarrio" idioma={idioma} />
          </p>
          <p className="max-w-3xl text-sm" data-dato="fideicomiso">
            {t.resultados.parteFideicomiso(
              malos.length === 0 ? porcentajeEn(parteQueQuedaEnElFideicomiso(), idioma) : sin,
            )}
          </p>
        </section>

        <section aria-labelledby={`${id}-comun`} className="grid gap-2">
          <h3 id={`${id}-comun`} className="font-medium">
            {t.comun.titulo}
          </h3>
          {comun.ok ? (
            <>
              <div role="region" tabIndex={0} aria-label={t.comun.caption} className={REGION}>
                <table className="w-full min-w-[30rem] text-sm">
                  <caption className="sr-only">{t.comun.caption}</caption>
                  <thead>
                    <tr className="border-b border-line">
                      {[t.comun.anio, t.comun.partePagos, t.comun.expensas, t.comun.total, t.comun.lotesVendidos].map((c) => (
                        <th key={c} scope="col" className={TH}>
                          {c}
                          {c === t.comun.expensas ? <TerminoLegal clave="expensas" idioma={idioma} /> : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comun.filas.map((f) => (
                      <tr key={f.anio} className="border-t border-line">
                        <th scope="row" className={`${TD} text-left font-medium`}>
                          {enteroEn(f.anio, idioma)}
                        </th>
                        <td className={TD}>{usdEn(f.parteDeLosPagos, idioma)}</td>
                        <td className={TD}>{usdEn(f.expensas, idioma)}</td>
                        <td className={`${TD} font-medium`}>{usdEn(f.total, idioma)}</td>
                        <td className={TD}>{enteroEn(f.lotesVendidos, idioma)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="max-w-3xl text-sm">{t.comun.cubre(porcentajeEn(parteDelPresupuestoQueCubren(), idioma))}</p>
            </>
          ) : (
            <p className="text-sm">{sin}</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, id }: { etiqueta: ReactNode; valor: string; id: string }) {
  return (
    <div className="grid content-start gap-0.5 rounded-lg border border-faint p-3" data-dato={id}>
      <dt className="text-muted">{etiqueta}</dt>
      <dd className="text-lg font-semibold">{valor}</dd>
    </div>
  );
}

/**
 * La sección entera de la página: solo con sesión. Sin sesión, un aviso con el enlace para entrar y ningún número.
 * Mientras se verifica la sesión no muestra ni calculadora ni aviso.
 */
export function SeccionBarrio({ partida }: { partida: Entradas }) {
  const idioma = useIdioma();
  const t = useTextos("biencomun").barrio;
  const { estado } = useSesion();
  const conSesion = estado === "ok";

  return (
    <section aria-labelledby="h-barrio" className={TARJETA}>
      <h2 id="h-barrio" className="text-xl font-semibold">
        {conSesion ? t.titulo : t.sinSesion.titulo}
      </h2>
      {conSesion ? (
        <>
          <p className="max-w-3xl text-sm">{t.intro}</p>
          <p className="max-w-3xl text-sm font-medium">
            {t.fuente(
              VERSION_SIM_BARRIO.archivo.replace(/^sim\//, ""),
              VERSION_SIM_BARRIO.version,
              formatearFecha(VERSION_SIM_BARRIO.fecha, idioma, "largo"),
            )}
            <TerminoLegal clave="noesoferta" idioma={idioma} />
          </p>
          <p className="max-w-3xl text-sm">{t.faltan}</p>
          <CalculadoraBarrio t={t} idioma={idioma} partida={partida} />
          <h3 className="font-medium">{t.conclusionesTitulo}</h3>
          <ul className="grid list-disc gap-1 pl-5 text-sm">
            {t.conclusiones.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      ) : estado === "cargando" ? null : (
        <>
          <p className="max-w-3xl text-sm">{t.sinSesion.texto}</p>
          <EntrarPara texto={t.sinSesion.entrar} />
        </>
      )}
    </section>
  );
}
