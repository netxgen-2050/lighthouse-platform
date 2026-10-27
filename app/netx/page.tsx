import type { Metadata } from "next";
import { BarrasReparto } from "@/components/barras-reparto";
import { TerminoLegal } from "@/components/termino-legal";
import { SUPUESTO_CONGRESO, VERSIONES } from "@/lib/financiamiento/fuentes";
import { JUEGO_A, JUEGO_B, PROCOMUN_EN_SIMPLE } from "@/lib/financiamiento/juegos";
import { PALANCAS, type IdPalanca } from "@/lib/financiamiento/palancas";
import { usdMillones } from "@/lib/financiamiento/pista";
import { armarResumen } from "@/lib/financiamiento/resumen";
import { FUTUROS_SIMULADOS } from "@/lib/financiamiento/riesgo";
import { TERMINOS } from "@/lib/legal/terminos";
import { VERSION_MODELO } from "@/lib/series/escenarios";
import { SIN_DATO, multiplo, numero, pct, usd } from "@/lib/series/formato";

export const metadata: Metadata = { title: "Vista NetX · Resumen" };

const CARTA = "rounded-xl border border-faint bg-surface p-4";
const A_CONFIRMAR = "a confirmar con Vagner";
const PARA_DISCUTIR = "para discutir, no es una decisión";

/** Porcentaje con signo menos tipográfico: −2,6 %. */
function pctRango(fraccion: number): string {
  return pct(fraccion).replace("-", "−");
}

function pctEntero(fraccion: number): string {
  return `${Math.round(fraccion * 100)} %`;
}

function Palanca({ id }: { id: IdPalanca }) {
  const p = PALANCAS.find((x) => x.id === id);
  if (!p) return null;
  return (
    <div className="mt-2 rounded-lg bg-surface-2 p-3 text-sm">
      <p>
        <strong>Palanca:</strong> {p.direccion}
      </p>
      <p className="mt-1 text-muted">
        Fuente: {p.fuente} · {PARA_DISCUTIR}
      </p>
    </div>
  );
}

