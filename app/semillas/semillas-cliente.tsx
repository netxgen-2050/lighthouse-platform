"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { TerminoLegal } from "@/components/termino-legal";
import { esCodigoValido } from "@/lib/congreso/ticket";
import { CLAVES } from "@/lib/demo/claves";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { clave, estadoMedidor, FACTOR_EVALUACION, faltantes, mensajeFaltante } from "@/lib/semillas/calculo";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import type { Residencia } from "@/lib/pasaporte/datos";
import {
  COMPANEROS,
  DIMENSIONES,
  MAX_RAZON,
  META_SEMBRADOR,
  PREGUNTA_PORQUE,
  RECONOCIMIENTO_RECIBIDO,
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
import { miles, PASSES } from "@/lib/sumarte/datos";
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

function valor(n: number | null): string {
  return n === null ? "sin dato" : `${miles(n)} semillas`;
}

export function SemillasCliente() {
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

  if (!listo) return <p className="text-muted">Cargando tus datos…</p>;

  const hayComunidad = elegida !== "";
  const semillas = hayComunidad ? semillasDeComunidad(datos.pactos, elegida) : null;
  const tiempo = semillas?.tiempo ?? null;

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que la ronda no se puede guardar.
        </p>
      )}

      <section aria-labelledby="panel" className="grid gap-3">
        <h2 id="panel" className="text-xl font-semibold">
          Tus Semillas por comunidad
        </h2>
        {miembro.length === 0 ? (
          <div className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
            <p>Todavía no sos miembro de ninguna comunidad, así que no tenés Semillas.</p>
            <p className="text-sm text-muted">
              Para empezar, entrá a una comunidad (el Lighthouse o una tribu) y pedí ser miembro. Después podés proponer
              tu pacto y tus Semillas aparecen acá, una tarjeta por comunidad.
            </p>
            <Link className="w-fit underline" href="/tribus">Ver las comunidades</Link>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2" aria-label="Comunidades donde sos miembro">
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
                    <dt className="text-muted">Tiempo</dt>
                    <dd>{valor(s.tiempo)}</dd>
                    <dt className="text-muted">Plata</dt>
                    <dd>{valor(s.plata)}</dd>
                    <dt className="text-muted">Presencia</dt>
                    <dd>{valor(s.presencia)}</dd>
                    <dt className="font-medium">Total</dt>
                    <dd className="font-semibold" data-testid={`total-${id}`}>{valor(s.total)}</dd>
                  </dl>
                  <button
                    type="button"
                    aria-pressed={activa}
                    aria-label={`Ver el detalle de ${nombre}`}
                    onClick={() => setElegida(id)}
                    className={`mt-1 w-fit rounded-lg border px-3 py-1 text-sm font-medium ${FOCO} ${activa ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface-2"}`}
                  >
                    {activa ? "Mostrando el detalle" : "Ver el detalle"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {hayComunidad && semillas && (
        <>
          <h2 className="text-xl font-semibold">Detalle de {nombreComunidad(elegida)}</h2>
          <section aria-label="De dónde vienen tus semillas" className="grid gap-4 md:grid-cols-3">
            <div className={TARJETA}>
              <p className={ETIQUETA}>Tiempo · 3 meses</p>
              {semillas.horas !== null && tiempo !== null ? (
                <>
                  <p className={GRANDE} data-testid="semillas-tiempo">{miles(tiempo)} semillas</p>
                  <p className="text-sm text-muted">{semillas.horas} h/mes en tu pacto aceptado</p>
                </>
              ) : (
                <>
                  <p className={GRANDE}>sin dato</p>
                  <p className="text-sm text-muted">
                    Todavía no tenés un pacto de tiempo aceptado.{" "}
                    <Link className="underline" href={`/pactos?comunidad=${elegida}`}>Proponé un pacto de tiempo</Link>.
                  </p>
                </>
              )}
            </div>

            <div className={TARJETA}>
              <p className={ETIQUETA}>Plata</p>
              {semillas.plata !== null ? (
                <>
                  <p className={GRANDE} data-testid="semillas-plata">{miles(semillas.plata)} semillas</p>
                  <p className="text-sm text-muted">Aportes registrados en esta comunidad (simulado)</p>
                </>
              ) : (
                <>
                  <p className={GRANDE}>sin dato</p>
                  {datos.residencia === "argentina" ? (
                    <p className="text-sm text-muted">Pendiente de firma con el fiduciario</p>
                  ) : datos.residencia === "exterior" ? (
                    <p className="text-sm text-muted">No disponible por residencia fiscal</p>
                  ) : (
                    <p className="text-sm text-muted">
                      Sin dato de tu residencia fiscal. <Link className="underline" href="/pasaporte">Cargala en Tus datos</Link>.
                    </p>
                  )}
                </>
              )}
              {datos.pase && (
                <p className="text-sm text-muted">Pase Fundador {PASSES.find((p) => p.id === datos.pase)?.nombre ?? datos.pase} activo (simulado), un servicio que no suma semillas
                  <TerminoLegal clave="pasefundador" />.
                </p>
              )}
            </div>

            <div className={TARJETA}>
              <p className={ETIQUETA}>
                Presencia
                <TerminoLegal clave="presencia" />
              </p>
              <p className={GRANDE}>{datos.ticket && elegida === COMUNIDAD_LIGHTHOUSE ? "Ticket registrado" : "sin dato"}</p>
              <p className="text-sm text-muted">
                {datos.ticket && elegida === COMUNIDAD_LIGHTHOUSE ? (
                  "Genesis se activa con el primer check-in."
                ) : datos.ticket ? (
                  "La presencia del Congreso se cuenta en el Lighthouse."
                ) : (
                  <>
                    Registrá tu ticket del Congreso en <Link className="underline" href="/congreso">Congreso</Link>.
                  </>
                )}
              </p>
            </div>
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

/** Meta de Semillas de tiempo para ser sembrador/a activo/a. Lo que se abre con cada paso vive en el pasaporte. */
function MetaSembrador({ tiempo }: { tiempo: number | null }) {
  return (
    <section aria-labelledby="meta-sembrador" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
      <h2 id="meta-sembrador" className="text-xl font-semibold">Sembrador/a activo/a</h2>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        Semillas de tiempo en 3 meses
        <span className="w-fit rounded-full border border-gold-ink bg-gold-soft px-3 py-0.5 font-medium text-gold-ink">
          {tiempo === null ? "sin dato" : estadoMedidor(tiempo)}
        </span>
      </p>
      {tiempo === null ? (
        <p className="text-sm text-muted" data-testid="medidor">sin dato de 120 semillas: falta un pacto aceptado</p>
      ) : (
        <>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <div className="h-full bg-gold" style={{ width: `${Math.min(100, (tiempo / META_SEMBRADOR) * 100)}%` }} />
          </div>
          <p className="text-sm font-medium" data-testid="medidor">
            {miles(tiempo)} de {META_SEMBRADOR} semillas
          </p>
        </>
      )}
      <p className="text-sm">
        <Link className="underline" href="/pasaporte">Ver lo que te abre tu pasaporte</Link>
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
  if (!habilitada) {
    return (
      <section aria-labelledby="ronda" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <h2 id="ronda" className="text-xl font-semibold">Ronda de reconocimiento · {nombre}</h2>
        <p>La ronda es solo para quienes tienen un pacto aceptado en {nombre}.</p>
        <p className="text-sm text-muted">
          Para habilitarla, <Link className="underline" href={`/pactos?comunidad=${comunidad}`}>proponé tu pacto de tiempo en {nombre}</Link>{" "}
          y esperá a que la comunidad lo acepte.
        </p>
      </section>
    );
  }

  const falta = faltantes(ronda.notas, ronda.razones, COMPANEROS.length);
  const faltaDe = (k: string) => falta.find((f) => f.clave === k)?.falta;
  const idRazon = (k: string) => `razon-${comunidad}-${k.replace("|", "-")}`;
  const idNota = (k: string, n: number) => `nota-${comunidad}-${k.replace("|", "-")}-${n}`;

  function enviar() {
    if (falta.length > 0) {
      onIntento();
      const primera = falta[0];
      document.getElementById(primera.falta === "razon" ? idRazon(primera.clave) : idNota(primera.clave, 1))?.focus();
      return;
    }
    onCambio((r) => enviarRonda(r, COMPANEROS.length));
    registrarEvento(EVENTOS.enviasteRonda(nombre, comunidad));
  }

  return (
    <>
      <section aria-labelledby="ronda" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ronda" className="text-xl font-semibold">Ronda de reconocimiento · {nombre} (ejemplo)</h2>
          <span className="text-sm text-muted">Privada · se muestra agregada</span>
        </div>
        <p className="text-sm text-muted">
          Reconocé a tus compañeras y compañeros de {nombre} con una puntuación de 1 a 5 en cada criterio. Cada
          puntuación necesita que cuentes por qué.
        </p>
        {COMPANEROS.map((c, i) => (
          <div key={c.nombre} className="grid gap-3 rounded-lg bg-surface-2 p-3 md:grid-cols-[10rem_1fr_1fr]">
            <div>
              <p className="font-medium">{c.nombre}</p>
              <p className="text-sm text-muted">{c.rol}</p>
            </div>
            {DIMENSIONES.map(([d, titulo, ayuda]) => {
              const k = clave(i, d);
              const nota = ronda.notas[k] ?? 0;
              const error = intento ? faltaDe(k) : undefined;
              const idAyuda = `ayuda-${comunidad}-${k.replace("|", "-")}`;
              const idErrorNota = `${idAyuda}-error-nota`;
              return (
                <div key={d} role="group" aria-label={`${titulo}, ${c.nombre}`} className="grid content-start gap-1">
                  <p className="text-sm font-medium">{titulo}</p>
                  <p className="text-sm text-muted" id={idAyuda}>{ayuda}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        id={idNota(k, n)}
                        type="button"
                        aria-pressed={nota === n}
                        aria-label={`${n} de 5`}
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
                  <p className="text-sm text-muted">{nota ? `Puntaje: ${nota} de 5` : "Sin puntaje"}</p>
                  {error === "nota" && (
                    <p id={idErrorNota} className="text-sm font-medium text-danger">Error: elegí una puntuación de 1 a 5.</p>
                  )}
                  <label htmlFor={idRazon(k)} className="text-sm font-medium">{PREGUNTA_PORQUE}</label>
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
                      Error: escribí por qué le das esta puntuación.
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
              <span className="font-medium">Ronda enviada (simulado)</span> · Factor de evaluación:{" "}
              <strong data-testid="factor">{FACTOR_EVALUACION.toLocaleString("es-AR", { minimumFractionDigits: 1 })}</strong>
            </p>
          ) : (
            <>
              {intento && falta.length > 0 && (
                <p role="alert" className="text-sm font-medium text-danger">
                  {mensajeFaltante(falta)}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className={BOTON} onClick={enviar}>
                  Enviar ronda
                </button>
                <p className="text-sm text-muted">Factor de evaluación: 1,0.</p>
              </div>
            </>
          )}
        </div>
        <p className="text-sm text-muted">
          El factor de evaluación entre pares es 1,0 fijo, como en el mock-up: la ronda se envía de forma simulada y no
          cambia tus semillas.
        </p>
      </section>

      <section aria-labelledby="recibido" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="recibido" className="text-xl font-semibold">Cómo te reconocieron</h2>
          <span className="text-sm text-muted">Ejemplo · no es de personas reales</span>
        </div>
        <ul className="grid gap-3">
          {RECONOCIMIENTO_RECIBIDO.map((r) => (
            <li key={r.de} className="grid gap-2 rounded-lg bg-surface-2 p-3 md:grid-cols-2">
              <p className="font-medium md:col-span-2">De {r.de}</p>
              {[
                [DIMENSIONES[0][1], r.rol],
                [DIMENSIONES[1][1], r.aporte],
              ].map(([titulo, x]) => {
                const dato = x as { nota: number; porque: string };
                return (
                  <div key={titulo as string}>
                    <p className="text-sm font-medium">
                      {titulo as string}: {dato.nota} de 5
                    </p>
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
