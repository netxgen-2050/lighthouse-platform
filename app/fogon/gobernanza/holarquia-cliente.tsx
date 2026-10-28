"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { leer as leerFogon } from "@/lib/fogon/estado";
import { decisionesDeLaLente } from "@/lib/gobernanza/caminos";
import {
  buscarNodo,
  caminoHasta,
  hijosDe,
  lugaresMios,
  recorrer,
  type LugarMio,
  type NodoH,
} from "@/lib/gobernanza/holarquia";
import { leyendaDe, marcasDe, pinturasDe, resolverTexto, type ContextoLente } from "@/lib/gobernanza/lentes";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { leerMembresiaDelNavegador } from "@/lib/membresia/estado";
import { leerEstadoGuardado } from "@/lib/sesion/nivel";
import { Arbol } from "./arbol";
import { Dibujo } from "./dibujo";
import { LENTES } from "./lentes";
import type { Lente } from "./lentes/tipos";
import { Leyenda } from "./leyenda";

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_ACTIVO = `${BOTON} border-deep bg-deep text-on-deep`;

type Props = { raiz: NodoH; lentes?: readonly Lente[] };

/** La holarquía: lentes, migas, dibujo con zoom, leyenda, panel de detalle y la estructura como lista. */
export function HolarquiaCliente({ raiz, lentes = LENTES }: Props) {
  const idioma = useIdioma();
  const tx = useTextos("gobernanza");
  const [focoId, setFocoId] = useState(raiz.id);
  const [lenteId, setLenteId] = useState(lentes[0].id);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  // Lo que el navegador ya sabe: se lee una sola vez, después de montar. No se escribe nada.
  const [mios, setMios] = useState<readonly LugarMio[]>(() => lugaresMios({}, null));
  const [alConsejo, setAlConsejo] = useState<readonly string[]>([]);

  useEffect(() => {
    try {
      const sumarte = leerEstadoGuardado(window.localStorage);
      const tribuLider = sumarte.tribu ? sumarte.tribuId : null;
      const tribus = hijosDe(raiz).filter((h) => h.tipo === "tribu").map((h) => h.id);
      setMios(lugaresMios(leerMembresiaDelNavegador(), tribuLider, tribus));
      setAlConsejo(leerFogon(window.localStorage.getItem(CLAVES.fogon)).alConsejo);
    } catch {
      // Sin almacenamiento: quedan los dos roles de ejemplo y las decisiones de ejemplo.
    }
  }, [raiz]);

  const foco = buscarNodo(raiz, focoId) ?? raiz;
  const lente = lentes.find((l) => l.id === lenteId) ?? lentes[0];
  const decisiones = useMemo(() => decisionesDeLaLente(alConsejo), [alConsejo]);
  const decision = decisiones.find((d) => d.id === decisionId) ?? null;

  const ctx = useMemo<ContextoLente>(
    () => ({ raiz, foco, seleccion, idioma, decision, mios }),
    [raiz, foco, seleccion, idioma, decision, mios],
  );
  const nodos = useMemo(() => {
    const salida: NodoH[] = [];
    recorrer(raiz, (n) => salida.push(n));
    return salida;
  }, [raiz]);
  const pinturas = useMemo(() => pinturasDe(lentes, lenteId, nodos, ctx), [lentes, lenteId, nodos, ctx]);
  const marcas = useMemo(() => marcasDe(lentes, lenteId, ctx), [lentes, lenteId, ctx]);
  const leyenda = useMemo(() => leyendaDe(lentes, lenteId, ctx), [lentes, lenteId, ctx]);

  const sel = seleccion ? buscarNodo(raiz, seleccion) : null;
  const personaId = sel?.tipo === "rol" ? sel.personaId : null;

  // Entrar a un lugar: una persona elegida sigue elegida; cualquier otra elección se limpia.
  const enfocar = useCallback(
    (id: string) => {
      setFocoId(id);
      setSeleccion((s) => (s && buscarNodo(raiz, s)?.tipo === "rol" ? s : null));
    },
    [raiz],
  );
  const salir = useCallback(() => {
    const camino = caminoHasta(raiz, focoId);
    if (camino.length > 1) enfocar(camino[camino.length - 2].id);
  }, [raiz, focoId, enfocar]);
  const elegirPersona = useCallback(
    (circuloId: string, rolId: string) => {
      setFocoId(circuloId);
      setSeleccion(rolId);
    },
    [],
  );
  const elegirDecision = useCallback(
    (id: string | null) => {
      setDecisionId(id);
      // El camino de una decisión cruza varios niveles: se vuelve al común para verlo entero.
      if (id) setFocoId(raiz.id);
    },
    [raiz],
  );

  const migas = caminoHasta(raiz, foco.id);
  const Panel = lente.panel;

  return (
    <div className="grid gap-5">
      <div role="group" aria-label={tx.lentes.barra} className="flex flex-wrap gap-2">
        {lentes.map((l) => {
          const activa = l.id === lenteId;
          return (
            <button key={l.id} type="button" aria-pressed={activa} onClick={() => setLenteId(l.id)} className={activa ? BOTON_ACTIVO : BOTON_SUAVE}>
              {activa && <span aria-hidden="true">✓ </span>}
              {resolverTexto(tx, l.nombre) ?? l.id}
            </button>
          );
        })}
      </div>

      <nav aria-label={tx.migas.aria}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {migas.map((n, i) => {
            const ultima = i === migas.length - 1;
            const nombre = "nombre" in n ? n.nombre : n.id;
            return (
              <li key={n.id} className="flex items-center gap-2">
                {ultima ? (
                  <span aria-current="location" className="font-semibold" translate="no">
                    {nombre}
                  </span>
                ) : (
                  <button type="button" onClick={() => enfocar(n.id)} className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" translate="no">
                    {nombre}
                  </button>
                )}
                {!ultima && <span aria-hidden="true">›</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-6 min-[860px]:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)]">
        <div className="grid min-w-0 gap-3">
          <h2 className="text-lg font-semibold">{tx.dibujo.titulo}</h2>
          <Dibujo
            raiz={raiz}
            foco={foco}
            pinturas={pinturas}
            marcas={marcas}
            personaId={personaId}
            onEnfocar={enfocar}
            onSeleccionar={setSeleccion}
            onSalir={salir}
          />
          <p className="text-sm text-muted">{tx.dibujo.ayuda}</p>
          <Leyenda entradas={leyenda} />
        </div>

        <section aria-labelledby="panel-titulo" aria-live="polite" className="min-w-0 rounded-xl border border-faint bg-surface p-4">
          <h2 id="panel-titulo" className="mb-3 text-lg font-semibold">
            {tx.panel.titulo}
          </h2>
          <Panel ctx={ctx} enfocar={enfocar} seleccionar={setSeleccion} decisiones={decisiones} elegirDecision={elegirDecision} />
        </section>
      </div>

      <Arbol raiz={raiz} enfocar={enfocar} elegirPersona={elegirPersona} />
    </div>
  );
}
