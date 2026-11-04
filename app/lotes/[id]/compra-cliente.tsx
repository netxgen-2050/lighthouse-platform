"use client";

import { useEffect, useRef, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { ESTADOS_ADMINISTRATIVOS, accionesDeLote, type IdProyecto } from "@/lib/legal/estado-administrativo";
import { deshacer, pagar, reservar, type CompraLote, type LoVisto } from "@/lib/lotes/compra";
import { usdEn } from "@/lib/lotes/formato";
import type { OpcionCompra } from "@/lib/lotes/modelo";
import { formatearFecha, sinDato } from "@/lib/idioma/formatos";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { estadoDeLote } from "@/lib/territorios/loteo-estados";

// Reservar, pago simulado y boleto de ejemplo (spec lotes-compra-simulada). Todo es simulado: no hay ningún campo de
// pago ni identidad, y no se hace ningún pedido de red con estos datos. Lo único que se guarda va al navegador.

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRINCIPAL = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const SECUNDARIO = `${BOTON} border border-muted hover:bg-surface`;
const TITULO = "text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Fase = "inicio" | "reservado" | "pago" | "boleto";

type Props = {
  loteId: string;
  etiqueta: string;
  proyecto: IdProyecto;
  superficieM2?: number;
  opcion: OpcionCompra;
  vio: LoVisto;
  compras: CompraLote[];
  guardar: (nuevas: CompraLote[]) => boolean;
  /** La compra de este lote, si la persona la tiene (y el estado de ejemplo todavía lo permite). */
  compra?: CompraLote;
};

export function CompraSimulada({ loteId, etiqueta, proyecto, superficieM2, opcion, vio, compras, guardar, compra }: Props) {
  const idioma = useIdioma();
  const t = useTextos("lotes");
  const tl = useTextos("territorio").loteo;
  const { estado: estadoSesion } = useSesion();
  const [pagando, setPagando] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [falloGuardar, setFalloGuardar] = useState(false);
  const mover = useRef(false);
  const titulos = {
    inicio: useRef<HTMLHeadingElement>(null),
    reservado: useRef<HTMLHeadingElement>(null),
    pago: useRef<HTMLHeadingElement>(null),
    boleto: useRef<HTMLHeadingElement>(null),
  };

  const fase: Fase = compra?.paso === "pagado" ? "boleto" : compra ? (pagando ? "pago" : "reservado") : "inicio";

  // Cada cambio de paso hecho por la persona mueve el foco al título del paso nuevo.
  useEffect(() => {
    if (!mover.current) return;
    mover.current = false;
    titulos[fase].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  function aplicar(nuevas: CompraLote[], mensaje: string) {
    if (!guardar(nuevas)) {
      setFalloGuardar(true);
      return;
    }
    setFalloGuardar(false);
    setAnuncio(mensaje);
    mover.current = true;
  }

  function alReservar() {
    const r = reservar(compras, loteId, opcion, vio, new Date());
    if (!r.ok) return;
    aplicar(r.compras, t.compra.anuncioReservado(etiqueta));
  }

  function alSimularPago() {
    mover.current = true;
    setPagando(true);
  }

  // Volver del pago simulado es un cambio de paso: el foco va al título de la reserva.
  function alVolver() {
    mover.current = true;
    setPagando(false);
  }

  function alConfirmar() {
    const r = pagar(compras, loteId, new Date());
    if (!r.ok) return;
    setPagando(false);
    aplicar(r.compras, t.compra.anuncioPagado(etiqueta));
  }

  function alDeshacer() {
    setPagando(false);
    aplicar(deshacer(compras, loteId), t.compra.anuncioDeshecho(etiqueta));
    // Si no cambió la fase (por ejemplo, ya estaba en "inicio"), no queda un movimiento de foco pendiente.
    if (!compra) mover.current = false;
  }

  const estadoLegal = ESTADOS_ADMINISTRATIVOS[proyecto];
  const ofreceReservar = accionesDeLote(proyecto).includes("reservar");

  return (
    <div className="grid gap-3">
      <p role="status" className="sr-only">
        {anuncio}
      </p>
      {falloGuardar && (
        <p role="alert" className="text-sm font-medium text-danger">
          <span aria-hidden="true">▲ </span>
          {t.compra.noSePudo}
        </p>
      )}

      {fase === "inicio" && (
        <div className="grid gap-2">
          <h3 ref={titulos.inicio} tabIndex={-1} className={TITULO}>
            {t.acciones.titulo}
          </h3>
          {!ofreceReservar || estadoDeLote(loteId) !== "disponible" ? (
            <p className="text-sm">{t.acciones.noSeOfrece}</p>
          ) : estadoSesion === "ok" ? (
            <button type="button" onClick={alReservar} className={PRINCIPAL}>
              {t.acciones.reservar}
            </button>
          ) : (
            <EntrarPara texto={t.acciones.entrarReservar} />
          )}
        </div>
      )}

      {(fase === "reservado" || fase === "pago") && (
        <div className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
          <h3 ref={titulos.reservado} tabIndex={-1} className={TITULO}>
            {t.compra.reservaTitulo}
          </h3>
          <p className="text-sm">{t.compra.reservaAviso}</p>
          {fase === "reservado" && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={alSimularPago} className={PRINCIPAL}>
                {t.compra.simularPago}
              </button>
              <button type="button" onClick={alDeshacer} className={SECUNDARIO}>
                {t.compra.deshacer}
              </button>
            </div>
          )}
        </div>
      )}

      {fase === "pago" && (
        <div className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
          <h3 ref={titulos.pago} tabIndex={-1} className={TITULO}>
            {t.compra.pagoTitulo}
          </h3>
          <p className="text-sm font-medium">{t.compra.pagoAviso}</p>
          <p className="text-sm">{t.compra.precioElegido(usdEn(compra?.vio.precio, idioma))}</p>
          <p className="text-sm">
            {t.compra.aporteAparte(usdEn(compra?.vio.aporte, idioma))}
            <TerminoLegal clave="aporteunico" idioma={idioma} />
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={alConfirmar} className={PRINCIPAL}>
              {t.compra.confirmar}
            </button>
            <button type="button" onClick={alVolver} className={SECUNDARIO}>
              {t.compra.cancelar}
            </button>
          </div>
        </div>
      )}

      {fase === "boleto" && compra && (
        <section
          aria-labelledby={`boleto-${loteId}`}
          className="grid gap-2 rounded-xl border-2 border-dashed border-gold-ink bg-surface p-4"
        >
          <h3 id={`boleto-${loteId}`} ref={titulos.boleto} tabIndex={-1} className={TITULO}>
            {t.boleto.titulo}
            <TerminoLegal clave="boletoejemplo" idioma={idioma} />
          </h3>
          {/* La marca va antes de cualquier dato. */}
          <p className="rounded-lg border border-dashed border-gold-ink bg-gold-soft px-3 py-2 text-sm font-bold break-words">
            {t.boleto.marca}
          </p>
          <p className="text-sm">{t.compra.noSeCobro}</p>
          <ul className="grid gap-1 text-sm break-words">
            <li>
              <strong>{t.boleto.lote}</strong> {tl.lote(etiqueta)}
              {" · "}
              {textoSuperficieM2(superficieM2, idioma)}
            </li>
            <li>
              <strong>{t.boleto.opcion}</strong> {t.casa.opciones[compra.opcion]}
              {compra.opcion !== "solo-lote" && (
                <>
                  {" · "}
                  {t.boleto.casaEstimacion(
                    t.casa.opciones[compra.opcion],
                    usdEn(compra.vio.precioCasa, idioma),
                    usdEn(compra.vio.precio, idioma),
                  )}
                </>
              )}
            </li>
            <li>
              <strong>{t.boleto.precio}</strong> {usdEn(compra.vio.precio, idioma)}
            </li>
            <li>
              <strong>{t.boleto.aporte}</strong> {usdEn(compra.vio.aporte, idioma)}
            </li>
            <li>
              <strong>{t.boleto.expensa}</strong> {usdEn(compra.vio.expensa, idioma)}
            </li>
            <li>{t.boleto.comprador}</li>
            <li>
              {t.boleto.vendedor} {sinDato(idioma)}
            </li>
            <li>
              {t.boleto.aprobacion}{" "}
              {idioma === "en" && estadoLegal.en?.supuestoDeTrabajo ? estadoLegal.en.supuestoDeTrabajo : estadoLegal.supuestoDeTrabajo}
            </li>
            <li>
              {t.boleto.reservado} {formatearFecha(compra.reservadoEl, idioma, "corto")}
              {compra.pagadoEl && (
                <>
                  {" · "}
                  {t.boleto.pagado} {formatearFecha(compra.pagadoEl, idioma, "corto")}
                </>
              )}
            </li>
            <li className="text-muted">
              {t.boleto.modelo}: {compra.vio.fuente ?? sinDato(idioma)} · {compra.vio.version}
            </li>
          </ul>
          <button type="button" onClick={alDeshacer} className={SECUNDARIO}>
            {t.compra.deshacer}
          </button>
        </section>
      )}
    </div>
  );
}
