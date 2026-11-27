"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PedidoContacto } from "@/components/pedido-contacto";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarComo } from "@/components/sesion/entrar-como";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearNumero } from "@/lib/idioma/formatos";
import { sumarte } from "@/lib/idioma/textos/sumarte";
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
import { guardarPedido } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { formatearMonto, notaTipoDeCambio } from "@/lib/configuracion/preferencias";
import { MODELO_LOTES } from "@/lib/lotes/modelo";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { CaminosSumarte } from "@/components/sumarte/caminos";
import { ListaDelPlan, TablaComparacion } from "@/components/sumarte/comparacion";
import { ModoDePrueba } from "@/components/sumarte/modo-de-prueba";
import {
  direccionVieja,
  leerPlan,
  PLAN_POR_DEFECTO,
  planDeLaPersona,
  type PlanVista,
} from "@/components/sumarte/planes";
import { SelectorPlanes } from "@/components/sumarte/selector-planes";
import { AMIGO, FARO_PREPAGO, FUNDADOR, miles, pasesQueQuedan, repartoDelPago } from "@/lib/sumarte/datos";
import { INICIAL, reducir, type Accion, type EstadoSumarte } from "@/lib/sumarte/estado";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros (el pago es simulado).

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const BOTON_SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const TARJETA = "grid h-full grid-cols-1 content-start gap-3 rounded-xl border bg-surface p-4";
const BORDE = "border-faint";
const BORDE_ACTUAL = "border-2 border-deep";
const BORDE_DESTACADO = "border-2 border-gold-ink";
const ETIQUETA_ACTUAL = "w-fit rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

const ACCIONES_DE_PLAN: readonly Accion["tipo"][] = ["plan", "pase"];

type Beneficio = { texto: string; pronto: boolean };

/** Lista de beneficios de un plan: lo que todavía no existe lleva "Próximamente" en texto, nunca solo un ícono. */
function Beneficios({ lista, pronto }: { lista: readonly Beneficio[]; pronto: string }) {
  return (
    <ul className="list-disc pl-5 text-sm">
      {lista.map((b) => (
        <li key={b.texto}>
          {b.texto}
          {b.pronto && <span className="ml-1 font-medium text-gold-ink">· {pronto}</span>}
        </li>
      ))}
    </ul>
  );
}

