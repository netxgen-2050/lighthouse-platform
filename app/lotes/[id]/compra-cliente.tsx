"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { faroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { ESTADOS_ADMINISTRATIVOS, accionesDeLote, type IdProyecto } from "@/lib/legal/estado-administrativo";
import type { ResultadoDeAccion } from "@/components/lotes/usar-compras";
import { pagar, reservar, type CompraLote, type LoVisto } from "@/lib/lotes/compra";
import { usdEn } from "@/lib/lotes/formato";
import type { OpcionCompra } from "@/lib/lotes/modelo";
import { formatearFecha, sinDato } from "@/lib/idioma/formatos";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";

// Reservar, pago simulado y boleto de ejemplo (spec lotes-compra-simulada). Todo es simulado: no hay ningún campo de
// pago ni identidad. Las reservas y pagos simulados se guardan en el servidor, a nombre de la persona en sesión
// (`lotes-en-la-base`): las acciones llegan por props desde `useCompras`, esperan al servidor y dicen si salió bien.

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRINCIPAL = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const SECUNDARIO = `${BOTON} border border-muted hover:bg-surface`;
const TITULO = "text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Fase = "inicio" | "reservado" | "pago" | "boleto";

type Props = {
  loteId: string;
  numero: number;
  proyecto: IdProyecto;
  /** Si el lote trae NFT y FARO (`loteTraeFaro`): los primeros 4 no, y el boleto no lo menciona. */
  traeFaro: boolean;
  superficieM2?: number;
  opcion: OpcionCompra;
  vio: LoVisto;
  compras: CompraLote[];
  /** Las acciones de `useCompras`: esperan al servidor y dicen si salió bien o por qué no. */
  reservar: (loteId: string, opcion: OpcionCompra, vio: LoVisto) => Promise<ResultadoDeAccion>;
  pagar: (loteId: string) => Promise<ResultadoDeAccion>;
  deshacer: (loteId: string) => Promise<ResultadoDeAccion>;
  /** ¿Está disponible para esta persona? Falso si es de ejemplo no disponible o si otra persona lo reservó o lo pagó. */
  disponible: boolean;
  /** La compra de este lote, si la persona la tiene (y el estado de ejemplo todavía lo permite). */
  compra?: CompraLote;
};

