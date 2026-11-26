"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { useCompras } from "@/components/lotes/usar-compras";
import { Megaphone, MapPin, Sprout } from "lucide-react";
import { Actividad } from "@/components/mi-tierra/actividad";
import { DibujoLote } from "@/components/mi-tierra/dibujo-lote";
import { EncabezadoMiTierra } from "@/components/mi-tierra/encabezado";
import { FilaPosicion } from "@/components/mi-tierra/fila-posicion";
import { MiniCurva } from "@/components/mi-tierra/mini-curva";
import { VistaPreviaMiTierra } from "@/components/mi-tierra/vista-previa";
import { BarraAvance } from "@/components/ui/barra-avance";
import { Boton } from "@/components/ui/boton";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { enteroEn, faroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { usdEn } from "@/lib/lotes/formato";
import { armarPortafolio, curvaFaro, type FaroPortafolio, type LotePortafolio } from "@/lib/mi-tierra/portafolio";
import { leerAdhesionDelNavegador, SIN_ADHESION, type Adhesion } from "@/lib/membresia/versiones";

const TARJETA = "grid content-start gap-3 rounded-xl border border-line bg-surface p-4";
const SUBBLOQUE = "grid content-start gap-2 rounded-lg border border-line bg-surface-2 p-3";
// La lista de lotes. Con la spec `explorar-unificado` (en dev) la ruta es `/explorar/lotes`; en esta base todavía no existe
// (ver el PR): se apunta al ancla que sí existe y se cambia en un solo lugar cuando la ruta llegue.
const RUTA_LOTES = "/explorar#lotes";
const SUBRAYADO = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

// Mi tierra (spec mi-tierra): el portafolio de la persona, todo simulado. Lee las reservas SOLO por `useCompras`
// (que usa `lib/lotes/reservas.ts`). Ningún número se escribe acá: salen del portafolio, que lee lo que la persona vio.
export function MiTierraCliente() {
  const idioma = useIdioma();
  const t = useTextos("miTierra");
  const comunes = useTextos("comunes");
  const { estado } = useSesion();
  const { compras, listo } = useCompras();
  const [adhesion, setAdhesion] = useState<Adhesion>(SIN_ADHESION);

  useEffect(() => {
    if (estado === "ok") setAdhesion(leerAdhesionDelNavegador());
  }, [estado]);

  const portafolio = useMemo(() => armarPortafolio(compras, adhesion), [compras, adhesion]);

  // Sin sesión: un aviso y el enlace para entrar. No se muestra ningún dato.
  if (estado === "cargando") return <p className="text-sm text-muted">{comunes.cargando}</p>;
  if (estado !== "ok") {
    return (
      <section aria-label={t.titulo} className={TARJETA}>
        <p className="max-w-3xl">{t.sinSesion.aviso}</p>
        <EntrarPara texto={t.sinSesion.entrar} />
      </section>
    );
  }
  if (!listo) return <p className="text-sm text-muted">{t.cargando}</p>;

  if (portafolio.lotes.length === 0) {
    return (
      <div className="grid gap-6">
        <section aria-labelledby="mt-sin-compras" className={TARJETA}>
          <EstadoVacio
            nivel={2}
            titulo={t.sinCompras.titulo}
            texto={t.sinCompras.texto}
            dibujo={<DibujoLote />}
            accion={<Boton href={RUTA_LOTES}>{t.sinCompras.ver}</Boton>}
            vistaPrevia={<VistaPreviaMiTierra />}
            etiquetaVistaPrevia={t.sinCompras.vistaPrevia}
          />
        </section>
        <Voz adhesion={portafolio.voz} />
      </div>
    );
  }

  const { totales } = portafolio;
  const curva = curvaFaro(portafolio.lotes);
  const p = t.posiciones;
  const faroValor = totales.faroAcreditados !== null ? faroEn(totales.faroAcreditados, idioma) : comunes.sinDato;
  const faroDetalle = totales.hayPago && totales.faroAcreditados !== null ? p.faroDetalle : totales.hayPago ? p.faroDetalle : t.faro.sinPago;
  const vozValor = portafolio.voz.adhirio ? p.vozAdhirio : portafolio.voz.desactualizada ? p.vozDesactualizada : p.vozSinAdhesion;

  return (
    <div className="grid gap-6">
      <EncabezadoMiTierra portafolio={portafolio} />

      <section id="mt-posiciones" aria-labelledby="mt-posiciones-t" className="grid scroll-mt-20 gap-2">
        <h2 id="mt-posiciones-t" className="text-xl font-bold">
          {p.titulo}
        </h2>
        <ul className="m-0 grid list-none divide-y divide-line border-y border-line p-0">
          {portafolio.lotes.map((l) => {
            const valor =
              l.plan.tipo === "cuotas"
                ? p.cuotas(enteroEn(l.plan.cuotasPagadas, idioma), enteroEn(l.plan.cuotas, idioma))
                : l.plan.tipo === "contado"
                  ? p.contado
                  : l.plan.tipo === "no-entra"
                    ? p.fueraDelPlan
                    : comunes.sinDato;
            const detalle = [l.superficieM2 === null ? comunes.sinDato : p.m2(enteroEn(l.superficieM2, idioma)), p.estados[l.estado === "vendido" ? "vendido" : l.estado]].join(" · ");
            return (
              <li key={l.loteId}>
                <FilaPosicion icono={<MapPin size={16} />} nombre={p.lote(l.numero)} detalle={detalle} valor={valor} href={`/lotes/${l.loteId}`} />
              </li>
            );
          })}
          {totales.entraAlPlan && (
            <li>
              <FilaPosicion
                icono={<Sprout size={16} />}
                nombre="FARO"
                detalle={faroDetalle}
                valor={faroValor}
                extra={<MiniCurva puntos={curva} titulo={p.curva} />}
              />
            </li>
          )}
          <li>
            <FilaPosicion icono={<Megaphone size={16} />} nombre={t.voz.titulo} detalle={p.vozDetalle} valor={vozValor} href="/tribus/lighthouse/manifiesto" />
          </li>
        </ul>
      </section>

      <section id="mt-detalle" aria-labelledby="mt-lotes" className="grid gap-3">
        <h2 id="mt-lotes" className="text-xl font-bold">
          {p.detalleTitulo}
        </h2>
        <ul className="grid gap-4 lg:grid-cols-2">
          {portafolio.lotes.map((l) => (
            <li key={l.loteId} className={TARJETA}>
              <TarjetaLote l={l} />
            </li>
          ))}
        </ul>
      </section>

      <Voz adhesion={portafolio.voz} />

      <section id="mt-actividad" aria-labelledby="mt-actividad-t" className="grid scroll-mt-20 gap-3">
        <h2 id="mt-actividad-t" className="text-xl font-bold">
          {t.actividad.titulo}
        </h2>
        <Actividad libro={portafolio.libro} />
      </section>
    </div>
  );
}

function TarjetaLote({ l }: { l: LotePortafolio }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          {t.lote.lote(l.numero)}
        </h3>
        <ChipEstado estado={l.estado} />
      </div>
      <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="text-muted">{t.lote.opcion}</dt>
        <dd className="m-0">{t.lote.opciones[l.opcion]}</dd>
        <dt className="text-muted">{t.lote.precio}</dt>
        <dd className="m-0 font-mono">{usdEn(l.precioVisto, idioma)}</dd>
      </dl>
      <p className="text-sm text-muted">{t.lote.modelo(l.version)}</p>
      <Plan l={l} />
      <Faro faro={l.faro} />
      <Link href={`/lotes/${l.loteId}`} className={`${SUBRAYADO} w-fit text-sm font-medium`}>
        {t.lote.ver(l.numero)}
      </Link>
    </>
  );
}

