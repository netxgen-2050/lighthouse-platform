"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { EstadosAdministrativos } from "@/components/estados-administrativos";
import { PedidoContacto } from "@/components/pedido-contacto";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { TerminoLegal } from "@/components/termino-legal";
import { Aviso } from "@/components/ui/aviso";
import { PlanoLote } from "@/components/explorar/plano-lote";
import { Desplegable } from "@/components/ui/desplegable";
import { Indicador } from "@/components/ui/indicador";
import { useCompras } from "@/components/lotes/usar-compras";
import { faroEn } from "@/lib/bien-comun/formato";
import { PLAN_CUOTAS, centroDeAnillo, faroDeLote, faroDelPlan, loteTraeFaro, planDeLote } from "@/lib/bien-comun/modelo";
import { guardarPedido } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { sinDato as textoSinDato } from "@/lib/idioma/formatos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { ESTADOS_ADMINISTRATIVOS, proyectoDeGrupo, type IdProyecto } from "@/lib/legal/estado-administrativo";
import { compraDe, estadoConCompras, type EstadoMostrado } from "@/lib/lotes/compra";
import { VERSION_HIBRIDO, lineasDelResumen } from "@/lib/lotes/hibrido";
import {
  MODELO_LOTES,
  OPCIONES_COMPRA,
  VERSION_MODELO_LOTES,
  aporteDe,
  parteDelDuenoDe,
  precioCasa,
  precioLote,
  precioPaquete,
  type OpcionCompra,
  type TipoCasa,
} from "@/lib/lotes/modelo";
import { usdEn } from "@/lib/lotes/formato";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { listarLotes } from "@/lib/territorios/loteo";
import { ImagenLote } from "@/components/lotes/imagen-lote";
import { PlanTokenTierra } from "@/components/lotes/plan-token-tierra";
import { CompraSimulada } from "./compra-cliente";

const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const CAJA_DESPLEGABLE = "rounded-xl border border-faint bg-surface p-4";
const BOTON =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const MARCA = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";

/** El estado del lote en una palabra, para el indicador de la fila de datos. */
function textoDeEstado(
  t: { disponible: string; reservado: string; vendido: string; reservadoPorVos: string; vendidoAVos: string; enCuotasTuyo: string },
  e: EstadoMostrado,
): string {
  return {
    disponible: t.disponible,
    reservado: t.reservado,
    vendido: t.vendido,
    "reservado-por-vos": t.reservadoPorVos,
    "vendido-a-vos": t.vendidoAVos,
    "en-cuotas-tuyo": t.enCuotasTuyo,
  }[e];
}

