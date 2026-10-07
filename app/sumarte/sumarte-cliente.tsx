"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Medidor } from "@/components/medidor";
import { PedidoContacto } from "@/components/pedido-contacto";
import { TerminoLegal } from "@/components/termino-legal";
import { guardarPedido } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { CLAVES } from "@/lib/demo/claves";
import {
  COHORT,
  EMISION,
  FILAS,
  MEMBRESIA,
  miles,
  PASSES,
  PLAN_TRIBU_MENSUAL,
  type NivelPase,
} from "@/lib/sumarte/datos";
import { INICIAL, leer, reducir, type Accion, type EstadoSumarte } from "@/lib/sumarte/estado";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const CLAVE = CLAVES.sumarte;

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_DORADO = `${BOTON} bg-gold text-ink hover:bg-gold-soft`;
const BOTON_SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const TARJETA = "grid grid-cols-1 content-start gap-3 rounded-xl border bg-surface p-4";
const BORDE = "border-faint";
const BORDE_ACTUAL = "border-2 border-deep";
const ETIQUETA_ACTUAL = "w-fit rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function SumarteCliente() {
  const [estado, setEstado] = useState<EstadoSumarte>(INICIAL);
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [formulario, setFormulario] = useState<"invitacion" | "charla" | null>(null);
  const foco = useRef<string | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setEstado(leer(window.localStorage.getItem(CLAVE)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  // Tras un cambio, el botón que se apretó puede desaparecer: el foco pasa al estado nuevo.
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>(`[data-foco="${foco.current}"]`)?.focus();
    foco.current = null;
  }, [estado]);

  function dispatch(accion: Accion, enfocar?: string) {
    const siguiente = reducir(estado, accion);
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
      return;
    }
    foco.current = enfocar ?? null;
    setEstado(siguiente);
  }

  // El pedido se guarda primero; recién ahí se hace lo que el botón hacía antes.
  function enviarPedido(pedido: Pedido, accion: Accion): boolean {
    if (!guardarPedido(pedido)) {
      setFalloAlmacen(true);
      return false;
    }
    dispatch(accion);
    return true;
  }

  const paseActivo = estado.pase ? PASSES.find((p) => p.id === estado.pase)! : null;
  // Con un pase activo, la tarjeta muestra siempre el nivel activado (no se puede cambiar sin deshacerlo).
  const nivel = paseActivo ?? PASSES.find((p) => p.id === estado.nivelPase)!;
  const esExplorador = estado.plan === "explorador";
  const esMiembro = estado.plan === "miembro";
  const nombrePlan = paseActivo ? `Pase Fundador ${paseActivo.nombre}` : esMiembro ? "Miembro" : "Explorador";
  const sumaInvitacion = estado.invitacion ? 1 : 0;

  return (
    <div className="grid gap-6">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que la elección no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Facturación" className="flex gap-2">
          {(["mensual", "anual"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={estado.facturacion === f}
              onClick={() => dispatch({ tipo: "facturacion", facturacion: f })}
              className={`rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${estado.facturacion === f ? "border-deep bg-deep text-on-deep" : "border-muted hover:bg-surface-2"}`}
            >
              {estado.facturacion === f && <span aria-hidden="true">✓ </span>}
              {f === "mensual" ? "Mensual" : "Anual"}
              {f === "anual" && <span className="ml-2 text-sm">2 meses gratis</span>}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {listo ? (
            <>
              Tu plan actual: <b>{nombrePlan}</b> (simulado)
            </>
          ) : null}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article aria-labelledby="plan-explorador" className={`${TARJETA} ${esExplorador ? BORDE_ACTUAL : BORDE}`}>
          <h2 id="plan-explorador" className="text-xl font-semibold">Explorador</h2>
          <p className="text-2xl font-bold">Gratis</p>
          <p className="text-muted">Conocé el territorio, las tribus y a la gente.</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Mapa y páginas de tribus</li>
            <li>Entrevista con el agente</li>
            <li>Eventos abiertos</li>
            <li>Registro de tu ticket del Congreso</li>
          </ul>
          {esExplorador ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-explorador">Tu plan (simulado)</p>
          ) : (
            <button type="button" className={BOTON_SUAVE} onClick={() => dispatch({ tipo: "plan", plan: "explorador" }, "plan-explorador")}>
              Volver a Explorador
            </button>
          )}
        </article>

        <article aria-labelledby="plan-miembro" className={`${TARJETA} ${esMiembro ? BORDE_ACTUAL : BORDE}`}>
          <h2 id="plan-miembro" className="text-xl font-semibold">
            Miembro de la red
            <TerminoLegal clave="membresia" />
          </h2>
          <p className="text-2xl font-bold">
            {estado.facturacion === "anual" ? `USD ${MEMBRESIA.anual}` : `USD ${MEMBRESIA.mensual}`}
            <span className="text-base font-normal text-muted">{estado.facturacion === "anual" ? "/año" : "/mes"}</span>
          </p>
          <p className="text-muted">Entrá a las salas, proponé pactos y empezá a sumar.</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Todo lo de Explorador</li>
            <li>Salas de tribu y foros</li>
            <li>
              Pactos y Semillas
              <TerminoLegal clave="semillas" />
            </li>
            <li>Voz en tu tribu</li>
          </ul>
          {esMiembro ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="plan-miembro">Tu plan (simulado)</p>
          ) : (
            <button type="button" className={BOTON_PRIMARIO} onClick={() => dispatch({ tipo: "plan", plan: "miembro" }, "plan-miembro")}>
              Hacerme miembro
            </button>
          )}
        </article>

        <article aria-labelledby="plan-fundador" className={`${TARJETA} ${paseActivo ? BORDE_ACTUAL : "border-2 border-gold-ink"}`}>
          <p className="w-fit rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-gold-ink">Cohorte Génesis · Feb 2027</p>
          <h2 id="plan-fundador" className="text-xl font-semibold">
            Pase Fundador
            <TerminoLegal clave="pasefundador" />
          </h2>
          <fieldset className="grid grid-cols-3 gap-2">
            <legend className="sr-only">Nivel del pase</legend>
            {PASSES.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col items-center rounded-lg border px-2 py-1.5 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep ${nivel.id === p.id ? "border-2 border-deep bg-green-soft" : "border-muted"} ${paseActivo ? "cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="nivel-pase"
                  value={p.id}
                  checked={nivel.id === p.id}
                  disabled={paseActivo !== null}
                  onChange={() => dispatch({ tipo: "nivel", nivel: p.id as NivelPase })}
                  className="sr-only"
                />
                <span className="font-medium">{p.nombre}</span>
                <span className="text-sm">USD {miles(p.precio)}</span>
              </label>
            ))}
          </fieldset>
          <p className="text-2xl font-bold">
            USD {miles(nivel.precio)}
            <span className="text-base font-normal text-muted"> · pago único</span>
          </p>
          <p className="text-muted">
            Financiás el Fondo Común
            <TerminoLegal clave="guardian" /> y entrás a la cohorte fundadora. Mismo voto en los tres niveles.
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>Todo lo de Miembro, 1 año incluido</li>
            <li>
              Voz en la Ronda 0
              <TerminoLegal clave="ronda0" />: 1 persona = 1 voz
            </li>
            <li>
              USD {miles(nivel.creditos)} en créditos comunes y de estadía
              <TerminoLegal clave="creditos" />, en 3 años
            </li>
            <li>Canal de fundadores</li>
            <li>Registro Genesis si venís al Congreso</li>
          </ul>
          <Medidor titulo="Pases de la cohorte" actual={COHORT.vendidos + (paseActivo ? 1 : 0)} tope={COHORT.cupo} dorado />
          <Medidor
            titulo="Mínimo para abrir el Fondo Común"
            actual={COHORT.recaudado + (paseActivo ? paseActivo.precio : 0)}
            tope={COHORT.minimo}
            unidad="USD "
          />
          {paseActivo ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="pase">
              Pase {paseActivo.nombre} activo (simulado)
            </p>
          ) : (
            <button type="button" className={BOTON_DORADO} onClick={() => dispatch({ tipo: "pase" }, "pase")}>
              Quiero el Pase {nivel.nombre}
            </button>
          )}
          <p className="text-sm text-muted">No es una inversión: no da tierra, lotes, prioridad ni rendimiento, y no se revende.</p>
        </article>

        <article aria-labelledby="plan-tribu" className={`${TARJETA} ${BORDE}`}>
          <h2 id="plan-tribu" className="text-xl font-semibold">
            Plan Tribu
            <TerminoLegal clave="plantribu" />
          </h2>
          <p className="text-2xl font-bold">
            USD {PLAN_TRIBU_MENSUAL}
            <span className="text-base font-normal text-muted">/mes</span>
          </p>
          <p className="text-muted">Para tribus con personería que quieren organizarse acá.</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Página pública y convocatorias</li>
            <li>Pactos, rondas de reconocimiento y Semillas</li>
            <li>Salas y canales propios</li>
            <li>Ritual de entrada configurable</li>
          </ul>
          {estado.tribu ? (
            <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="tribu">Alta del Plan Tribu pedida (simulado)</p>
          ) : (
            <button type="button" className={BOTON_SUAVE} onClick={() => dispatch({ tipo: "tribu" }, "tribu")}>
              Sumar mi tribu
            </button>
          )}
        </article>
      </div>

      <section aria-labelledby="comparativa" className={`rounded-xl border bg-surface p-4 ${BORDE}`}>
        <h2 id="comparativa" className="mb-2 text-xl font-semibold">Qué incluye cada plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <td className="p-2"><span className="sr-only">Función</span></td>
                <th scope="col" className="p-2">Explorador</th>
                <th scope="col" className="p-2">Miembro</th>
                <th scope="col" className="p-2">Pase Fundador</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.texto} className="border-b border-line">
                  <th scope="row" className="p-2 font-normal">{f.texto}</th>
                  {f.incluye.map((si, i) => (
                    <td key={i} className="p-2">
                      <span aria-hidden="true">{si ? "✓" : "—"}</span>
                      <span className="sr-only">{si ? "Incluido" : "No incluido"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          <Link className="underline" href="/canales">Ver qué te abre cada plan</Link>
        </p>
      </section>

      <section aria-labelledby="inversores" className="grid gap-3">
        <h2 id="inversores" className="text-2xl font-semibold">Para inversores</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article aria-labelledby="inv-lote7" className={`${TARJETA} ${BORDE}`}>
            <p className="text-sm font-medium text-muted">
              Por invitación
              <TerminoLegal clave="circulo" />
            </p>
            <h3 id="inv-lote7" className="text-xl font-semibold">
              Sumarte al proyecto del Lote 7
              <TerminoLegal clave="sumarte" />
            </h3>
            <p className="text-sm text-muted">
              Tu aporte va a la caja del proyecto
              <TerminoLegal clave="caja" /> y aparece en el espejo
              <TerminoLegal clave="espejo" />. Para el proyecto, no para una chacra.
            </p>
            <Medidor titulo="Lugares en el círculo" actual={EMISION.aportantes + sumaInvitacion} tope={EMISION.cupo} />
            <Medidor titulo="Lugares para no calificados" actual={EMISION.noCalificados + sumaInvitacion} tope={EMISION.cupoNoCalificados} dorado />
            {estado.invitacion ? (
              <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="invitacion">Invitación pedida (simulado)</p>
            ) : (
              <button
                id="boton-invitacion"
                type="button"
                aria-expanded={formulario === "invitacion"}
                className={BOTON_PRIMARIO}
                onClick={() => setFormulario("invitacion")}
              >
                Pedir invitación
              </button>
            )}
            {formulario === "invitacion" && (
              <PedidoContacto
                motivo="invitacion-circulo"
                referencia="Lote 7"
                idBoton="boton-invitacion"
                alEnviar={(pedido) => enviarPedido(pedido, { tipo: "invitacion" })}
                alCancelar={() => setFormulario(null)}
              />
            )}
            <p className="text-sm text-muted">
              Elegibilidad de ejemplo: disponible. Con residencia fiscal en el exterior todavía no se puede entrar
              <TerminoLegal clave="hacienda" />; el Pase Fundador sí está abierto.
            </p>
          </article>
          <article aria-labelledby="inv-netx" className={`${TARJETA} ${BORDE}`}>
            <p className="text-sm font-medium text-muted">Conversación privada</p>
            <h3 id="inv-netx" className="text-xl font-semibold">
              Invertir en NetX como empresa
              <TerminoLegal clave="safe" />
            </h3>
            <p className="text-sm text-muted">
              Si te interesa la compañía detrás de la plataforma, lo hablamos uno a uno con el equipo.
            </p>
            {estado.charla ? (
              <p className={ETIQUETA_ACTUAL} role="status" tabIndex={-1} data-foco="charla">Charla pedida (simulado)</p>
            ) : (
              <button
                id="boton-charla"
                type="button"
                aria-expanded={formulario === "charla"}
                className={BOTON_SUAVE}
                onClick={() => setFormulario("charla")}
              >
                Pedir una charla
              </button>
            )}
            {formulario === "charla" && (
              <PedidoContacto
                motivo="charla-netx"
                referencia="Invertir en NetX"
                idBoton="boton-charla"
                alEnviar={(pedido) => enviarPedido(pedido, { tipo: "charla" })}
                alCancelar={() => setFormulario(null)}
              />
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
