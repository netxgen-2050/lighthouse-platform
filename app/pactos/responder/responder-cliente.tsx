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
  pendientesParaVer,
  personaDeAfirma,
  proponeLider,
  puedeResponder,
  type ConstanciaPacto,
} from "@/lib/pactos/constancias";
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
  const t = useTextos("pactos").responder;
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
      ) : comunidades.length === 0 ? (
        <p className="rounded-xl border border-faint bg-surface p-4">{t.sinPendientes}</p>
      ) : (
        comunidades.map((comunidad) => (
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
        ))
      )}
    </div>
  );
}