export function CompraSimulada({ loteId, numero, proyecto, traeFaro, superficieM2, opcion, vio, compras, reservar: reservarEnServidor, pagar: pagarEnServidor, deshacer: deshacerEnServidor, disponible, compra }: Props) {
  const idioma = useIdioma();
  const t = useTextos("lotes");
  const tl = useTextos("territorio").loteo;
  const { estado: estadoSesion } = useSesion();
  const [pagando, setPagando] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [falloGuardar, setFalloGuardar] = useState<null | "error" | "ya-reservado">(null);
  // La casilla "Leí lo que comparto y lo que me comprometo a pagar": sin marcarla no se puede reservar.
  const [leido, setLeido] = useState(false);
  const idAyuda = useId();
  const mover = useRef(false);
  const titulos = {
    inicio: useRef<HTMLHeadingElement>(null),
    reservado: useRef<HTMLHeadingElement>(null),
    pago: useRef<HTMLHeadingElement>(null),
    boleto: useRef<HTMLHeadingElement>(null),
  };

  // El plan que la persona vio al reservar (las compras guardadas antes no lo tienen: sin dato, nunca contado).
  const planCompra = compra?.vio.plan;
  const enCuotas = !!planCompra && planCompra.cuotas > 0;
  const textoPlan = (cuotas: number) => (cuotas === 0 ? t.boleto.planContado : t.plan.cuotas(cuotas));

  const fase: Fase = compra?.paso === "pagado" ? "boleto" : compra ? (pagando ? "pago" : "reservado") : "inicio";

  // Cada cambio de paso hecho por la persona mueve el foco al título del paso nuevo.
  useEffect(() => {
    if (!mover.current) return;
    mover.current = false;
    titulos[fase].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // Guardar es asíncrono (lib/lotes/reservas.ts). El foco se pide antes de guardar, porque guardar actualiza la lista y el cambio
  // de paso tiene que encontrar el pedido hecho. `despues` corre una vez guardado (o fallado): así la pantalla pasa de un paso
  // al siguiente de una sola vez, sin un paso intermedio que se lleve el foco.
  // Si el servidor no confirma, la pantalla no cambia: queda el aviso y todo sigue como estaba (no se corre `despues`).
  async function aplicar(accion: () => Promise<ResultadoDeAccion>, mensaje: string, moverFoco = true, despues?: () => void) {
    mover.current = moverFoco;
    const r = await accion();
    if (!r.ok) {
      mover.current = false;
      setFalloGuardar(r.motivo === "ya-reservado" ? "ya-reservado" : "error");
      return;
    }
    despues?.();
    setFalloGuardar(null);
    setAnuncio(mensaje);
  }

  function alReservar() {
    if (!leido) return;
    // La misma regla que el servidor, para no mandar lo que sabemos que no vale; el servidor decide igual.
    if (!reservar(compras, loteId, opcion, vio, new Date()).ok) return;
    void aplicar(() => reservarEnServidor(loteId, opcion, vio), t.compra.anuncioReservado(numero));
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
    if (!pagar(compras, loteId, new Date()).ok) return;
    // Con cuotas no se dice que el lote está pagado: es el primer pago.
    void aplicar(() => pagarEnServidor(loteId), enCuotas ? t.compra.anuncioPrimerPago(numero) : t.compra.anuncioPagado(numero), true, () => setPagando(false));
  }

  function alDeshacer() {
    // Un lote que vuelve a estar disponible pide aceptar de nuevo. Si no cambia la fase (ya estaba en "inicio"), no se pide mover el foco.
    void aplicar(() => deshacerEnServidor(loteId), t.compra.anuncioDeshecho(numero), !!compra, () => {
      setPagando(false);
      setLeido(false);
    });
  }

  const estadoLegal = ESTADOS_ADMINISTRATIVOS[proyecto];
  const ofreceReservar = accionesDeLote(proyecto).includes("reservar");

  return (
    <div className="grid gap-3">
      <p role="status" className="sr-only">
        {anuncio}
      </p>
      {falloGuardar !== null && (
        <p role="alert" className="text-sm font-medium text-danger">
          <span aria-hidden="true">▲ </span>
          {falloGuardar === "ya-reservado" ? t.compra.yaReservado : t.compra.noSePudo}
        </p>
      )}

      {fase === "inicio" && (
        <div className="grid gap-2">
          <h3 ref={titulos.inicio} tabIndex={-1} className={TITULO}>
            {t.acciones.titulo}
          </h3>
          {!ofreceReservar || !disponible ? (
            <p className="text-sm">{t.acciones.noSeOfrece}</p>
          ) : estadoSesion === "ok" ? (
            <div className="grid gap-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={leido}
                  onChange={(e) => setLeido(e.target.checked)}
                  className="mt-1 size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                />
                <span>{t.acciones.aceptar}</span>
              </label>
              <button
                type="button"
                onClick={alReservar}
                disabled={!leido}
                aria-describedby={leido ? undefined : idAyuda}
                className={`${PRINCIPAL} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {t.acciones.reservar}
              </button>
              {!leido && (
                <p id={idAyuda} className="text-sm text-muted">
                  {t.acciones.aceptarPrimero}
                </p>
              )}
            </div>
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
                {enCuotas ? t.compra.simularPrimerPago : t.compra.simularPago}
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
            {enCuotas ? t.compra.pagoTituloCuotas : t.compra.pagoTitulo}
          </h3>
          <p className="text-sm font-medium">{t.compra.pagoAviso}</p>
          <p className="text-sm">{t.compra.precioElegido(usdEn(compra?.vio.precio, idioma))}</p>
          {planCompra && (
            <p className="text-sm">{t.compra.planElegido(textoPlan(planCompra.cuotas), usdEn(planCompra.anticipo, idioma))}</p>
          )}
          {planCompra && compra?.opcion !== "solo-lote" && <p className="text-sm">{t.plan.casaAparte}</p>}
          <p className="text-sm">
            {t.compra.aporteAparte(usdEn(compra?.vio.aporte, idioma))}
            <TerminoLegal clave="aporteunico" idioma={idioma} />
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={alConfirmar} className={PRINCIPAL}>
              {enCuotas ? t.compra.confirmarCuotas : t.compra.confirmar}
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
              <strong>{t.boleto.lote}</strong> {tl.lote(numero)}
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
                  {enCuotas ? t.boleto.primerPago : t.boleto.pagado} {formatearFecha(compra.pagadoEl, idioma, "corto")}
                </>
              )}
            </li>
            <li>
              {t.boleto.hibrido} {compra.vio.hibridoAceptado ?? sinDato(idioma)}
            </li>
            {traeFaro && (
              <>
                <li>
                  <strong>{t.boleto.plan}</strong> {planCompra ? textoPlan(planCompra.cuotas) : sinDato(idioma)}
                </li>
                {planCompra && compra.opcion !== "solo-lote" && <li>{t.plan.casaAparte}</li>}
                {planCompra ? (
                  <>
                    <li>
                      <strong>{enCuotas ? t.boleto.anticipo : t.boleto.pagoUnico}</strong> {usdEn(planCompra.anticipo, idioma)}
                    </li>
                    {enCuotas && (
                      <li>
                        <strong>{t.boleto.cuota}</strong> {usdEn(planCompra.cuota, idioma)}
                        {planCompra.ultimaCuota != null && planCompra.ultimaCuota !== planCompra.cuota && (
                          <> · {t.plan.ultimaCuota(usdEn(planCompra.ultimaCuota, idioma))}</>
                        )}
                      </li>
                    )}
                    <li>
                      <strong>{t.boleto.faroPrimerPago}</strong> {faroEn(planCompra.faroAnticipo, idioma)} ({t.boleto.simulado})
                    </li>
                    {enCuotas && (
                      <li>
                        <strong>{t.boleto.faroCadaCuota}</strong> {faroEn(planCompra.faroPorCuota, idioma)} ({t.boleto.simulado})
                        {planCompra.faroUltimaCuota != null && planCompra.faroUltimaCuota !== planCompra.faroPorCuota && (
                          <> · {t.plan.faroUltima(faroEn(planCompra.faroUltimaCuota, idioma))}</>
                        )}
                      </li>
                    )}
                  </>
                ) : (
                  <li>{t.boleto.faroViejo(String(numero), faroEn(compra.vio.faro, idioma))}</li>
                )}
              </>
            )}
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
