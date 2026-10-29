"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { KycDialogo } from "@/components/kyc-dialogo";
import { MarcaSemillas } from "@/components/marca-semillas";
import { useSesion } from "@/components/sesion/contexto";
import { comunidadesQueResponde, respuestaDe } from "@/lib/pactos/constancias";
import { conciliarYGuardar, publicarLoQueFalta, publicarPropuesta, quienRespondeDe } from "@/lib/pactos/navegador";
import { leerDelNavegador, revocarEnNavegador } from "@/lib/pactos/registro-compartido";
import { CLAVES } from "@/lib/demo/claves";
import { TerminoEconomico } from "@/components/termino-economico";
import { TerminoLegal } from "@/components/termino-legal";
import { semillasDePlata, semillasPorMes } from "@/lib/pactos/calculo";
import {
  HORAS,
  HOUR_REF_ARS,
  HOUR_REF_USD,
  MONTO_USD,
  PESTANAS,
  ROLES,
  buscarRol,
  pasosDelPacto,
  textoDeRol,
  tituloDePestana,
  type ClaveRol,
} from "@/lib/pactos/datos";
import {
  INICIAL,
  MAX_DESCRIPCION,
  MAX_ROL_OTRO,
  deComunidad,
  leer,
  pactoCompleto,
  reducir,
  totalAportes,
  ultimaPropuesta,
  type Accion,
  type EstadoPactos,
  type RespuestaAplicada,
} from "@/lib/pactos/estado";
import { registrarEvento } from "@/lib/actividad/almacen";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { formatearMonto, notaTipoDeCambio } from "@/lib/configuracion/preferencias";
import { EVENTOS } from "@/lib/actividad/eventos";
import { formatearFecha, formatearNumero } from "@/lib/idioma/formatos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { DATOS_VACIOS, type DatosPersona } from "@/lib/pasaporte/datos";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import { useKyc } from "@/lib/pasaporte/usar-kyc";
import { buscarTribu } from "@/lib/tribus/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const AVISO = "rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink";
const PANEL_LATERAL = "grid content-start gap-3 rounded-xl bg-surface-2 p-4";
const CAMPO = "rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function Ejemplo({ texto = "ejemplo" }: { texto?: string }) {
  return <span className="ml-1 rounded-full border border-faint px-2 text-xs text-muted">{texto}</span>;
}

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

type TextosPactos = ReturnType<typeof useTextos<"pactos">>;

/** El texto que se anuncia (y queda en pantalla) cuando se aplican respuestas de la tribu; vacío si no hubo ninguna. */
function anuncioDe(aplicadas: RespuestaAplicada[], tx: TextosPactos): string {
  const a = aplicadas[aplicadas.length - 1];
  if (!a) return "";
  const donde = nombreComunidad(a.comunidad);
  if (a.tipo === "acepta") return a.esCambio ? tx.anuncios.cambioAceptado(donde, a.version) : tx.anuncios.pactoAceptado(donde);
  return a.esCambio ? tx.avisoCambioNoAceptado(donde, a.motivo ?? "") : tx.anuncios.pactoNoAceptado(donde, a.motivo ?? "");
}

/** Mi recorrido: una sola vez por respuesta (todos los eventos llevan clave, también el rechazo de un cambio). */
function registrarEventosDe(aplicadas: RespuestaAplicada[]): void {
  for (const a of aplicadas) {
    const donde = nombreComunidad(a.comunidad);
    if (a.tipo === "acepta") {
      if (a.esCambio) registrarEvento(EVENTOS.cambioDePactoAceptado(donde, a.comunidad, a.version));
      else {
        registrarEvento(EVENTOS.pactoAceptado(donde, a.comunidad));
        registrarEvento(EVENTOS.rondaAbierta(donde, a.comunidad));
      }
    } else if (a.esCambio) registrarEvento(EVENTOS.cambioDePactoRechazado(donde, a.comunidad, a.propuestaId));
    else registrarEvento(EVENTOS.pactoNoAceptado(donde, a.comunidad, a.propuestaId));
  }
}

