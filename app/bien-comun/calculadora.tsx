"use client";

import { useId, useState } from "react";
import { enteroEn, faroEn, usdConDecimales } from "@/lib/bien-comun/formato";
import { MONTO_MINIMO_USD, cotizar } from "@/lib/bien-comun/modelo";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";

// Calculadora de la venta temprana por tramos (bien-comun-tokens, design §2 punto 6). Sin estado guardado: ni en el navegador
// ni en el servidor. No hay botón de compra. El resultado sale de `cotizar` y se anuncia con una región `aria-live="polite"`.

const CAMPO =
  "w-full max-w-xs rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function Calculadora() {
  const idioma = useIdioma();
  const t = useTextos("biencomun").tramos.calculadora;
  const idCampo = useId();
  const idAyuda = useId();
  const [monto, setMonto] = useState("");

  const vacio = monto.trim() === "";
  const c = vacio ? null : cotizar(Number(monto));
  const minimo = usdConDecimales(MONTO_MINIMO_USD, idioma, 0);

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <label htmlFor={idCampo} className="text-sm font-medium">
          {t.campo}
        </label>
        <input
          id={idCampo}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={monto}
          aria-describedby={idAyuda}
          onChange={(e) => setMonto(e.target.value)}
          className={CAMPO}
        />
        <p id={idAyuda} className="text-sm text-muted">
          {t.ayuda(minimo)}
        </p>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="grid gap-1 rounded-lg bg-surface-2 p-3 text-sm">
        <p className="font-medium">{t.resultado}</p>
        {c === null ? (
          <p>{t.vacio}</p>
        ) : !c.ok ? (
          <p>{c.motivo === "monto-minimo" ? t.minimo(minimo) : t.invalido}</p>
        ) : (
          <>
            <p>{t.recibirias(faroEn(c.faro, idioma))}</p>
            <p>{t.promedio(usdConDecimales(c.precioPromedio, idioma, 3))}</p>
            <p>{t.tocas(c.tramos.map((i) => enteroEn(i + 1, idioma)).join(", "))}</p>
            <p>{t.tesoro(usdConDecimales(c.aporteAlTesoro, idioma, 2))}</p>
            {c.sobrante > 0 && <p>{t.sobrante(usdConDecimales(c.sobrante, idioma, 2))}</p>}
          </>
        )}
      </div>

      <p className="text-sm font-medium">{t.noSePuede}</p>
    </div>
  );
}
