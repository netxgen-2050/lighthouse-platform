"use client";

import { TerminoLegal } from "@/components/termino-legal";
import { CAMINOS, caminoDe, caminoEnArbol } from "@/lib/gobernanza/caminos";
import { buscarNodo } from "@/lib/gobernanza/holarquia";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { ParametrosDecision } from "../../parametros-decision";
import { BOTON_LINEA } from "../panel-nodo";
import type { PropsPanel } from "./tipos";

/** Panel de la lente Decisiones que suben: la lista de decisiones de ejemplo y, de la elegida, su camino y sus parámetros. */
export function PanelDecisiones({ ctx, decisiones, elegirDecision }: PropsPanel) {
  const idioma = useIdioma();
  const tx = useTextos("gobernanza");
  const t = tx.decisiones;
  const elegida = ctx.decision;
  const camino = elegida ? caminoDe(elegida) : null;
  const ids = camino ? caminoEnArbol(ctx.raiz, camino.camino) : [];
  const nombres = ids.map((id) => {
    const n = buscarNodo(ctx.raiz, id);
    return n && "nombre" in n ? n.nombre : id;
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h3 className="text-xl font-semibold">{t.titulo}</h3>
        <p className="text-sm">{t.intro}</p>
      </div>
      <ul aria-label={t.lista} className="grid gap-2">
        {decisiones.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              aria-pressed={elegida?.id === d.id}
              onClick={() => elegirDecision(elegida?.id === d.id ? null : d.id)}
              className={`${BOTON_LINEA} w-full ${elegida?.id === d.id ? "border-deep bg-green-soft" : ""}`}
            >
              {elegida?.id === d.id && <span aria-hidden="true">✓ </span>}
              {textoEn(d.titulo, idioma)}
            </button>
          </li>
        ))}
      </ul>

      {!elegida && <p className="text-sm text-muted">{t.ninguna}</p>}

      {elegida && (
        <section aria-labelledby="decision-elegida" className="grid gap-3 rounded-lg border border-faint p-3">
          <h4 id="decision-elegida" className="font-semibold">{textoEn(elegida.titulo, idioma)}</h4>
          {camino ? (
            <>
              <div>
                <p className="text-sm font-medium">
                  {t.camino}
                  <TerminoLegal clave="consejo" />
                </p>
                <ol className="mt-1 flex flex-wrap items-center gap-x-2 text-sm" data-testid="camino-texto">
                  {nombres.map((nombre, i) => (
                    <li key={`${ids[i]}-${i}`} translate="no">
                      {t.paso(i + 1, nombre)}
                      {i < nombres.length - 1 && <span aria-hidden="true"> ›</span>}
                    </li>
                  ))}
                </ol>
              </div>
              <p className="text-sm">
                <span className="font-medium">{t.tipo[camino.tipo]}.</span> {t.explicacion[camino.tipo]}
              </p>
              {elegida.origen && !CAMINOS.some((c) => c.decisionId === elegida.id) && (
                <p className="text-sm text-muted">{t.copiaConsejo}</p>
              )}
              <p className="text-xs text-muted">{t.aviso}</p>
            </>
          ) : (
            <p className="text-sm">{t.sinCamino}</p>
          )}
          <ParametrosDecision decision={elegida} />
        </section>
      )}
    </div>
  );
}
