"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { MarcaSemillas } from "@/components/marca-semillas";
import { TerminoLegal } from "@/components/termino-legal";
import { esCodigoValido } from "@/lib/congreso/ticket";
import { CLAVES } from "@/lib/demo/claves";
import { LOCALES, formatearFecha, formatearNumero } from "@/lib/idioma/formatos";
import { buscarNecesidad } from "@/lib/tribus/necesidades";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { clave, estadoMedidor, FACTOR_EVALUACION, faltantes, mensajeFaltante } from "@/lib/semillas/calculo";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import type { Residencia } from "@/lib/pasaporte/datos";
import {
  companeros,
  dimensiones,
  MAX_RAZON,
  META_SEMBRADOR,
  preguntaPorque,
  reconocimientoRecibido,
} from "@/lib/semillas/datos";
import {
  enviarRonda,
  guardarRondas,
  leerRondas,
  paseActivo,
  ponerNota,
  ponerRazon,
  rondaDe,
  semillasDeComunidad,
  type Ronda,
  type Rondas,
} from "@/lib/semillas/estado";
import { PASSES } from "@/lib/sumarte/datos";
import { buscarTribu } from "@/lib/tribus/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const TARJETA = "grid content-start gap-1 rounded-xl border border-faint bg-surface p-4";
const ETIQUETA = "font-mono text-sm text-muted";
const GRANDE = "text-2xl font-semibold";
const BOTON = "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Datos = {
  pactos: string | null;
  pase: string | null;
  ticket: boolean;
  /** Residencia fiscal que la persona cargó en "Tus datos"; undefined si no la cargó (sin dato). */
  residencia: Residencia | undefined;
};

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

function leerClave(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}