export function SumarteCliente({ volver, para }: { volver: string | null; para: string | null }) {
  const idioma = useIdioma();
  const t = useTextos("sumarte");
  const marco = useTextos("marco");
  const biencomun = useTextos("biencomun");
  const comunes = useTextos("comunes");
  const { estado: estadoSesion, nivel: nivelCuenta, nivelListo, entrar } = useSesion();
  const conSesion = estadoSesion === "ok";
  const [estado, setEstado] = useState<EstadoSumarte>(INICIAL);
  const [listo, setListo] = useState(false);
  // ¿Ya se leyó lo guardado de la persona con sesión? (Sin esto, el plan que se ve se calcularía con el estado inicial.)
  const [leidoConSesion, setLeidoConSesion] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [formulario, setFormulario] = useState(false);
  const { moneda } = usePreferencias();
  const foco = useRef<string | null>(null);
  // Plan que eligió la persona en el selector o que pide la dirección (`?plan=`); mientras no hay uno, se calcula (`planVisto`).
  // Se sincroniza con la dirección: al navegar a /sumarte (con otro plan o sin plan) se toma lo que dice; elegir en el selector
  // lo cambia al instante y reescribe la dirección.
  const planCrudo = useSearchParams().get("plan");
  const planDeLaDireccion = leerPlan(planCrudo);
  const [planElegido, setPlanElegido] = useState<PlanVista | null>(planDeLaDireccion);
  useEffect(() => setPlanElegido(planDeLaDireccion), [planDeLaDireccion]);
  // Direcciones del modelo anterior: `plan=miembro` pasa a Amigo y `plan=comunidad` a la franja de Aliados.
  useEffect(() => {
    const vieja = direccionVieja(planCrudo);
    if (!vieja) return;
    const params = new URLSearchParams(window.location.search);
    params.set("plan", PLAN_POR_DEFECTO);
    const ancla = vieja === "comunidad" ? "#aliados" : window.location.hash;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}${ancla}`);
    if (vieja === "comunidad") document.getElementById("aliados")?.scrollIntoView();
  }, [planCrudo]);
  // Cuántas veces se pidió entrar desde esta página: abre el cajón del modo de prueba, donde está "Entrar como…".
  const [pedidosDeEntrar, setPedidosDeEntrar] = useState(0);

  // Nivel que hace falta para lo que se quería abrir (la página, o la acción que pidió sumarse).
  const requerido: Nivel | null = nivelDeParametro(para) ?? (volver ? nivelMinimoDeRuta(volver) : null);
  const volverAlLugar = volver && !volver.startsWith("/sumarte") ? volver : null;
  const faltaNivel = requerido !== null && requerido !== "sin-cuenta" && !alcanza(nivelCuenta, requerido);
  const aviso = !volverAlLugar || !faltaNivel ? null : para ? avisoDeNivel(requerido!, idioma) : avisoDeRuta(volverAlLugar, idioma);

  // Plan que se ve: el elegido; si no hay, el que hace falta para lo que se quería abrir (si todavía no alcanza), si no el que
  // la persona ya tiene, y sin nada de eso Amigo. Hasta leer la cuenta no se muestra ninguno, para que la tarjeta no salte.
  const planQueHaceFalta: PlanVista | null = !faltaNivel
    ? null
    : requerido === "fundador"
      ? "fundador"
      : requerido === "miembro" || requerido === "lider"
        ? "amigo"
        : requerido === "explorador"
          ? "explorador"
          : null;
  const cuentaLeida = estadoSesion !== "cargando" && (!conSesion || leidoConSesion);
  const planVisto: PlanVista | null =
    planElegido ?? (!cuentaLeida ? null : (planQueHaceFalta ?? (conSesion ? planDeLaPersona(estado) : PLAN_POR_DEFECTO)));

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
    }
    setEstado(leido);
    setListo(true);
    setLeidoConSesion(true);
  }, [conSesion]);

  // Con el nivel que hacía falta, vuelve a donde la persona estaba (por ejemplo, la página que abrió por dirección).
  const router = useRouter();
  useEffect(() => {
    if (conSesion && nivelListo && listo && volverAlLugar && requerido && alcanza(nivelCuenta, requerido)) router.replace(volverAlLugar);
  }, [conSesion, nivelListo, listo, volverAlLugar, requerido, nivelCuenta, router]);

  // Tras un cambio, el botón que se apretó puede desaparecer: el foco pasa al estado nuevo.
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>(`[data-foco="${foco.current}"]`)?.focus();
    foco.current = null;
  }, [estado]);

  /** Elegir un plan en el selector: se ve ese plan y queda en la dirección (`?plan=`), sin recargar. */
  function elegirPlanVisto(elegido: PlanVista) {
    setPlanElegido(elegido);
    const params = new URLSearchParams(window.location.search);
    params.set("plan", elegido);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}${window.location.hash}`);
  }

  /** Abre el paso de entrar y, de paso, el cajón "Modo de prueba": ahí está el panel "Entrar como…". */
  function pedirEntrar(opciones?: Parameters<typeof entrar>[0]) {
    setPedidosDeEntrar((n) => n + 1);
    entrar(opciones);
  }

  /**
   * Sin cuenta, elegir un plan abre el registro (Privy, o "Entrar como…" en el modo de prueba): lo elegido queda pendiente
   * en esta pestaña y se aplica al volver con la cuenta. La facturación solo mueve la pantalla.
   */
  function dispatch(accion: Accion, enfocar?: string): boolean {
    if (!conSesion) {
      if (accion.tipo === "facturacion") {
        setEstado(reducir(estado, accion));
        return true;
      }
      // El pedido se guarda recién al aceptar el paso "Crear tu cuenta": si cancela, no queda nada.
      pedirEntrar({
        modo: "alta",
        alAceptar: () => {
          try {
            guardarPendiente(window.sessionStorage, ACCIONES_DE_PLAN.includes(accion.tipo) ? [accion] : []);
          } catch {
            // Sin almacenamiento de la pestaña, la persona tendrá que volver a elegir al registrarse.
          }
        },
      });
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

  // El pedido se guarda primero; recién ahí se hace lo que el botón hacía antes.
  // Si falla guardar el pedido, avisa el formulario (false); si falla el estado de la página,
  // avisa la página y el formulario no repite el aviso ("avisado").
  function enviarPedido(pedido: Pedido, accion: Accion): boolean | "avisado" {
    if (!guardarPedido(pedido)) return false;
    return dispatch(accion) ? true : "avisado";
  }

  // Sin cuenta ningún plan está elegido: las tarjetas no marcan "tu plan".
  const esFundador = conSesion && estado.pase !== null;
  const esAliado = conSesion && estado.tribu;
  const esExplorador = conSesion && estado.plan === "explorador";
  const esAmigo = conSesion && estado.plan === "miembro" && !esFundador && !esAliado;
  const nombrePlan = esAliado
    ? marco.niveles.lider
    : esFundador
      ? t.planes.fundador.nombre
      : esAmigo
        ? marco.niveles.miembro
        : marco.niveles.explorador;
  const monto = (usd: number) => formatearMonto(usd, moneda, idioma);
  const tuPlanSimulado = `${t.estadoPlan.tuPlan} ${comunes.simulado}`;
  const anual = estado.facturacion === "anual";
  const quedan = pasesQueQuedan(esFundador);
  const ad = FARO_PREPAGO.borrador ? ` ${t.faro.aDefinir}` : "";

  // Mensual / Anual vive con el plan que se cobra por período (Amigo); el Fundador es un pago único.
  const facturacion = (
    <div role="group" aria-label={t.facturacion.grupo} className={`flex flex-wrap gap-2 ${planVisto === "amigo" ? "" : "hidden lg:flex"}`}>
      {(["mensual", "anual"] as const).map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={estado.facturacion === f}
          onClick={() => dispatch({ tipo: "facturacion", facturacion: f })}
          className={`min-h-11 rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${estado.facturacion === f ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface-2"}`}
        >
          {estado.facturacion === f && <span aria-hidden="true">✓ </span>}
          {f === "mensual" ? t.facturacion.mensual : t.facturacion.anual}
          {f === "anual" && <span className="ml-2 text-sm">{t.facturacion.dosMesesGratis}</span>}
        </button>
      ))}
    </div>
  );
  const etiquetasDePlan: Record<PlanVista, string> = {
    explorador: t.selector.explorador,
    amigo: t.selector.miembro,
    fundador: t.selector.fundador,
  };
  const caminos = [
    { id: "vivir", href: "#comprar-lote", ...t.caminos.vivir },
    { id: "invertir", href: "#invertir", ...t.caminos.invertir },
    { id: "cuidar", href: "#planes", ...t.caminos.cuidar },
  ];
  const textosComparativa = t.comparativa;
  const paraQuien = (texto: string) => (
    <p className="text-sm">
      <span className="font-medium">{t.selector.paraQuien.titulo}:</span> {texto}
    </p>
  );
  /** En el celular solo se ve el plan elegido; en compu se ven los tres. */
  const visible = (id: PlanVista) => (planVisto === id ? "grid" : "hidden lg:grid");

  const reparto = (plan: "amigo" | "fundador") => repartoDelPago(plan, estado.facturacion);
  const bloqueFaro = (plan: "amigo" | "fundador") => {
    const r = reparto(plan);
    const regla = t.faro.reglas;
    return (
      <section
        key={plan}
        id={`faro-${plan}`}
        aria-labelledby={`faro-titulo-${plan}`}
        className={`${planVisto === plan ? "grid" : "hidden lg:grid"} content-start gap-2 rounded-xl border border-faint bg-surface-2 p-4`}
      >
        <p className="w-fit rounded-full border border-gold-ink bg-gold-soft px-3 py-1 text-sm font-medium text-gold-ink">
          {t.faro.borrador}
        </p>
        <h2 id={`faro-titulo-${plan}`} className="text-xl font-semibold">
          {t.faro.titulo}
          <TerminoLegal clave="faroprepago" idioma={idioma} />
        </h2>
        <p className="text-sm font-medium">{plan === "amigo" ? t.planes.amigo.nombre : t.planes.fundador.nombre}</p>
        <p className="text-sm text-muted">{t.faro.intro}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{regla.precio(monto(FARO_PREPAGO.precioUsd), ad)}</li>
          <li>{regla.canje}</li>
          <li>{regla.quema}</li>
          <li>{regla.vence(String(FARO_PREPAGO.venceAmigoMeses), String(FARO_PREPAGO.venceFundadorMeses), ad)}</li>
          <li>{regla.sinVoz}</li>
        </ol>
        <p className="text-sm">
          {plan === "amigo"
            ? t.faro.acredita.amigo(String(FARO_PREPAGO.amigoPorMes), ad)
            : t.faro.acredita.fundador(miles(FARO_PREPAGO.fundadorDeUnaVez), ad)}
        </p>
        <p className="text-sm font-medium">
          {t.faro.reparto[plan](monto(r.servicio), monto(r.faro), ad)}
        </p>
      </section>
    );
  };

  return (
    <div className="grid gap-6">
      {aviso && (
        <p role="status" className="rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium">
          {aviso} {t.avisos.elegiUnPlan}
          {volverAlLugar ? t.avisos.yVolvemos : ""}.
        </p>
      )}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.registro.errorAlmacenamiento}
        </p>
      )}

      <CaminosSumarte titulo={t.caminos.titulo} caminos={caminos} />

      <div id="planes" className="grid scroll-mt-[calc(var(--alto-fijo,0px)+1rem)] gap-4">
        {!conSesion && listo && <p className="max-w-2xl text-sm">{t.registro.ayuda(marco.barra.entrar)}</p>}
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

        {moneda === "ARS" && (
          <p className="text-sm text-muted">
            {t.pesos.montos} {notaTipoDeCambio(idioma)}{" "}
            <Link className="underline" href="/configuracion">{t.pesos.cambiarMoneda}</Link>
          </p>
        )}

        {planVisto === null && <div aria-hidden="true" className="min-h-96 lg:hidden" />}
        {planVisto !== null && (
          <div className="lg:hidden">
            <SelectorPlanes nombre={t.selector.grupo} etiquetas={etiquetasDePlan} actual={planVisto} onCambio={elegirPlanVisto} />
          </div>
        )}
        {facturacion}

        <div className="grid gap-4 lg:grid-cols-3" data-testid="tabla-de-precios">
          <div className={visible("explorador")}>
            <article aria-labelledby="plan-explorador" className={`${TARJETA} ${esExplorador ? BORDE_ACTUAL : BORDE}`}>
              <h2 id="plan-explorador" className="text-xl font-semibold">{t.planes.explorador.nombre}</h2>
              <p className="text-2xl font-bold">{t.planes.explorador.precio}</p>
              {paraQuien(t.selector.paraQuien.explorador)}
              <Beneficios lista={t.planes.explorador.incluye} pronto={t.planes.pronto} />
              {esExplorador ? (
                <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-explorador">{tuPlanSimulado}</p>
              ) : (
                <button type="button" className={BOTON_SUAVE} onClick={() => dispatch({ tipo: "plan", plan: "explorador" }, "plan-explorador")}>
                  {conSesion ? t.planes.explorador.volver : t.planes.explorador.sumarme}
                </button>
              )}
              <ListaDelPlan plan="explorador" titulo={t.selector.queIncluye} t={textosComparativa} />
            </article>
          </div>

          <div className={visible("amigo")}>
            <article aria-labelledby="plan-amigo" className={`${TARJETA} ${BORDE_DESTACADO}`}>
              <p className="w-fit rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-gold-ink">{t.planes.destacado}</p>
              <h2 id="plan-amigo" className="text-xl font-semibold">
                {t.planes.amigo.nombre}
                <TerminoLegal clave="membresia" idioma={idioma} />
              </h2>
              <p className="text-2xl font-bold">
                {monto(anual ? AMIGO.anual : AMIGO.mensual)}
                <span className="text-base font-normal text-muted">{anual ? t.facturacion.porAnio : t.facturacion.porMes}</span>
              </p>
              {anual && <p className="text-sm font-medium">{t.facturacion.dosMesesGratis}</p>}
              {paraQuien(t.selector.paraQuien.miembro)}
              <Beneficios lista={t.planes.amigo.incluye} pronto={t.planes.pronto} />
              {esAmigo ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-amigo">{tuPlanSimulado}</p>
                  <button type="button" className={BOTON_SUAVE} onClick={() => dispatch({ tipo: "plan", plan: "explorador" }, "plan-explorador")}>
                    {t.planes.amigo.darmeDeBaja} {comunes.simulado}
                  </button>
                </div>
              ) : (
                <button type="button" className={BOTON_PRIMARIO} onClick={() => dispatch({ tipo: "plan", plan: "miembro" }, "plan-amigo")}>
                  {t.planes.amigo.hacerme}
                </button>
              )}
              <ListaDelPlan plan="amigo" titulo={t.selector.queIncluye} t={textosComparativa} />
            </article>
          </div>

          <div className={visible("fundador")}>
            <article aria-labelledby="plan-fundador" className={`${TARJETA} ${esFundador ? BORDE_ACTUAL : BORDE}`}>
              <p className="w-fit rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-gold-ink">
                {t.planes.fundador.cohorte(formatearNumero(quedan, idioma), formatearNumero(FUNDADOR.cupo, idioma))}
              </p>
              <h2 id="plan-fundador" className="text-xl font-semibold">{t.planes.fundador.nombre}</h2>
              <p className="text-2xl font-bold">
                {monto(FUNDADOR.precio)}
                <span className="text-base font-normal">{t.planes.fundador.pagoUnico}</span>
              </p>
              {paraQuien(t.selector.paraQuien.fundador)}
              <Beneficios lista={t.planes.fundador.incluye} pronto={t.planes.pronto} />
              {esFundador ? (
                <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="pase">
                  {t.planes.fundador.activo} {comunes.simulado}
                </p>
              ) : (
                <button type="button" className={BOTON_DORADO} onClick={() => dispatch({ tipo: "pase" }, "pase")}>
                  {t.planes.fundador.quiero}
                </button>
              )}
              <ListaDelPlan plan="fundador" titulo={t.selector.queIncluye} t={textosComparativa} />
            </article>
          </div>
        </div>

        {/* FARO de prepago (borrador): en el celular solo el del plan elegido; en compu, los dos. */}
        <div className={`gap-4 lg:grid-cols-2 ${planVisto === "explorador" || planVisto === null ? "hidden lg:grid" : "grid"}`}>
          {bloqueFaro("amigo")}
          {bloqueFaro("fundador")}
        </div>

        <p className="max-w-3xl text-sm font-medium">{t.planes.ningunPlan}</p>

        <section id="aliados" aria-labelledby="aliados-titulo" className={`${TARJETA} ${BORDE} scroll-mt-[calc(var(--alto-fijo,0px)+1rem)]`}>
          <p className="text-sm font-medium text-muted">{t.aliados.etiqueta}</p>
          <h2 id="aliados-titulo" className="text-xl font-semibold">{t.aliados.nombre}</h2>
          {paraQuien(t.selector.paraQuien.aliados)}
          <p className="text-sm text-muted">{t.aliados.sinPrecio}</p>
          <Beneficios lista={t.aliados.incluye} pronto={t.planes.pronto} />
          {estado.charla ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="charla">{t.aliados.pedido} {comunes.simulado}</p>
          ) : (
            <button
              id="boton-aliados"
              type="button"
              aria-expanded={formulario}
              className={BOTON_SUAVE}
              onClick={() => (conSesion ? setFormulario(true) : pedirEntrar({ modo: "alta" }))}
            >
              {t.aliados.hablemos}
            </button>
          )}
          {formulario && (
            <PedidoContacto
              motivo="aliados"
              referencia={t.aliados.referencia}
              referenciaGuardada={sumarte.es.aliados.referencia}
              idBoton="boton-aliados"
              alEnviar={(pedido) => enviarPedido(pedido, { tipo: "charla" })}
              alCancelar={() => setFormulario(false)}
            />
          )}
        </section>

        {/* Línea informativa: no hay botón de adherir ni condiciona ningún plan; elegir un plan no registra una adhesión. */}
        <p className="max-w-3xl text-sm" data-testid="adhesion-sumarte">
          {t.adhesion.antes}
          <TerminoLegal clave="adhesiongobernanza" idioma={idioma} />
          {t.adhesion.despues}{" "}
          <Link className="underline" href="/tribus/lighthouse">{t.adhesion.enlace}</Link>
        </p>
      </div>

      <TablaComparacion plan={planVisto} idioma={idioma} t={textosComparativa} />

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="comprar-lote" className={`${TARJETA} ${BORDE}`}>
          <h2 id="comprar-lote" className="scroll-mt-[calc(var(--alto-fijo,0px)+1rem)] text-2xl font-semibold">{t.comprarLote.titulo}</h2>
          <p className="max-w-3xl text-sm">{t.comprarLote.texto(monto(MODELO_LOTES.precioLote.min))}</p>
          <EstadoAdministrativo proyecto="lighthouse-primeros" compacto idioma={idioma} />
          <EstadoAdministrativo proyecto="lighthouse-norte" compacto idioma={idioma} />
          <Link className="w-fit rounded-lg border border-muted px-4 py-1.5 font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/explorar/lotes">
            {t.comprarLote.enlace}
          </Link>
        </section>

        <section aria-labelledby="invertir" className={`${TARJETA} ${BORDE}`}>
          <h2 id="invertir" className="scroll-mt-[calc(var(--alto-fijo,0px)+1rem)] text-2xl font-semibold">{t.invertir.titulo}</h2>
          <p className="max-w-3xl text-sm">{t.invertir.texto}</p>
          <Link className="w-fit text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/bien-comun">
            {biencomun.enlace}
          </Link>
          <Link className="w-fit rounded-lg border border-muted px-4 py-1.5 font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href="/invertir">
            {t.invertir.enlace}
          </Link>
        </section>
      </div>

      <ModoDePrueba titulo={t.modoPrueba.titulo} abrir={pedidosDeEntrar}>
        <EntrarComo />
      </ModoDePrueba>
    </div>
  );
}
