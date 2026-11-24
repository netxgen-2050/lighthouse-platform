"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CurvaDevolucion } from "@/components/invertir/curva-devolucion";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { TerminoLegal } from "@/components/termino-legal";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Indicador } from "@/components/ui/indicador";
import { SelloPrototipo } from "@/components/ui/sello-prototipo";
import { TablaLibro } from "@/components/ui/tabla-libro";
import { ANIOS_DEL_HORIZONTE } from "@/lib/bien-comun/barrio";
import { enteroEn } from "@/lib/bien-comun/formato";
import { VERSION_PROPUESTA } from "@/lib/bien-comun/modelo";
import { barriosEnFinanciamiento } from "@/lib/invertir/barrios";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

const TARJETA = "grid content-start gap-3 rounded-xl border border-line bg-surface p-4";
const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

// Invertir (spec invertir): solo con sesión. Sin sesión, un aviso y ningún número; el cálculo es puro y corre acá, en el
// navegador, solo cuando hay sesión, para que el HTML sin sesión no lleve números. Esto oculta, no protege (ADR-015).
export function InvertirCliente() {
  const idioma = useIdioma();
  const t = useTextos("invertir");
  const comunes = useTextos("comunes");
  const { estado, nivel } = useSesion();
  // Los barrios se calculan una sola vez, y solo con sesión.
  const conSesion = estado === "ok";
  const barrios = useMemo(() => (conSesion ? barriosEnFinanciamiento() : []), [conSesion]);

  if (estado === "cargando") return <p className="text-sm text-muted">{comunes.cargando}</p>;
  if (!conSesion) {
    return (
      <section aria-label={t.titulo} className={TARJETA}>
        <p className="max-w-3xl">{t.sinSesion.aviso}</p>
        <EntrarPara texto={t.sinSesion.entrar} />
      </section>
    );
  }

  return (
    <div className="grid gap-8">
      <div role="group" aria-label={t.sellos.etiqueta} className="grid w-fit max-w-3xl gap-2" data-sellos="invertir">
        <p className="w-fit rounded-lg border-2 border-dashed border-muted bg-warn-bg px-3 py-2 font-semibold text-warn-ink">
          {t.sellos.propuesta(VERSION_PROPUESTA.version)}
        </p>
        <SelloPrototipo variante="venta" />
        <p className="w-fit rounded-lg border-2 border-dashed border-muted bg-warn-bg px-3 py-2 font-semibold text-warn-ink">
          {t.sellos.noEsOferta} <TerminoLegal clave="nooferta" idioma={idioma} />
        </p>
      </div>
      {barrios.map((b) => {
        const mes =
          b.mesDevolucion === null
            ? t.barrio.noEnAnios(enteroEn(ANIOS_DEL_HORIZONTE, idioma))
            : t.barrio.mes(enteroEn(b.mesDevolucion, idioma));
        return (
          <article key={b.id} aria-labelledby={`inv-${b.id}`} className="grid gap-6">
            <header className="flex flex-wrap items-center gap-3">
              <h2 id={`inv-${b.id}`} className="text-2xl font-bold">
                {t.barrio.titulo}
              </h2>
              <ChipEstado estado="enFinanciamiento" />
            </header>

            <section aria-label={t.barrio.indicadores} className={`${TARJETA} sm:grid-cols-2 lg:grid-cols-4`}>
              <Indicador etiqueta={t.barrio.meta} valor={b.meta === null ? null : usdEn(b.meta, idioma)} mono />
              <Indicador etiqueta={t.barrio.juntado} valor={b.juntado} mono />
              <Indicador etiqueta={t.barrio.mesDevolucion} valor={b.meta === null ? null : mes} mono />
              <Indicador
                etiqueta={t.barrio.parteComun}
                valor={b.parteParaElComun === null ? null : porcentajeEn(b.parteParaElComun, idioma)}
                mono
              />
              <p className="text-sm text-muted sm:col-span-2 lg:col-span-4" data-dato="prima">
                {t.prima.etiqueta} <TerminoLegal clave="primaobjetivo" idioma={idioma} />:{" "}
                <span className="font-mono text-ink">{porcentajeEn(b.primaObjetivo, idioma)}</span> ({t.prima.nota}). {t.barrio.version(b.version)}
              </p>
            </section>

            <section aria-labelledby={`inv-${b.id}-como`} className="grid gap-3">
              <h3 id={`inv-${b.id}-como`}className="text-xl font-bold">
                {t.comoFunciona.titulo}
              </h3>
              <ul className="grid max-w-3xl list-disc gap-1 pl-5">
                <li>
                  {t.comoFunciona.financia} <TerminoLegal clave="tokeninversor" idioma={idioma} />
                </li>
                <li>
                  {t.comoFunciona.cobra} <TerminoLegal clave="fideicomisobarrio" idioma={idioma} />
                </li>
                <li>{t.comoFunciona.sinFecha}</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/bien-comun" className={ENLACE}>
                  {t.comoFunciona.masBienComun}
                </Link>
                {puedeCapacidad(nivel, "vista-netx") && (
                  <Link href="/netx/financiamiento" className={ENLACE}>
                    {t.comoFunciona.masFinanciamiento}
                  </Link>
                )}
              </div>
            </section>

            <section aria-labelledby={`inv-${b.id}-curva`} className="grid gap-3">
              <h3 id={`inv-${b.id}-curva`}className="text-xl font-bold">
                {t.curva.titulo}
              </h3>
              <CurvaDevolucion curva={b.curva} />
            </section>

            <section aria-labelledby={`inv-${b.id}-libro`} className="grid gap-3">
              <h3 id={`inv-${b.id}-libro`}className="text-xl font-bold">
                {t.libro.titulo}
              </h3>
              <TablaLibro
                titulo={t.libro.titulo}
                filas={b.libro.map((f) => ({
                  fecha: t.libro.mes(enteroEn(f.mes, idioma)),
                  motivo: t.libro.motivos[f.motivo],
                  monto: f.monto === null ? null : usdEn(f.monto, idioma),
                }))}
              />
              <p className="text-sm text-muted">{t.libro.nota}</p>
            </section>
          </article>
        );
      })}
    </div>
  );
}
