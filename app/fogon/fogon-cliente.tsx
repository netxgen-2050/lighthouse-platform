"use client";

import { useEffect, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { AMBITOS, OPCIONES, PERSONAS, type Ambito, type Opcion, type PersonaId } from "@/lib/fogon/datos";
import { cambiarPersona, contar, filtrar, INICIAL, leer, motivoSinVoto, votar, type EstadoFogon } from "@/lib/fogon/estado";

// Todo queda solo en este navegador: no hay pedidos de red.
const CLAVE = "lh-fogon";

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_ACTIVO = `${BOTON} border-deep bg-deep text-on-deep`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

export function FogonCliente() {
  const [estado, setEstado] = useState<EstadoFogon>(INICIAL);
  const [ambito, setAmbito] = useState<Ambito | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setEstado(leer(window.localStorage.getItem(CLAVE)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function guardar(siguiente: EstadoFogon): boolean {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
      return false;
    }
    setEstado(siguiente);
    return true;
  }

  function elegir(id: string, opcion: Opcion) {
    if (guardar(votar(estado, id, opcion))) setAbierta(null);
  }

  const persona = PERSONAS[estado.persona];
  const lista = filtrar(ambito);

  return (
    <div className="grid gap-5">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el voto no se puede guardar. Revisá la
          configuración de privacidad o probá en otro navegador.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar por ámbito" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={ambito === null} onClick={() => setAmbito(null)} className={ambito === null ? BOTON_ACTIVO : BOTON_SUAVE}>
            {ambito === null && <span aria-hidden="true">✓ </span>}Todas
          </button>
          {AMBITOS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={ambito === a.id}
              onClick={() => setAmbito(a.id)}
              className={ambito === a.id ? BOTON_ACTIVO : BOTON_SUAVE}
            >
              {ambito === a.id && <span aria-hidden="true">✓ </span>}
              {a.etiqueta}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          Persona de ejemplo
          <select
            value={estado.persona}
            onChange={(e) => {
              setAbierta(null);
              guardar(cambiarPersona(estado, e.target.value as PersonaId));
            }}
            className="rounded-lg border border-muted bg-surface px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            {(Object.keys(PERSONAS) as PersonaId[]).map((id) => (
              <option key={id} value={id}>
                {PERSONAS[id].nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="grid gap-3">
        {lista.map((d) => {
          const motivo = motivoSinVoto(d, estado.persona);
          const propio = estado.votos[d.id];
          const c = contar(d, propio);
          const idTitulo = `dec-${d.id}`;
          return (
            <li key={d.id} aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <h2 id={idTitulo} className="font-semibold">{d.titulo}</h2>
                  <p className="flex flex-wrap gap-2">
                    <span className={CHIP}>{d.donde}</span>
                    <span className={`${CHIP} border-deep text-deep`}>
                      {d.regla}
                      <TerminoLegal clave={d.base} />
                    </span>
                    {d.ambito === "tribu" && <span className={CHIP}>Tribu</span>}
                  </p>
                </div>
                <div className="text-right">
                  {motivo ? (
                    <span className={`${CHIP} text-muted`}>{motivo}</span>
                  ) : (
                    <button
                      type="button"
                      aria-expanded={abierta === d.id}
                      aria-controls={`votar-${d.id}`}
                      onClick={() => setAbierta(abierta === d.id ? null : d.id)}
                      className={BOTON_SUAVE}
                    >
                      {propio ? "Cambiar voto" : "Votar"}
                    </button>
                  )}
                </div>
              </div>

              {abierta === d.id && !motivo && (
                <div id={`votar-${d.id}`} role="group" aria-label={`Tu voto: ${d.titulo}`} className="flex flex-wrap gap-2">
                  {OPCIONES.map((o) => (
                    <button key={o.id} type="button" onClick={() => elegir(d.id, o.id)} className={BOTON_SUAVE}>
                      {o.etiqueta}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted">
                Votos de ejemplo: A favor {c.favor} · En contra {c.contra} · Abstención {c.abstencion}
              </p>
              {listo && propio && (
                <p role="status" className="rounded-lg border border-deep bg-green-soft px-3 py-2 text-sm text-deep">
                  <span aria-hidden="true">✓ </span>
                  Tu voto: {OPCIONES.find((o) => o.id === propio)!.etiqueta} (simulado)
                  <span className="block">
                    Acta (ejemplo): {persona.nombre} votó {OPCIONES.find((o) => o.id === propio)!.etiqueta.toLowerCase()} en
                    «{d.titulo}». Tu voto quedó registrado en el historial del acta (simulado).
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {listo && (
        <p className="text-sm text-muted">
          {persona.nombre}:{" "}
          {persona.residente ? "residente, vota en la Asamblea" : "no residente: participa en su tribu y ve las actas de la Asamblea"}
          {persona.beneficiaria
            ? " · beneficiario/a del fideicomiso, vota en su asamblea"
            : " · sin acceso a la asamblea del fideicomiso"}
          .
        </p>
      )}
    </div>
  );
}
