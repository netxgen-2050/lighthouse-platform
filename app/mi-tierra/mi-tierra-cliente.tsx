"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { useCompras } from "@/components/lotes/usar-compras";
import { BarraAvance } from "@/components/ui/barra-avance";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Indicador } from "@/components/ui/indicador";
import { SelloPrototipo } from "@/components/ui/sello-prototipo";
import { TablaLibro } from "@/components/ui/tabla-libro";
import { enteroEn, faroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearFecha } from "@/lib/idioma/formatos";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";
import { armarPortafolio, type FaroPortafolio, type LotePortafolio } from "@/lib/mi-tierra/portafolio";
import { leerAdhesionDelNavegador, SIN_ADHESION, type Adhesion } from "@/lib/membresia/versiones";

const TARJETA = "grid content-start gap-3 rounded-xl border border-line bg-surface p-4";
const SUBBLOQUE = "grid content-start gap-2 rounded-lg border border-line bg-surface-2 p-3";
const ENLACE =
  "w-fit rounded-full border border-line bg-surface px-5 py-3 font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
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
      <section aria-labelledby="mt-sin-compras" className={TARJETA}>
        <h2 id="mt-sin-compras" className="text-xl font-bold">
          {t.sinCompras.titulo}
        </h2>
        <p className="max-w-3xl">{t.sinCompras.texto}</p>
        <Link href="/lotes" className={ENLACE}>
          {t.sinCompras.ver}
        </Link>
        <Voz adhesion={portafolio.voz} />
      </section>
    );
  }

  const { totales } = portafolio;
  const filas = portafolio.libro.map((m) => ({
    fecha: formatearFecha(m.fecha, idioma, "corto"),
    motivo: m.tipo === "reserva" ? t.actividad.reserva(m.numero) : m.tipo === "primer-pago" ? t.actividad.primerPago(m.numero) : t.actividad.pago(m.numero),
    monto: m.monto === null ? null : usdEn(m.monto, idioma),
  }));

  return (
    <div className="grid gap-6">
      <SelloPrototipo variante="venta" />

      <section aria-labelledby="mt-vistazo" className="grid gap-3">
        <h2 id="mt-vistazo" className="sr-only">
          {t.indicadores.titulo}
        </h2>
        <div className={`${TARJETA} sm:grid-cols-3`}>
          <Indicador etiqueta={t.indicadores.lotes} valor={enteroEn(totales.lotes, idioma)} mono />
          <Indicador
            etiqueta={t.indicadores.fraccion}
            valor={totales.fraccionPagada === null ? null : porcentajeEn(totales.fraccionPagada, idioma)}
            mono
          />
          <Indicador
            etiqueta={t.indicadores.faro}
            valor={totales.faroAcreditados !== null ? faroEn(totales.faroAcreditados, idioma) : totales.hayPago ? null : t.indicadores.faltaPrimerPago}
            mono
          />
        </div>
      </section>

      <section aria-labelledby="mt-lotes" className="grid gap-3">
        <h2 id="mt-lotes" className="text-xl font-bold">
          {t.lote.titulo}
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

      <section aria-labelledby="mt-actividad" className="grid gap-3">
        <h2 id="mt-actividad" className="text-xl font-bold">
          {t.actividad.titulo}
        </h2>
        <TablaLibro titulo={t.actividad.titulo} filas={filas} />
        <p className="text-sm text-muted">{t.actividad.nota}</p>
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
      <h4 className="font-semibold">{t.titulo}</h4>
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
      <h4 className="font-semibold">{t.titulo}</h4>
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
  const t = useTextos("miTierra").voz;
  const texto = adhesion.adhirio ? t.conAdhesion : adhesion.desactualizada ? t.desactualizada : t.sinAdhesion;
  return (
    <section aria-labelledby="mt-voz" className={TARJETA}>
      <h2 id="mt-voz" className="text-xl font-bold">
        {t.titulo}
      </h2>
      <p role="status" className="max-w-3xl font-medium">
        <span aria-hidden="true">{adhesion.adhirio ? "✓ " : "○ "}</span>
        {texto}
      </p>
      <Link href="/tribus/lighthouse/manifiesto" className={`${SUBRAYADO} w-fit text-sm font-medium`}>
        {adhesion.adhirio ? t.ver : t.adherir}
      </Link>
      <div className={SUBBLOQUE}>
        <p className="w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium">{t.enDiscusion}</p>
        <p className="max-w-3xl text-sm">{t.propuesta}</p>
      </div>
      <p className="text-sm text-muted">{t.faroNoVota}</p>
    </section>
  );
}
