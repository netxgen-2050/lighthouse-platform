"use client";

import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { conMayuscula, formatearFecha, formatearNumero, nombreDelMes } from "@/lib/idioma/formatos";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import {
  MAX_MOTIVO,
  afirmaComunidad,
  agregar,
  comunidadDeSobre,
  comunidadesQueResponde,
  estaPendiente,
  holonIdDePostulacion,
  pendientesParaVer,
  personaDeAfirma,
  proponeLider,
  preadmitidasDe,
  puedeResponder,
  topeDeDatos,
  type ConstanciaPacto,
  type QuienResponde,
} from "@/lib/pactos/constancias";
import {
  comunidadQueResponde,
  holonDePostulacion,
  holonDeId,
  loAdministraHifa,
  nombreDeHolon,
  postulacionesParaVer,
  puedeResponderPostulacion,
  responderPostulacion,
  type ResultadoRespuesta,
} from "@/lib/pactos/postulacion";
import { horasEsperando, horasPendientes, repartidoAntesDe, responderHoras, restoDelTotal, textoDeTope, type ResultadoHoras } from "@/lib/pactos/horas";
import { declaracionesParaVer, propuestaAceptadaDe, quienDeSobre, responderMes, type ResultadoMes } from "@/lib/pactos/mensual";
import { textoHorasDelPacto } from "@/lib/pactos/texto-horas";
import { aplicarTope, buscarNecesidad } from "@/lib/tribus/necesidades";
import { HOUR_REF_USD } from "@/lib/pactos/datos";
import { quienRespondeDe } from "@/lib/pactos/navegador";
import { actualizarEnNavegador, leerDelNavegador } from "@/lib/pactos/registro-compartido";
import { buscarRol, textoDeRol } from "@/lib/pactos/datos";
import { buscarTribu } from "@/lib/tribus/datos";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-muted hover:bg-surface-2`;
const CAMPO = `rounded-lg border border-muted bg-surface px-3 py-1.5 ${FOCO}`;

/** Las propuestas de horas que la sesión puede verificar y las propias de un holón que administra (se ven sin botones). */
function horasParaVer(lista: readonly ConstanciaPacto[], q: QuienResponde): { h: ConstanciaPacto; post: ConstanciaPacto; puede: boolean }[] {
  const salida: { h: ConstanciaPacto; post: ConstanciaPacto; puede: boolean }[] = [];
  const pendientes = horasPendientes(lista, q);
  for (const h of horasEsperando(lista)) {
    const post = lista.find((x) => x.id === h.apuntaA);
    if (!post) continue;
    const puede = pendientes.some((x) => x.id === h.id);
    if (puede) {
      salida.push({ h, post, puede });
      continue;
    }
    // Las propias, mientras esperan: se ven sin botones si la persona administra ese holón.
    if (personaDeAfirma(h.afirma) !== q.idPersona) continue;
    const holon = holonDePostulacion(post);
    if (holon && comunidadesQueResponde(q).includes(comunidadQueResponde(holon))) salida.push({ h, post, puede: false });
  }
  return salida;
}

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

export function ResponderCliente() {
  const idioma = useIdioma();
  const textosPactos = useTextos("pactos");
  const t = textosPactos.responder;
  const p = t.postulaciones;
  const v = t.verificar;
  const tp = textosPactos.puntual;
  const { estado, sesion, tribuLider } = useSesion();
  const comunes = useTextos("comunes");
  const idPersona = sesion?.idPersona ?? null;
  const rol = sesion?.rol ?? null;
  const q = quienRespondeDe(idPersona && rol ? { idPersona, rol } : null, tribuLider);
  // undefined = todavía no se leyó; null = no se pudo leer ("sin dato").
  const [lista, setLista] = useState<ConstanciaPacto[] | null | undefined>(undefined);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [resultado, setResultado] = useState({ n: 0, texto: "", error: false });
  const regionResultado = useRef<HTMLParagraphElement>(null);
  const campoMotivo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Lectura del registro del navegador tras hidratar (no existe en el servidor).
    setLista(leerDelNavegador());
  }, [idPersona]);

  // El resultado se anuncia y el foco va ahí (el botón que se apretó puede haber desaparecido).
  useEffect(() => {
    if (resultado.n > 0) regionResultado.current?.focus();
  }, [resultado.n]);

  useEffect(() => {
    if (abierta) campoMotivo.current?.focus();
  }, [abierta]);

  if (estado !== "ok" || !q || lista === undefined) {
    return <p role="status" className="text-sm text-muted">{t.cargando}</p>;
  }

  const comunidadesPropias = comunidadesQueResponde(q);
  const tienePermiso = comunidadesPropias.length > 0;
  const visibles = lista === null ? [] : pendientesParaVer(lista, q);
  // Una sección por comunidad, en el orden en que aparecen.
  const comunidades = [...new Set(visibles.map((c) => comunidadDeSobre(c.sobre) ?? ""))].filter(Boolean);
  // Postulaciones a tareas, agrupadas por holón (pacto-puntual, design §6).
  const postulaciones = lista === null ? [] : postulacionesParaVer(lista, q);
  const holones = [...new Set(postulaciones.map((c) => holonIdDePostulacion(c) ?? ""))].filter(Boolean);
  // Tareas hechas para verificar (pacto-puntual-verificacion): las que esta sesión puede verificar y las propias de un holón que administra (sin botones).
  const horasVisibles = lista === null ? [] : horasParaVer(lista, q);
  const holonesHoras = [...new Set(horasVisibles.map((x) => holonIdDePostulacion(x.post) ?? ""))].filter(Boolean);
  // Horas de cada mes de los pactos variables (pactos-horas-variables): las de las comunidades donde esta sesión responde.
  const mesesVisibles = lista === null ? [] : declaracionesParaVer(lista, q);

  /** Cómo se dice un pacto de tiempo a partir de los `datos` de su propuesta: "Horas variables · entre 0 y 30 h/mes · compromiso mínimo 3 meses". */
  function contenidoDeDatos(d: Record<string, string>): { variable: boolean; texto: string } {
    const variable = d.modalidad === "variable";
    const rango = { min: Number(d.rangoMin), max: Number(d.rangoMax) };
    const horas = Number(d.horas);
    if (!variable) return { variable, texto: Number.isFinite(horas) ? t.horas(formatearNumero(horas, idioma)) : comunes.sinDato };
    if (!Number.isFinite(rango.min) || !Number.isFinite(rango.max)) return { variable, texto: comunes.sinDato };
    const compromiso = Number(d.compromisoMeses);
    return { variable, texto: t.variable(textoHorasDelPacto({ modalidad: "variable", horas: 0, rango }, idioma), Number.isFinite(compromiso) ? compromiso : null) };
  }

  /** Confirmar o pedir revisar las horas de un mes: se relee el registro y se comprueba, justo antes de escribir, que no tengan respuesta. */
  function responderAMes(h: ConstanciaPacto, confirma: boolean) {
    if (!q) return;
    const texto = motivo.trim();
    if (!confirma && texto.length === 0) {
      setErrorMotivo(t.mes.motivoVacio);
      campoMotivo.current?.focus();
      return;
    }
    setErrorMotivo("");
    let resultado: ResultadoMes = "ya-respondida";
    const nueva = actualizarEnNavegador((actual) => {
      const r = responderMes(actual, { declaracionId: h.id, confirma, motivo: texto, sesion: q }, new Date().toISOString());
      resultado = r.resultado;
      return r.resultado === "ok" ? r.lista : null;
    });
    setAbierta(null);
    setMotivo("");
    if (nueva === null) {
      setResultado((r) => ({ n: r.n + 1, texto: t.errorGuardar, error: true }));
      return;
    }
    setLista(nueva);
    const quien = quienDeSobre(nueva, h.sobre) ?? t.quienSinDato;
    const mes = conMayuscula(nombreDelMes(h.datos.mes ?? "", idioma));
    setResultado((r) =>
      resultado === "sin-permiso"
        ? { n: r.n + 1, texto: t.mes.sinPermiso, error: true }
        : resultado === "sin-motivo"
          ? { n: r.n + 1, texto: t.mes.motivoVacio, error: true }
          : resultado !== "ok"
            ? { n: r.n + 1, texto: t.mes.yaRespondida, error: true }
            : { n: r.n + 1, texto: confirma ? t.mes.confirmaste(quien, mes) : t.mes.pediste(quien, mes), error: false },
    );
  }

  function responderAPostulacion(c: ConstanciaPacto, acepta: boolean) {
    if (!q) return;
    const texto = motivo.trim();
    if (!acepta && texto.length === 0) {
      setErrorMotivo(p.motivoVacio);
      campoMotivo.current?.focus();
      return;
    }
    setErrorMotivo("");
    let resultado: ResultadoRespuesta = "ya-respondida";
    // Se relee y se vuelve a comprobar, justo antes de escribir, que ESA postulación no tenga respuesta (otra pestaña pudo responderla).
    const nueva = actualizarEnNavegador((actual) => {
      const r = responderPostulacion(actual, { propuestaId: c.id, acepta, motivo: texto, sesion: q }, new Date().toISOString());
      resultado = r.resultado;
      return r.resultado === "ok" ? r.lista : null;
    });
    setAbierta(null);
    setMotivo("");
    if (nueva === null) {
      setResultado((r) => ({ n: r.n + 1, texto: t.errorGuardar, error: true }));
      return;
    }
    setLista(nueva);
    const quien = quienPropone(c);
    const tarea = buscarNecesidad(c.datos.necesidad ?? "", idioma)?.titulo ?? comunes.sinDato;
    setResultado((r) =>
      resultado === "sin-permiso"
        ? { n: r.n + 1, texto: p.sinPermiso, error: true }
        : resultado === "sin-motivo"
          ? { n: r.n + 1, texto: p.motivoVacio, error: true }
          : resultado !== "ok"
        ? { n: r.n + 1, texto: p.yaRespondida, error: true }
        : { n: r.n + 1, texto: acepta ? p.preadmitiste(quien, tarea) : p.noPreadmitiste(quien, tarea), error: false },
    );
  }

  function quienPropone(c: ConstanciaPacto): string {
    return c.datos.nombre || c.datos.iniciales || t.quienSinDato;
  }

  /** Verificar o pedir revisar unas horas: se relee el registro y se comprueba, justo antes de escribir, que no tengan respuesta. */
  function responderAHoras(h: ConstanciaPacto, post: ConstanciaPacto, verifica: boolean) {
    if (!q) return;
    const texto = motivo.trim();
    if (!verifica && texto.length === 0) {
      setErrorMotivo(v.motivoVacio);
      campoMotivo.current?.focus();
      return;
    }
    setErrorMotivo("");
    let resultado: ResultadoHoras = "ya-respondida";
    const nueva = actualizarEnNavegador((actual) => {
      const r = responderHoras(actual, { propuestaHorasId: h.id, verifica, motivo: texto, sesion: q }, new Date().toISOString());
      resultado = r.resultado;
      return r.resultado === "ok" ? r.lista : null;
    });
    setAbierta(null);
    setMotivo("");
    if (nueva === null) {
      setResultado((r) => ({ n: r.n + 1, texto: t.errorGuardar, error: true }));
      return;
    }
    setLista(nueva);
    const quien = quienPropone(post);
    const tarea = buscarNecesidad(post.datos.necesidad ?? "", idioma)?.titulo ?? comunes.sinDato;
    setResultado((r) =>
      resultado === "sin-permiso"
        ? { n: r.n + 1, texto: v.sinPermiso, error: true }
        : resultado === "sin-motivo"
          ? { n: r.n + 1, texto: v.motivoVacio, error: true }
          : resultado !== "ok"
            ? { n: r.n + 1, texto: v.yaRespondida, error: true }
            : { n: r.n + 1, texto: verifica ? v.verificaste(quien, tarea) : v.pediste(quien, tarea), error: false },
    );
  }

  function responder(c: ConstanciaPacto, acepta: boolean) {
    if (!q) return;
    const comunidad = comunidadDeSobre(c.sobre);
    if (!comunidad) return;
    const texto = motivo.trim();
    if (!acepta && texto.length === 0) {
      setErrorMotivo(t.motivoVacio);
      campoMotivo.current?.focus();
      return;
    }
    setErrorMotivo("");
    let escrito = false;
    // Se relee y se vuelve a comprobar que siga pendiente justo antes de escribir (otra pestaña pudo retirarlo o responderlo).
    const nueva = actualizarEnNavegador((actual) => {
      if (!estaPendiente(actual, c.id) || !puedeResponder(q, comunidad, c)) return null;
      escrito = true;
      return agregar(
        actual,
        {
          esquema: acepta ? "pacto-acepta" : "pacto-no-acepta",
          afirma: afirmaComunidad(comunidad),
          por: q.idPersona,
          sobre: c.sobre,
          version: c.version,
          apuntaA: c.id,
          datos: acepta ? {} : { motivo: texto.slice(0, MAX_MOTIVO) },
        },
        new Date().toISOString(),
      );
    });
    setAbierta(null);
    setMotivo("");
    if (nueva === null) {
      setResultado((r) => ({ n: r.n + 1, texto: t.errorGuardar, error: true }));
      return;
    }
    setLista(nueva);
    const quien = quienPropone(c);
    const donde = nombreComunidad(comunidad);
    setResultado((r) =>
      !escrito
        ? { n: r.n + 1, texto: t.yaNoPendiente, error: true }
        : { n: r.n + 1, texto: acepta ? t.aceptaste(quien, donde) : t.noAceptaste(quien, donde), error: false },
    );
  }

  return (
    <div className="grid gap-6">
      <p
        ref={regionResultado}
        role="status"
        tabIndex={-1}
        aria-label={t.estado}
        className={`text-sm font-medium ${resultado.error ? "text-danger" : ""} focus-visible:outline-2 focus-visible:outline-deep`}
      >
        <span key={resultado.n}>{resultado.texto}</span>
      </p>

      {!tienePermiso ? (
        <p className="rounded-xl border border-faint bg-surface p-4">{t.sinPermiso}</p>
      ) : lista === null ? (
        <p className="rounded-xl border border-faint bg-surface p-4">{t.registroSinDato}</p>
      ) : comunidades.length === 0 && postulaciones.length === 0 && horasVisibles.length === 0 && mesesVisibles.length === 0 ? (
        <p className="rounded-xl border border-faint bg-surface p-4">{t.sinPendientes}</p>
      ) : (
        <>
        {comunidades.map((comunidad) => (
          <section key={comunidad} aria-labelledby={`com-${comunidad}`} className="grid gap-3">
            <h2 id={`com-${comunidad}`} className="text-xl font-semibold">
              {t.deComunidad(nombreComunidad(comunidad))}
            </h2>
            {visibles
              .filter((c) => comunidadDeSobre(c.sobre) === comunidad)
              .map((c) => {
                const puede = puedeResponder(q, comunidad, c);
                const propio = personaDeAfirma(c.afirma) === q.idPersona;
                const rolClave = buscarRol(c.datos.rol);
                const nombreRol = c.datos.rol === "otro" ? c.datos.rolOtro : rolClave ? textoDeRol(rolClave, idioma).nombre : comunes.sinDato;
                const horas = Number(c.datos.horas);
                const contenido = contenidoDeDatos(c.datos);
                const horasTexto = contenido.texto;
                const esCambio = c.datos.tipo === "cambio";
                const rangoDe = (min: string | undefined, max: string | undefined) =>
                  textoHorasDelPacto({ modalidad: "variable", horas: 0, rango: { min: Number(min), max: Number(max) } }, idioma);
                const cambiaModalidad = esCambio && (contenido.variable || c.datos.modalidadVigente === "variable");
                const textoVigente =
                  c.datos.modalidadVigente === "variable"
                    ? rangoDe(c.datos.rangoVigenteMin, c.datos.rangoVigenteMax)
                    : textoHorasDelPacto({ modalidad: "fija", horas: Number(c.datos.horasVigentes), rango: { min: 0, max: 0 } }, idioma);
                const fecha = Number.isNaN(Date.parse(c.cuando)) ? t.fechaSinDato : formatearFecha(c.cuando, idioma);
                return (
                  <article key={c.id} aria-labelledby={`art-${c.id}`} className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
                    <h3 id={`art-${c.id}`} className="text-lg font-semibold">
                      {t.propone}: <span translate="no">{quienPropone(c)}</span>
                    </h3>
                    {puede && proponeLider(c) && <p className="text-sm text-muted">{t.loProponeLider(nombreComunidad(comunidad))}</p>}
                    <p className="text-sm font-medium">
                      {cambiaModalidad
                        ? t.cambioModalidad(
                            c.datos.horasVigentes || c.datos.modalidadVigente ? textoVigente : comunes.sinDato,
                            contenido.variable
                              ? rangoDe(c.datos.rangoMin, c.datos.rangoMax)
                              : textoHorasDelPacto({ modalidad: "fija", horas, rango: { min: 0, max: 0 } }, idioma),
                            c.version,
                          )
                        : esCambio
                        ? t.cambio(
                            c.datos.horasVigentes ? formatearNumero(Number(c.datos.horasVigentes), idioma) : comunes.sinDato,
                            Number.isFinite(horas) ? formatearNumero(horas, idioma) : comunes.sinDato,
                            c.version,
                          )
                        : t.nuevo(c.version)}
                    </p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-muted">{t.rol}</dt>
                      <dd lang={c.datos.rol === "otro" && idioma === "en" ? "es" : undefined}>{nombreRol}</dd>
                      <dt className="text-muted">{t.etiquetaHoras}</dt>
                      <dd>{horasTexto}</dd>
                      <dt className="text-muted">{t.descripcion}</dt>
                      <dd lang={idioma === "en" ? "es" : undefined}>{c.datos.descripcion || comunes.sinDato}</dd>
                    </dl>
                    <p className="text-sm text-muted">{t.enviado(fecha)}</p>
                    {propio && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm">{t.propioPacto}</p>}
                    {puede && abierta !== c.id && (
                      <div className="flex flex-wrap gap-3">
                        <button type="button" className={BOTON_PRIMARIO} onClick={() => responder(c, true)}>
                          {t.aceptar}
                        </button>
                        <button
                          type="button"
                          className={BOTON_SECUNDARIO}
                          onClick={() => {
                            setAbierta(c.id);
                            setMotivo("");
                            setErrorMotivo("");
                          }}
                        >
                          {t.noAceptar}
                        </button>
                      </div>
                    )}
                    {puede && abierta === c.id && (
                      <div className="grid gap-2">
                        <label className="grid gap-1 text-sm">
                          <span className="font-medium">{t.motivo}</span>
                          <textarea
                            ref={campoMotivo}
                            rows={3}
                            maxLength={MAX_MOTIVO}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            aria-describedby={errorMotivo ? `error-${c.id}` : undefined}
                            aria-invalid={errorMotivo ? true : undefined}
                            className={CAMPO}
                          />
                        </label>
                        {errorMotivo && (
                          <p id={`error-${c.id}`} role="alert" className="text-sm font-medium text-danger">
                            {errorMotivo}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <button type="button" className={BOTON_PRIMARIO} onClick={() => responder(c, false)}>
                            {t.confirmar}
                          </button>
                          <button
                            type="button"
                            className={BOTON_SECUNDARIO}
                            onClick={() => {
                              setAbierta(null);
                              setErrorMotivo("");
                            }}
                          >
                            {t.cancelar}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
          </section>
        ))}
        {postulaciones.length > 0 && (
          <section aria-labelledby="titulo-postulaciones" className="grid gap-4">
            <h2 id="titulo-postulaciones" className="text-xl font-semibold">
              {p.titulo}
            </h2>
            {holones.map((holonId) => {
              const holon = holonDeId(holonId);
              const nombre = holon ? nombreDeHolon(holon, idioma) : null;
              const hifa = holon ? loAdministraHifa(holon) : false;
              return (
                <section key={holonId} aria-labelledby={`holon-${holonId}`} className="grid gap-3">
                  <h3 id={`holon-${holonId}`} className="text-lg font-semibold">
                    {p.deHolon(nombre ? tp.holon(nombre.nombre, nombre.tipo) : comunes.sinDato)}
                  </h3>
                  {hifa && <p className="text-sm text-muted">{p.respaldoHifa}</p>}
                  {postulaciones
                    .filter((c) => holonIdDePostulacion(c) === holonId)
                    .map((c) => {
                      const puede = puedeResponderPostulacion(q, c);
                      const propio = personaDeAfirma(c.afirma) === q.idPersona;
                      const tarea = buscarNecesidad(c.datos.necesidad ?? "", idioma)?.titulo ?? comunes.sinDato;
                      const rolClave = buscarRol(c.datos.rol);
                      const nombreRol = c.datos.rol === "otro" ? c.datos.rolOtro : rolClave ? textoDeRol(rolClave, idioma).nombre : comunes.sinDato;
                      const horas = Number(c.datos.horas);
                      const tope = topeDeDatos(c.datos.topeUnidad, c.datos.topeValor);
                      const topeTotal = topeDeDatos(c.datos.topeTotalUnidad, c.datos.topeTotalValor);
                      const yaPreadmitidas = lista ? preadmitidasDe(lista, c.datos.necesidad ?? "") : [];
                      const horasYa = yaPreadmitidas.reduce((s, x) => s + (Number(x.datos.horas) || 0), 0);
                      const fecha = Number.isNaN(Date.parse(c.cuando)) ? t.fechaSinDato : formatearFecha(c.cuando, idioma);
                      const relacion = c.datos.relacion === "miembro" ? p.miembro : p.aspirante;
                      return (
                        <article key={c.id} aria-labelledby={`art-${c.id}`} className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
                          <h4 id={`art-${c.id}`} className="text-lg font-semibold">
                            {p.propone}: <span translate="no">{quienPropone(c)} · {relacion}</span>
                          </h4>
                          {puede && proponeLider(c) && nombre && <p className="text-sm text-muted">{p.loProponeLider(tp.holon(nombre.nombre, nombre.tipo))}</p>}
                          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                            <dt className="text-muted">{p.tarea}</dt>
                            <dd>{tarea}</dd>
                            <dt className="text-muted">{t.rol}</dt>
                            <dd lang={c.datos.rol === "otro" && idioma === "en" ? "es" : undefined}>{nombreRol}</dd>
                            <dt className="text-muted">{p.horas}</dt>
                            <dd>{Number.isFinite(horas) ? `${formatearNumero(horas, idioma)} h` : comunes.sinDato}</dd>
                            <dt className="text-muted">{p.fecha}</dt>
                            <dd>{c.datos.fecha ? formatearFecha(c.datos.fecha, idioma) : comunes.sinDato}</dd>
                            <dt className="text-muted">{p.descripcion}</dt>
                            <dd lang={idioma === "en" ? "es" : undefined}>{c.datos.descripcion || comunes.sinDato}</dd>
                          </dl>
                          {tope && (
                            <p className="text-sm text-muted">
                              {tope.unidad === "horas" ? tp.maximoHoras(tope.valor) : tp.maximoSemillas(tope.valor)} · {tp.horasDeMas}
                            </p>
                          )}
                          {topeTotal && (
                            <p className="text-sm text-muted">
                              {topeTotal.unidad === "horas" ? tp.maximoTotalHoras(topeTotal.valor) : tp.maximoTotalSemillas(topeTotal.valor)} ·{" "}
                              {tp.totalAclaracion}
                            </p>
                          )}
                          {topeTotal?.unidad === "horas" && yaPreadmitidas.length > 0 && (
                            <p className="text-sm text-muted">{p.preadmitidasTotal(horasYa, topeTotal.valor)}</p>
                          )}
                          {yaPreadmitidas.length > 0 && <p className="text-sm font-medium">{p.yaPreadmitiste(yaPreadmitidas.length)}</p>}
                          <p className="text-sm text-muted">{t.enviado(fecha)}</p>
                          {propio && nombre && (
                            <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm">{p.propia(tp.holon(nombre.nombre, nombre.tipo))}</p>
                          )}
                          {puede && abierta !== c.id && (
                            <div className="flex flex-wrap gap-3">
                              <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAPostulacion(c, true)}>
                                {p.preadmitir}
                              </button>
                              <button
                                type="button"
                                className={BOTON_SECUNDARIO}
                                onClick={() => {
                                  setAbierta(c.id);
                                  setMotivo("");
                                  setErrorMotivo("");
                                }}
                              >
                                {p.noPreadmitir}
                              </button>
                            </div>
                          )}
                          {puede && abierta === c.id && (
                            <div className="grid gap-2">
                              <label className="grid gap-1 text-sm">
                                <span className="font-medium">{t.motivo}</span>
                                <textarea
                                  ref={campoMotivo}
                                  rows={3}
                                  maxLength={MAX_MOTIVO}
                                  value={motivo}
                                  onChange={(e) => setMotivo(e.target.value)}
                                  aria-describedby={errorMotivo ? `error-${c.id}` : undefined}
                                  aria-invalid={errorMotivo ? true : undefined}
                                  className={CAMPO}
                                />
                              </label>
                              {errorMotivo && (
                                <p id={`error-${c.id}`} role="alert" className="text-sm font-medium text-danger">
                                  {errorMotivo}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3">
                                <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAPostulacion(c, false)}>
                                  {p.confirmar}
                                </button>
                                <button
                                  type="button"
                                  className={BOTON_SECUNDARIO}
                                  onClick={() => {
                                    setAbierta(null);
                                    setErrorMotivo("");
                                  }}
                                >
                                  {t.cancelar}
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                </section>
              );
            })}
          </section>
        )}
        {horasVisibles.length > 0 && lista && (
          <section aria-labelledby="titulo-verificar" className="grid gap-4">
            <h2 id="titulo-verificar" className="text-xl font-semibold">
              {v.titulo}
            </h2>
            <p className="text-sm text-muted">{v.aclaracion}</p>
            {holonesHoras.map((holonId) => {
              const holon = holonDeId(holonId);
              const nombre = holon ? nombreDeHolon(holon, idioma) : null;
              const hifa = holon ? loAdministraHifa(holon) : false;
              return (
                <section key={holonId} aria-labelledby={`verif-${holonId}`} className="grid gap-3">
                  <h3 id={`verif-${holonId}`} className="text-lg font-semibold">
                    {v.deHolon(nombre ? tp.holon(nombre.nombre, nombre.tipo) : comunes.sinDato)}
                  </h3>
                  {hifa && <p className="text-sm text-muted" data-testid="aviso-hifa-verificar">{p.respaldoHifa}</p>}
                  {horasVisibles
                    .filter((x) => holonIdDePostulacion(x.post) === holonId)
                    .map(({ h, post, puede }) => {
                      const necesidadId = post.datos.necesidad ?? "";
                      const tarea = buscarNecesidad(necesidadId, idioma)?.titulo ?? comunes.sinDato;
                      const horasDice = Number(h.datos.horas);
                      const horasPactadas = Number(post.datos.horas);
                      const tope = topeDeDatos(post.datos.topeUnidad, post.datos.topeValor);
                      const topeTotal = topeDeDatos(post.datos.topeTotalUnidad, post.datos.topeTotalValor);
                      const conTope = aplicarTope(horasDice, tope, HOUR_REF_USD);
                      const resto = restoDelTotal(topeTotal, repartidoAntesDe(lista, necesidadId, null, topeTotal));
                      const textoTope = (x: { unidad: "horas" | "semillas"; valor: number }) => textoDeTope(x.unidad, x.valor);
                      const propio = personaDeAfirma(h.afirma) === q.idPersona;
                      const fecha = Number.isNaN(Date.parse(h.cuando)) ? t.fechaSinDato : formatearFecha(h.cuando, idioma);
                      return (
                        <article key={h.id} aria-labelledby={`art-${h.id}`} className="grid gap-2 rounded-xl border border-faint bg-surface p-4" data-testid="tarea-para-verificar">
                          <h4 id={`art-${h.id}`} className="text-lg font-semibold">
                            <span translate="no">{quienPropone(post)}</span> · {tarea}
                          </h4>
                          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                            <dt className="text-muted">{v.pactadas}</dt>
                            <dd>{Number.isFinite(horasPactadas) ? `${formatearNumero(horasPactadas, idioma)} h` : comunes.sinDato}</dd>
                            <dt className="text-muted">{v.dice}</dt>
                            <dd>{`${formatearNumero(horasDice, idioma)} h`}</dd>
                          </dl>
                          {tope && conTope.horasSinSemillas > 0 && (
                            <p className="text-sm font-medium">{v.conMaximo(conTope.horasSinSemillas, textoTope(tope))}</p>
                          )}
                          {topeTotal && resto !== null && resto > 0 && <p className="text-sm text-muted">{v.maximoTotalQueda(textoTope({ unidad: topeTotal.unidad, valor: resto }), textoTope(topeTotal))}</p>}
                          {topeTotal && resto === 0 && <p className="text-sm font-medium">{v.totalCompleto}</p>}
                          <p className="text-sm text-muted">{t.enviado(fecha)}</p>
                          {propio && nombre && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm">{v.propia(tp.holon(nombre.nombre, nombre.tipo))}</p>}
                          {puede && abierta !== h.id && (
                            <div className="flex flex-wrap gap-3">
                              <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAHoras(h, post, true)}>
                                {v.verificar}
                              </button>
                              <button
                                type="button"
                                className={BOTON_SECUNDARIO}
                                onClick={() => {
                                  setAbierta(h.id);
                                  setMotivo("");
                                  setErrorMotivo("");
                                }}
                              >
                                {v.pedirRevisar}
                              </button>
                            </div>
                          )}
                          {puede && abierta === h.id && (
                            <div className="grid gap-2">
                              <label className="grid gap-1 text-sm">
                                <span className="font-medium">{t.motivo}</span>
                                <textarea
                                  ref={campoMotivo}
                                  rows={3}
                                  maxLength={MAX_MOTIVO}
                                  value={motivo}
                                  onChange={(e) => setMotivo(e.target.value)}
                                  aria-describedby={errorMotivo ? `error-${h.id}` : undefined}
                                  aria-invalid={errorMotivo ? true : undefined}
                                  className={CAMPO}
                                />
                              </label>
                              {errorMotivo && (
                                <p id={`error-${h.id}`} role="alert" className="text-sm font-medium text-danger">
                                  {errorMotivo}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3">
                                <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAHoras(h, post, false)}>
                                  {v.confirmarRevisar}
                                </button>
                                <button
                                  type="button"
                                  className={BOTON_SECUNDARIO}
                                  onClick={() => {
                                    setAbierta(null);
                                    setErrorMotivo("");
                                  }}
                                >
                                  {t.cancelar}
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                </section>
              );
            })}
          </section>
        )}
        {mesesVisibles.length > 0 && lista && (
          <section aria-labelledby="titulo-horas-mes" className="grid gap-4" data-testid="horas-del-mes-para-confirmar">
            <h2 id="titulo-horas-mes" className="text-xl font-semibold">
              {t.mes.titulo}
            </h2>
            <p className="text-sm text-muted">{t.mes.aclaracion}</p>
            {mesesVisibles.map(({ h, comunidad, puede }) => {
              const quien = quienDeSobre(lista, h.sobre) ?? t.quienSinDato;
              const mes = conMayuscula(nombreDelMes(h.datos.mes ?? "", idioma));
              const vigente = propuestaAceptadaDe(lista, h.sobre);
              const rango = vigente && vigente.datos.modalidad === "variable"
                ? textoHorasDelPacto({ modalidad: "variable", horas: 0, rango: { min: Number(vigente.datos.rangoMin), max: Number(vigente.datos.rangoMax) } }, idioma)
                : comunes.sinDato;
              const fecha = Number.isNaN(Date.parse(h.cuando)) ? t.fechaSinDato : formatearFecha(h.cuando, idioma);
              return (
                <article key={h.id} aria-labelledby={`art-${h.id}`} className="grid gap-2 rounded-xl border border-faint bg-surface p-4" data-testid="horas-mes">
                  <h3 id={`art-${h.id}`} className="text-lg font-semibold">
                    <span translate="no">{quien}</span> · {mes}
                  </h3>
                  <p className="text-sm text-muted">{t.deComunidad(nombreComunidad(comunidad))}</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">{t.mes.declara}</dt>
                    <dd>{`${formatearNumero(Number(h.datos.horas), idioma)} h`}</dd>
                    <dt className="text-muted">{t.mes.rangoVigente}</dt>
                    <dd>{rango}</dd>
                  </dl>
                  <p className="text-sm text-muted">{t.enviado(fecha)}</p>
                  {!puede && <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm">{t.mes.propias}</p>}
                  {puede && abierta !== h.id && (
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAMes(h, true)}>
                        {t.mes.confirmar}
                      </button>
                      <button
                        type="button"
                        className={BOTON_SECUNDARIO}
                        onClick={() => {
                          setAbierta(h.id);
                          setMotivo("");
                          setErrorMotivo("");
                        }}
                      >
                        {t.mes.pedirRevisar}
                      </button>
                    </div>
                  )}
                  {puede && abierta === h.id && (
                    <div className="grid gap-2">
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium">{t.motivo}</span>
                        <textarea
                          ref={campoMotivo}
                          rows={3}
                          maxLength={MAX_MOTIVO}
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          aria-describedby={errorMotivo ? `error-${h.id}` : undefined}
                          aria-invalid={errorMotivo ? true : undefined}
                          className={CAMPO}
                        />
                      </label>
                      {errorMotivo && (
                        <p id={`error-${h.id}`} role="alert" className="text-sm font-medium text-danger">
                          {errorMotivo}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button type="button" className={BOTON_PRIMARIO} onClick={() => responderAMes(h, false)}>
                          {t.mes.confirmarRevisar}
                        </button>
                        <button
                          type="button"
                          className={BOTON_SECUNDARIO}
                          onClick={() => {
                            setAbierta(null);
                            setErrorMotivo("");
                          }}
                        >
                          {t.cancelar}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
        </>
      )}
    </div>
  );
}
