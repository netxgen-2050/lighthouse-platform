"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { CLAVES } from "@/lib/demo/claves";
import { clave, estadoMedidor, factorEvaluacion, rondaCompleta, semillasTiempo } from "@/lib/semillas/calculo";
import { COMPANEROS, DIMENSIONES, META_SEMBRADOR, PERSONA } from "@/lib/semillas/datos";
import {
  CLAVE_RONDA,
  CLAVE_SUMARTE,
  leerRonda,
  pactoAceptado,
  paseActivo,
  ponerNota,
  RONDA_INICIAL,
  type Ronda,
} from "@/lib/semillas/estado";
import { miles } from "@/lib/sumarte/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const TARJETA = "grid content-start gap-1 rounded-xl border border-faint bg-surface p-4";
const ETIQUETA = "font-mono text-sm text-muted";
const GRANDE = "text-2xl font-semibold";
const BOTON = "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";

type Datos = {
  pacto: { horas: number; parteSemilla: number } | null;
  pase: string | null;
  ticket: boolean;
};

function Ficha({ texto, tono }: { texto: string; tono?: "ok" | "no" }) {
  const cls = tono === "ok" ? "border-deep bg-green-soft text-deep" : tono === "no" ? "border-faint text-muted" : "border-gold-ink bg-gold-soft text-gold-ink";
  return <span className={`h-fit w-fit shrink-0 rounded-full border px-3 py-0.5 text-sm font-medium ${cls}`}>{texto}</span>;
}

function leerClave(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}

