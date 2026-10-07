"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { cajaPorMes, semillasPorMes } from "@/lib/pactos/calculo";
import {
  HORAS,
  HOUR_REF_ARS,
  HOUR_REF_USD,
  MONTO_USD,
  PARTE_SEMILLA,
  PASOS,
  PERSONA,
  PESTANAS,
  REGLAS_CONVIVENCIA,
} from "@/lib/pactos/datos";
import { CLAVE_PACTOS, INICIAL, leer, reducir, type Accion, type EstadoPactos } from "@/lib/pactos/estado";
import { miles } from "@/lib/sumarte/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const BOTON_SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const AVISO = "rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink";
const PANEL_LATERAL = "grid content-start gap-3 rounded-xl bg-surface-2 p-4";

function Ejemplo() {
  return <span className="ml-1 rounded-full border border-faint px-2 text-xs text-muted">ejemplo</span>;
}

export function PactosCliente() {
  const [estado, setEstado] = useState<EstadoPactos>(INICIAL);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const foco = useRef(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setEstado(leer(window.localStorage.getItem(CLAVE_PACTOS)));
    } catch {
      setFalloAlmacen(true);
    }
  }, []);

  // El botón de paso desaparece al apretarlo: el foco pasa al estado nuevo.
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>("[data-foco-paso]")?.focus();
    foco.current = false;
  }, [estado.paso]);

  function dispatch(accion: Accion) {
    const siguiente = reducir(estado, accion);
    try {
      window.localStorage.setItem(CLAVE_PACTOS, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      // No se pudo guardar: la pantalla sigue respondiendo en memoria y se avisa.
      setFalloAlmacen(true);
    }
    if (accion.tipo === "avanzar") foco.current = true;
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

  const semillas = semillasPorMes(estado.horas, estado.parteSemilla);
  const caja = cajaPorMes(estado.horas, estado.parteSemilla);

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el pacto no se puede guardar. Revisá la
          configuración de privacidad o probá en otro navegador.
        </p>
      )}
      <section aria-label="Estado del pacto" className="grid gap-4 rounded-xl border border-faint bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ol className="flex flex-wrap gap-2" aria-label="Pasos del pacto">
            {PASOS.map((p, i) => (
              <li
                key={p}
                aria-current={i === estado.paso ? "step" : undefined}
                className={`rounded-full border px-3 py-1 text-sm ${
                  i <= estado.paso ? "border-deep bg-green-soft font-medium text-deep" : "border-faint text-muted"
                }`}
              >
                {i < estado.paso ? "✓ " : ""}
                {p}
              </li>
            ))}
          </ol>
          <span className="text-sm text-muted">Versión {estado.paso + 1}</span>
        </div>

        <div role="tablist" aria-label="Tipo de pacto" className="flex flex-wrap gap-2 border-b border-line pb-2">
          {PESTANAS.map(([clave, titulo], i) => {
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
              <div className="grid content-start gap-4">
                <p className="grid gap-1 text-sm">
                  <span className="font-medium">Rol en la tribu</span>
                  <span>{PERSONA.rol}</span>
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Compromiso mensual: {estado.horas} h/mes</span>
                  <input
                    type="range"
                    min={HORAS.min}
                    max={HORAS.max}
                    step={HORAS.paso}
                    value={estado.horas}
                    onChange={(e) => dispatch({ tipo: "horas", horas: Number(e.target.value) })}
                    className="accent-deep"
                  />
                </label>
                <p className="grid gap-1 text-sm">
                  <span className="font-medium">Valor de referencia de la hora</span>
                  <span>
                    ARS {miles(HOUR_REF_ARS)} ≈ USD {miles(HOUR_REF_USD)}
                    <Ejemplo />
                  </span>
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">
                    Parte que aportás como semilla (no cobrás en caja): {estado.parteSemilla}%
                  </span>
                  <input
                    type="range"
                    min={PARTE_SEMILLA.min}
                    max={PARTE_SEMILLA.max}
                    step={PARTE_SEMILLA.paso}
                    value={estado.parteSemilla}
                    onChange={(e) => dispatch({ tipo: "parte", parteSemilla: Number(e.target.value) })}
                    className="accent-deep"
                  />
                </label>
                {PERSONA.modo === "obra" ? (
                  <p className={AVISO}>
                    Horas de obra presenciales
                    <TerminoLegal clave="obra" />: antes de la primera minga hace falta el seguro y la modalidad
                    (voluntariado o locación de servicios).
                  </p>
                ) : (
                  <p className={AVISO}>
                    Aporte remoto desde el exterior
                    <TerminoLegal clave="remoto" />
                    {estado.horas > 20
                      ? `: comprometés ${estado.horas} h/mes viviendo en Oslo. ¿Parte es presencial? Conviene un pacto de verano aparte.`
                      : "."}
                  </p>
                )}
              </div>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">Por mes</p>
                <div>
                  <p className="text-2xl font-semibold" data-testid="semillas-mes">
                    {miles(semillas)} semillas
                  </p>
                  <p className="text-sm text-muted">
                    Semillas
                    <TerminoLegal clave="semillas" /> con una evaluación entre pares de 1,0
                  </p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted">En caja</dt>
                  <dd>USD {miles(caja)}/mes</dd>
                  <dt className="text-muted">Fórmula</dt>
                  <dd>horas × valor hora × parte en semilla × evaluación</dd>
                </dl>
                <p className="text-sm text-muted">
                  1 semilla = 1 USD de referencia: una hora y un dólar se miden igual.
                </p>
              </div>
            </div>
          )}

          {estado.pestana === "plata" &&
            (PERSONA.residenciaArgentina ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid content-start gap-3">
                  <p className="text-sm">
                    Tu plata va a <b>la caja del proyecto</b>
                    <TerminoLegal clave="caja" />, no a NetX. Te sumás al proyecto del macrolote
                    <TerminoLegal clave="sumarte" />, no a una chacra puntual.
                  </p>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Monto: USD {miles(estado.montoUsd)}</span>
                    <input
                      type="range"
                      min={MONTO_USD.min}
                      max={MONTO_USD.max}
                      step={MONTO_USD.paso}
                      value={estado.montoUsd}
                      onChange={(e) => dispatch({ tipo: "monto", montoUsd: Number(e.target.value) })}
                      className="accent-deep"
                    />
                  </label>
                  <p className={AVISO}>
                    La firma vinculante es por escritura con el fiduciario, fuera de la plataforma. Acá queda el pacto,
                    su estado y el espejo
                    <TerminoLegal clave="espejo" />.
                  </p>
                </div>
                <div className={PANEL_LATERAL}>
                  <p className="font-mono text-sm text-muted">En el espejo</p>
                  <p className="text-2xl font-semibold">{miles(estado.montoUsd)} semillas</p>
                  <p className="text-sm text-muted">Cuando el fiduciario confirme el aporte.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <p className="text-sm">
                  <b>Por ahora no podés sumarte con plata al fideicomiso</b>, por tu residencia fiscal
                  <TerminoLegal clave="hacienda" /> ({PERSONA.residencia}). Podés sumar tiempo, tener un{" "}
                  <b>Pase de estadías</b>
                  <TerminoLegal clave="pase" /> o esperar la vía para aportantes del exterior.
                </p>
                <Link className={BOTON_SUAVE} href="/sumarte">
                  Ver alternativas
                </Link>
              </div>
            ))}

          {estado.pestana === "convivencia" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <p className="text-sm">
                  El <b>Pacto de convivencia</b>
                  <TerminoLegal clave="pacto" /> trata sobre lo que hacés, no sobre lo que pensás:
                </p>
                <ul className="grid gap-2">
                  {REGLAS_CONVIVENCIA.map((regla, i) => (
                    <li key={regla}>
                      <label className="flex items-start gap-2 text-sm">
                        <input type="checkbox" id={`regla-${i}`} defaultChecked className="mt-1 accent-deep" />
                        <span>{regla}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={PANEL_LATERAL}>
                <p className="text-sm">
                  Si alguien vende, la comunidad tiene preferencia para comprar. Las sanciones son por conductas graves
                  o repetidas. Nadie puede ser echado de su lote.
                </p>
                <p className="text-sm">
                  Entrar a una <b>tribu</b> es otra cosa: lo decide cada tribu con su ritual
                  <TerminoLegal clave="ritual" />.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {estado.paso === 0 && (
            <button type="button" data-foco-paso className={BOTON_PRIMARIO} onClick={() => dispatch({ tipo: "avanzar" })}>
              Enviar a la tribu
            </button>
          )}
          {estado.paso === 1 && (
            <button type="button" data-foco-paso className={BOTON_DORADO} onClick={() => dispatch({ tipo: "avanzar" })}>
              Simular: la tribu acepta
            </button>
          )}
          {estado.paso === 2 && (
            <>
              <span
                tabIndex={-1}
                data-foco-paso
                className="rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep"
              >
                ✓ Pacto aceptado
              </span>
              <span className="text-sm text-muted">Tus semillas se verán en el libro de semillas (todavía no disponible).</span>
            </>
          )}
        </div>
        <p role="status" className="sr-only">
          {estado.paso === 1 ? "Pacto enviado a Valle Solar." : estado.paso === 2 ? "La tribu aceptó el pacto." : ""}
        </p>
      </section>
    </div>
  );
}
