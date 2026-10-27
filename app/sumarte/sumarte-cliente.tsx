"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KycDialogo } from "@/components/kyc-dialogo";
import { Medidor } from "@/components/medidor";
import { PedidoContacto } from "@/components/pedido-contacto";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarComo } from "@/components/sesion/entrar-como";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoBilingue } from "@/components/texto-bilingue";
import { ProveedorIdioma, useIdioma, useTextos } from "@/lib/idioma/cliente";
import { GLOSARIO } from "@/lib/idioma/glosario";
import {
  alcanza,
  avisoDeNivel,
  avisoDeRuta,
  nivelDeParametro,
  nivelMinimoDeRuta,
  type Nivel,
} from "@/lib/permisos/niveles";
import {
  aplicarAcciones,
  CLAVE_PENDIENTE,
  guardarEstado,
  guardarPendiente,
  leerEstadoGuardado,
  leerPendiente,
} from "@/lib/sesion/nivel";
import { buscarTribu, listarTribus } from "@/lib/tribus/datos";
import { textoDeEstado } from "@/lib/tribus/tipos";
import { guardarPedido } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { formatearMonto, notaTipoDeCambio, TIPO_DE_CAMBIO } from "@/lib/configuracion/preferencias";
import {
  COHORT,
  EMISION,
  FILAS,
  MEMBRESIA,
  PASSES,
  PLAN_TRIBU,
  type NivelPase,
} from "@/lib/sumarte/datos";
import { useKyc } from "@/lib/pasaporte/usar-kyc";
import { INICIAL, reducir, type Accion, type EstadoSumarte } from "@/lib/sumarte/estado";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const BOTON_SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const TARJETA = "grid grid-cols-1 content-start gap-3 rounded-xl border bg-surface p-4";
const BORDE = "border-faint";
const BORDE_ACTUAL = "border-2 border-deep";
const ETIQUETA_ACTUAL = "w-fit rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

const ACCIONES_DE_PLAN: readonly Accion["tipo"][] = ["plan", "pase", "tribu"];

/** "Semillas" es una marca de la plataforma: el traductor del navegador no la cambia (`translate="no"`). */
function ConMarcas({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(Semillas(?: \(seeds\))?)/).map((parte, i) =>
        i % 2 === 1 ? (
          <span key={i} translate="no">
            {parte}
          </span>
        ) : (
          parte
        ),
      )}
    </>
  );
}