/** "Hablar con alguien": el mismo pedido de contacto de la plataforma, registrado como consulta por un lote de Lighthouse VRN. */
function HablarConAlguien({ numero, proyecto }: { numero: number; proyecto: IdProyecto }) {
  const t = useTextos("lotes");
  const tl = useTextos("territorio").loteo;
  const idioma = useIdioma();
  const { estado } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const idBoton = `hablar-${useId()}`;
  const estadoLegal = ESTADOS_ADMINISTRATIVOS[proyecto];

  if (estado !== "ok") return <EntrarPara texto={t.acciones.entrarHablar} />;

  function alEnviar(pedido: Pedido): boolean {
    if (!guardarPedido(pedido)) return false;
    setEnviado(true);
    return true;
  }

  return (
    <div className="grid gap-3">
      {enviado ? (
        <p role="status" className="font-medium">
          {t.acciones.consultaEnviada}
        </p>
      ) : (
        <button id={idBoton} type="button" aria-expanded={abierto} onClick={() => setAbierto(true)} className={BOTON}>
          {t.acciones.hablar}
        </button>
      )}
      {abierto && (
        <PedidoContacto
          motivo="consulta-lote-vrn"
          referencia={tl.lote(numero)}
          estadoMostrado={`${estadoLegal.estado} · ${estadoLegal.supuestoDeTrabajo}`}
          aviso={<EstadoAdministrativo proyecto={proyecto} compacto idioma={idioma} />}
          idBoton={idBoton}
          alEnviar={alEnviar}
          alCancelar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}

export function FichaCliente({ id }: { id: string }) {
  const idioma = useIdioma();
  const t = useTextos("lotes");
  const tl = useTextos("territorio").loteo;
  const tb = useTextos("biencomun");
  const te = useTextos("explorar");
  const { compras, guardar } = useCompras();
  const [elegida, setElegida] = useState<OpcionCompra>("solo-lote");
  const [cuotasElegidas, setCuotasElegidas] = useState<number>(PLAN_CUOTAS.dePartida);
  const grupo = useId();
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) return null;

  const proyecto = proyectoDeGrupo(lote.grupo);
  const estado = estadoConCompras(id, compras);
  // La reserva o el pago simulados fijan la opción y el plan: el boleto muestra lo que se vio.
  const compra =
    estado === "reservado-por-vos" || estado === "vendido-a-vos" || estado === "en-cuotas-tuyo" ? compraDe(compras, id) : undefined;
  const opcion = compra?.opcion ?? elegida;
  // Una compra guardada sin plan (o con un plan mal formado) no presume contado: el plan se muestra "sin dato".
  const cuotas = compra ? (compra.vio.plan?.cuotas ?? null) : cuotasElegidas;

  const precioDelLote = precioLote(lote.superficieM2);
  const precio = precioPaquete(lote.superficieM2, opcion);
  const aporte = precio === null ? null : aporteDe(precio);
  const parte = precioDelLote === null ? null : parteDelDuenoDe(precioDelLote);
  const sd = textoSinDato(idioma);
  // Los primeros 4 lotes no traen NFT ni FARO (loteTraeFaro): no se muestra la tarjeta ni se guarda en la reserva.
  const traeFaro = loteTraeFaro(lote.grupo);
  const faro = traeFaro ? faroDeLote(lote.superficieM2) : null;
  // Token Tierra: plan solo sobre el precio del lote. Los primeros 4 no lo muestran ni lo guardan.
  const plan = traeFaro && cuotas !== null ? planDeLote(precioDelLote, cuotas) : null;
  const faroPlan = traeFaro && cuotas !== null ? faroDelPlan(lote.superficieM2, cuotas) : null;
  const planVisto = plan
    ? {
        cuotas: plan.cuotas,
        anticipo: plan.anticipo,
        cuota: plan.cuota,
        ultimaCuota: plan.ultimaCuota,
        faroAnticipo: faroPlan?.anticipo ?? null,
        faroPorCuota: faroPlan?.porCuota ?? null,
        faroUltimaCuota: faroPlan?.ultimaCuota ?? null,
      }
    : undefined;
  const centro = centroDeAnillo(lote.anillo);
  const estadoLegal = ESTADOS_ADMINISTRATIVOS[proyecto];
  const estadoLegalTexto = idioma === "en" && estadoLegal.en?.estado ? estadoLegal.en.estado : estadoLegal.estado;
  const nft = tb.ficha;
  // Lo que la persona ve al reservar queda guardado tal cual: el boleto no se recalcula con un modelo que cambie después.
  const vio = {
    precio,
    aporte,
    expensa: MODELO_LOTES.expensaAnual,
    version: VERSION_MODELO_LOTES.version,
    fuente: VERSION_MODELO_LOTES.fuente,
    // La versión del texto "Lo que compartís y lo que pagás" que se ve en esta ficha: la reserva exige marcar que se leyó.
    hibridoAceptado: VERSION_HIBRIDO,
    // Los FARO que traería el lote, simulados (bien-comun-tokens): se guardan para que el boleto no cambie con el modelo.
    ...(traeFaro ? { faro } : {}),
    ...(planVisto ? { plan: planVisto } : {}),
    ...(opcion === "solo-lote" ? {} : { precioCasa: precioCasa(opcion) }),
  };

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <PlanoLote anillo={lote.anillo} tam={144} />
        <div className="min-w-0 flex-1">
          <ImagenLote lote={lote} />
        </div>
      </div>
      {/* Fila de datos clave: superficie, estado, precio de ejemplo y plan en cuotas (o "sin dato"). */}
      <section aria-label={te.ficha.indicadores} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Indicador etiqueta={te.ficha.superficie} valor={lote.superficieM2 === undefined ? null : textoSuperficieM2(lote.superficieM2, idioma)} mono />
        <Indicador etiqueta={te.ficha.estado} valor={textoDeEstado(t.estado, estado)} />
        <Indicador etiqueta={te.ficha.precio} valor={precioDelLote === null ? null : usdEn(precioDelLote, idioma)} mono />
        <Indicador etiqueta={te.ficha.cuotas} valor={traeFaro ? te.ficha.cuotasSi : null} />
      </section>
      <p className="text-sm">
        <strong>{t.ficha.quienVende}</strong> {sd}
      </p>
      {/* El estado administrativo del proyecto va antes de la acción principal. */}
      <EstadosAdministrativos proyectos={[proyecto]} idioma={idioma} />

      {traeFaro && (
      <section aria-labelledby="ficha-nft" className={TARJETA}>
        <h2 id="ficha-nft" className="text-lg font-semibold">
          {nft.titulo}
          <TerminoLegal clave="nftlote" idioma={idioma} />
        </h2>
        <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="font-semibold">{nft.token}</dt>
          <dd>{lote.numero}</dd>
          <dt className="font-semibold">{nft.superficie}</dt>
          <dd>{textoSuperficieM2(lote.superficieM2, idioma)}</dd>
          <dt className="font-semibold">{nft.centro}</dt>
          <dd>{centro ? `${centro.lat.toFixed(5)}, ${centro.lng.toFixed(5)}` : sd}</dd>
          <dt className="font-semibold">{nft.estado}</dt>
          <dd>{estadoLegalTexto}</dd>
          <dt className="font-semibold">{nft.deberes}</dt>
          <dd>{nft.deberesValor}</dd>
          <dt className="font-semibold">{nft.red}</dt>
          <dd>{nft.redValor}</dd>
        </dl>
        <p className="text-sm font-medium">{nft.noInversion}</p>
        <p className="text-sm text-muted">{nft.nota}</p>
        <p className="text-sm">
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/bien-comun">
            {nft.ver}
          </Link>
        </p>
      </section>
      )}

      <section aria-labelledby="ficha-precio" className={TARJETA}>
        <h2 id="ficha-precio" className="text-lg font-semibold">
          {t.precio.titulo}
        </h2>
        <p className="font-medium">
          {precioDelLote === null ? t.precio.sinSuperficie : t.precio.valor(usdEn(precioDelLote, idioma))}
          <TerminoLegal clave="precioreferencia" idioma={idioma} />
        </p>
        <p className="text-sm text-muted">
          {t.precio.rango(usdEn(MODELO_LOTES.precioLote.min, idioma), usdEn(MODELO_LOTES.precioLote.max, idioma))}
        </p>
      </section>

      <section aria-labelledby="ficha-casa" className={TARJETA}>
        <h2 id="ficha-casa" className="text-lg font-semibold">
          {t.casa.titulo}
        </h2>
        <fieldset className="grid gap-2" disabled={!!compra}>
          <legend className="font-medium">{t.casa.leyenda}</legend>
          {OPCIONES_COMPRA.map((o) => {
            const casa = o === "solo-lote" ? null : MODELO_LOTES.casas[o as TipoCasa];
            return (
              <label key={o} className="flex items-start gap-2">
                <input
                  type="radio"
                  name={`${grupo}-opcion`}
                  value={o}
                  checked={opcion === o}
                  onChange={() => setElegida(o)}
                  className="mt-1 size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                />
                <span className="grid">
                  <span>{t.casa.opciones[o]}</span>
                  {casa && (
                    <span className="text-sm text-muted">
                      {t.casa.detalle(casa.m2, usdEn(precioCasa(o as TipoCasa), idioma))}
                      {o === "familiar" && <> · {t.casa.referenciaMartin}</>}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>
        {opcion !== "solo-lote" && (
          <p className="text-sm font-medium">
            {t.casa.total(usdEn(precio, idioma))} <span className={MARCA}>{t.casa.estimacion}</span>
          </p>
        )}
      </section>

      {!traeFaro ? (
        <p className="text-sm">{t.plan.primeros}</p>
      ) : (
        <PlanTokenTierra
          nombre={grupo}
          textos={t.plan}
          opciones={PLAN_CUOTAS.opciones}
          elegida={cuotas}
          alElegir={setCuotasElegidas}
          deshabilitado={!!compra}
          plan={plan}
          faro={faroPlan}
          usd={(n) => usdEn(n, idioma)}
          faroTexto={(n) => faroEn(n, idioma)}
          sinDato={sd}
          conCasa={opcion !== "solo-lote"}
          terminoTierra={<TerminoLegal clave="tokentierra" idioma={idioma} />}
          terminoOrdenanza={<TerminoLegal clave="ordenanza173" idioma={idioma} />}
          enlace={
            <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/bien-comun">
              {t.plan.ver}
            </Link>
          }
        />
      )}

      <Desplegable id="ficha-costos" titulo={t.costos.titulo} className={CAJA_DESPLEGABLE}>
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">{t.costos.titulo}</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="w-1/2 py-1.5 pr-2">
                {t.costos.concepto}
              </th>
              <th scope="col" className="py-1.5">
                {t.costos.valor}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal break-words">
                {t.costos.aporte}
                <TerminoLegal clave="aporteunico" idioma={idioma} />
              </th>
              <td className="py-1.5 break-words">
                {usdEn(aporte, idioma)} <span className={MARCA}>{t.costos.deEjemplo}</span>
              </td>
            </tr>
            <tr className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal break-words">
                {t.costos.expensas}
                <TerminoLegal clave="expensas" idioma={idioma} />
              </th>
              <td className="py-1.5 break-words">
                {usdEn(MODELO_LOTES.expensaAnual, idioma)} <span className={MARCA}>{t.costos.deEjemplo}</span>
              </td>
            </tr>
            <tr className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal break-words">
                {t.costos.infraestructura}
                <TerminoLegal clave="infraestructuralote" idioma={idioma} />
              </th>
              <td className="py-1.5 break-words">
                {usdEn(MODELO_LOTES.infraestructuraPorLote, idioma)} <span className={MARCA}>{t.costos.deEjemplo}</span>
                <span className="block text-muted">{t.costos.estimacion}</span>
              </td>
            </tr>
            <tr className="border-t border-line align-top">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal break-words">
                {t.costos.parteDelDueno}
                <TerminoLegal clave="partedueno" idioma={idioma} />
              </th>
              <td className="py-1.5 break-words">
                {usdEn(parte, idioma)} <span className={MARCA}>{t.costos.deEjemplo}</span>
                <span className="block text-muted">{t.costos.estimacion}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm">{t.costos.aporteSobre}</p>
        <p className="text-sm">{t.costos.aporteAparte}</p>
        <Aviso tono="legal">
          <strong>{t.costos.provisoriaTitulo}</strong> {t.costos.provisoria}
          <TerminoLegal clave="retribucionraiz" idioma={idioma} />
        </Aviso>
        <p className="text-sm text-muted">
          {t.costos.version(VERSION_MODELO_LOTES.fuente, VERSION_MODELO_LOTES.version, VERSION_MODELO_LOTES.fecha)}
        </p>
      </Desplegable>

      <section aria-labelledby="ficha-derechos" className={TARJETA}>
        <h2 id="ficha-derechos" className="text-lg font-semibold">
          {t.derechos.titulo}
          <TerminoLegal clave="derechosdeberes" idioma={idioma} />
        </h2>
        <h3 className="font-medium">{t.derechos.queDa}</h3>
        <ul className="list-disc pl-5 text-sm">
          {t.derechos.queDaItems.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <h3 className="font-medium">{t.derechos.quePide}</h3>
        <ul className="list-disc pl-5 text-sm">
          {t.derechos.quePideItems.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="text-sm font-medium">{t.derechos.queNoDa}</p>
      </section>

      <Desplegable id="ficha-resumen" titulo={t.resumen.titulo} className={CAJA_DESPLEGABLE}>
        <ul className="list-disc pl-5 text-sm">
          {lineasDelResumen(idioma, { aporte: usdEn(aporte, idioma), expensa: usdEn(MODELO_LOTES.expensaAnual, idioma) }).map(
            (l) => (
              <li key={l}>{l}</li>
            ),
          )}
        </ul>
        <p className="text-sm">
          <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/lotes/hibrido">
            {t.resumen.ver}
          </Link>
        </p>
      </Desplegable>

      {/* Acción principal: en el celular queda fija abajo, encima de la barra inferior (con tope de alto y scroll propio). */}
      <section
        aria-labelledby="ficha-acciones"
        className={`${TARJETA} sticky bottom-[var(--alto-barra-inferior)] z-20 max-h-[45dvh] overflow-y-auto shadow-[var(--sombra-2)] md:static md:max-h-none md:overflow-visible md:shadow-none`}
      >
        <h2 id="ficha-acciones" className="sr-only">
          {t.acciones.titulo}
        </h2>
        <CompraSimulada
          loteId={lote.id}
          numero={lote.numero}
          proyecto={proyecto}
          traeFaro={traeFaro}
          superficieM2={lote.superficieM2}
          opcion={opcion}
          vio={vio}
          compras={compras}
          guardar={guardar}
          compra={compra}
        />
        <HablarConAlguien numero={lote.numero} proyecto={proyecto} />
      </section>

      <p className="text-sm">
        <Link className="underline" href={`/explorar/territorio?sel=${lote.id}`}>
          {t.ficha.volverAlMapa}
        </Link>
      </p>
    </div>
  );
}