function Plan({ l }: { l: LotePortafolio }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra").plan;
  const p = l.plan;
  const sinPago = l.estado === "reservado";
  return (
    <div className={SUBBLOQUE}>
      <h4 className="font-semibold">
        {t.titulo} <TerminoLegal clave="tokentierra" idioma={idioma} />
      </h4>
      {p.tipo === "no-entra" && <p className="text-sm">{t.noEntra}</p>}
      {p.tipo === "sin-dato" && <p className="text-sm">{t.sinDato}</p>}
      {p.tipo === "contado" && (
        <>
          <p className="text-sm font-medium">{t.contado}</p>
          <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
            <dt className="text-muted">{t.pagoUnico}</dt>
            <dd className="m-0 font-mono">{usdEn(p.pago, idioma)}</dd>
          </dl>
          {sinPago && <p className="text-sm">{t.faltaPrimerPago}</p>}
          <BarraAvance etiqueta={t.avance} fraccion={p.fraccionPagada} />
        </>
      )}
      {p.tipo === "cuotas" && (
        <>
          <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
            <dt className="text-muted">{t.anticipo}</dt>
            <dd className="m-0 font-mono">{usdEn(p.anticipo, idioma)}</dd>
            <dt className="text-muted">{t.cuota}</dt>
            <dd className="m-0 font-mono">{usdEn(p.cuota, idioma)}</dd>
            <dt className="text-muted">{t.cuotasPagadas}</dt>
            <dd className="m-0 font-mono">{t.cuotasDe(enteroEn(p.cuotasPagadas, idioma), enteroEn(p.cuotas, idioma))}</dd>
          </dl>
          {sinPago ? <p className="text-sm">{t.faltaPrimerPago}</p> : <p className="text-sm text-muted">{t.soloPrimerPago}</p>}
          <BarraAvance etiqueta={t.avance} fraccion={p.fraccionPagada} />
        </>
      )}
    </div>
  );
}

