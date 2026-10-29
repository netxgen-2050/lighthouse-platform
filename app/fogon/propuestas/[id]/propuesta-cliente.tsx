"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { useSesion } from "@/components/sesion/contexto";
import { DECISIONES_BASE } from "@/lib/fogon/datos";
import { formatoPlata } from "@/lib/fogon/consultas/reglas";
import { entradasDeDiscusion, type EntradaDiscusion } from "@/lib/fogon/propuestas/discusion";
import { personaDeEjemplo, propuestaDe } from "@/lib/fogon/propuestas/ejemplos";
import { derivarEstado } from "@/lib/fogon/propuestas/estado";
import { accionesDisponibles } from "@/lib/fogon/propuestas/fases";
import { nivelInicialSeguro, VOS } from "@/lib/fogon/propuestas/nivel";
import { ACCIONES_DE_PROCESO, MATRIZ, NIVELES_IMPLICACION, permiso } from "@/lib/fogon/propuestas/permisos";
import { principioPorId } from "@/lib/fogon/propuestas/principios";
import { topeUrgenciaDe } from "@/lib/fogon/propuestas/reglas";
import type { Accion, Bi, ConcernVista, NivelImplicacion, Resultado } from "@/lib/fogon/propuestas/tipos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { formatearFecha } from "@/lib/idioma/formatos";
import { buscarNodo, construirHolarquia, nombreDe } from "@/lib/gobernanza/holarquia";
import { comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { textoEn } from "@/lib/idioma/tipos";

// Todos los registros de esta página son de ejemplo y están marcados "(simulado)". Ningún valor de gobernanza se escribe acá:
// los plazos, el quórum y la matriz salen de `lib/fogon/propuestas/` (reglas.ts y permisos.ts).

const CAJA = "grid gap-3 rounded-xl border border-faint bg-surface p-4";
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

export function PropuestaCliente({ id }: { id: string }) {
  const idioma = useIdioma();
  const t = useTextos("fogonPropuestas");
  const tf = useTextos("fogon");
  const { estado: estadoSesion, sesion, tribuLider } = useSesion();
  const p = useMemo(() => propuestaDe(id), [id]);
  const decision = useMemo(() => DECISIONES_BASE.find((d) => d.id === id), [id]);
  const arbol = useMemo(() => construirHolarquia(idioma), [idioma]);

  // La hora y lo guardado en el navegador se leen después de montar (no existen en el servidor).
  const [ahora, setAhora] = useState<Date | null>(null);
  const [nivelPropio, setNivelPropio] = useState<NivelImplicacion>("red");
  const [elegido, setElegido] = useState<NivelImplicacion | null>(null);

  // `page.tsx` no lee la sesión (ADR-016): el super admin se reconoce acá. Mientras la sesión carga, false.
  const puedeDefinirAmbitoConsejo = estadoSesion === "ok" && sesion?.rol === "superadmin";

  useEffect(() => {
    setAhora(new Date());
    if (!p) return;
    setNivelPropio(
      nivelInicialSeguro(p, () => ({ membresias: comunidadesDondeEsMiembro(leerMembresiaDelNavegador()), tribuLider })),
    );
  }, [p, tribuLider]);

  const estado = useMemo(
    () => (p && ahora ? derivarEstado(p, [], ahora, { aplicaAmbitoConsejo: puedeDefinirAmbitoConsejo }) : null),
    [p, ahora, puedeDefinirAmbitoConsejo],
  );

  if (!p || !decision) return null;
  if (!estado) {
    return (
      <p role="status" className="text-muted">
        {t.pagina.cargando}
      </p>
    );
  }

  const txt = (v: Bi | string | undefined): string => (v === undefined ? "" : typeof v === "string" ? v : textoEn(v, idioma));
  const fecha = (iso: string) => formatearFecha(iso, idioma);
  const persona = (quien: string): string => {
    if (quien === VOS) return t.pagina.vos;
    const x = personaDeEjemplo(p, quien);
    return x ? txt(x.nombre) : quien;
  };
  const personas = (lista: readonly string[]) => lista.map(persona).join(", ");
  const nivel = elegido ?? nivelPropio;
  const sumaAfectada = estado.afectadas.some((a) => a.quien === VOS && a.vigente);
  const niveles: NivelImplicacion[] = sumaAfectada && nivel !== "afectada" ? [nivel, "afectada"] : [nivel];
  const titulo = textoEn(decision.titulo, idioma);
  // Plata simulada: un monto que falta es "sin dato", nunca 0.
  const monto = decision.monto && decision.monto.cantidad !== null ? formatoPlata(decision.monto.cantidad * 100, "USD", idioma) : null;
  const entradas = entradasDeDiscusion(p, estado, p.registros);
  const disponibles = accionesDisponibles(p, estado, niveles, decision.ambito, { monto: decision.monto?.cantidad, quien: VOS });
  const nombreHolon = (holonId: string) => {
    const n = buscarNodo(arbol, holonId);
    return n ? nombreDe(n) : holonId;
  };

  function textoResultado(r: Resultado): string {
    switch (r.tipo) {
      case "consenso":
        return r.conLadoA.length > 0 ? t.resultado.consensoConLado(personas(r.conLadoA)) : t.resultado.consenso;
      case "bloqueada":
        return t.resultado.bloqueada;
      case "sin-consenso":
        return t.resultado.sinConsenso;
      case "adoptada":
        return t.resultado.adoptada;
      case "pausada":
        return t.resultado.pausada[r.motivo];
      case "sube":
        return r.a ? t.resultado.sube(nombreHolon(r.a)) : t.resultado.subeSinDato;
      case "provisoria":
        return r.enRevision ? t.resultado.enRevision : t.resultado.provisoria(fecha(r.revisarAntesDe));
    }
  }

  function etiquetaCelda(accion: Accion, n: NivelImplicacion): string {
    const r = permiso(accion, [n], { ambito: decision!.ambito });
    if (r.estado === "si") return t.permisos.si;
    if (r.estado === "no") return r.condiciones.includes("solo-comun") ? `${t.permisos.no} (${t.condiciones["solo-comun"]})` : t.permisos.no;
    return r.condiciones.map((c) => t.condiciones[c]).join(", ");
  }

  function Principio({ id: pid }: { id: string }) {
    const x = principioPorId(pid);
    return (
      <span className={CHIP}>
        {t.discusion.principio}: {x ? textoEn(x.nombre, idioma) : t.discusion.principioFuera(pid)}
      </span>
    );
  }

  function ConcernCaja({ c }: { c: ConcernVista }) {
    return (
      <div className="grid gap-1">
        <p className="text-sm">
          <span className="font-medium">{t.discusion.razon}:</span> {txt(c.razon)}
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{c.sinNombre ? t.discusion.sinNombre : t.discusion.por(persona(c.quien))}</span>
          <span className={CHIP}>{t.discusion.estados[c.estado]}</span>
          {c.bloqueoNoLegitimo && <span>{t.discusion.bloqueoNoLegitimo}</span>}
          {c.principio && <Principio id={c.principio} />}
        </p>
        {c.sumados.length > 0 && <p className="text-sm text-muted">{t.discusion.sumados(personas(c.sumados))}</p>}
      </div>
    );
  }

  function Entrada({ e }: { e: EntradaDiscusion }) {
    const base = "grid gap-2 rounded-xl border bg-surface p-4";
    if (e.tipo === "grupo") {
      return (
        <article id={`entrada-${e.clave}`} className={`${base} border-rose`}>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t.discusion.tipos.grupo}
            <TerminoLegal clave="concern" idioma={idioma} />
          </p>
          <h3 className="text-lg font-semibold">{e.grupo.nombre}</h3>
          <p className="text-sm text-muted">
            {t.discusion.grupoAutoras}: {personas(e.grupo.autoras)}
          </p>
          <p className="text-sm font-medium">{t.discusion.grupoAdentro}</p>
          <ul className="grid gap-2">
            {e.grupo.concerns.map((c) => (
              <li key={c.id} className="rounded-lg border border-faint p-3">
                <ConcernCaja c={c} />
              </li>
            ))}
          </ul>
        </article>
      );
    }
    if (e.tipo === "concern") {
      const esBloqueo = e.concern.clase === "bloqueo";
      return (
        <article id={`entrada-${e.clave}`} className={`${base} border-rose`}>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {esBloqueo ? t.discusion.tipos.bloqueo : t.discusion.tipos.concern}
            <TerminoLegal clave={esBloqueo ? "bloqueo" : "concern"} idioma={idioma} />
            {e.concern.apuntaA && <span className="font-normal text-muted">· {t.discusion.apuntaA}</span>}
          </p>
          <ConcernCaja c={e.concern} />
        </article>
      );
    }
    if (e.tipo === "guardian") {
      const s = e.sugerencia;
      const previa = s.decisionPrevia ? DECISIONES_BASE.find((d) => d.id === s.decisionPrevia) : undefined;
      return (
        <article id={`entrada-${e.clave}`} className={`${base} border-dashed border-blue`}>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t.discusion.tipos.guardian}
            <TerminoLegal clave="guardianIA" idioma={idioma} />
            <span className={CHIP}>{t.discusion.guardianTipos[s.tipo]}</span>
          </p>
          <p>{txt(s.texto)}</p>
          <p className="text-sm text-muted">
            {s.principio && (
              <>
                {t.discusion.guardianCita.principio}: {principioPorId(s.principio) ? textoEn(principioPorId(s.principio)!.nombre, idioma) : s.principio}
              </>
            )}
            {previa && (
              <>
                {t.discusion.guardianCita.previa}: {textoEn(previa.titulo, idioma)}
              </>
            )}
            {s.urgencia && <>{t.discusion.guardianCita.urgencia}</>}
          </p>
          <p className="text-sm font-medium">
            {s.estado === "respaldada" ? t.discusion.guardianEstado.respaldada(s.respaldos.length) : t.discusion.guardianEstado.sinRespaldo}
          </p>
        </article>
      );
    }
    const sugerencias = estado!.mecanismos.filter((m) => m.apuntaA === e.clave);
    return (
      <article id={`entrada-${e.clave}`} className={`${base} border-faint`}>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {t.discusion.tipos[e.tipo]}
          {e.tipo === "a-un-lado" && <TerminoLegal clave="aunlado" idioma={idioma} />}
          <span className="font-normal text-muted">{t.discusion.por(persona(e.quien))}</span>
        </p>
        <p>{txt(e.texto)}</p>
        {sugerencias.length > 0 && (
          <ul className="grid gap-1 text-sm">
            {sugerencias.map((m) => (
              <li key={m.id}>
                {t.mecanismos.sugeridoPor(persona(m.quien))}: <strong>{m.nombre ?? t.mecanismos.nombres[m.mecanismo]}</strong> · {t.mecanismos.para}: {m.fin}.{" "}
                {m.mecanismo === "cuadratico" ? (
                  <Link className="underline" href="/fogon/consultas">{t.mecanismos.verCuadratico}</Link>
                ) : (
                  t.mecanismos.noEsta
                )}
                <span className="block text-muted">{t.mecanismos.nota}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    );
  }

  const urgencia = estado.urgencia;
  const topeUSD = topeUrgenciaDe(p.holonId);
  const pideTope = p.plata.pide ? formatoPlata(topeUSD * 100, "USD", idioma) : null;
  const versiones = estado.historial.filter((h) => h.tipo === "version" || h.tipo === "revision");
  const sugerenciasPropuesta = estado.mecanismos.filter((m) => !m.apuntaA);

  const selector = (
    <div className="grid gap-1">
      <label htmlFor="nivel" className="text-sm font-medium">{t.hacer.selector}</label>
      <select
        id="nivel"
        value={nivel}
        onChange={(e) => setElegido(e.target.value as NivelImplicacion)}
        className="w-fit rounded-lg border border-muted bg-surface px-3 py-1.5"
      >
        {NIVELES_IMPLICACION.map((n) => (
          <option key={n} value={n}>
            {t.niveles[n]}
            {n === nivelPropio ? ` ${t.hacer.tuNivel}` : ""}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted">{t.hacer.simulacion} {t.nivelesAyuda[nivel]}.</p>
    </div>
  );

  if (nivel === "visita") {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">{t.sinCuenta.titulo}</h1>
        <p className="text-muted">{t.sinCuenta.texto}</p>
        <p>
          <Link className="underline" href="/sumarte">{t.sinCuenta.enlace}</Link>
        </p>
        {selector}
      </div>
    );
  }

  const tam = estado.tamanoAmbito;
  const part = estado.participacion;
  const filaAcciones: Accion[] = [...(Object.keys(MATRIZ) as Accion[]), ...(Object.keys(ACCIONES_DE_PROCESO) as Accion[])];

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-muted">
          {t.pagina.sobretitulo} · {tf.ambitos[decision.ambito]} · {t.recorrido[estado.recorrido]}
        </p>
        <h1 className="text-3xl font-semibold">{titulo}</h1>
        {selector}
      </header>

      <section aria-labelledby="h-fases" className={CAJA}>
        <h2 id="h-fases" className="text-xl font-semibold">{t.fases.titulo}</h2>
        <ol aria-label={t.fases.aria} className="grid gap-2">
          {estado.fases.map((f, i) => {
            const previa = estado.fases[i - 1];
            const compartida = previa !== undefined && previa.desde === f.desde && previa.vence === f.vence && f.desde !== f.vence;
            const marca = f.actual ? t.fases.estado.ahora : f.hecha ? t.fases.estado.hecha : t.fases.estado.pendiente;
            return (
              <li
                key={f.fase}
                aria-current={f.actual ? "step" : undefined}
                className={`rounded-lg border px-3 py-2 ${f.actual ? "border-deep bg-green-soft font-semibold" : "border-faint"}`}
              >
                {t.fases.nombres[f.fase]} · {marca}
                <span className="block text-sm font-normal text-muted">
                  {f.desde === f.vence ? t.fases.sinPlazo : t.fases.vence(fecha(f.vence))}
                  {compartida ? ` · ${t.fases.ventanaCompartida}` : ""}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-muted">{t.fases.venceTodo(fecha(estado.vence))}</p>
      </section>

      <section aria-labelledby="h-resultado" className={CAJA}>
        <h2 id="h-resultado" className="text-xl font-semibold">{t.resultado.titulo}</h2>
        {estado.resultado ? (
          <>
            <p className="flex flex-wrap items-center gap-2">
              {textoResultado(estado.resultado)}
              {estado.resultado.tipo === "provisoria" && <TerminoLegal clave="medidaProvisoria" idioma={idioma} />}
            </p>
            {estado.resultado.tipo === "provisoria" && estado.resultado.concernsQueObligan.length > 0 && (
              <p className="text-sm text-muted">{t.resultado.obligan}: {estado.resultado.concernsQueObligan.length}</p>
            )}
          </>
        ) : (
          <p className="text-muted">{t.resultado.aunNo}</p>
        )}
      </section>

      <section aria-labelledby="h-ficha" className={CAJA}>
        <h2 id="h-ficha" className="text-xl font-semibold">{t.ficha.titulo}</h2>
        <dl className="grid gap-2 sm:grid-cols-[max-content_1fr] sm:gap-x-4">
          <dt className="font-medium">{t.ficha.decide}</dt>
          <dd>{textoEn(decision.donde, idioma)}{p.holonId === null ? ` · ${t.ficha.sinHolon}` : ""}</dd>
          <dt className="font-medium">{t.ficha.presenta}</dt>
          <dd>{persona(p.presenta.personaId)} · {txt(p.presenta.desde)}</dd>
          <dt className="font-medium">{t.ficha.problema}</dt>
          <dd>{txt(p.problema)}</dd>
          <dt className="font-medium">{t.ficha.propone}</dt>
          <dd>{txt(p.propone)}</dd>
          <dt className="font-medium">{t.ficha.recorrido}</dt>
          <dd>{t.recorrido[estado.recorrido]} · {t.ficha.version} {estado.version}</dd>
          <dt className="font-medium">{t.ficha.plata}</dt>
          <dd>
            {p.plata.pide ? (
              <>
                {monto ? t.ficha.pidePlata(monto) : `${t.pagina.sinDato} ${t.pagina.simulado}`}
                {decision.monto && <> · {t.ficha.fuente} {t.ficha.fuentes[decision.monto.fuente]}</>}
              </>
            ) : (
              t.ficha.noPidePlata
            )}
          </dd>
          <dt className="font-medium">{t.ficha.ambitoTamano}</dt>
          <dd>{tam === null ? t.pagina.sinDato : tam}</dd>
          <dt className="font-medium">
            {t.ficha.principios} <TerminoLegal clave="principios" idioma={idioma} />
          </dt>
          <dd className="flex flex-wrap gap-2">
            {p.principios.map((pid) => (
              <Principio key={pid} id={pid} />
            ))}
          </dd>
        </dl>
      </section>

      {urgencia && (
        <section aria-labelledby="h-urgencia" className={CAJA}>
          <h2 id="h-urgencia" className="flex items-center gap-2 text-xl font-semibold">
            {t.urgencia.titulo} <TerminoLegal clave="urgencia" idioma={idioma} />
          </h2>
          <p className="font-medium">
            {t.urgencia.estado[urgencia.estado]}
            {urgencia.estado === "pedida" && ` · ${t.urgencia.faltan(urgencia.faltan)}`}
          </p>
          <dl className="grid gap-2 sm:grid-cols-[max-content_1fr] sm:gap-x-4">
            <dt className="font-medium">{t.urgencia.pierde}</dt>
            <dd>{String(urgencia.datos.pierde ?? t.pagina.sinDato)}</dd>
            <dt className="font-medium">{t.urgencia.fechaLimite}</dt>
            <dd>{typeof urgencia.datos.fechaLimite === "string" ? fecha(urgencia.datos.fechaLimite) : t.pagina.sinDato}</dd>
            <dt className="font-medium">{t.urgencia.reversible}</dt>
            <dd>{String(urgencia.datos.porQueReversible ?? t.pagina.sinDato)}</dd>
            <dt className="font-medium">{t.urgencia.criterio}</dt>
            <dd>{t.urgencia.criterios[urgencia.datos.criterio as keyof typeof t.urgencia.criterios] ?? t.pagina.sinDato}</dd>
            {p.plata.pide && (
              <>
                <dt className="font-medium">{t.urgencia.queSeCompra}</dt>
                <dd>{String(urgencia.datos.queSeCompra ?? t.pagina.sinDato)}</dd>
                <dt className="font-medium">{t.urgencia.destino}</dt>
                <dd>{t.urgencia.destinos[urgencia.datos.destinoPlata as keyof typeof t.urgencia.destinos] ?? t.pagina.sinDato}</dd>
              </>
            )}
            <dt className="font-medium">{t.urgencia.respaldos}</dt>
            <dd>{urgencia.respaldos.length > 0 ? personas(urgencia.respaldos) : t.urgencia.sinRespaldos}</dd>
          </dl>
          {pideTope && <p className="text-sm text-muted">{t.urgencia.tope(pideTope)}</p>}
          <p className="text-sm text-muted">{t.urgencia.nota}</p>
        </section>
      )}

      {estado.ambitoConsejo && (
        <section aria-labelledby="h-ambito" className={CAJA}>
          <h2 id="h-ambito" className="text-xl font-semibold">{t.ambitoConsejo.titulo}</h2>
          <p className="text-sm text-muted">{t.ambitoConsejo.aviso}</p>
          {estado.ambitoConsejo.personas.length === 0 ? (
            <p>{t.ambitoConsejo.sinDefinir}</p>
          ) : (
            <>
              <p>
                {t.ambitoConsejo.tamano(estado.ambitoConsejo.personas.length)}: {personas(estado.ambitoConsejo.personas)}
              </p>
              <p className="text-sm text-muted">
                {estado.ambitoConsejo.definidoPor === "board-netxgen" ? t.ambitoConsejo.definidoBoard : t.ambitoConsejo.definidoSuperAdmin}
              </p>
            </>
          )}
        </section>
      )}

      <section aria-labelledby="h-participacion" className={CAJA}>
        <h2 id="h-participacion" className="flex items-center gap-2 text-xl font-semibold">
          {t.participacion.titulo} <TerminoLegal clave="quorum" idioma={idioma} />
        </h2>
        <p>
          {part.minimo === null ? t.participacion.cuentaSinDato(part.cuenta, part.acuses) : t.participacion.cuenta(part.cuenta, part.minimo, part.acuses)}
        </p>
        <p className="text-sm text-muted">
          {part.falta === null ? t.ambitoConsejo.sinDefinir : part.falta === 0 ? t.participacion.alcanzado : t.participacion.falta(part.falta)}
        </p>
        <p className="text-sm text-muted">{t.participacion.nota}</p>
        <h3 className="flex items-center gap-2 font-semibold">
          {t.participacion.acuses} <TerminoLegal clave="acuseConformidad" idioma={idioma} />
        </h3>
        {estado.acuses.length === 0 ? (
          <p className="text-muted">{t.participacion.sinAcuses}</p>
        ) : (
          <ul className="grid gap-1">
            {estado.acuses.map((a) => (
              <li key={a.id}>
                {persona(a.quien)} · {a.vigente ? t.participacion.deVersion(a.version) : t.participacion.sobreVersion(a.version)}
                {a.reemplazadoPorConcern ? ` · ${t.participacion.reemplazado}` : ""}
                {` ${t.pagina.simulado}`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="h-mecanismos" className={CAJA}>
        <h2 id="h-mecanismos" className="text-xl font-semibold">{t.mecanismos.titulo}</h2>
        {sugerenciasPropuesta.length === 0 ? (
          <p className="text-muted">{t.mecanismos.sin}</p>
        ) : (
          <ul className="grid gap-1">
            {sugerenciasPropuesta.map((m) => (
              <li key={m.id}>
                {t.mecanismos.sugeridoPor(persona(m.quien))}: {m.nombre ?? t.mecanismos.nombres[m.mecanismo]} · {m.fin}
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted">{t.mecanismos.nota}</p>
      </section>

      <section aria-labelledby="h-discusion" className="grid gap-3">
        <h2 id="h-discusion" className="text-xl font-semibold">{t.discusion.titulo}</h2>
        {entradas.length === 0 ? (
          <p className="text-muted">{t.discusion.vacia}</p>
        ) : (
          <ol aria-label={t.discusion.aria} className="grid gap-3">
            {entradas.map((e) => (
              <li key={e.clave}>
                <Entrada e={e} />
              </li>
            ))}
          </ol>
        )}
        {estado.afectadas.length > 0 && (
          <div className="grid gap-1">
            <h3 className="flex items-center gap-2 font-semibold">
              {t.afectadas.titulo} <TerminoLegal clave="afectada" idioma={idioma} />
            </h3>
            <ul>
              {estado.afectadas.map((a, i) => (
                <li key={i}>
                  {persona(a.quien)}: {a.motivo}{a.vigente ? "" : ` · ${t.afectadas.objetada}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="h-hacer" className={CAJA}>
        <h2 id="h-hacer" className="text-xl font-semibold">{t.hacer.titulo}</h2>
        <p className="text-sm text-muted">{t.hacer.intro}</p>
        {disponibles.length === 0 ? (
          <p>{t.hacer.ninguna}</p>
        ) : (
          <ul className="grid gap-1">
            {disponibles.map((a) => (
              <li key={a.accion}>
                <span aria-hidden="true">{a.permiso.estado === "si" ? "✓ " : "◐ "}</span>
                {t.acciones[a.accion]}
                {a.permiso.estado === "condicion" && (
                  <span className="text-muted"> ({a.permiso.condiciones.map((c) => t.condiciones[c]).join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className={CAJA}>
        <summary className="cursor-pointer font-semibold">
          {t.permisos.titulo}: {t.permisos.resumen}
        </summary>
        <p className="mt-2 text-sm text-muted">{t.permisos.aviso}</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="mb-2 text-left font-medium">{t.permisos.caption}</caption>
            <thead>
              <tr>
                <th scope="col" className="border border-faint p-2">{t.permisos.accion}</th>
                {NIVELES_IMPLICACION.map((n) => (
                  <th key={n} scope="col" className="border border-faint p-2">{t.niveles[n]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filaAcciones.map((a) => (
                <tr key={a}>
                  <th scope="row" className="border border-faint p-2 font-medium">{t.acciones[a]}</th>
                  {NIVELES_IMPLICACION.map((n) => (
                    <td key={n} className="border border-faint p-2">{etiquetaCelda(a, n)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <section aria-labelledby="h-versiones" className={CAJA}>
        <h2 id="h-versiones" className="text-xl font-semibold">{t.versiones.titulo}</h2>
        <ul>
          <li>{t.versiones.inicial}</li>
          {versiones.map((v, i) => (
            <li key={v.id}>{t.versiones.nueva(i + 2, fecha(v.cuando), persona(v.quien))}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
