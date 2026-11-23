"use client";

import { buscarNodo, caminoHasta, type NodoContenedor } from "@/lib/gobernanza/holarquia";
import { RolesDePersona, textoDeCamino, useEtiquetas, BOTON_LINEA } from "../panel-nodo";
import type { PropsPanel } from "./tipos";

/** Panel de la lente Desde mí: dónde participa la persona, en varios niveles. Solo lee; no escribe nada. */
export function PanelDesdeMi({ ctx, enfocar, seleccionar }: PropsPanel) {
  const { tx, nombreRol } = useEtiquetas();
  const t = tx.desdeMi;
  const sel = ctx.seleccion ? buscarNodo(ctx.raiz, ctx.seleccion) : null;
  const persona = sel?.tipo === "rol" ? sel : null;

  const lugares = ctx.mios.flatMap((m) => {
    const nodo = buscarNodo(ctx.raiz, m.nodoId);
    if (!nodo || !("decide" in nodo)) return [];
    return [{ m, nodo: nodo as NodoContenedor, camino: caminoHasta(ctx.raiz, m.nodoId) }];
  });

  return (
    <div className="grid gap-4">
      {persona && (
        <RolesDePersona raiz={ctx.raiz} personaId={persona.personaId} nombre={persona.persona} enfocar={enfocar} seleccionar={seleccionar} />
      )}
      <div className="grid gap-1">
        <h3 className="text-xl font-semibold">{t.titulo}</h3>
        <p className="text-sm">{t.intro}</p>
      </div>
      <ul className="grid gap-3">
        {lugares.map(({ m, nodo, camino }) => (
          <li key={`${m.nodoId}-${m.rol}`} className="grid gap-1 rounded-lg border border-faint p-3 text-sm">
            <span className="font-semibold" translate="no">
              {nodo.nombre} {m.ejemplo && <span className="font-normal text-muted">{tx.panel.ejemplo}</span>}
            </span>
            <span className="text-muted" translate="no">{textoDeCamino(camino)}</span>
            <span>
              {t.tuRol} {nombreRol(m.rol)}
              {!m.ejemplo && <span className="text-muted"> · {t.delNavegador}</span>}
            </span>
            <span>
              {t.decideSobre} {nodo.decide.length > 0 ? nodo.decide.join(", ") : tx.panel.sinDato}
            </span>
            <button type="button" onClick={() => enfocar(m.nodoId)} className={`${BOTON_LINEA} justify-self-start`}>
              {t.irA}
            </button>
          </li>
        ))}
      </ul>
      <section aria-labelledby="ideas" className="rounded-lg border border-dashed border-faint p-3">
        <h4 id="ideas" className="text-sm font-semibold">{t.ideas.titulo}</h4>
        <p className="mt-1 text-sm">{t.ideas.texto}</p>
      </section>
    </div>
  );
}