export function PactosCliente() {
  const idioma = useIdioma();
  const tx = useTextos("pactos");
  const { sesion, tribuLider } = useSesion();
  const idPersona = sesion?.idPersona ?? null;
  const email = sesion?.email ?? null;
  const rolSesion = sesion?.rol ?? null;
  const quien = quienRespondeDe(idPersona && rolSesion ? { idPersona, rol: rolSesion } : null, tribuLider);
  // Lo que la carga inicial necesita de la sesión, sin volver a cargar cuando cambia (p. ej. al terminar de calcular el nivel).
  const contexto = useRef({ tx, quien, email });
  useEffect(() => {
    contexto.current = { tx, quien, email };
  });
  const pasaporte = useTextos("pasaporte");
  const comunes = useTextos("comunes");
  const textoSemillas = useTextos("semillas");
  // Lo que escribe la persona (descripción del pacto, rol "Otro") nunca se traduce. No se guarda en qué idioma se escribió:
  // con la interfaz en inglés se marca como español, que es lo que se escribe hoy.
  const langTexto = idioma === "en" ? "es" : undefined;
  /** Número según el idioma: "1.200" en español, "1,200" en inglés. */
  const miles = (n: number) => formatearNumero(n, idioma);
  const [estado, setEstado] = useState<EstadoPactos>(INICIAL);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);
  const foco = useRef(false);
  const [anuncio, setAnuncio] = useState("");
  // La propuesta no llegó al registro compartido (el navegador no dejó): la tribu no la va a ver.
  const [falloPublicar, setFalloPublicar] = useState<"envio" | "retiro" | null>(null);
  // Lo que la persona cargó en "Tus datos"; lo que no cargó queda sin dato.
  const [datos, setDatos] = useState<DatosPersona>(DATOS_VACIOS);
  // Comunidades donde la persona es miembro: solo ahí puede proponer un pacto.
  const [miembro, setMiembro] = useState<string[]>([]);
  const [elegida, setElegida] = useState("");
  const [monto, setMonto] = useState(String(MONTO_USD.inicial));
  const [dialogoKyc, setDialogoKyc] = useState(false);
  const kyc = useKyc();
  const { moneda } = usePreferencias();

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setDatos(leerPasaporteDelNavegador());
    const comunidades = comunidadesDondeEsMiembro(leerMembresiaDelNavegador());
    setMiembro(comunidades);
    const pedida = new URLSearchParams(window.location.search).get("comunidad");
    setElegida(pedida && comunidades.includes(pedida) ? pedida : (comunidades[0] ?? ""));
    let leido: EstadoPactos = INICIAL;
    try {
      leido = leer(window.localStorage.getItem(CLAVES.pactos));
    } catch {
      setFalloAlmacen(true);
    }
    if (idPersona) {
      const { tx: t, quien: q, email: correo } = contexto.current;
      // Un pacto enviado antes de este cambio se publica una vez (design §8); con el registro ilegible no se publica nada.
      const registro = publicarLoQueFalta(
        leido,
        leerDelNavegador(),
        { idPersona, email: correo, comunidadesQueResponde: q ? comunidadesQueResponde(q) : [] },
        new Date().toISOString(),
      );
      // Las respuestas de la tribu se aplican, se guardan, se anuncian y se registran una sola vez.
      const r = conciliarYGuardar(leido, registro, idPersona);
      if (!r.guardado) setFalloAlmacen(true);
      if (r.aplicadas.length > 0) {
        setAnuncio(anuncioDe(r.aplicadas, t));
        registrarEventosDe(r.aplicadas);
      }
      leido = r.estado;
    }
    setEstado(leido);
    setListo(true);
  }, [idPersona]);

  // El botón de paso desaparece al apretarlo: el foco pasa al estado nuevo.
  const tiempoActual = elegida ? deComunidad(estado, elegida).tiempo : null;
  const pasoActual = tiempoActual ? tiempoActual.paso * 10 + (tiempoActual.cambio ? tiempoActual.cambio.paso + 1 : 0) : 0;
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>("[data-foco-paso]")?.focus();
    foco.current = false;
  }, [pasoActual]);

  function dispatch(original: Accion) {
    // Las fechas las pone la pantalla: el reductor es puro.
    const ahora = new Date().toISOString();
    const accion: Accion = original;
    const siguiente = reducir(estado, accion);
    const comunidadId = "comunidad" in accion ? accion.comunidad : null;
    if (comunidadId !== null && siguiente !== estado && idPersona) {
      const antes = deComunidad(estado, comunidadId).tiempo;
      const lidera = quien ? comunidadesQueResponde(quien).includes(comunidadId) : false;
      const persona = { idPersona, email, lidera };
      if (accion.tipo === "avanzar" && antes.paso === 0) {
        // Enviar escribe la propuesta en el registro compartido; si el navegador no deja, no se envía.
        const ok = publicarPropuesta({ comunidad: comunidadId, tipo: "nuevo", contenido: antes, version: antes.version + 1 }, persona, ahora);
        setFalloPublicar(ok === null ? "envio" : null);
        if (ok === null) return;
      } else if (accion.tipo === "enviarCambio" && antes.cambio) {
        const ok = publicarPropuesta(
          { comunidad: comunidadId, tipo: "cambio", contenido: antes.cambio, version: antes.version + 1, horasVigentes: antes.horas },
          persona,
          ahora,
        );
        setFalloPublicar(ok === null ? "envio" : null);
        if (ok === null) return;
      } else if (accion.tipo === "retirar" || accion.tipo === "retirarCambio") {
        const registro = leerDelNavegador();
        const propuesta = registro ? ultimaPropuesta(registro, idPersona, comunidadId, accion.tipo === "retirar" ? "nuevo" : "cambio") : null;
        if (registro && propuesta) {
          if (respuestaDe(registro, propuesta.id)) {
            // La tribu ya respondió: se aplica su respuesta y no se retira nada.
            const r = conciliarYGuardar(estado, registro, idPersona);
            if (!r.guardado) setFalloAlmacen(true);
            foco.current = true;
            setAnuncio(anuncioDe(r.aplicadas, tx));
            registrarEventosDe(r.aplicadas);
            setEstado(r.estado);
            return;
          }
          // Si no se pudo escribir, no se retira: la tribu seguiría viendo la propuesta pendiente.
          const ok = revocarEnNavegador(propuesta.id, idPersona, ahora);
          setFalloPublicar(ok === null ? "retiro" : null);
          if (ok === null) return;
        }
      }
    }
    if (comunidadId !== null && siguiente !== estado) {
      const despuesT = deComunidad(siguiente, comunidadId).tiempo;
      const donde = nombreComunidad(comunidadId);
      if (accion.tipo === "retirarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioRetirado(donde));
      } else if (accion.tipo === "retirar") {
        foco.current = true;
        setAnuncio(tx.anuncios.retiraste(donde));
      } else if (accion.tipo === "proponerCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioAbierto);
      } else if (accion.tipo === "enviarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioEnviado(donde));
        registrarEvento(EVENTOS.propusisteCambioDePacto(donde, comunidadId));
      } else if (accion.tipo === "descartarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioDescartado(despuesT.version));
      }
    }
    try {
      window.localStorage.setItem(CLAVES.pactos, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      // No se pudo guardar: la pantalla sigue respondiendo en memoria y se avisa.
      setFalloAlmacen(true);
    }
    if (accion.tipo === "avanzar") {
      foco.current = true;
      // Solo se anuncia lo que provoca la persona en esta sesión, no lo que ya estaba guardado.
      const paso = deComunidad(siguiente, accion.comunidad).tiempo.paso;
      const donde = nombreComunidad(accion.comunidad);
      setAnuncio(paso === 1 ? tx.anuncios.pactoEnviado(donde) : "");
      const antes = deComunidad(estado, accion.comunidad).tiempo.paso;
      if (paso === 1 && antes === 0) registrarEvento(EVENTOS.propusistePacto(donde, accion.comunidad));
    }
    setEstado(siguiente);
  }

  function alTeclearPestana(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = PESTANAS.length;
    const j = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + delta + n) % n;
    dispatch({ tipo: "pestana", pestana: PESTANAS[j][0] });
    document.getElementById(`pestana-${PESTANAS[j][0]}`)?.focus();
  }

  if (!listo) return <p role="status" className="text-sm text-muted">{tx.cargando}</p>;

  if (miembro.length === 0) {
    return (
      <section aria-label={tx.sinComunidad.aria} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <p>{tx.sinComunidad.texto}</p>
        <Link className={BOTON_PRIMARIO} href="/tribus">
          {tx.sinComunidad.ver}
        </Link>
      </section>
    );
  }

  const comunidad = elegida;
  const nombre = nombreComunidad(comunidad);
  const mias = deComunidad(estado, comunidad);
  const t = mias.tiempo;
  const rol = buscarRol(t.rol);
  const editable = t.paso === 0;
  const pasoCambio = t.cambio?.paso ?? 0;
  const cambioCompleto = t.cambio ? pactoCompleto(t.cambio) : false;
  const semillas = semillasPorMes(t.horas);
  const montoNumero = Number(monto);
  const montoValido = monto.trim() !== "" && Number.isInteger(montoNumero) && montoNumero >= MONTO_USD.min && montoNumero <= MONTO_USD.max;
  const totalPlata = totalAportes(mias);

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {tx.errorAlmacenamiento}
        </p>
      )}
      <section aria-label={tx.comunidad.aria} className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tx.comunidad.pregunta}</span>
          <select
            value={comunidad}
            onChange={(e) => {
              setAnuncio("");
              setElegida(e.target.value);
            }}
            className={`${CAMPO} w-fit`}
          >
            {miembro.map((id) => (
              <option key={id} value={id}>
                {nombreComunidad(id)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted"><MarcaSemillas texto={tx.comunidad.ayuda} /></p>
      </section>

      <section aria-label={tx.estadoAria} className="grid gap-4 rounded-xl border border-faint bg-surface p-4">
        {estado.pestana === "tiempo" && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ol className="flex flex-wrap gap-2" aria-label={tx.pasosAria}>
              {pasosDelPacto(idioma).map((p, i) => (
                <li
                  key={p}
                  aria-current={i === t.paso ? "step" : undefined}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    i <= t.paso ? "border-deep bg-green-soft font-medium text-deep" : "border-faint text-muted"
                  }`}
                >
                  {i < t.paso ? "✓ " : ""}
                  {p}
                </li>
              ))}
            </ol>
            {t.version > 0 && <span className="text-sm text-muted" data-testid="version-pacto">{tx.version(t.version)}</span>}
          </div>
        )}

        <div role="tablist" aria-label={tx.tipoAria} className="flex flex-wrap gap-2 border-b border-line pb-2">
          {PESTANAS.map(([clave], i) => {
            const titulo = tituloDePestana(clave, idioma);
            const activa = estado.pestana === clave;
            return (
              <button
                key={clave}
                id={`pestana-${clave}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${clave}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => dispatch({ tipo: "pestana", pestana: clave })}
                onKeyDown={(e) => alTeclearPestana(e, i)}
                className={`rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  activa ? "bg-deep text-on-deep" : "border border-muted hover:bg-surface-2"
                }`}
              >
                {titulo}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${estado.pestana}`} aria-labelledby={`pestana-${estado.pestana}`}>
          {estado.pestana === "tiempo" && (
            <div className="grid gap-4 md:grid-cols-2">
              <fieldset disabled={!editable} className="grid content-start gap-4 border-0 p-0">
                <legend className="sr-only">{tx.tiempo.legend(nombre)}</legend>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.tiempo.rol(nombre)}</span>
                  <select
                    value={t.rol}
                    onChange={(e) => dispatch({ tipo: "rol", comunidad, rol: e.target.value as ClaveRol | "" })}
                    className={`${CAMPO} w-fit`}
                  >
                    <option value="">{tx.tiempo.elegiRol}</option>
                    {ROLES.map((r) => (
                      <option key={r.clave} value={r.clave}>
                        {textoDeRol(r, idioma).nombre}
                      </option>
                    ))}
                  </select>
                </label>
                {rol && (
                  <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm" data-testid="rol-descripcion">
                    <b>{textoDeRol(rol, idioma).nombre}</b>: {textoDeRol(rol, idioma).descripcion}
                  </p>
                )}
                {t.rol === "otro" && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">{tx.tiempo.queRol}</span>
                    <input
                      type="text"
                      maxLength={MAX_ROL_OTRO}
                      value={t.rolOtro}
                      lang={langTexto}
                      onChange={(e) => dispatch({ tipo: "rolOtro", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                {t.rol && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">{tx.tiempo.descripcion}</span>
                    <textarea
                      rows={3}
                      maxLength={MAX_DESCRIPCION}
                      value={t.descripcion}
                      lang={langTexto}
                      onChange={(e) => dispatch({ tipo: "descripcion", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.tiempo.compromiso(t.horas)}</span>
                  <input
                    type="range"
                    min={HORAS.min}
                    max={HORAS.max}
                    step={HORAS.paso}
                    value={t.horas}
                    onChange={(e) => dispatch({ tipo: "horas", comunidad, horas: Number(e.target.value) })}
                    className="accent-deep"
                  />
                </label>
                <p className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.tiempo.valorHora}</span>
                  <span>
                    ARS {miles(HOUR_REF_ARS)} ≈ USD {miles(HOUR_REF_USD)}
                    <Ejemplo texto={tx.tiempo.referenciaPorAhora} />
                  </span>
                </p>
                {datos.modalidad === "obra" ? (
                  <p className={AVISO}>
                    {tx.tiempo.obra}
                    <TerminoLegal clave="obra" idioma={idioma} />
                    {tx.tiempo.obraFin}
                  </p>
                ) : datos.modalidad === "remoto" ? (
                  <p className={AVISO}>
                    {tx.tiempo.remoto}
                    <TerminoLegal clave="remoto" idioma={idioma} />
                    {t.horas > 20 ? tx.tiempo.remotoLargo(t.horas, datos.paisResidencia ?? "") : tx.tiempo.remotoCorto}
                  </p>
                ) : (
                  <p className={AVISO}>
                    {tx.tiempo.sinModalidad}{" "}
                    <Link className="underline" href="/pasaporte">
                      {tx.tiempo.cargala}
                    </Link>{" "}
                    {tx.tiempo.sinModalidadFin}
                  </p>
                )}
              </fieldset>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">{tx.tiempo.porMes}</p>
                <div>
                  <p className="text-2xl font-semibold" data-testid="semillas-mes">
                    <MarcaSemillas texto={textoSemillas.cantidad(miles(semillas))} />
                  </p>
                  <p className="text-sm text-muted">
                    <span translate="no">{tx.tiempo.semillas}</span>
                    <TerminoEconomico clave="semillas" />
                    {tx.tiempo.deNombre(nombre)}
                  </p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted">{tx.tiempo.formula}</dt>
                  <dd>{tx.tiempo.formulaValor}</dd>
                </dl>
                <p className="text-sm text-muted"><MarcaSemillas texto={tx.tiempo.nota} /></p>
              </div>
            </div>
          )}

          {estado.pestana === "plata" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <p className="text-sm">
                  {tx.plata.antes} <b>{nombre}</b>
                  <MarcaSemillas texto={tx.plata.medio} />
                  <TerminoEconomico clave="semillas" />
                  {tx.plata.fin}
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.plata.monto}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MONTO_USD.min}
                    max={MONTO_USD.max}
                    step={1}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    aria-describedby="ayuda-monto"
                    className={`${CAMPO} w-40`}
                  />
                </label>
                <p id="ayuda-monto" className="text-sm text-muted">
                  {montoValido
                    ? <MarcaSemillas texto={tx.plata.equivale(miles(semillasDePlata(montoNumero)), moneda === "ARS" ? formatearMonto(montoNumero, moneda, idioma) : "")} />
                    : tx.plata.montoInvalido(miles(MONTO_USD.min), miles(MONTO_USD.max))}
                </p>
                {moneda === "ARS" && <p className="text-sm text-muted">{notaTipoDeCambio(idioma)}</p>}
                <button
                  type="button"
                  className={BOTON_PRIMARIO}
                  disabled={!montoValido}
                  onClick={() => {
                    // Sin el sello de identidad, primero se ofrece la verificación.
                    if (kyc.verificada) dispatch({ tipo: "aporte", comunidad, montoUsd: montoNumero });
                    else setDialogoKyc(true);
                  }}
                >
                  {tx.plata.registrar}
                </button>
                <p className={AVISO}>{tx.plata.ningunCobro}</p>
              </div>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">{tx.plata.registradoEn(nombre)}</p>
                {mias.aportes.length === 0 ? (
                  <p className="text-sm text-muted">{tx.plata.sinAportes}</p>
                ) : (
                  <>
                    <p className="text-2xl font-semibold" data-testid="semillas-plata">
                      <MarcaSemillas texto={tx.plata.total(miles(semillasDePlata(totalPlata)))} />
                    </p>
                    <ul className="grid gap-1 text-sm">
                      {mias.aportes.map((a, i) => (
                        <li key={i}>
                          <MarcaSemillas texto={`${formatearMonto(a, moneda, idioma)} · ${miles(semillasDePlata(a))} Semillas`} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {estado.pestana === "tiempo" && (
          <div className="flex flex-wrap items-center gap-3">
            {t.paso === 0 && (
              <>
                <button
                  type="button"
                  data-foco-paso
                  className={BOTON_PRIMARIO}
                  aria-disabled={!pactoCompleto(t)}
                  aria-describedby={!pactoCompleto(t) ? "ayuda-enviar" : undefined}
                  onClick={() => {
                    if (pactoCompleto(t)) dispatch({ tipo: "avanzar", comunidad });
                  }}
                >
                  {tx.pasos.enviar}
                </button>
                {!pactoCompleto(t) && (
                  <span id="ayuda-enviar" className="text-sm text-muted">
                    {t.rol === "otro" && !t.rolOtro.trim() && t.descripcion.trim()
                      ? tx.pasos.nombrarRol
                      : tx.pasos.elegirRol}
                  </span>
                )}
              </>
            )}
            {t.paso === 1 && (
              <>
                <span
                  tabIndex={-1}
                  data-foco-paso
                  data-testid="esperando-respuesta"
                  className="rounded-full border border-dashed border-deep px-3 py-1 text-sm font-medium text-deep"
                >
                  {tx.pasos.esperando(nombre)}
                </span>
                <button
                  type="button"
                  className={`${BOTON} border border-muted hover:bg-surface-2`}
                  onClick={() => dispatch({ tipo: "retirar", comunidad })}
                >
                  {tx.pasos.retirar}
                </button>
              </>
            )}
            {t.paso === 2 && (
              <>
                <span
                  tabIndex={-1}
                  data-foco-paso={t.cambio ? undefined : true}
                  className="rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep"
                >
                  {tx.pasos.aceptado}
                </span>
                <TerminoLegal clave="pactoDosPartes" idioma={idioma} />
                <span className="text-sm text-muted"><MarcaSemillas texto={tx.pasos.verLibro(nombre)} /></span>
                {!t.cambio && (
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "proponerCambio", comunidad })}
                  >
                    {tx.pasos.proponerCambio}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {estado.pestana === "tiempo" && t.paso === 2 && t.cambio && (
          <section aria-labelledby="titulo-cambio" className="grid gap-4 rounded-xl border border-dashed border-deep p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-cambio" className="text-lg font-semibold">
                {tx.cambio.titulo}
              </h2>
              <ol className="flex flex-wrap gap-2" aria-label={tx.cambio.pasosAria}>
                {pasosDelPacto(idioma).slice(0, 2).map((p, i) => (
                  <li
                    key={p}
                    aria-current={i === pasoCambio ? "step" : undefined}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      i <= pasoCambio ? "border-deep bg-green-soft font-medium text-deep" : "border-faint text-muted"
                    }`}
                  >
                    {i < pasoCambio ? "✓ " : ""}
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-sm text-muted"><MarcaSemillas texto={tx.cambio.vigente(t.version, t.horas, miles(semillas))} /></p>
            <fieldset disabled={t.cambio.paso !== 0} className="grid content-start gap-4 border-0 p-0">
              <legend className="sr-only">{tx.cambio.legend(nombre)}</legend>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tx.cambio.rol}</span>
                <select
                  value={t.cambio.rol}
                  onChange={(e) =>
                    dispatch({ tipo: "editarCambio", comunidad, cambios: { rol: e.target.value as ClaveRol | "" } })
                  }
                  className={`${CAMPO} w-fit`}
                >
                  <option value="">{tx.tiempo.elegiRol}</option>
                  {ROLES.map((r) => (
                    <option key={r.clave} value={r.clave}>
                      {textoDeRol(r, idioma).nombre}
                    </option>
                  ))}
                </select>
              </label>
              {t.cambio.rol === "otro" && (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.cambio.queRol}</span>
                  <input
                    type="text"
                    maxLength={MAX_ROL_OTRO}
                    value={t.cambio.rolOtro}
                    lang={langTexto}
                    onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { rolOtro: e.target.value } })}
                    className={CAMPO}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tx.cambio.descripcion}</span>
                <textarea
                  rows={3}
                  maxLength={MAX_DESCRIPCION}
                  value={t.cambio.descripcion}
                  lang={langTexto}
                  onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { descripcion: e.target.value } })}
                  className={CAMPO}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tx.cambio.compromiso(t.cambio.horas)}</span>
                <input
                  type="range"
                  min={HORAS.min}
                  max={HORAS.max}
                  step={HORAS.paso}
                  value={t.cambio.horas}
                  onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { horas: Number(e.target.value) } })}
                  className="accent-deep"
                />
              </label>
            </fieldset>
            <p className="text-sm" data-testid="semillas-cambio">
              <MarcaSemillas texto={tx.cambio.conCambio(miles(semillasPorMes(t.cambio.horas)))} />
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {t.cambio.paso === 0 ? (
                <>
                  <button
                    type="button"
                    data-foco-paso
                    className={BOTON_PRIMARIO}
                    aria-disabled={!pactoCompleto(t.cambio)}
                    aria-describedby={!pactoCompleto(t.cambio) ? "ayuda-enviar-cambio" : undefined}
                    onClick={() => {
                      if (cambioCompleto) dispatch({ tipo: "enviarCambio", comunidad });
                    }}
                  >
                    {tx.cambio.enviar}
                  </button>
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "descartarCambio", comunidad })}
                  >
                    {tx.cambio.descartar}
                  </button>
                  {!pactoCompleto(t.cambio) && (
                    <span id="ayuda-enviar-cambio" className="text-sm text-muted">
                      {t.cambio.rol === "otro" && !t.cambio.rolOtro.trim() && t.cambio.descripcion.trim()
                        ? tx.pasos.nombrarRol
                        : tx.pasos.elegirRol}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span
                    tabIndex={-1}
                    data-foco-paso
                    data-testid="esperando-respuesta-cambio"
                    className="rounded-full border border-dashed border-deep px-3 py-1 text-sm font-medium text-deep"
                  >
                    {tx.pasos.esperando(nombre)}
                  </span>
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "retirarCambio", comunidad })}
                  >
                    {tx.cambio.retirar}
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {estado.pestana === "tiempo" && estado.ultimaRespuesta && estado.ultimaRespuesta.comunidad === comunidad && (
          <p className={AVISO} data-testid="aviso-no-aceptado">
            <span lang={langTexto}>
              {estado.ultimaRespuesta.esCambio
                ? tx.avisoCambioNoAceptado(nombre, estado.ultimaRespuesta.motivo)
                : tx.avisoNoAceptado(nombre, estado.ultimaRespuesta.motivo)}
            </span>
          </p>
        )}
        {falloPublicar && (
          <p role="alert" className="text-sm font-medium text-danger">
            {falloPublicar === "retiro" ? tx.anuncios.noSePudoRetirar : tx.anuncios.noSePudoPublicar}
          </p>
        )}

        {estado.pestana === "tiempo" && t.paso === 2 && t.historial.length > 0 && (
          <details className="rounded-lg border border-faint px-3 py-2">
            <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              {tx.historial.titulo(t.historial.length)}
            </summary>
            <ul className="mt-2 grid gap-2 text-sm" aria-label={tx.historial.aria}>
              {[...t.historial].reverse().map((v) => {
                const rolDeVersion = buscarRol(v.rol);
                return (
                  <li key={v.version} className="grid gap-0.5">
                    <span>
                      <b>{tx.historial.version(v.version)}</b> ·{" "}
                      {v.rol === "otro" ? (
                        <span lang={langTexto}>{v.rolOtro}</span>
                      ) : rolDeVersion ? (
                        textoDeRol(rolDeVersion, idioma).nombre
                      ) : (
                        comunes.sinDato
                      )}{" "}
                      · {tx.historial.horas(v.horas)} · {v.aceptado ? formatearFecha(v.aceptado, idioma) : tx.historial.fechaSinDato}
                    </span>
                    <span className="text-muted" lang={langTexto}>{v.descripcion}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
        <p role="status" className="sr-only">
          {anuncio}
        </p>
      </section>
      <KycDialogo
        abierto={dialogoKyc}
        kyc={kyc.kyc}
        motivo={pasaporte.kyc.motivoAporte}
        alCerrar={() => {
          setDialogoKyc(false);
          // Con el sello ya obtenido, se sigue con lo que la persona quería hacer.
          if (kyc.verificada && montoValido) dispatch({ tipo: "aporte", comunidad, montoUsd: montoNumero });
        }}
        alEnviar={kyc.enviar}
        alAprobar={kyc.aprobar}
      />
    </div>
  );
}
