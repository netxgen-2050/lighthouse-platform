"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { PedidoContacto } from "@/components/pedido-contacto";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoEstado } from "@/components/lotes/estado-del-lote";
import { useCompras } from "@/components/lotes/usar-compras";
import { guardarPedido } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { sinDato as textoSinDato } from "@/lib/idioma/formatos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { ESTADOS_ADMINISTRATIVOS, proyectoDeGrupo, type IdProyecto } from "@/lib/legal/estado-administrativo";
import { compraDe, estadoConCompras } from "@/lib/lotes/compra";
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
import { CompraSimulada } from "./compra-cliente";

const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const BOTON =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const MARCA = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";

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
  const { compras, guardar } = useCompras();
  const [elegida, setElegida] = useState<OpcionCompra>("solo-lote");
  const grupo = useId();
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) return null;

  const proyecto = proyectoDeGrupo(lote.grupo);
  const estado = estadoConCompras(id, compras);
  // La reserva o el pago simulados fijan la opción: el boleto muestra lo que se vio.
  const compra = estado === "reservado-por-vos" || estado === "vendido-a-vos" ? compraDe(compras, id) : undefined;
  const opcion = compra?.opcion ?? elegida;

  const precioDelLote = precioLote(lote.superficieM2);
  const precio = precioPaquete(lote.superficieM2, opcion);
  const aporte = precio === null ? null : aporteDe(precio);
  const parte = precioDelLote === null ? null : parteDelDuenoDe(precioDelLote);
  const sd = textoSinDato(idioma);
  // Lo que la persona ve al reservar queda guardado tal cual: el boleto no se recalcula con un modelo que cambie después.
  const vio = {
    precio,
    aporte,
    expensa: MODELO_LOTES.expensaAnual,
    version: VERSION_MODELO_LOTES.version,
    fuente: VERSION_MODELO_LOTES.fuente,
    // La versión del texto "Lo que compartís y lo que pagás" que se ve en esta ficha: la reserva exige marcar que se leyó.
    hibridoAceptado: VERSION_HIBRIDO,
    ...(opcion === "solo-lote" ? {} : { precioCasa: precioCasa(opcion) }),
  };

  return (
    <div className="mt-4 grid gap-4">
      <ImagenLote lote={lote} />
      <section aria-label={tl.lote(lote.numero)} className={TARJETA}>
        <p className="text-sm">
          <strong>{t.ficha.superficie}</strong> {textoSuperficieM2(lote.superficieM2, idioma)}
        </p>
        <p className="text-sm font-medium">
          {t.ficha.estado} <TextoEstado estado={estado} />
        </p>
        <p className="text-sm">
          <strong>{t.ficha.quienVende}</strong> {sd}
        </p>
      </section>

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

      <section aria-labelledby="ficha-costos" className={TARJETA}>
        <h2 id="ficha-costos" className="text-lg font-semibold">
          {t.costos.titulo}
        </h2>
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
        <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          <strong>{t.costos.provisoriaTitulo}</strong> {t.costos.provisoria}
          <TerminoLegal clave="retribucionraiz" idioma={idioma} />
        </p>
        <p className="text-sm text-muted">
          {t.costos.version(VERSION_MODELO_LOTES.fuente, VERSION_MODELO_LOTES.version, VERSION_MODELO_LOTES.fecha)}
        </p>
      </section>

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

      <EstadoAdministrativo proyecto={proyecto} idioma={idioma} />

      <section aria-labelledby="ficha-resumen" className={TARJETA}>
        <h2 id="ficha-resumen" className="text-lg font-semibold">
          {t.resumen.titulo}
        </h2>
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
      </section>

      <section aria-labelledby="ficha-acciones" className={TARJETA}>
        <h2 id="ficha-acciones" className="sr-only">
          {t.acciones.titulo}
        </h2>
        <CompraSimulada
          loteId={lote.id}
          numero={lote.numero}
          proyecto={proyecto}
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
        <Link className="underline" href={`/territorios/lighthouse?sel=${lote.id}`}>
          {t.ficha.volverAlMapa}
        </Link>
      </p>
    </div>
  );
}
