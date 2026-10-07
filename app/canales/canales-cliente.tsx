"use client";

import { useEffect, useMemo, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { filasDePuertas, PASES, personaDesdeSumarte, PLANES } from "@/lib/canales/puertas";
import { CLAVES } from "@/lib/demo/claves";
import type { Pase, Persona, Plan } from "@/lib/permisos/tipos";
import { INICIAL, leer } from "@/lib/sumarte/estado";
import { listarTribus } from "@/lib/tribus/datos";

const BOTON_SUAVE =
  "w-fit rounded-lg border border-muted px-4 py-1.5 font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const TARJETA = "grid grid-cols-1 content-start gap-3 rounded-xl border border-faint bg-surface p-4";
const CAMPO =
  "w-full min-w-0 rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CASILLA = "size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

// Solo las tribus que existen de verdad pueden aceptar a alguien: los barrios vacantes no.
const TRIBUS = listarTribus()
  .filter((t) => t.estado !== "vacante")
  .map((t) => ({ id: t.id, nombre: t.nombre }));

export function CanalesCliente() {
  const [real, setReal] = useState<Persona>(() => personaDesdeSumarte(INICIAL));
  // null = se muestra la situación real; con valor, la de prueba (solo en memoria).
  const [prueba, setPrueba] = useState<Persona | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setReal(personaDesdeSumarte(leer(window.localStorage.getItem(CLAVES.sumarte))));
    } catch {
      // Sin acceso al almacenamiento: queda Explorador sin pase.
    }
  }, []);

  const persona = prueba ?? real;
  const filas = useMemo(() => filasDePuertas(persona, TRIBUS), [persona]);
  const cambiar = (c: Partial<Persona>) => setPrueba({ ...persona, ...c });

  return (
    <div className="grid grid-cols-1 gap-6">
      <section aria-labelledby="situacion" className={TARJETA}>
        <h2 id="situacion" className="text-xl font-semibold">Tu situación</h2>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
          <dt className="font-medium">Plan</dt>
          <dd>{PLANES[real.plan]}</dd>
          <dt className="font-medium">
            Pase Fundador
            <TerminoLegal clave="pasefundador" />
          </dt>
          <dd>{real.pase ? `Pase Fundador · ${PASES[real.pase]}` : "Sin Pase Fundador"}</dd>
          <dt className="font-medium">Tribu aceptada</dt>
          <dd>ninguna todavía</dd>
          <dt className="font-medium">
            Presencia Genesis
            <TerminoLegal clave="presencia" />
          </dt>
          <dd>{real.presenciaGenesis ? "confirmada" : "pendiente: la confirma el anfitrión en el check-in"}</dd>
          <dt className="font-medium">Residente</dt>
          <dd>{real.residente ? "sí" : "no"}</dd>
        </dl>
      </section>

      <section aria-labelledby="prueba" className={TARJETA}>
        <h2 id="prueba" className="text-xl font-semibold">Probá otra situación</h2>
        <p className="text-sm text-muted">Cambiá lo que quieras y mirá cómo se mueven las puertas. No se guarda nada.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="grid gap-1">
            <legend className="font-medium">Plan</legend>
            {(["explorador", "miembro"] as Plan[]).map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="prueba-plan"
                  className={CASILLA}
                  checked={persona.plan === p}
                  onChange={() => cambiar({ plan: p })}
                />
                {PLANES[p]}
              </label>
            ))}
          </fieldset>
          <fieldset className="grid gap-1">
            <legend className="font-medium">Pase Fundador</legend>
            {([null, "semilla", "brote", "raiz"] as Array<Pase | null>).map((p) => (
              <label key={p ?? "ninguno"} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="prueba-pase"
                  className={CASILLA}
                  checked={persona.pase === p}
                  onChange={() => cambiar({ pase: p })}
                />
                {p ? PASES[p] : "Sin pase"}
              </label>
            ))}
          </fieldset>
          <div className="grid content-start gap-1">
            <label htmlFor="prueba-tribu" className="font-medium">Tribu aceptada</label>
            <select
              id="prueba-tribu"
              className={CAMPO}
              value={persona.tribus[0] ?? ""}
              onChange={(e) => cambiar({ tribus: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">Ninguna</option>
              {TRIBUS.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid content-start gap-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className={CASILLA}
                checked={persona.presenciaGenesis}
                onChange={(e) => cambiar({ presenciaGenesis: e.target.checked })}
              />
              Presencia Genesis
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className={CASILLA}
                checked={persona.residente}
                onChange={(e) => cambiar({ residente: e.target.checked })}
              />
              Residente
            </label>
          </div>
        </div>
        <button type="button" className={BOTON_SUAVE} onClick={() => setPrueba(null)}>
          Volver a mi situación
        </button>
      </section>

      <section aria-labelledby="puertas" className={TARJETA}>
        <h2 id="puertas" className="text-xl font-semibold">Las puertas</h2>
        <div aria-live="polite" className="grid grid-cols-1 gap-3">
          <p className="text-sm font-medium">
            {prueba ? "Estás viendo una situación de prueba (no se guarda)." : "Estás viendo tu situación."}
          </p>
          {/* Sin contenedor con scroll: recortaría la explicación del ⚖. La tabla se ajusta al ancho. */}
          {/* Por debajo de 640 px: tarjetas apiladas en lugar de la tabla. */}
          <ul className="grid grid-cols-1 gap-3 sm:hidden" data-testid="puertas-tarjetas">
            {filas.map((f) => (
              <li key={f.clave} className="grid gap-1 rounded-lg border border-line bg-surface-2 p-3 text-sm">
                <p className="font-semibold break-words">
                  {f.nombre}
                  {f.termino && <TerminoLegal clave={f.termino} />}
                </p>
                <p className="font-medium">
                  <span aria-hidden="true">{f.abierta ? "✓ " : "✕ "}</span>
                  {f.estado}
                </p>
                <p className="break-words">
                  {f.abierta ? f.motivos.join(" y ") : `Se abre con: ${f.abreCon}`}
                  {f.refuerzo && <span className="block text-muted">{f.refuerzo}</span>}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-[36%] p-1 sm:p-2">Puerta</th>
                  <th scope="col" className="w-[30%] p-1 sm:p-2">Estado</th>
                  <th scope="col" className="p-1 sm:p-2">Por qué</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.clave} className="border-b border-line align-top">
                    <th scope="row" className="p-1 font-medium break-words sm:p-2">
                      {f.nombre}
                      {f.termino && <TerminoLegal clave={f.termino} />}
                    </th>
                    <td className="p-1 font-medium break-words sm:p-2">
                      <span aria-hidden="true">{f.abierta ? "✓ " : "✕ "}</span>
                      {f.estado}
                    </td>
                    <td className="p-1 break-words sm:p-2">
                      {f.abierta ? f.motivos.join(" y ") : `Se abre con: ${f.abreCon}`}
                      {f.refuerzo && <span className="block text-muted">{f.refuerzo}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
