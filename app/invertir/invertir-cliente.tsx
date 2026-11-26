"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CurvaDevolucion } from "@/components/invertir/curva-devolucion";
import { DibujoBarrio } from "@/components/invertir/dibujo-barrio";
import { LibroBarrio } from "@/components/invertir/libro-barrio";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { TerminoLegal } from "@/components/termino-legal";
import { Aviso } from "@/components/ui/aviso";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { Indicador } from "@/components/ui/indicador";
import { Pestanas } from "@/components/ui/pestanas";
import { ANIOS_DEL_HORIZONTE } from "@/lib/bien-comun/barrio";
import { enteroEn } from "@/lib/bien-comun/formato";
import { VERSION_PROPUESTA } from "@/lib/bien-comun/modelo";
import { barriosEnFinanciamiento, type BarrioEnFinanciamiento } from "@/lib/invertir/barrios";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

const TARJETA = "grid content-start gap-3 rounded-xl border border-line bg-surface p-4";
const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Pestana = "como" | "curva" | "libro";
const PESTANAS: readonly Pestana[] = ["como", "curva", "libro"];
// Valor de `?ver=` de cada pestaña (design §2). "Cómo funciona" es la de por defecto y no lleva parámetro.
const VER: Record<Pestana, string | null> = { como: null, curva: "curva", libro: "libro" };

function pestanaDeLaUrl(): Pestana {
  const ver = new URLSearchParams(window.location.search).get("ver");
  return PESTANAS.find((p) => VER[p] === ver) ?? "como";
}

// Invertir (spec invertir, ux-invertir): solo con sesión. Sin sesión, un estado vacío y ningún número; el cálculo es puro y
// corre acá, en el navegador, solo cuando hay sesión, para que el HTML sin sesión no lleve números. Esto oculta, no protege (ADR-015).
export function InvertirCliente() {
  const t = useTextos("invertir");
  const comunes = useTextos("comunes");
  const { estado } = useSesion();
  // Los barrios se calculan una sola vez, y solo con sesión.
  const conSesion = estado === "ok";
  const barrios = useMemo(() => (conSesion ? barriosEnFinanciamiento() : []), [conSesion]);

  if (estado === "cargando") return <p className="text-sm text-muted">{comunes.cargando}</p>;
  if (!conSesion) {
    return (
      <section aria-label={t.titulo} className={TARJETA}>
        <EstadoVacio nivel={2} titulo={t.sinSesion.titulo} texto={t.sinSesion.aviso} dibujo={<DibujoBarrio />} accion={<EntrarPara texto={t.sinSesion.entrar} />} />
      </section>
    );
  }

  return (
    <div className="grid gap-8">
      {barrios.map((b) => (
        <Barrio key={b.id} b={b} />
      ))}
    </div>
  );
}

/** Un barrio en financiamiento como un pool (ux-invertir, design §1): número principal, tres secundarios, un aviso y pestañas. */
function Barrio({ b }: { b: BarrioEnFinanciamiento }) {
  const idioma = useIdioma();
  const t = useTextos("invertir");
  const { nivel } = useSesion();
  const [pestana, setPestana] = useState<Pestana>("como");
  // La pestaña elegida vive en la URL (`?ver=curva`) para poder compartirla; se lee al montar, en el navegador.
  useEffect(() => setPestana(pestanaDeLaUrl()), []);

  function elegir(clave: string) {
    const p = PESTANAS.find((x) => x === clave) ?? "como";
    setPestana(p);
    const url = new URL(window.location.href);
    const ver = VER[p];
    if (ver) url.searchParams.set("ver", ver);
    else url.searchParams.delete("ver");
    window.history.replaceState(null, "", url);
  }

  const mes =
    b.mesDevolucion === null ? t.barrio.noEnAnios(enteroEn(ANIOS_DEL_HORIZONTE, idioma)) : t.barrio.mes(enteroEn(b.mesDevolucion, idioma));
  const items = [
    { clave: "como", etiqueta: t.pestanas.como },
    { clave: "curva", etiqueta: t.pestanas.curva },
    { clave: "libro", etiqueta: t.pestanas.libro },
  ];

  return (
    <article aria-labelledby={`inv-${b.id}`} className="grid gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <h2 id={`inv-${b.id}`} className="text-2xl font-bold">
          {t.barrio.titulo}
        </h2>
        <ChipEstado estado="enFinanciamiento" />
      </header>

      <section aria-label={t.barrio.indicadores} className={`${TARJETA} gap-5`}>
        <Indicador etiqueta={t.barrio.meta} valor={b.meta === null ? null : usdEn(b.meta, idioma)} mono tamano="grande" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Indicador etiqueta={t.barrio.juntado} valor={b.juntado} mono tamano="chico" />
          <Indicador etiqueta={t.barrio.mesDevolucion} valor={b.meta === null ? null : mes} mono tamano="chico" />
          <Indicador
            etiqueta={t.barrio.parteComun}
            valor={b.parteParaElComun === null ? null : porcentajeEn(b.parteParaElComun, idioma)}
            mono
            tamano="chico"
          />
        </div>
      </section>

      <Aviso tono="legal" className="w-fit max-w-3xl font-semibold" data-sellos="invertir" aria-label={t.aviso.etiqueta}>
        {t.aviso.texto(VERSION_PROPUESTA.version)} <TerminoLegal clave="nooferta" idioma={idioma} />
      </Aviso>

      <div className="grid gap-4">
        <Pestanas aria={t.pestanas.etiqueta} items={items} actual={pestana} onCambio={elegir} prefijo={`${b.id}-`} />
        <div role="tabpanel" id={`${b.id}-panel-${pestana}`} aria-labelledby={`${b.id}-pestana-${pestana}`} className="grid gap-3">
          {pestana === "como" && (
            <>
              <ul className="grid max-w-3xl list-disc gap-1 pl-5">
                <li>
                  {t.comoFunciona.financia} <TerminoLegal clave="tokeninversor" idioma={idioma} />
                </li>
                <li>
                  {t.comoFunciona.cobra} <TerminoLegal clave="fideicomisobarrio" idioma={idioma} />
                </li>
                <li>{t.comoFunciona.sinFecha}</li>
                <li data-dato="prima">
                  {t.prima.etiqueta} <TerminoLegal clave="primaobjetivo" idioma={idioma} />:{" "}
                  <span className="font-mono">{porcentajeEn(b.primaObjetivo, idioma)}</span> ({t.prima.nota}). {t.barrio.version(b.version)}
                </li>
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
            </>
          )}
          {pestana === "curva" && <CurvaDevolucion curva={b.curva} />}
          {pestana === "libro" && <LibroBarrio libro={b.libro} />}
        </div>
      </div>
    </article>
  );
}