function Faro({ faro }: { faro: FaroPortafolio }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra").faro;
  const comunes = useTextos("comunes");
  return (
    <div className={SUBBLOQUE}>
      <h4 className="font-semibold">
        {t.titulo} <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
      </h4>
      {faro.tipo === "no-aplica" && <p className="text-sm">{t.noAplica}</p>}
      {faro.tipo === "sin-dato" && <p className="text-sm">{comunes.sinDato}</p>}
      {faro.tipo === "sin-pago" && (
        <>
          <p className="text-sm font-medium">{t.sinPago}</p>
          <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
            <dt className="text-muted">{t.delPlan}</dt>
            <dd className="m-0 font-mono">{faroEn(faro.total, idioma)}</dd>
          </dl>
        </>
      )}
      {faro.tipo === "acreditado" && (
        <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="text-muted">{t.acreditados}</dt>
          <dd className="m-0 font-mono">{faroEn(faro.acreditados, idioma)}</dd>
          <dt className="text-muted">{t.delPlan}</dt>
          <dd className="m-0 font-mono">{faroEn(faro.total, idioma)}</dd>
        </dl>
      )}
      {faro.tipo === "a-medida-que-se-paga" && <p className="text-sm">{t.aMedida(faroEn(faro.total, idioma))}</p>}
      {faro.tipo !== "no-aplica" && (
        <>
          <p className="text-sm text-muted">{t.regla}</p>
          <p className="text-sm text-muted">{t.nota}</p>
        </>
      )}
    </div>
  );
}

function Voz({ adhesion }: { adhesion: { adhirio: boolean; desactualizada: boolean } }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra").voz;
  const texto = adhesion.adhirio ? t.conAdhesion : adhesion.desactualizada ? t.desactualizada : t.sinAdhesion;
  return (
    <section aria-labelledby="mt-voz" className={TARJETA}>
      <h2 id="mt-voz" className="text-xl font-bold">
        {t.titulo}
      </h2>
      <p className="max-w-3xl font-medium">
        <span aria-hidden="true">{adhesion.adhirio ? "✓ " : "○ "}</span>
        {texto} <TerminoLegal clave="adhesion" idioma={idioma} />
      </p>
      <p className="text-sm font-medium">
        <Link href="/tribus/lighthouse/manifiesto" className={SUBRAYADO}>
          {adhesion.adhirio ? t.ver : t.adherir}
        </Link>{" "}
        <TerminoLegal clave="manifiestovrn" idioma={idioma} />
      </p>
      <div className={SUBBLOQUE}>
        <p className="w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium">{t.enDiscusion}</p>
        <p className="max-w-3xl text-sm">{t.propuesta}</p>
      </div>
      <p className="text-sm text-muted">{t.faroNoVota}</p>
    </section>
  );
}
