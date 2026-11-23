import type { ReactNode } from "react";
import type { FaroDelPlan, PlanDeLote } from "@/lib/bien-comun/modelo";

// Tarjeta "Plan en cuotas · Token Tierra (simulado)" (spec lote-token-tierra). Recibe datos y textos por props: no calcula
// nada ni escribe un número. Todo es simulación: no hay cobro, contrato ni emisión.

export type TextosPlan = {
  titulo: string;
  leyenda: string;
  contado: string;
  cuotas: (n: number) => string;
  soloLote: string;
  casaAparte: string;
  sinPrecio: string;
  pagoUnico: string;
  anticipo: string;
  cuota: string;
  ultimaCuota: (monto: string) => string;
  faroAnticipo: string;
  faroPagoUnico: string;
  faroCuota: string;
  faroTotal: string;
  faroUltima: (faro: string) => string;
  abandono: string;
  interes: string;
  aviso: string;
};

type Props = {
  /** Identificador único del grupo de radios. */
  nombre: string;
  textos: TextosPlan;
  opciones: readonly number[];
  elegida: number;
  alElegir: (cuotas: number) => void;
  /** Con una compra simulada hecha, el plan queda fijo, igual que la casa. */
  deshabilitado: boolean;
  plan: PlanDeLote | null;
  faro: FaroDelPlan | null;
  usd: (n: number | null) => string;
  faroTexto: (n: number | null) => string;
  sinDato: string;
  conCasa: boolean;
  /** Los ⚖ de Token Tierra y de la Ordenanza 173, ya armados por quien llama. */
  terminoTierra: ReactNode;
  terminoOrdenanza: ReactNode;
  /** Enlace a la propuesta del bien común. */
  enlace: ReactNode;
};

const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";

export function PlanTokenTierra({
  nombre,
  textos: t,
  opciones,
  elegida,
  alElegir,
  deshabilitado,
  plan,
  faro,
  usd,
  faroTexto,
  sinDato,
  conCasa,
  terminoTierra,
  terminoOrdenanza,
  enlace,
}: Props) {
  const contado = elegida === 0;
  const hayUltima = (plan?.ultimaCuota ?? null) !== null && plan?.ultimaCuota !== plan?.cuota;
  const hayFaroUltima = (faro?.ultimaCuota ?? null) !== null && faro?.ultimaCuota !== faro?.porCuota;
  return (
    <section aria-labelledby="ficha-plan" className={TARJETA}>
      <h2 id="ficha-plan" className="text-lg font-semibold">
        {t.titulo}
        {terminoTierra}
      </h2>
      <fieldset className="grid gap-2" disabled={deshabilitado}>
        <legend className="font-medium">{t.leyenda}</legend>
        {opciones.map((n) => (
          <label key={n} className="flex items-center gap-2">
            <input
              type="radio"
              name={`${nombre}-plan`}
              value={n}
              checked={elegida === n}
              onChange={() => alElegir(n)}
              className="size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            />
            <span>{n === 0 ? t.contado : t.cuotas(n)}</span>
          </label>
        ))}
      </fieldset>
      <p className="text-sm">{conCasa ? t.casaAparte : t.soloLote}</p>
      {plan === null ? (
        <p className="text-sm font-medium">{t.sinPrecio}</p>
      ) : (
        <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          <dt className="font-semibold">{contado ? t.pagoUnico : t.anticipo}</dt>
          <dd>{usd(plan.anticipo)}</dd>
          {!contado && (
            <>
              <dt className="font-semibold">{t.cuota}</dt>
              <dd>{usd(plan.cuota)}</dd>
            </>
          )}
          <dt className="font-semibold">{contado ? t.faroPagoUnico : t.faroAnticipo}</dt>
          <dd>{faroTexto(faro?.anticipo ?? null)}</dd>
          {!contado && (
            <>
              <dt className="font-semibold">{t.faroCuota}</dt>
              <dd>{faroTexto(faro?.porCuota ?? null)}</dd>
            </>
          )}
          <dt className="font-semibold">{t.faroTotal}</dt>
          <dd>{faroTexto(faro?.total ?? null)}</dd>
        </dl>
      )}
      {plan !== null && !contado && (hayUltima || hayFaroUltima) && (
        <p className="text-sm text-muted">
          {hayUltima && plan.ultimaCuota !== null && <>{t.ultimaCuota(usd(plan.ultimaCuota))} </>}
          {hayFaroUltima && faro?.ultimaCuota != null && t.faroUltima(faroTexto(faro.ultimaCuota))}
        </p>
      )}
      {!contado && <p className="text-sm">{t.abandono}</p>}
      <p className="text-sm">
        {t.interes} {sinDato}.
      </p>
      <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {t.aviso}
        {terminoOrdenanza}
      </p>
      <p className="text-sm">{enlace}</p>
    </section>
  );
}
