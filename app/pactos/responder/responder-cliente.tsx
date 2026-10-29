"use client";

import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearFecha, formatearNumero } from "@/lib/idioma/formatos";
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
} from "@/lib/pactos/constancias";
import {
  holonDeId,
  loAdministraHifa,
  nombreDeHolon,
  postulacionesParaVer,
  puedeResponderPostulacion,
  responderPostulacion,
  type ResultadoRespuesta,
} from "@/lib/pactos/postulacion";
import { buscarNecesidad } from "@/lib/tribus/necesidades";
import { quienRespondeDe } from "@/lib/pactos/navegador";
import { actualizarEnNavegador, leerDelNavegador } from "@/lib/pactos/registro-compartido";
import { buscarRol, textoDeRol } from "@/lib/pactos/datos";
import { buscarTribu } from "@/lib/tribus/datos";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-muted hover:bg-surface-2`;
const CAMPO = `rounded-lg border border-muted bg-surface px-3 py-1.5 ${FOCO}`;

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

export function ResponderCliente() {
  const idioma = useIdioma();
  const textosPactos = useTextos("pactos");
  const t = textosPactos.responder;
  const p = t.postulaciones;
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
      ) : comunidades.length === 0 && postulaciones.length === 0 ? (
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
                const horasTexto = Number.isFinite(horas) ? t.horas(formatearNumero(horas, idioma)) : comunes.sinDato;
                const esCambio = c.datos.tipo === "cambio";
                const fecha = Number.isNaN(Date.parse(c.cuando)) ? t.fechaSinDato : formatearFecha(c.cuando, idioma);
                return (
                  <article key={c.id} aria-labelledby={`art-${c.id}`} className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
                    <h3 id={`art-${c.id}`} className="text-lg font-semibold">
                      {t.propone}: <span translate="no">{quienPropone(c)}</span>
                    </h3>
                    {puede && proponeLider(c) && <p className="text-sm text-muted">{t.loProponeLider(nombreComunidad(comunidad))}</p>}
                    <p className="text-sm font-medium">
                      {esCambio
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
        </>
      )}
    </div>
  );
}