export function SumarteCliente({ volver, para }: { volver: string | null; para: string | null }) {
  const router = useRouter();
  const idioma = useIdioma();
  const t = useTextos("sumarte");
  const marco = useTextos("marco");
  const comunes = useTextos("comunes");
  const { estado: estadoSesion, nivel: nivelCuenta, nivelListo, tribuLider, entrar } = useSesion();
  const conSesion = estadoSesion === "ok";
  const [estado, setEstado] = useState<EstadoSumarte>(INICIAL);
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [formulario, setFormulario] = useState<"invitacion" | "charla" | null>(null);
  const [dialogoKyc, setDialogoKyc] = useState(false);
  // Elección de la tribu que se va a liderar con el Plan Tribu ("" = todavía no eligió; "nueva" = proponer una tribu nueva).
  const [eligiendoTribu, setEligiendoTribu] = useState(false);
  const [tribuElegida, setTribuElegida] = useState("");
  const kyc = useKyc();
  const { moneda } = usePreferencias();
  const foco = useRef<string | null>(null);

  // Nivel que hace falta para lo que se quería abrir (la página, o la acción que pidió sumarse).
  const requerido: Nivel | null = nivelDeParametro(para) ?? (volver ? nivelMinimoDeRuta(volver) : null);
  const volverAlLugar = volver && !volver.startsWith("/sumarte") ? volver : null;
  const faltaNivel = requerido !== null && requerido !== "sin-cuenta" && !alcanza(nivelCuenta, requerido);
  const aviso = !volverAlLugar || !faltaNivel ? null : para ? avisoDeNivel(requerido!, idioma) : avisoDeRuta(volverAlLugar, idioma);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor). Sin sesión no se lee ni se guarda nada.
    if (!conSesion) {
      setEstado(INICIAL);
      setListo(true);
      return;
    }
    let leido = INICIAL;
    try {
      leido = leerEstadoGuardado(window.localStorage);
    } catch {
      setFalloAlmacen(true);
    }
    // Si la persona eligió un plan antes de registrarse, se aplica ahora que ya tiene cuenta.
    let pendiente: Accion[] = [];
    try {
      pendiente = leerPendiente(window.sessionStorage);
    } catch {
      // Sin almacenamiento de la pestaña no hay pedido que aplicar.
    }
    if (pendiente.length > 0) {
      try {
        window.sessionStorage.removeItem(CLAVE_PENDIENTE);
      } catch {
        // Si no se puede borrar, se vuelve a aplicar lo mismo: el resultado es igual.
      }
      leido = aplicarAcciones(leido, pendiente);
      if (!guardarEstado(window.localStorage, leido)) setFalloAlmacen(true);
      // Propuso una tribu nueva: sigue en la postulación de un barrio vacante.
      if (pendiente.some((a) => a.tipo === "tribu" && !a.tribuId)) router.push("/tribus#sec-vacantes");
    }
    setEstado(leido);
    setListo(true);
  }, [conSesion, router]);

  // Con el nivel que hacía falta, vuelve a donde la persona estaba (por ejemplo, la página que abrió por dirección).
  useEffect(() => {
    if (conSesion && nivelListo && listo && volverAlLugar && requerido && alcanza(nivelCuenta, requerido)) router.replace(volverAlLugar);
  }, [conSesion, nivelListo, listo, volverAlLugar, requerido, nivelCuenta, router]);

  // Tras un cambio, el botón que se apretó puede desaparecer: el foco pasa al estado nuevo.
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>(`[data-foco="${foco.current}"]`)?.focus();
    foco.current = null;
  }, [estado]);

  /**
   * Sin cuenta, elegir un plan abre el registro (Privy, o "Entrar como…" en el modo de prueba): lo elegido queda pendiente
   * en esta pestaña y se aplica al volver con la cuenta. La facturación y el nivel del pase solo mueven la pantalla.
   */
  function dispatch(accion: Accion, enfocar?: string): boolean {
    if (!conSesion) {
      if (accion.tipo === "facturacion" || accion.tipo === "nivel") {
        setEstado(reducir(estado, accion));
        return true;
      }
      const acciones: Accion[] = accion.tipo === "pase" ? [{ tipo: "nivel", nivel: estado.nivelPase }, accion] : [accion];
      try {
        guardarPendiente(window.sessionStorage, ACCIONES_DE_PLAN.includes(accion.tipo) ? acciones : []);
      } catch {
        // Sin almacenamiento de la pestaña, la persona tendrá que volver a elegir al registrarse.
      }
      entrar();
      return true;
    }
    const siguiente = reducir(estado, accion);
    if (!guardarEstado(window.localStorage, siguiente)) {
      setFalloAlmacen(true);
      return false;
    }
    setFalloAlmacen(false);
    foco.current = enfocar ?? null;
    setEstado(siguiente);
    return true;
  }

  const tribusParaLiderar = listarTribus().filter((tr) => tr.estado === "activa" || tr.estado === "formacion");

  function confirmarTribu() {
    if (tribuElegida === "") return;
    const nueva = tribuElegida === "nueva";
    const ok = dispatch({ tipo: "tribu", tribuId: nueva ? null : tribuElegida }, "tribu");
    if (!ok) return;
    setEligiendoTribu(false);
    // Una tribu nueva se arma desde la postulación de un barrio vacante (con sesión; sin sesión se sigue al registrarse).
    if (nueva && conSesion) router.push("/tribus#sec-vacantes");
  }

  // El pedido se guarda primero; recién ahí se hace lo que el botón hacía antes.
  // Si falla guardar el pedido, avisa el formulario (false); si falla el estado de la página,
  // avisa la página y el formulario no repite el aviso ("avisado").
  function enviarPedido(pedido: Pedido, accion: Accion): boolean | "avisado" {
    if (!guardarPedido(pedido)) return false;
    return dispatch(accion) ? true : "avisado";
  }

  const paseActivo = estado.pase ? PASSES.find((p) => p.id === estado.pase)! : null;
  // Con un pase activo, la tarjeta muestra siempre el nivel activado (no se puede cambiar sin deshacerlo).
  const nivel = paseActivo ?? PASSES.find((p) => p.id === estado.nivelPase)!;
  // Sin cuenta ningún plan está elegido: las tarjetas no marcan "tu plan".
  const esLider = conSesion && estado.tribu;
  const esExplorador = conSesion && estado.plan === "explorador";
  const esMiembro = conSesion && estado.plan === "miembro" && !estado.tribu;
  const tribuLiderada = esLider && estado.tribuId ? buscarTribu(estado.tribuId) : undefined;
  const nombreNivel = (id: NivelPase) => t.niveles[id];
  const nombrePlan = esLider
    ? marco.niveles.lider
    : paseActivo
      ? t.estadoPlan.paseFundador(nombreNivel(paseActivo.id))
      : esMiembro
        ? marco.niveles.miembro
        : marco.niveles.explorador;
  const sumaInvitacion = estado.invitacion ? 1 : 0;
  const factorMoneda = moneda === "ARS" ? TIPO_DE_CAMBIO : 1;
  const monto = (usd: number) => formatearMonto(usd, moneda, idioma);
  const tuPlanSimulado = `${t.estadoPlan.tuPlan} ${comunes.simulado}`;
  // La primera mención de Semillas en el contenido de la página lleva su explicación; las siguientes, solo el nombre.
  const semillasPrimera = idioma === "en" ? GLOSARIO.semillas.explicada.en : GLOSARIO.semillas.es;

  const dialogoDeIdentidad = (
    <KycDialogo
      abierto={dialogoKyc}
      kyc={kyc.kyc}
      motivo="Para pedir una invitación a invertir primero necesitamos verificar tu identidad."
      alCerrar={() => {
        setDialogoKyc(false);
        // Con el sello ya obtenido, se sigue con lo que la persona quería hacer.
        if (kyc.verificada && !estado.invitacion) setFormulario("invitacion");
      }}
      alEnviar={kyc.enviar}
      alAprobar={kyc.aprobar}
    />
  );

  return (
    <div className="grid gap-6">
      {aviso && (
        <p role="status" className="rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium">
          {aviso} {t.avisos.elegiUnPlan}
          {volverAlLugar ? t.avisos.yVolvemos : ""}.
        </p>
      )}
      {!conSesion && listo && <p className="max-w-2xl text-sm">{t.registro.ayuda(marco.barra.entrar)}</p>}
      <EntrarComo />
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.registro.errorAlmacenamiento}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t.facturacion.grupo} className="flex gap-2">
          {(["mensual", "anual"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={estado.facturacion === f}
              onClick={() => dispatch({ tipo: "facturacion", facturacion: f })}
              className={`rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${estado.facturacion === f ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface-2"}`}
            >
              {estado.facturacion === f && <span aria-hidden="true">✓ </span>}
              {f === "mensual" ? t.facturacion.mensual : t.facturacion.anual}
              {f === "anual" && <span className="ml-2 text-sm">{t.facturacion.dosMesesGratis}</span>}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {listo ? (
            conSesion ? (
              <>
                {t.estadoPlan.actual} <b>{nombrePlan}</b> {comunes.simulado}
              </>
            ) : (
              t.estadoPlan.sinCuenta
            )
          ) : null}
        </p>
      </div>

      {moneda === "ARS" && (
        <p className="text-sm text-muted">
          {t.pesos.montos} {notaTipoDeCambio(idioma)}{" "}
          <Link className="underline" href="/configuracion">{t.pesos.cambiarMoneda}</Link>
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article aria-labelledby="plan-explorador" className={`${TARJETA} ${esExplorador ? BORDE_ACTUAL : BORDE}`}>
          <h2 id="plan-explorador" className="text-xl font-semibold">{t.explorador.nombre}</h2>
          <p className="text-2xl font-bold">{t.explorador.precio}</p>
          <p className="text-muted">{t.explorador.descripcion}</p>
          <ul className="list-disc pl-5 text-sm">
            {t.explorador.incluye.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {esExplorador ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-explorador">{tuPlanSimulado}</p>
          ) : (
            <button type="button" className={BOTON_SUAVE} onClick={() => dispatch({ tipo: "plan", plan: "explorador" }, "plan-explorador")}>
              {conSesion ? t.explorador.volver : t.explorador.sumarme}
            </button>
          )}
        </article>

        <article aria-labelledby="plan-miembro" className={`${TARJETA} ${esMiembro ? BORDE_ACTUAL : BORDE}`}>
          <h2 id="plan-miembro" className="text-xl font-semibold">
            {t.miembro.nombre}
            <TerminoLegal clave="membresia" idioma={idioma} />
          </h2>
          <p className="text-2xl font-bold">
            {monto(estado.facturacion === "anual" ? MEMBRESIA.anual : MEMBRESIA.mensual)}
            <span className="text-base font-normal text-muted">
              {estado.facturacion === "anual" ? t.facturacion.porAnio : t.facturacion.porMes}
            </span>
          </p>
          {estado.facturacion === "anual" && <p className="text-sm font-medium">{t.facturacion.dosMesesGratis}</p>}
          <p className="text-muted">{t.miembro.descripcion}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t.miembro.todoExplorador}</li>
            <li>{t.miembro.salas}</li>
            <li>
              {t.miembro.pactosY}
              <span translate="no">{semillasPrimera}</span>
              <TerminoLegal clave="semillas" idioma={idioma} />
            </li>
            <li>{t.miembro.voz}</li>
          </ul>
          {esMiembro ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-miembro">{tuPlanSimulado}</p>
          ) : (
            <button type="button" className={BOTON_PRIMARIO} onClick={() => dispatch({ tipo: "plan", plan: "miembro" }, "plan-miembro")}>
              {t.miembro.hacerme}
            </button>
          )}
        </article>

        <article aria-labelledby="plan-fundador" className={`${TARJETA} ${paseActivo ? BORDE_ACTUAL : "border-2 border-gold-ink"}`}>
          <p className="w-fit rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-gold-ink">{t.fundador.cohorte}</p>
          <h2 id="plan-fundador" className="text-xl font-semibold">
            {GLOSARIO.paseFundador[idioma]}
            <TerminoLegal clave="pasefundador" idioma={idioma} />
          </h2>
          <fieldset className="grid grid-cols-3 gap-2">
            <legend className="sr-only">{t.fundador.nivelDelPase}</legend>
            {PASSES.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col items-center rounded-lg border px-2 py-1.5 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep ${nivel.id === p.id ? "border-2 border-deep bg-green-soft" : "border-muted"} ${paseActivo ? "cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="nivel-pase"
                  value={p.id}
                  checked={nivel.id === p.id}
                  disabled={paseActivo !== null}
                  onChange={() => dispatch({ tipo: "nivel", nivel: p.id as NivelPase })}
                  className="sr-only"
                />
                <span className="font-medium">{nombreNivel(p.id)}</span>
                <span className="text-sm">{monto(p.precio)}</span>
              </label>
            ))}
          </fieldset>
          <p className="text-2xl font-bold">
            {monto(nivel.precio)}
            <span className="text-base font-normal">{t.fundador.pagoUnico}</span>
          </p>
          <p className="text-muted">
            {t.fundador.financias}
            <TerminoLegal clave="guardian" idioma={idioma} />
            {t.fundador.financiasFin}
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t.fundador.todoMiembro}</li>
            <li>
              {t.fundador.ronda0}
              <TerminoLegal clave="ronda0" idioma={idioma} />
              {t.fundador.ronda0Fin}
            </li>
            <li>
              {t.fundador.creditos(monto(nivel.creditos))}
              <TerminoLegal clave="creditos" idioma={idioma} />
              {t.fundador.creditosFin}
            </li>
            <li>
              {t.fundador.fideicomiso}
              <TerminoLegal clave="gobernanzafideicomiso" idioma={idioma} />
            </li>
            <li>{t.fundador.canal}</li>
            <li>{t.fundador.registroGenesis}</li>
          </ul>
          <Medidor titulo={t.fundador.medidorPases} actual={COHORT.vendidos + (paseActivo ? 1 : 0)} tope={COHORT.cupo} dorado />
          <Medidor
            titulo={t.fundador.medidorMinimo}
            actual={(COHORT.recaudado + (paseActivo ? paseActivo.precio : 0)) * factorMoneda}
            tope={COHORT.minimo * factorMoneda}
            unidad={`${moneda} `}
          />
          {paseActivo ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="pase">
              {t.fundador.activo(nombreNivel(paseActivo.id))} {comunes.simulado}
            </p>
          ) : (
            <button type="button" className={BOTON_DORADO} onClick={() => dispatch({ tipo: "pase" }, "pase")}>
              {t.fundador.quiero(nombreNivel(nivel.id))}
            </button>
          )}
          {/* Texto con peso legal (R16): hasta `idioma-legal` se ve en español, marcado como tal. */}
          <p className="text-sm text-muted">
            <TextoBilingue
              valor={{ es: "No es una inversión: no da tierra, lotes, prioridad ni rendimiento, y no se revende." }}
              sinNota
            />
          </p>
        </article>

        <article aria-labelledby="plan-tribu" className={`${TARJETA} ${esLider ? BORDE_ACTUAL : BORDE}`}>
          <h2 id="plan-tribu" className="text-xl font-semibold">
            {t.tribu.nombre}
            <TerminoLegal clave="plantribu" idioma={idioma} />
          </h2>
          <p className="text-2xl font-bold">
            {monto(estado.facturacion === "anual" ? PLAN_TRIBU.anual : PLAN_TRIBU.mensual)}
            <span className="text-base font-normal text-muted">
              {estado.facturacion === "anual" ? t.facturacion.porAnio : t.facturacion.porMes}
            </span>
          </p>
          {estado.facturacion === "anual" && <p className="text-sm font-medium">{t.facturacion.dosMesesGratis}</p>}
          <p className="text-muted">{t.tribu.descripcion}</p>
          <ul className="list-disc pl-5 text-sm">
            {t.tribu.incluye.map((x) => (
              <li key={x}>
                <ConMarcas texto={x} />
              </li>
            ))}
          </ul>
          <p className="text-sm">{t.tribu.alElegir}</p>
          {esLider && !eligiendoTribu ? (
            <>
              <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="tribu">
                {tribuLiderada ? (
                  <>
                    {t.tribu.liderDe("")}
                    <span translate="no">{tribuLiderada.nombre}</span> {comunes.simulado}
                  </>
                ) : (
                  `${t.tribu.tribuNueva} ${comunes.simulado}`
                )}
              </p>
              <button type="button" className={BOTON_SUAVE} onClick={() => setEligiendoTribu(true)}>
                {t.tribu.cambiar}
              </button>
              {!tribuLiderada && (
                <Link className="w-fit text-sm underline" href="/tribus#sec-vacantes">
                  {t.tribu.elegirBarrio}
                </Link>
              )}
            </>
          ) : eligiendoTribu ? (
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">{t.tribu.cual}</legend>
              {tribusParaLiderar.map((tr) => (
                <label key={tr.id} className="flex cursor-pointer items-center gap-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep">
                  <input
                    type="radio"
                    name="tribu-a-liderar"
                    value={tr.id}
                    checked={tribuElegida === tr.id}
                    onChange={() => setTribuElegida(tr.id)}
                  />
                  <span translate="no">{tr.nombre}</span>{" "}
                  <span className="text-muted">({textoDeEstado(tr.estado, idioma)})</span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep">
                <input
                  type="radio"
                  name="tribu-a-liderar"
                  value="nueva"
                  checked={tribuElegida === "nueva"}
                  onChange={() => setTribuElegida("nueva")}
                />
                {t.tribu.proponerNueva}
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={BOTON_PRIMARIO} disabled={tribuElegida === ""} onClick={confirmarTribu}>
                  {t.tribu.serLider}
                </button>
                <button type="button" className={BOTON_SUAVE} onClick={() => setEligiendoTribu(false)}>
                  {comunes.cancelar}
                </button>
              </div>
            </fieldset>
          ) : (
            <button
              type="button"
              className={BOTON_SUAVE}
              onClick={() => {
                setTribuElegida(tribuLider ?? "");
                setEligiendoTribu(true);
              }}
            >
              {t.tribu.sumarMiTribu}
            </button>
          )}
        </article>
      </div>

      <section aria-labelledby="comparativa" className={`min-w-0 rounded-xl border bg-surface p-4 ${BORDE}`}>
        <h2 id="comparativa" className="mb-2 text-xl font-semibold">{t.comparativa.titulo}</h2>
        {/* relative: los textos sr-only de la tabla (position: absolute) quedan recortados con la tabla y no ensanchan la página. */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <td className="p-2"><span className="sr-only">{t.comparativa.funcion}</span></td>
                <th scope="col" className="p-2">{GLOSARIO.explorador[idioma]}</th>
                <th scope="col" className="p-2">{GLOSARIO.miembro[idioma]}</th>
                <th scope="col" className="p-2">{GLOSARIO.paseFundador[idioma]}</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.texto.es} className="border-b border-line">
                  <th scope="row" className="p-2 font-normal">
                    <TextoBilingue valor={f.texto} sinNota />
                  </th>
                  {f.incluye.map((si, i) => (
                    <td key={i} className="p-2">
                      <span aria-hidden="true">{si ? "✓" : "—"}</span>
                      <span className="sr-only">{si ? t.comparativa.incluido : t.comparativa.noIncluido}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          <Link className="underline" href="/pasaporte">{t.comparativa.verSellos}</Link>
        </p>
      </section>

      <section aria-labelledby="inversores" className="grid gap-3">
        <h2 id="inversores" className="text-2xl font-semibold">{t.inversores.titulo}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article aria-labelledby="inv-lote7" className={`${TARJETA} ${BORDE}`}>
            <p className="text-sm font-medium text-muted">
              {t.inversores.porInvitacion}
              <TerminoLegal clave="circulo" idioma={idioma} />
            </p>
            <h3 id="inv-lote7" className="text-xl font-semibold">
              {t.inversores.lote7}
              <TerminoLegal clave="sumarte" idioma={idioma} />
            </h3>
            <p className="text-sm text-muted">
              {t.inversores.aporte}
              <TerminoLegal clave="caja" idioma={idioma} />
              {t.inversores.aporteY}
              <TerminoLegal clave="espejo" idioma={idioma} />
              {t.inversores.aporteFin}
            </p>
            <Medidor titulo={t.inversores.medidorCirculo} actual={EMISION.aportantes + sumaInvitacion} tope={EMISION.cupo} />
            <Medidor titulo={t.inversores.medidorNoCalificados} actual={EMISION.noCalificados + sumaInvitacion} tope={EMISION.cupoNoCalificados} dorado />
            {estado.invitacion ? (
              <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="invitacion">{t.inversores.invitacionPedida} {comunes.simulado}</p>
            ) : (
              <button
                id="boton-invitacion"
                type="button"
                aria-expanded={formulario === "invitacion"}
                className={BOTON_PRIMARIO}
                onClick={() => {
                  // Sin cuenta, primero hay que registrarse.
                  if (!conSesion) return entrar();
                  // Sin el sello de identidad, primero se ofrece la verificación.
                  if (kyc.verificada) setFormulario("invitacion");
                  else setDialogoKyc(true);
                }}
              >
                {t.inversores.pedirInvitacion}
              </button>
            )}
            {formulario === "invitacion" && (
              <PedidoContacto
                motivo="invitacion-circulo"
                referencia="Lote 7"
                idBoton="boton-invitacion"
                alEnviar={(pedido) => enviarPedido(pedido, { tipo: "invitacion" })}
                alCancelar={() => setFormulario(null)}
              />
            )}
            <p className="text-sm text-muted">
              {t.inversores.elegibilidad}
              <TerminoLegal clave="hacienda" idioma={idioma} />
              {t.inversores.elegibilidadFin}
            </p>
          </article>
          <article aria-labelledby="inv-netx" className={`${TARJETA} ${BORDE}`}>
            <p className="text-sm font-medium text-muted">{t.inversores.conversacion}</p>
            <h3 id="inv-netx" className="text-xl font-semibold">
              {t.inversores.invertirNetx}
              <TerminoLegal clave="safe" idioma={idioma} />
            </h3>
            <p className="text-sm text-muted">{t.inversores.siTeInteresa}</p>
            {estado.charla ? (
              <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="charla">{t.inversores.charlaPedida} {comunes.simulado}</p>
            ) : (
              <button
                id="boton-charla"
                type="button"
                aria-expanded={formulario === "charla"}
                className={BOTON_SUAVE}
                onClick={() => (conSesion ? setFormulario("charla") : entrar())}
              >
                {t.inversores.pedirCharla}
              </button>
            )}
            {formulario === "charla" && (
              <PedidoContacto
                motivo="charla-netx"
                referencia="Invertir en NetX"
                idBoton="boton-charla"
                alEnviar={(pedido) => enviarPedido(pedido, { tipo: "charla" })}
                alCancelar={() => setFormulario(null)}
              />
            )}
          </article>
        </div>
      </section>

      {idioma === "en" ? (
        // El diálogo de verificación de identidad todavía no tiene traducción (`idioma-pasaporte-semillas-pactos`):
        // sigue en español, marcado como tal.
        <div lang="es" className="contents">
          <ProveedorIdioma idioma="es" soloContenido>
            {dialogoDeIdentidad}
          </ProveedorIdioma>
        </div>
      ) : (
        dialogoDeIdentidad
      )}
    </div>
  );
}
