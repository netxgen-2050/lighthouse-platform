"use client";

import type { Decision } from "@/lib/fogon/datos";
import { formatearFechaCierre, formatearMonto } from "@/lib/fogon/parametros";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";

/**
 * Los parámetros opcionales de una decisión: cada fila aparece solo si el dato existe. Un monto sin cifra dice "sin dato"
 * (nunca 0) y lleva "(simulado)". Nada de esto va en el mapa de la gobernanza.
 */
export function ParametrosDecision({ decision }: { decision: Pick<Decision, "id" | "plazo" | "acuerdo" | "monto"> }) {
  const idioma = useIdioma();
  const t = useTextos("fogon").parametros;
  const { plazo, acuerdo, monto } = decision;
  if (!plazo && !acuerdo && !monto) return null;

  const fecha = plazo ? (formatearFechaCierre(plazo.cierra, idioma) ?? t.sinDato) : null;
  const cifra = monto ? formatearMonto(monto.cantidad, idioma) : null;

  return (
    <div data-testid={`parametros-${decision.id}`} className="grid gap-1 rounded-lg border border-faint px-3 py-2 text-sm">
      <dl className="grid gap-1">
        {plazo && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">{t.cierra}</dt>{" "}
            <dd>{fecha}</dd>
          </div>
        )}
        {acuerdo && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">{t.acuerdo}</dt>{" "}
            <dd>
              {t[acuerdo.tipo]}: {textoEn(acuerdo.nombre, idioma)}
            </dd>
          </div>
        )}
        {monto && (
          <>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">{t.monto}</dt>{" "}
              <dd>
                {cifra ?? t.sinDato}
                {cifra !== null && ` ${t.simulado}`}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">{t.fuente}</dt>{" "}
              <dd>{t.fuentes[monto.fuente]}</dd>
            </div>
          </>
        )}
      </dl>
      {monto && <p className="text-xs text-muted">{t.aviso}</p>}
    </div>
  );
}
