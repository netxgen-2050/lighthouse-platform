"use client";

import { useId, useState } from "react";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { ESCENARIOS_COSTO, cobertura, type IdEscenario } from "@/lib/lotes/escenarios";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

// Calculadora del costo anual del bien común, la expensa y la cantidad de lotes (modelo-hibrido-procomun, design §4 punto 5).
// No guarda nada: ni en el navegador ni en el servidor. Los valores de partida salen de los escenarios y del módulo.

const CAMPO =
  "w-full max-w-xs rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Props = { expensaInicial: number; lotesIniciales: number };

export function Calculadora({ expensaInicial, lotesIniciales }: Props) {
  const idioma = useIdioma();
  const t = useTextos("hibrido");
  const grupo = useId();
  const idCosto = useId();
  const idExpensa = useId();
  const idLotes = useId();
  const [costo, setCosto] = useState(String(ESCENARIOS_COSTO[0].costoAnual));
  const [expensa, setExpensa] = useState(String(expensaInicial));
  const [lotes, setLotes] = useState(String(lotesIniciales));

  function elegir(id: IdEscenario) {
    const e = ESCENARIOS_COSTO.find((x) => x.id === id);
    if (e) setCosto(String(e.costoAnual));
  }

  const numLotes = lotes.trim() === "" ? Number.NaN : Number(lotes);
  const c =
    Number.isInteger(numLotes) && costo.trim() !== "" && expensa.trim() !== ""
      ? cobertura({ costoAnual: Number(costo), expensa: Number(expensa), lotes: numLotes })
      : null;

  return (
    <div className="grid gap-3">
      <fieldset className="grid gap-1">
        <legend className="font-medium">{t.calculadora.escenario}</legend>
        {ESCENARIOS_COSTO.map((e) => (
          <label key={e.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${grupo}-escenario`}
              value={e.id}
              // Marcado solo mientras el costo del campo es el del escenario: al editarlo a mano, ninguno queda marcado.
              checked={costo.trim() !== "" && Number(costo) === e.costoAnual}
              onChange={() => elegir(e.id)}
              className="size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            />
            <span>
              {idioma === "en" ? e.nombre.en : e.nombre.es} · {t.alcanza.costoAnual(usdEn(e.costoAnual, idioma))}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1">
          <label htmlFor={idCosto} className="text-sm font-medium">
            {t.calculadora.costo}
          </label>
          <input
            id={idCosto}
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            className={CAMPO}
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor={idExpensa} className="text-sm font-medium">
            {t.calculadora.expensa}
          </label>
          <input
            id={idExpensa}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={expensa}
            onChange={(e) => setExpensa(e.target.value)}
            className={CAMPO}
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor={idLotes} className="text-sm font-medium">
            {t.calculadora.lotes}
          </label>
          <input
            id={idLotes}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={lotes}
            onChange={(e) => setLotes(e.target.value)}
            className={CAMPO}
          />
        </div>
      </div>

      {/* Se anuncia el resultado cada vez que cambia. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="grid gap-1 rounded-lg bg-surface-2 p-3 text-sm">
        <p className="font-medium">{t.calculadora.resultado}</p>
        {c === null ? (
          <p>{t.alcanza.sinDato}</p>
        ) : (
          <>
            <p>{t.calculadora.cubreVenta(usdEn(c.duranteLaVenta, idioma), porcentajeEn(c.fraccionDuranteLaVenta, idioma))}</p>
            <p>{t.calculadora.cubreDespues(usdEn(c.despues, idioma), porcentajeEn(c.fraccionDespues, idioma))}</p>
            {c.fraccionDespues < 1 && <p>{t.alcanza.resto}</p>}
          </>
        )}
      </div>
    </div>
  );
}