export default function ResumenPage() {
  const r = armarResumen();
  const repartoDe = (serie: "vinedo" | "agrovoltaica") => (destino: string) =>
    r.reparto[serie].find((x) => x.destino === destino)?.monto ?? null;
  const vin = repartoDe("vinedo");
  const agro = repartoDe("agrovoltaica");
  const destinos: { id: string; etiqueta: string }[] = [
    { id: "procomun", etiqueta: "Procomún" },
    { id: "netx", etiqueta: "NetX" },
    { id: "unidades", etiqueta: "Unidades de Regeneración" },
    { id: "primeraPerdida", etiqueta: "Primera pérdida" },
    { id: "notas", etiqueta: "Notas Verdes" },
  ];
  const grupos = [
    { id: "vinedo", etiqueta: "Viñedo · 10 ha", items: destinos.map((d) => ({ ...d, valor: vin(d.id) })) },
    { id: "agrovoltaica", etiqueta: "Agrovoltaica · 5 MW", items: destinos.map((d) => ({ ...d, valor: agro(d.id) })) },
  ];
  const mp = r.netx.plataformaMes36;
  const pase = r.procomun.pase;
  const desarrollo = r.netx.desarrolloAgrovoltaica;
  const sinContrato = `${SIN_DATO} (a cotizar)`;

  return (
    <div>
      <p className="text-sm font-medium text-muted">Vista NetX · para el equipo de NetXGen</p>
      <h1 className="text-3xl font-semibold">¿Cómo se financia NetX sin vender lotes?</h1>

      <p className="mt-3 mb-4 max-w-3xl rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {TERMINOS.avisosimulador.texto}
      </p>

      <p className="mb-6 max-w-3xl text-lg">
        NetX es la empresa que diseña, gestiona y opera la plataforma. Cobra por su trabajo, no por vender tierra: en el
        Juego B, la tierra queda en una Fundación y la plata de los proyectos entra por series{" "}
        <TerminoLegal clave="serieprograma" /> del programa de fideicomisos.
      </p>

      <section aria-labelledby="t-juegos" className="mb-6">
        <h2 id="t-juegos" className="mb-3 text-xl font-semibold">
          Dos juegos
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={CARTA}>
            <h3 className="text-lg font-semibold">{JUEGO_A.titulo}</h3>
            <p className="mt-1">{JUEGO_A.idea}</p>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {JUEGO_A.costos.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              Qué dice la Ordenanza 173 <TerminoLegal clave="ordenanza173" />
            </p>
          </div>
          <div className={CARTA}>
            <h3 className="text-lg font-semibold">{JUEGO_B.titulo}</h3>
            <p className="mt-1">{JUEGO_B.idea}</p>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {JUEGO_B.suma.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{PROCOMUN_EN_SIMPLE}</p>
      </section>

      <section aria-labelledby="t-bolsillos" className="mb-6">
        <h2 id="t-bolsillos" className="mb-3 text-xl font-semibold">
          Tres bolsillos que nunca se mezclan
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <section aria-labelledby="t-netx" className={CARTA}>
            <h3 id="t-netx" className="mb-2 text-lg font-semibold">
              NetX · la empresa
            </h3>
            <ul className="grid gap-2 text-sm">
              <li>
                Ahora · SAFE de la empresa <TerminoLegal clave="safe" />: {usd(r.netx.safe.min)} a{" "}
                {numero(r.netx.safe.max)} (meta) · {A_CONFIRMAR}
              </li>
              <li>Ahora · contrato de diseño con BioPueblo: {sinContrato}</li>
              <li>
                2027–2028 · comisión de desarrollo: 3 a 5 % del capex, una vez (agrovoltaica:{" "}
                {desarrollo ? `${usd(desarrollo.min)} a ${numero(desarrollo.max)}` : SIN_DATO})
              </li>
              <li>
                Por año · comisión de gestión: {usd(r.netx.gestionAnual.vinedo)} (viñedo) ·{" "}
                {usd(r.netx.gestionAnual.agrovoltaica)} (agrovoltaica)
              </li>
              <li>
                Membresías y Plan Tribu: {usd(mp.base.ingreso)} por mes al mes 36 (escenario base). {SUPUESTO_CONGRESO}
              </li>
            </ul>
          </section>

          <section aria-labelledby="t-procomun" className={CARTA}>
            <h3 id="t-procomun" className="mb-2 text-lg font-semibold">
              Procomún · Fundación
            </h3>
            <ul className="grid gap-2 text-sm">
              <li>Viñedo: {usd(r.procomun.vinedo.total)} en {r.procomun.vinedo.anios} años</li>
              <li>
                Agrovoltaica: {usd(r.procomun.agrovoltaica.total)} en {r.procomun.agrovoltaica.anios} años (canon, regalía
                y excedente sobre el tope; cobra antes que cualquier inversor)
              </li>
              <li>
                Pase Fundador <TerminoLegal clave="pasefundador" />: {usd(pase.bajo.recaudado)} · {numero(pase.base.recaudado)}{" "}
                · {numero(pase.bueno.recaudado)} (bajo · base · bueno) — va al procomún, no a NetX
                {pase.bajo.alcanzaMinimo ? "" : "; el escenario bajo no llega al mínimo de USD 75.000"}. {SUPUESTO_CONGRESO}
              </li>
            </ul>
          </section>

          <section aria-labelledby="t-inversores" className={CARTA}>
            <h3 id="t-inversores" className="mb-2 text-lg font-semibold">
              Inversores de las series
            </h3>
            <ul className="grid gap-2 text-sm">
              <li>
                Unidades de Regeneración <TerminoLegal clave="unidadesregeneracion" /> del viñedo:{" "}
                {multiplo(r.inversores.vinedo.multiplo)} · TIR {pct(r.inversores.vinedo.tir)} en {r.inversores.vinedo.anios}{" "}
                años
              </li>
              <li>
                De la agrovoltaica: {multiplo(r.inversores.agrovoltaica.multiplo)} · TIR {pct(r.inversores.agrovoltaica.tir)} en{" "}
                {r.inversores.agrovoltaica.anios} años
              </li>
              <li>
                Notas Verdes <TerminoLegal clave="notasverdes" />: TIR {pct(r.inversores.agrovoltaica.notasTir)}
              </li>
              <li>
                Primera pérdida <TerminoLegal clave="primeraperdida" />: TIR {pct(r.inversores.primeraPerdidaTir.vinedo)}{" "}
                (viñedo) · {pct(r.inversores.primeraPerdidaTir.agrovoltaica)} (agrovoltaica)
              </li>
            </ul>
            <p className="mt-2 text-sm text-muted">Supuestos del modelo {A_CONFIRMAR}.</p>
          </section>
        </div>
      </section>

      <section aria-labelledby="t-grafico" className={`mb-6 ${CARTA}`}>
        <h2 id="t-grafico" className="mb-3 text-xl font-semibold">
          ¿Adónde va lo que paga cada serie?
        </h2>
        <BarrasReparto titulo="¿Adónde va lo que paga cada serie? (valores de partida)" grupos={grupos} formatoValor={usd} />
      </section>

      <section aria-labelledby="t-riesgo" className="mb-6">
        <h2 id="t-riesgo" className="mb-3 text-xl font-semibold">
          ¿Y si sale peor?
        </h2>
        <ul className="grid gap-2">
          {(["vinedo", "agrovoltaica"] as const).map((s) => (
            <li key={s} className={CARTA}>
              <strong>{s === "vinedo" ? "Viñedo" : "Agrovoltaica"}:</strong> TIR de las Unidades en{" "}
              {numero(FUTUROS_SIMULADOS)} futuros simulados: {pctRango(r.riesgo[s].p10)} · {pctRango(r.riesgo[s].p50)} ·{" "}
              {pctRango(r.riesgo[s].p90)} (P10 · P50 · P90) · {pctEntero(r.riesgo[s].pPierden)} de los futuros pierden plata
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Son futuros simulados con heladas, demoras y precios inciertos, no un pronóstico.
        </p>
      </section>

      <section aria-labelledby="t-cierto" className="mb-6">
        <h2 id="t-cierto" className="mb-2 text-xl font-semibold">
          Lo que tiene que ser cierto
        </h2>
        <p className="mb-3 max-w-3xl text-muted">
          Estos números no ayudan al relato y se muestran igual. Estamos a tiempo de cambiar los supuestos del diseño: al lado
          de cada uno va la palanca que lo movería.
        </p>
        <ol className="grid gap-3">
          <li className={CARTA}>
            <p>
              El equipo consume {usd(r.pista.consumoMensual)} por mes ({usd(r.pista.consumoAnual)} por año) · {A_CONFIRMAR}.
              Para pagarlo solo con comisiones de gestión hacen falta {usdMillones(r.incomodos.capital15)} bajo gestión al 1,5
              % o {usdMillones(r.incomodos.capital10)} al 1 %. Hasta llegar ahí, NetX vive del SAFE, los contratos de diseño
              y las comisiones de desarrollo.
            </p>
            <Palanca id="capital" />
          </li>
          <li className={CARTA}>
            <p>
              Las membresías cubren {pct(r.incomodos.membresiasPct.bajo)} · {pct(r.incomodos.membresiasPct.base)} ·{" "}
              {pct(r.incomodos.membresiasPct.bueno)} del consumo al mes 36 (bajo · base · bueno): la plataforma vale por lo
              que trae (miembros, inversores, tribus) y por lo que se puede licenciar, no por sus suscripciones.{" "}
              {SUPUESTO_CONGRESO}
            </p>
            <Palanca id="membresias" />
          </li>
          <li className={CARTA}>
            <p>
              La primera pérdida <TerminoLegal clave="primeraperdida" /> no se recupera completa en el{" "}
              {pctEntero(r.incomodos.primeraNoRecupera.vinedo)} (viñedo) y el{" "}
              {pctEntero(r.incomodos.primeraNoRecupera.agrovoltaica)} (agrovoltaica) de los futuros simulados.
            </p>
            <Palanca id="primeraPerdida" />
          </li>
          <li className={CARTA}>
            <p>
              El contrato de diseño con BioPueblo, que es el puente que no necesita aprobaciones, está {sinContrato}.
            </p>
            <Palanca id="contratoDiseno" />
          </li>
        </ol>
      </section>

      <section aria-labelledby="t-lotes" className={`mb-6 ${CARTA}`}>
        <h2 id="t-lotes" className="mb-2 text-xl font-semibold">
          ¿Y vender lotes?
        </h2>
        <ul className="grid list-disc gap-1 pl-5">
          <li>
            No se puede: antes de la aprobación municipal no se ofrecen, reservan ni prometen lotes{" "}
            <TerminoLegal clave="ordenanza173" />.
          </li>
          <li>No hace falta: la plata entra por las series y por el trabajo de NetX.</li>
          <li>En el Juego B, la tierra queda en una Fundación: no hay lotes de NetX para vender.</li>
        </ul>
      </section>

      <p className="text-xs text-muted">
        Fuentes: NS_Tokenomics doc 28 (diseño B), 29 y 30 ({VERSIONES.capitalizacion.version},{" "}
        {fechaCorta(VERSIONES.capitalizacion.fecha)}); series_waterfall_sim.py {VERSION_MODELO.version},{" "}
        {fechaCorta(VERSION_MODELO.fecha)}; platform_revenue_sim.py {VERSIONES.plataforma.version},{" "}
        {fechaCorta(VERSIONES.plataforma.fecha)}; series_montecarlo_sim.py {VERSIONES.monteCarlo.version},{" "}
        {fechaCorta(VERSIONES.monteCarlo.fecha)} ({numero(FUTUROS_SIMULADOS)} futuros, semilla 7). La idea de procomún sigue
        el trabajo de Elinor Ostrom sobre bienes comunes.
      </p>
    </div>
  );
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-17" → "17-oct-2026". */
function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${Number(d)}-${MESES[Number(m) - 1]}-${a}`;
}