export function SemillasCliente() {
  const idioma = useIdioma();
  const t = useTextos("semillas");
  const comunes = useTextos("comunes");
  const [listo, setListo] = useState(false);
  const [datos, setDatos] = useState<Datos>({ pactos: null, pase: null, ticket: false, residencia: undefined });
  const [miembro, setMiembro] = useState<string[]>([]);
  const [elegida, setElegida] = useState("");
  const [rondas, setRondas] = useState<Rondas>({});
  const [intentos, setIntentos] = useState<Record<string, boolean>>({});
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setDatos({
      pactos: leerClave(CLAVES.pactos),
      pase: paseActivo(leerClave(CLAVES.sumarte)),
      ticket: esCodigoValido(leerClave(CLAVES.congreso) ?? ""),
      residencia: leerPasaporteDelNavegador().residencia,
    });
    const comunidades = comunidadesDondeEsMiembro(leerMembresiaDelNavegador());
    setMiembro(comunidades);
    const pedida = new URLSearchParams(window.location.search).get("comunidad");
    setElegida(pedida && comunidades.includes(pedida) ? pedida : (comunidades[0] ?? ""));
    setRondas(leerRondas(leerClave(CLAVES.semillasRonda)));
    setListo(true);
  }, []);

  function cambiarRonda(comunidad: string, cambio: (r: Ronda) => Ronda) {
    const siguiente: Rondas = { ...rondas, [comunidad]: cambio(rondaDe(rondas, comunidad)) };
    setRondas(siguiente);
    try {
      window.localStorage.setItem(CLAVES.semillasRonda, guardarRondas(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
  }

  if (!listo) return <p className="text-muted">{t.cargando}</p>;

  /** Un valor en Semillas con el número según el idioma; el dato que falta es "sin dato", nunca 0. */
  const valor = (n: number | null): string => (n === null ? comunes.sinDato : t.cantidad(formatearNumero(n, idioma)));

  const hayComunidad = elegida !== "";
  const semillas = hayComunidad ? semillasDeComunidad(datos.pactos, elegida) : null;
  const tiempo = semillas?.tiempo ?? null;
  const pase = datos.pase ? PASSES.find((p) => p.id === datos.pase) : undefined;

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.errorAlmacenamiento}
        </p>
      )}

      <section aria-labelledby="panel" className="grid gap-3">
        <h2 id="panel" className="text-xl font-semibold">
          <MarcaSemillas texto={t.panel.titulo} />
        </h2>
        {miembro.length === 0 ? (
          <div className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
            <p><MarcaSemillas texto={t.panel.sinComunidad} /></p>
            <p className="text-sm text-muted"><MarcaSemillas texto={t.panel.sinComunidadAyuda} /></p>
            <Link className="w-fit underline" href="/tribus">{t.panel.verComunidades}</Link>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2" aria-label={t.panel.listaAria}>
            {miembro.map((id) => {
              const s = semillasDeComunidad(datos.pactos, id);
              const nombre = nombreComunidad(id);
              const activa = id === elegida;
              return (
                <li
                  key={id}
                  data-testid={`tarjeta-${id}`}
                  className={`grid content-start gap-1 rounded-xl border p-4 ${activa ? "border-deep bg-green-soft" : "border-faint bg-surface"}`}
                >
                  <h3 className="text-lg font-semibold">{nombre}</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">{t.panel.tiempo}</dt>
                    <dd><MarcaSemillas texto={valor(s.tiempo)} /></dd>
                    <dt className="text-muted">{t.panel.plata}</dt>
                    <dd><MarcaSemillas texto={valor(s.plata)} /></dd>
                    <dt className="text-muted">{t.panel.presencia}</dt>
                    <dd><MarcaSemillas texto={valor(s.presencia)} /></dd>
                    <dt className="text-muted">{t.panel.puntual}</dt>
                    <dd data-testid={`puntual-${id}`}><MarcaSemillas texto={valor(s.puntual)} /></dd>
                    <dt className="font-medium">{t.panel.total}</dt>
                    <dd className="font-semibold" data-testid={`total-${id}`}><MarcaSemillas texto={valor(s.total)} /></dd>
                  </dl>
                  <button
                    type="button"
                    aria-pressed={activa}
                    aria-label={t.panel.verDetalleDe(nombre)}
                    onClick={() => setElegida(id)}
                    className={`mt-1 w-fit rounded-lg border px-3 py-1 text-sm font-medium ${FOCO} ${activa ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface-2"}`}
                  >
                    {activa ? t.panel.mostrando : t.panel.verDetalle}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {hayComunidad && semillas && (
        <>
          <h2 className="text-xl font-semibold">{t.detalle.titulo(nombreComunidad(elegida))}</h2>
          <section aria-label={t.detalle.aria} className="grid gap-4 md:grid-cols-3">
            <div className={TARJETA}>
              <p className={ETIQUETA}>{t.detalle.tiempo3}</p>
              {semillas.horas !== null && tiempo !== null ? (
                <>
                  <p className={GRANDE} data-testid="semillas-tiempo"><MarcaSemillas texto={valor(tiempo)} /></p>
                  <p className="text-sm text-muted">{t.detalle.horasMes(semillas.horas)}</p>
                </>
              ) : (
                <>
                  <p className={GRANDE}>{comunes.sinDato}</p>
                  <p className="text-sm text-muted">
                    {t.detalle.sinPacto}{" "}
                    <Link className="underline" href={`/pactos?comunidad=${elegida}`}>{t.detalle.proponer}</Link>.
                  </p>
                </>
              )}
            </div>

            <div className={TARJETA}>
              <p className={ETIQUETA}>{t.panel.plata}</p>
              {semillas.plata !== null ? (
                <>
                  <p className={GRANDE} data-testid="semillas-plata"><MarcaSemillas texto={valor(semillas.plata)} /></p>
                  <p className="text-sm text-muted">{t.detalle.plataRegistrada}</p>
                </>
              ) : (
                <>
                  <p className={GRANDE}>{comunes.sinDato}</p>
                  {datos.residencia === "argentina" ? (
                    <p className="text-sm text-muted">{t.detalle.pendienteFirma}</p>
                  ) : datos.residencia === "exterior" ? (
                    <p className="text-sm text-muted">{t.detalle.noDisponibleResidencia}</p>
                  ) : (
                    <p className="text-sm text-muted">
                      {t.detalle.sinResidencia} <Link className="underline" href="/pasaporte">{t.detalle.cargala}</Link>.
                    </p>
                  )}
                </>
              )}
              {datos.pase && (
                <p className="text-sm text-muted"><MarcaSemillas texto={t.detalle.paseActivo(nombreDelNivel(pase?.nombre, datos.pase, idioma))} />
                  <TerminoLegal clave="pasefundador" idioma={idioma} />.
                </p>
              )}
            </div>

            <div className={TARJETA}>
              <p className={ETIQUETA}>
                {t.detalle.presencia}
                <TerminoLegal clave="presencia" idioma={idioma} />
              </p>
              <p className={GRANDE}>{datos.ticket && elegida === COMUNIDAD_LIGHTHOUSE ? t.detalle.ticketRegistrado : comunes.sinDato}</p>
              <p className="text-sm text-muted">
                {datos.ticket && elegida === COMUNIDAD_LIGHTHOUSE ? (
                  t.detalle.genesis
                ) : datos.ticket ? (
                  t.detalle.presenciaCongreso
                ) : (
                  <>
                    {t.detalle.registraTicket} <Link className="underline" href="/congreso">{t.detalle.congreso}</Link>.
                  </>
                )}
              </p>
            </div>
          </section>
          <section aria-labelledby="puntuales" className={TARJETA} data-testid="semillas-puntuales">
            <h3 id="puntuales" className={ETIQUETA}>{t.detalle.puntualTitulo}</h3>
            <p className={GRANDE} data-testid="semillas-puntual"><MarcaSemillas texto={valor(semillas.puntual)} /></p>
            {semillas.constancias.length === 0 ? (
              <p className="text-sm text-muted">{t.detalle.puntualSinDato}</p>
            ) : (
              <>
                <ul className="grid gap-1 text-sm">
                  {semillas.constancias.map((c) => (
                    <li key={c.uid} data-testid="constancia-puntual">
                      {t.detalle.puntualFila(
                        buscarNecesidad(c.datos.necesidad, idioma)?.titulo ?? c.datos.necesidad,
                        c.datos.horas,
                        formatearFecha(c.creada_en, idioma),
                        valor(c.datos.semillas),
                      )}
                      {c.datos.horas_sin_semillas > 0 && ` · ${t.detalle.puntualSinSemillas(c.datos.horas_sin_semillas)}`}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted">{t.detalle.puntualAyuda}</p>
              </>
            )}
          </section>
        </>
      )}

      <MetaSembrador tiempo={tiempo} />

      {hayComunidad && semillas && (
        <RondaDeComunidad
          comunidad={elegida}
          nombre={nombreComunidad(elegida)}
          habilitada={semillas.pactoAceptado}
          ronda={rondaDe(rondas, elegida)}
          intento={intentos[elegida] === true}
          onIntento={() => setIntentos((i) => ({ ...i, [elegida]: true }))}
          onCambio={(cambio) => cambiarRonda(elegida, cambio)}
        />
      )}
    </div>
  );
}

/** Nombre del nivel del pase: en español el de Sumarte (o el id guardado); en inglés el de `sumarte` (Seed, Sprout, Root). */
function nombreDelNivel(nombreEs: string | undefined, id: string, idioma: Idioma): string {
  if (idioma !== "en") return nombreEs ?? id;
  const niveles: Record<string, string> = textos("sumarte", idioma).niveles;
  return niveles[id] ?? id;
}

/** Meta de Semillas de tiempo para ser sembrador/a activo/a. Lo que se abre con cada paso vive en el pasaporte. */
function MetaSembrador({ tiempo }: { tiempo: number | null }) {
  const idioma = useIdioma();
  const t = useTextos("semillas");
  const comunes = useTextos("comunes");
  return (
    <section aria-labelledby="meta-sembrador" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
      <h2 id="meta-sembrador" className="text-xl font-semibold">{t.meta.titulo}</h2>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <MarcaSemillas texto={t.meta.tiempo3} />
        <span className="w-fit rounded-full border border-gold-ink bg-gold-soft px-3 py-0.5 font-medium text-gold-ink">
          {tiempo === null ? comunes.sinDato : estadoMedidor(tiempo) === "Lista" ? t.meta.lista : t.meta.enCamino}
        </span>
      </p>
      {tiempo === null ? (
        <p className="text-sm text-muted" data-testid="medidor"><MarcaSemillas texto={t.meta.sinDatoMeta(META_SEMBRADOR)} /></p>
      ) : (
        <>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <div className="h-full bg-gold" style={{ width: `${Math.min(100, (tiempo / META_SEMBRADOR) * 100)}%` }} />
          </div>
          <p className="text-sm font-medium" data-testid="medidor">
            <MarcaSemillas texto={t.meta.avance(formatearNumero(tiempo, idioma), META_SEMBRADOR)} />
          </p>
        </>
      )}
      <p className="text-sm">
        <Link className="underline" href="/pasaporte">{t.meta.verPasaporte}</Link>
      </p>
    </section>
  );
}

type PropsRonda = {
  comunidad: string;
  nombre: string;
  habilitada: boolean;
  ronda: Ronda;
  intento: boolean;
  onIntento: () => void;
  onCambio: (cambio: (r: Ronda) => Ronda) => void;
};

function RondaDeComunidad({ comunidad, nombre, habilitada, ronda, intento, onIntento, onCambio }: PropsRonda) {
  const idioma = useIdioma();
  const t = useTextos("semillas");
  if (!habilitada) {
    return (
      <section aria-labelledby="ronda" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <h2 id="ronda" className="text-xl font-semibold">{t.ronda.titulo(nombre)}</h2>
        <p>{t.ronda.soloConPacto(nombre)}</p>
        <p className="text-sm text-muted">
          {t.ronda.paraHabilitar} <Link className="underline" href={`/pactos?comunidad=${comunidad}`}>{t.ronda.proponerEn(nombre)}</Link>
          {t.ronda.yEsperar}
        </p>
      </section>
    );
  }

  const personas = companeros(idioma);
  const criterios = dimensiones(idioma);
  const falta = faltantes(ronda.notas, ronda.razones, personas.length);
  const faltaDe = (k: string) => falta.find((f) => f.clave === k)?.falta;
  const idRazon = (k: string) => `razon-${comunidad}-${k.replace("|", "-")}`;
  const idNota = (k: string, n: number) => `nota-${comunidad}-${k.replace("|", "-")}-${n}`;
  // El factor se escribe según el idioma: "1,0" en español y "1.0" en inglés.
  const factor = FACTOR_EVALUACION.toLocaleString(LOCALES[idioma], { minimumFractionDigits: 1 });

  function enviar() {
    if (falta.length > 0) {
      onIntento();
      const primera = falta[0];
      document.getElementById(primera.falta === "razon" ? idRazon(primera.clave) : idNota(primera.clave, 1))?.focus();
      return;
    }
    onCambio((r) => enviarRonda(r, personas.length));
    registrarEvento(EVENTOS.enviasteRonda(nombre, comunidad));
  }

  return (
    <>
      <section aria-labelledby="ronda" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ronda" className="text-xl font-semibold">{t.ronda.tituloEjemplo(nombre)}</h2>
          <span className="text-sm text-muted">{t.ronda.privada}</span>
        </div>
        <p className="text-sm text-muted">{t.ronda.intro(nombre)}</p>
        {personas.map((c, i) => (
          <div key={c.nombre} className="grid gap-3 rounded-lg bg-surface-2 p-3 md:grid-cols-[10rem_1fr_1fr]">
            <div>
              <p className="font-medium">{c.nombre}</p>
              <p className="text-sm text-muted">{c.rol}</p>
            </div>
            {criterios.map(([d, titulo, ayuda]) => {
              const k = clave(i, d);
              const nota = ronda.notas[k] ?? 0;
              const error = intento ? faltaDe(k) : undefined;
              const idAyuda = `ayuda-${comunidad}-${k.replace("|", "-")}`;
              const idErrorNota = `${idAyuda}-error-nota`;
              return (
                <div key={d} role="group" aria-label={t.ronda.grupoAria(titulo, c.nombre)} className="grid content-start gap-1">
                  <p className="text-sm font-medium">{titulo}</p>
                  <p className="text-sm text-muted" id={idAyuda}>{ayuda}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        id={idNota(k, n)}
                        type="button"
                        aria-pressed={nota === n}
                        aria-label={t.ronda.nDe5(n)}
                        aria-describedby={error === "nota" ? `${idAyuda} ${idErrorNota}` : idAyuda}
                        disabled={ronda.enviada}
                        onClick={() => onCambio((r) => ponerNota(r, i, d, n))}
                        className={`h-9 w-9 rounded-lg border font-medium ${FOCO} ${
                          nota === n ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted">{nota ? t.ronda.puntaje(nota) : t.ronda.sinPuntaje}</p>
                  {error === "nota" && (
                    <p id={idErrorNota} className="text-sm font-medium text-danger">{t.ronda.errorNota}</p>
                  )}
                  <label htmlFor={idRazon(k)} className="text-sm font-medium">{preguntaPorque(idioma)}</label>
                  <textarea
                    id={idRazon(k)}
                    rows={3}
                    maxLength={MAX_RAZON}
                    required
                    readOnly={ronda.enviada}
                    value={ronda.razones[k] ?? ""}
                    aria-invalid={error === "razon" ? true : undefined}
                    aria-describedby={error === "razon" ? `${idAyuda} ${idRazon(k)}-error` : idAyuda}
                    onChange={(e) => onCambio((r) => ponerRazon(r, i, d, e.target.value))}
                    className={`w-full rounded-lg border border-muted bg-surface p-2 text-sm ${FOCO}`}
                  />
                  {error === "razon" && (
                    <p id={`${idRazon(k)}-error`} className="text-sm font-medium text-danger">
                      {t.ronda.errorRazon}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="grid gap-2">
          {ronda.enviada ? (
            <p role="status">
              <span className="font-medium">{t.ronda.enviada}</span> · {t.ronda.factorEvaluacion}{" "}
              <strong data-testid="factor">{factor}</strong>
            </p>
          ) : (
            <>
              {intento && falta.length > 0 && (
                <p role="alert" className="text-sm font-medium text-danger">
                  {mensajeFaltante(falta, idioma)}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className={BOTON} onClick={enviar}>
                  {t.ronda.enviar}
                </button>
                <p className="text-sm text-muted">{t.ronda.factorFijo(factor)}</p>
              </div>
            </>
          )}
        </div>
        <p className="text-sm text-muted"><MarcaSemillas texto={t.ronda.pie(factor)} /></p>
      </section>

      <section aria-labelledby="recibido" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="recibido" className="text-xl font-semibold">{t.recibido.titulo}</h2>
          <span className="text-sm text-muted">{t.recibido.ejemplo}</span>
        </div>
        <ul className="grid gap-3">
          {reconocimientoRecibido(idioma).map((r) => (
            <li key={r.de} className="grid gap-2 rounded-lg bg-surface-2 p-3 md:grid-cols-2">
              <p className="font-medium md:col-span-2">{t.recibido.de(r.de)}</p>
              {[
                [criterios[0][1], r.rol],
                [criterios[1][1], r.aporte],
              ].map(([titulo, x]) => {
                const dato = x as { nota: number; porque: string };
                return (
                  <div key={titulo as string}>
                    <p className="text-sm font-medium">{t.recibido.puntuacion(titulo as string, dato.nota)}</p>
                    <p className="text-sm text-muted">{dato.porque}</p>
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
