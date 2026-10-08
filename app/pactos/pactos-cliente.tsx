"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { TerminoEconomico } from "@/components/termino-economico";
import { TerminoLegal } from "@/components/termino-legal";
import { semillasDePlata, semillasPorMes } from "@/lib/pactos/calculo";
import { HORAS, HOUR_REF_ARS, HOUR_REF_USD, MONTO_USD, PASOS, PESTANAS, ROLES, buscarRol, type ClaveRol } from "@/lib/pactos/datos";
import {
  CLAVE_PACTOS,
  INICIAL,
  MAX_DESCRIPCION,
  MAX_ROL_OTRO,
  deComunidad,
  leer,
  pactoCompleto,
  reducir,
  totalAportes,
  type Accion,
  type EstadoPactos,
} from "@/lib/pactos/estado";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { DATOS_VACIOS, type DatosPersona } from "@/lib/pasaporte/datos";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import { miles } from "@/lib/sumarte/datos";
import { buscarTribu } from "@/lib/tribus/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const AVISO = "rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink";
const PANEL_LATERAL = "grid content-start gap-3 rounded-xl bg-surface-2 p-4";
const CAMPO = "rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function Ejemplo({ texto = "ejemplo" }: { texto?: string }) {
  return <span className="ml-1 rounded-full border border-faint px-2 text-xs text-muted">{texto}</span>;
}

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