export function SemillasCliente() {
  const [listo, setListo] = useState(false);
  const [datos, setDatos] = useState<Datos>({ pacto: null, pase: null, ticket: false });
  const [ronda, setRonda] = useState<Ronda>(RONDA_INICIAL);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setDatos({
      pacto: pactoAceptado(leerClave(CLAVES.pactos)),
      pase: paseActivo(leerClave(CLAVE_SUMARTE)),
      ticket: Boolean(leerClave(CLAVES.congreso)),
    });
    setRonda(leerRonda(leerClave(CLAVE_RONDA)));
    setListo(true);
  }, []);

  function guardar(siguiente: Ronda) {
    setRonda(siguiente);
    try {
      window.localStorage.setItem(CLAVE_RONDA, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
  }

  if (!listo) return <p className="text-muted">Cargando tus datos…</p>;

  const factor = ronda.enviada ? factorEvaluacion(ronda.notas, COMPANEROS.length) : null;
  const tiempo = datos.pacto ? semillasTiempo(datos.pacto.horas, datos.pacto.parteSemilla, factor ?? 1) : null;
  const completa = rondaCompleta(ronda.notas, COMPANEROS.length);
  const puedeEnviar = completa && !ronda.enviada;

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que la ronda no se puede guardar.
        </p>
      )}

      <section aria-label="De dónde vienen tus semillas" className="grid gap-4 md:grid-cols-3">
        <div className={TARJETA}>
          <p className={ETIQUETA}>Tiempo · 3 meses</p>
          {datos.pacto && tiempo !== null ? (
            <>
              <p className={GRANDE} data-testid="semillas-tiempo">{miles(tiempo)} semillas</p>
              <p className="text-sm text-muted">
                {datos.pacto.horas} h/mes · {datos.pacto.parteSemilla}% en semilla
              </p>
            </>
          ) : (
            <>
              <p className={GRANDE}>sin dato</p>
              <p className="text-sm text-muted">
                Todavía no tenés un pacto aceptado.{" "}
                <Link className="underline" href="/pactos">Proponé un pacto de tiempo</Link>.
              </p>
            </>
          )}
        </div>

        <div className={TARJETA}>
          <p className={ETIQUETA}>Plata</p>
          {PERSONA.residenciaArgentina ? (
            <>
              <p className={GRANDE}>sin dato</p>
              <p className="text-sm text-muted">Pendiente de firma con el fiduciario</p>
            </>
          ) : (
            <>
              <p className={GRANDE}>sin dato</p>
              <p className="text-sm text-muted">No disponible por residencia fiscal</p>
            </>
          )}
          {datos.pase && (
            <p className="text-sm text-muted">Pase {datos.pase} activo (simulado), un servicio que no suma semillas.</p>
          )}
        </div>

        <div className={TARJETA}>
          <p className={ETIQUETA}>
            Presencia
            <TerminoLegal clave="presencia" />
          </p>
          <p className={GRANDE}>{datos.ticket ? "Ticket registrado" : "sin dato"}</p>
          <p className="text-sm text-muted">
            {datos.ticket ? (
              "Genesis se activa con el primer check-in."
            ) : (
              <>
                Registrá tu ticket del Congreso en <Link className="underline" href="/congreso">Congreso</Link>.
              </>
            )}
          </p>
        </div>
      </section>

      <section aria-labelledby="se-abre" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <h2 id="se-abre" className="text-xl font-semibold">Lo que se te abre</h2>
        <ol className="grid gap-3">
          <Paso titulo="Explorador/a" detalle="Mapa, fichas y eventos abiertos" ficha={<Ficha texto="Activa" tono="ok" />} hecho />
          <Paso
            titulo="Miembro de tribu"
            detalle="Sala, llamadas y jornadas · pacto aceptado"
            ficha={datos.pacto ? <Ficha texto="Activa" tono="ok" /> : <Ficha texto="Falta el pacto aceptado" tono="no" />}
            hecho={Boolean(datos.pacto)}
          />
          <Paso
            titulo="Sembrador/a activo/a"
            detalle="Uso de espacios comunes y voz en el diseño"
            ficha={tiempo === null ? <Ficha texto="sin dato" tono="no" /> : <Ficha texto={estadoMedidor(tiempo)} />}
            actual
          >
            <p className="text-sm">Semillas de tiempo en 3 meses</p>
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
          </Paso>
          <Paso
            titulo="Parte del proyecto"
            detalle={
              <>
                Derechos del fideicomiso, según su contrato
                <TerminoLegal clave="sumarte" />
              </>
            }
            ficha={<Ficha texto={PERSONA.residenciaArgentina ? "Pendiente legal" : "No disponible hoy"} tono="no" />}
          />
          <Paso
            titulo="Residente"
            detalle={
              <>
                Voz y voto en la Asamblea: una persona, un voto
                <TerminoLegal clave="art32" />
              </>
            }
            ficha={PERSONA.residente ? <Ficha texto="Desde marzo (ejemplo)" tono="ok" /> : <Ficha texto="Vive afuera" tono="no" />}
            hecho={PERSONA.residente}
          />
        </ol>
      </section>

      <section aria-labelledby="ronda" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ronda" className="text-xl font-semibold">Ronda de reconocimiento · octubre (ejemplo)</h2>
          <span className="text-sm text-muted">Privada · se muestra agregada</span>
        </div>
        {COMPANEROS.map((c, i) => (
          <div key={c.nombre} className="grid gap-3 rounded-lg bg-surface-2 p-3 sm:grid-cols-3">
            <div>
              <p className="font-medium">{c.nombre}</p>
              <p className="text-sm text-muted">{c.rol}</p>
            </div>
            {DIMENSIONES.map(([d, titulo]) => {
              const nota = ronda.notas[clave(i, d)] ?? 0;
              return (
                <div key={d} role="group" aria-label={`${titulo}, ${c.nombre}`}>
                  <p className="text-sm text-muted">{titulo}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={nota === n}
                        aria-label={`${n} de 5`}
                        disabled={ronda.enviada}
                        onClick={() => guardar(ponerNota(ronda, i, d, n))}
                        className={`h-9 w-9 rounded-lg border font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                          nota === n ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted">{nota ? `Puntaje: ${nota} de 5` : "Sin puntaje"}</p>
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          {ronda.enviada ? (
            <p role="status">
              <span className="font-medium">Ronda enviada (simulado)</span> · Factor de evaluación:{" "}
              <strong data-testid="factor">{factor === null ? "sin dato" : factor.toLocaleString("es-AR")}</strong>
            </p>
          ) : (
            <>
              <button type="button" className={BOTON} disabled={!puedeEnviar} onClick={() => guardar({ ...ronda, enviada: true })}>
                Enviar ronda
              </button>
              <p className="text-sm text-muted">
                {completa ? "Lista para enviar." : "Puntuá a los dos compañeros en rol y aporte (4 notas) para enviarla."}
                {" "}Factor de evaluación hoy: 1,0 (sin ronda).
              </p>
            </>
          )}
        </div>
        <p className="text-sm text-muted">
          El factor es el promedio de las notas dividido 3 (3 de 5 es neutro, 1,0). Fórmula de ejemplo del prototipo:
          multiplica tus semillas de tiempo.
        </p>
      </section>
    </div>
  );
}

function Paso({
  titulo,
  detalle,
  ficha,
  hecho,
  actual,
  children,
}: {
  titulo: string;
  detalle: React.ReactNode;
  ficha: React.ReactNode;
  hecho?: boolean;
  actual?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li
      aria-current={actual ? "step" : undefined}
      className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 ${
        hecho ? "border-deep bg-green-soft" : actual ? "border-gold-ink bg-gold-soft" : "border-line"
      }`}
    >
      <div className="grid gap-1">
        <p className="font-medium">
          {hecho ? <span aria-hidden="true">✓ </span> : null}
          {titulo}
        </p>
        <p className="text-sm text-muted">{detalle}</p>
        {children}
      </div>
      {ficha}
    </li>
  );
}
