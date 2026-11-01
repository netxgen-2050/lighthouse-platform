"use client";

import { useMemo, useState } from "react";
import { decisionesDelHolon } from "@/lib/fogon/estado";
import { buscarNodo, nombreDe, type NodoH } from "@/lib/gobernanza/holarquia";
import { useTextos } from "@/lib/idioma/cliente";
import { LENTES } from "./gobernanza/lentes";
import { TarjetaDecision } from "./tarjeta-decision";
import type { FogonUsado } from "./usar-fogon";

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_ACTIVO = `${BOTON} border-deep bg-deep text-on-deep`;

export const ID_PROPUESTAS = "propuestas-del-holon";

type Props = { foco: NodoH; raiz: NodoH; lente: string; fogon: FogonUsado };

/**
 * "Propuestas en {holón}": las decisiones de ejemplo del holón enfocado en tres grupos. El padre le pone `key={foco.id}`
 * para que "Solo las de {holón}" vuelva a no presionado al cambiar de holón.
 */
export function PropuestasDelHolon({ foco, raiz, lente: lenteActual, fogon }: Props) {
  const t = useTextos("fogon");
  // La primera lente es la de siempre: no hace falta llevarla en la dirección.
  const lente = lenteActual === LENTES[0].id ? undefined : lenteActual;
  const [soloAca, setSoloAca] = useState(false);
  const nombre = nombreDe(foco);
  const { aca, pasa, adentro } = useMemo(() => decisionesDelHolon(raiz, foco.id, fogon.estado), [raiz, foco.id, fogon.estado]);
  const vacio = aca.length === 0 && pasa.length === 0 && adentro.length === 0;
  const nombreDeHolon = (id: string) => {
    const n = buscarNodo(raiz, id);
    return n ? nombreDe(n) : id;
  };

  return (
    <section id={ID_PROPUESTAS} aria-labelledby="propuestas-titulo" className="grid min-w-0 gap-3 rounded-xl border border-faint bg-surface p-4">
      <h2 id="propuestas-titulo" className="text-lg font-semibold">
        {t.propuestasEn("")}
        <span translate="no">{nombre}</span>
      </h2>

      {fogon.falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.errorAlmacenamiento}
        </p>
      )}

      {adentro.length > 0 && (
        <div>
          <button
            type="button"
            aria-pressed={soloAca}
            aria-controls={ID_PROPUESTAS}
            onClick={() => setSoloAca((v) => !v)}
            className={soloAca ? BOTON_ACTIVO : BOTON_SUAVE}
          >
            {soloAca && <span aria-hidden="true">✓ </span>}
            {t.soloLasDe("")}
            <span translate="no">{nombre}</span>
          </button>
        </div>
      )}

      {vacio ? (
        <p className="text-sm text-muted">
          {t.sinDecisiones("")}
          <span translate="no">{nombre}</span>
        </p>
      ) : (
        <>
          <div className="grid gap-2">
            <h3 className="font-semibold">{t.grupos.aca}</h3>
            {aca.length === 0 ? (
              <p className="text-sm text-muted">{t.sinEnGrupo}</p>
            ) : (
              <ul className="grid gap-3">
                {aca.map((d) => (
                  <TarjetaDecision key={d.id} decision={d} fogon={fogon} desde={foco.id} lente={lente} />
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-2">
            <h3 className="font-semibold">{t.grupos.pasa}</h3>
            {pasa.length === 0 ? (
              <p className="text-sm text-muted">{t.sinEnGrupo}</p>
            ) : (
              <ul className="grid gap-3">
                {pasa.map((d) => (
                  <TarjetaDecision
                    key={d.id}
                    decision={d}
                    fogon={fogon}
                    desde={foco.id}
                    lente={lente}
                    lugar={
                      <>
                        {t.seDecideEn("")}
                        <span translate="no">{nombreDeHolon(d.holonId)}</span>
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </div>

          {adentro.length > 0 && !soloAca && (
            <div className="grid gap-2">
              <h3 className="font-semibold">{t.grupos.adentro}</h3>
              <ul className="grid gap-3">
                {adentro.map((x) => (
                  <TarjetaDecision
                    key={x.decision.id}
                    decision={x.decision}
                    fogon={fogon}
                    desde={foco.id}
                    lente={lente}
                    lugar={
                      <>
                        {t.enCirculo("", null)}
                        <span translate="no">{x.tribu ? `${x.circulo} · ${x.tribu}` : x.circulo}</span>
                      </>
                    }
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p role="status" className="sr-only">
        {fogon.anuncio}
      </p>
    </section>
  );
}