export function PactosCliente() {
  const [estado, setEstado] = useState<EstadoPactos>(INICIAL);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);
  const foco = useRef(false);
  const [anuncio, setAnuncio] = useState("");
  // Lo que la persona cargó en "Tus datos"; lo que no cargó queda sin dato.
  const [datos, setDatos] = useState<DatosPersona>(DATOS_VACIOS);
  // Comunidades donde la persona es miembro: solo ahí puede proponer un pacto.
  const [miembro, setMiembro] = useState<string[]>([]);
  const [elegida, setElegida] = useState("");
  const [monto, setMonto] = useState(String(MONTO_USD.inicial));

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setDatos(leerPasaporteDelNavegador());
    const comunidades = comunidadesDondeEsMiembro(leerMembresiaDelNavegador());
    setMiembro(comunidades);
    const pedida = new URLSearchParams(window.location.search).get("comunidad");
    setElegida(pedida && comunidades.includes(pedida) ? pedida : (comunidades[0] ?? ""));
    try {
      setEstado(leer(window.localStorage.getItem(CLAVE_PACTOS)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  // El botón de paso desaparece al apretarlo: el foco pasa al estado nuevo.
  const pasoActual = elegida ? deComunidad(estado, elegida).tiempo.paso : 0;
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>("[data-foco-paso]")?.focus();
    foco.current = false;
  }, [pasoActual]);

  function dispatch(accion: Accion) {
    const siguiente = reducir(estado, accion);
    try {
      window.localStorage.setItem(CLAVE_PACTOS, JSON.stringify(siguiente));
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
      setAnuncio(paso === 1 ? `Pacto enviado a ${donde}.` : paso === 2 ? `Quien administra ${donde} aceptó el pacto.` : "");
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

  if (!listo) return <p role="status" className="text-sm text-muted">Cargando tus comunidades…</p>;

  if (miembro.length === 0) {
    return (
      <section aria-label="Sin comunidad" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
        <p>Para proponer un pacto primero tenés que pertenecer a una comunidad.</p>
        <Link className={BOTON_PRIMARIO} href="/tribus">
          Ver las comunidades
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
  const semillas = semillasPorMes(t.horas);
  const montoNumero = Number(monto);
  const montoValido = monto.trim() !== "" && Number.isInteger(montoNumero) && montoNumero >= MONTO_USD.min && montoNumero <= MONTO_USD.max;
  const totalPlata = totalAportes(mias);

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el pacto no se puede guardar. Revisá la
          configuración de privacidad o probá en otro navegador.
        </p>
      )}
      <section aria-label="Comunidad del pacto" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">¿En qué comunidad es el pacto?</span>
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
        <p className="text-sm text-muted">
          Solo podés proponer pactos en las comunidades donde sos miembro. Las Semillas son de cada comunidad.
        </p>
      </section>

      <section aria-label="Estado del pacto" className="grid gap-4 rounded-xl border border-faint bg-surface p-4">
        {estado.pestana === "tiempo" && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ol className="flex flex-wrap gap-2" aria-label="Pasos del pacto">
              {PASOS.map((p, i) => (
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
            <span className="text-sm text-muted">Versión {t.paso + 1}</span>
          </div>
        )}

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
              <fieldset disabled={!editable} className="grid content-start gap-4 border-0 p-0">
                <legend className="sr-only">Pacto de tiempo en {nombre}</legend>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">1. Rol que asumís en {nombre}</span>
                  <select
                    value={t.rol}
                    onChange={(e) => dispatch({ tipo: "rol", comunidad, rol: e.target.value as ClaveRol | "" })}
                    className={`${CAMPO} w-fit`}
                  >
                    <option value="">Elegí un rol</option>
                    {ROLES.map((r) => (
                      <option key={r.clave} value={r.clave}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                {rol && (
                  <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm" data-testid="rol-descripcion">
                    <b>{rol.nombre}</b>: {rol.descripcion}
                  </p>
                )}
                {t.rol === "otro" && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">¿Qué rol es?</span>
                    <input
                      type="text"
                      maxLength={MAX_ROL_OTRO}
                      value={t.rolOtro}
                      onChange={(e) => dispatch({ tipo: "rolOtro", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                {t.rol && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Tu descripción: qué vas a hacer</span>
                    <textarea
                      rows={3}
                      maxLength={MAX_DESCRIPCION}
                      value={t.descripcion}
                      onChange={(e) => dispatch({ tipo: "descripcion", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">2. Compromiso mensual: {t.horas} h/mes</span>
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
                  <span className="font-medium">Valor de referencia de la hora</span>
                  <span>
                    ARS {miles(HOUR_REF_ARS)} ≈ USD {miles(HOUR_REF_USD)}
                    <Ejemplo texto="referencia, por ahora" />
                  </span>
                </p>
                {datos.modalidad === "obra" ? (
                  <p className={AVISO}>
                    Horas de obra presenciales
                    <TerminoLegal clave="obra" />: antes de la primera minga hace falta el seguro y la modalidad
                    (voluntariado o locación de servicios).
                  </p>
                ) : datos.modalidad === "remoto" ? (
                  <p className={AVISO}>
                    Aporte remoto desde el exterior
                    <TerminoLegal clave="remoto" />
                    {t.horas > 20
                      ? `: comprometés ${t.horas} h/mes${datos.paisResidencia ? ` viviendo en ${datos.paisResidencia}` : ""}. ¿Parte es presencial? Conviene un pacto de verano aparte.`
                      : "."}
                  </p>
                ) : (
                  <p className={AVISO}>
                    Sin dato de tu modalidad (presencial o remota).{" "}
                    <Link className="underline" href="/pasaporte">
                      Cargala en Tus datos
                    </Link>{" "}
                    para ver los avisos que te tocan.
                  </p>
                )}
              </fieldset>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">3. Por mes</p>
                <div>
                  <p className="text-2xl font-semibold" data-testid="semillas-mes">
                    {miles(semillas)} semillas
                  </p>
                  <p className="text-sm text-muted">
                    Semillas
                    <TerminoEconomico clave="semillas" /> de {nombre}
                  </p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted">Fórmula</dt>
                  <dd>horas × valor de referencia de la hora</dd>
                </dl>
                <p className="text-sm text-muted">
                  En esta fase solo se da: tiempo o plata. 1 Semilla = 1 USD de referencia: una hora y un dólar se miden igual.
                </p>
              </div>
            </div>
          )}

          {estado.pestana === "plata" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <p className="text-sm">
                  Sumarte con plata en <b>{nombre}</b> se registra como Semillas
                  <TerminoEconomico clave="semillas" />: 1 USD = 1 Semilla de referencia. Es simulado: no se paga nada.
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Monto (USD)</span>
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
                    ? `Este aporte equivale a ${miles(semillasDePlata(montoNumero))} Semillas.`
                    : `Poné un monto entero de USD ${miles(MONTO_USD.min)} a ${miles(MONTO_USD.max)}.`}
                </p>
                <button
                  type="button"
                  className={BOTON_PRIMARIO}
                  disabled={!montoValido}
                  onClick={() => dispatch({ tipo: "aporte", comunidad, montoUsd: montoNumero })}
                >
                  Registrar aporte (simulado)
                </button>
                <p className={AVISO}>Ningún flujo cobra de verdad: el aporte solo queda registrado en este navegador.</p>
              </div>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">Registrado en {nombre}</p>
                {mias.aportes.length === 0 ? (
                  <p className="text-sm text-muted">Todavía no registraste aportes en plata.</p>
                ) : (
                  <>
                    <p className="text-2xl font-semibold" data-testid="semillas-plata">
                      {miles(semillasDePlata(totalPlata))} Semillas de plata (simulado)
                    </p>
                    <ul className="grid gap-1 text-sm">
                      {mias.aportes.map((a, i) => (
                        <li key={i}>
                          USD {miles(a)} · {miles(semillasDePlata(a))} Semillas
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
                  Enviar a la comunidad
                </button>
                {!pactoCompleto(t) && (
                  <span id="ayuda-enviar" className="text-sm text-muted">
                    Para enviarlo elegí un rol y contá qué vas a hacer.
                  </span>
                )}
              </>
            )}
            {t.paso === 1 && (
              <button type="button" data-foco-paso className={BOTON_DORADO} onClick={() => dispatch({ tipo: "avanzar", comunidad })}>
                Simular: la comunidad acepta
              </button>
            )}
            {t.paso === 2 && (
              <>
                <span
                  tabIndex={-1}
                  data-foco-paso
                  className="rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep"
                >
                  ✓ Pacto aceptado
                </span>
                <span className="text-sm text-muted">Tus Semillas de {nombre} se ven en el libro de semillas.</span>
              </>
            )}
          </div>
        )}
        <p role="status" className="sr-only">
          {anuncio}
        </p>
      </section>
    </div>
  );
}
