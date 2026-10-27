import { ESCENARIOS, VERSION_MODELO } from "./escenarios";
import type {
  DatosMedidos,
  FilaAnio,
  IdEscenario,
  ResultadoClase,
  ResultadoSerie,
  SupuestosAjustables,
  ValoresDecididos,
} from "./tipos";

// Modelo de cascada de una serie del programa de fideicomisos (diseño legal B).
// Traducción fiel de NS_Tokenomics/sim/series_waterfall_sim.py (v0.1, 2026-10-17; ver VERSION_MODELO), mismo orden
// de operaciones. Si hay una diferencia con el `.py`, manda el `.py` (ADR-010).
//
// Supuestos del modelo (todo valor es ilustrativo, no es un pronóstico ni una oferta):
//  - La Fundación cobra antes que cualquier inversor.
//  - La serie no paga impuestos en el modelo; no hay inflación ni tipo de cambio.
//  - La salida vende lo que queda de la serie a un múltiplo de la caja operativa del último año.
//  - El vino se vende al año siguiente de la cosecha.
//  - La energía pierde 0,5 % por año.
//  - La curva del viñedo escala con el rendimiento en madurez (supuesto de la plataforma, no del `.py`,
//    a confirmar con Vagner).
// Agregados de la plataforma que no están en el `.py`: la conversión del SAFU (safu.ts) y la TIR por encima
// de 100 % anual (ver `tir`).

export { VERSION_MODELO };

/** Cuota fija de un préstamo. 0 con años <= 0; capital / años con tasa 0. */
export function anualidad(capital: number, tasa: number, anios: number): number {
  if (anios <= 0) return 0;
  if (tasa === 0) return capital / anios;
  return (capital * tasa) / (1 - Math.pow(1 + tasa, -anios));
}

function vpn(flujos: readonly number[], tasa: number): number {
  let s = 0;
  for (let t = 0; t < flujos.length; t++) s += flujos[t] / Math.pow(1 + tasa, t);
  return s;
}

/**
 * Tasa interna de retorno por bisección entre −0,99 y 1,0 con 200 iteraciones, igual que el `.py`.
 * Agregado de la plataforma (decisión de Gus, 21-oct-2026): si rinde más de 100 % por año el `.py` devuelve NaN;
 * acá se duplica el extremo superior (2, 4, 8… hasta 1.024, o sea 102.400 % anual) hasta encontrar el cambio de signo
 * y se hace la misma bisección. `null` solo si no hay cambio de signo (por ejemplo, la clase nunca recupera nada).
 */
export function tir(flujos: readonly number[]): number | null {
  if (flujos.length < 2 || flujos.some((f) => !Number.isFinite(f))) return null;
  let lo = -0.99;
  let hi = 1.0;
  if (vpn(flujos, lo) * vpn(flujos, hi) > 0) {
    // Agregado de la plataforma: buscar más arriba solo si a 100 % todavía rinde (vpn positivo).
    if (!(vpn(flujos, hi) > 0)) return null;
    let encontrado = false;
    while (hi < 1024) {
      hi *= 2;
      if (vpn(flujos, lo) * vpn(flujos, hi) <= 0) {
        encontrado = true;
        break;
      }
    }
    if (!encontrado) return null;
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (vpn(flujos, lo) * vpn(flujos, mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

type ParametrosCascada = {
  horizonte: number;
  capex: number;
  reserva: number;
  multiploSalida: number;
  ingresos: (t: number) => number;
  costos: (t: number) => number;
  canon: number;
  regalia: number;
  comision: number;
  parteNotas: number;
  partePrimeraPerdida: number;
  tasaNotas: number;
  plazoNotas: number;
  graciaNotas: number;
  metaPrimeraPerdida: number;
  topeUnidades: number;
  parteExcedenteUnidades: number;
  tieneNotas: boolean;
};

const CURVA_VINEDO: Record<number, number> = { 1: 0, 2: 0, 3: 2, 4: 4, 5: 6 };
const HA_VINEDO = 10;
const BOTELLAS_POR_T = 750;
const COSTO_VARIABLE_BOTELLA = 2.5;
const COSTO_HA_VINEDO = 6000;
const MW = 5;

function parametrosVinedo(
  d: ValoresDecididos,
  m: DatosMedidos["vinedo"],
  s: SupuestosAjustables,
): ParametrosCascada {
  const cosechaTHa = (t: number): number => {
    if (t >= 6) return m.rendimientoMadurezTHa;
    return s.curvaEscalada ? (CURVA_VINEDO[t] * m.rendimientoMadurezTHa) / 7 : CURVA_VINEDO[t];
  };
  const toneladas = (t: number) => cosechaTHa(t) * HA_VINEDO;
  // Cada cosecha se vende al año siguiente.
  const botellas = (t: number) => (t >= 2 ? toneladas(t - 1) * BOTELLAS_POR_T : 0);
  return {
    horizonte: ESCENARIOS.vinedo.horizonte,
    capex: 30000 * HA_VINEDO + 50000 + s.reservaUsd,
    reserva: s.reservaUsd,
    multiploSalida: s.multiploSalida,
    ingresos: (t) => botellas(t) * m.precioVinoUsd,
    costos: (t) => COSTO_HA_VINEDO * HA_VINEDO + botellas(t) * COSTO_VARIABLE_BOTELLA,
    canon: d.canonPorHa * ESCENARIOS.vinedo.hectareas,
    regalia: d.regalia,
    comision: d.comisionNetx,
    parteNotas: s.parteNotas,
    partePrimeraPerdida: s.partePrimeraPerdida,
    tasaNotas: s.tasaNotas,
    plazoNotas: ESCENARIOS.vinedo.plazoNotas,
    graciaNotas: ESCENARIOS.vinedo.graciaNotas,
    metaPrimeraPerdida: d.metaPrimeraPerdida,
    topeUnidades: d.topeUnidades,
    parteExcedenteUnidades: d.parteExcedenteUnidades,
    tieneNotas: ESCENARIOS.vinedo.tieneNotas,
  };
}

function parametrosAgrovoltaica(
  d: ValoresDecididos,
  m: DatosMedidos["agrovoltaica"],
  s: SupuestosAjustables,
): ParametrosCascada {
  return {
    horizonte: ESCENARIOS.agrovoltaica.horizonte,
    capex: m.costoUsdPorMw * MW + s.reservaUsd,
    reserva: s.reservaUsd,
    multiploSalida: s.multiploSalida,
    ingresos: (t) => MW * 1900 * m.precioEnergiaUsdMwh * Math.pow(0.995, t - 1),
    costos: () => 15000 * MW + 10000,
    canon: d.canonPorHa * ESCENARIOS.agrovoltaica.hectareas,
    regalia: d.regalia,
    comision: d.comisionNetx,
    parteNotas: s.parteNotas,
    partePrimeraPerdida: s.partePrimeraPerdida,
    tasaNotas: s.tasaNotas,
    plazoNotas: ESCENARIOS.agrovoltaica.plazoNotas,
    graciaNotas: ESCENARIOS.agrovoltaica.graciaNotas,
    metaPrimeraPerdida: d.metaPrimeraPerdida,
    topeUnidades: d.topeUnidades,
    parteExcedenteUnidades: d.parteExcedenteUnidades,
    tieneNotas: ESCENARIOS.agrovoltaica.tieneNotas,
  };
}

function clase(flujos: readonly number[]): ResultadoClase {
  const pone = -flujos[0];
  const recibe = flujos.slice(1).reduce((a, b) => a + b, 0);
  if (pone === 0) return { pone, recibe, multiplo: null, tir: null };
  return { pone, recibe, multiplo: recibe / pone, tir: tir(flujos) };
}

/** La cascada del modelo (`run_series` del `.py`). */
function cascada(p: ParametrosCascada): ResultadoSerie {
  const H = p.horizonte;
  const levantado = p.capex;
  const notas = levantado * p.parteNotas;
  const primeraPerdida = levantado * p.partePrimeraPerdida;
  const unidades = levantado - notas - primeraPerdida;

  let reserva = p.reserva;
  let deficit = 0;
  let cuentaUn = unidades;
  let cuentaPp = primeraPerdida;
  let saldoNotas = notas;
  const cuota = anualidad(notas, p.tasaNotas, p.plazoNotas - p.graciaNotas);

  const fNotas = [-notas];
  const fPp = [-primeraPerdida];
  const fUn = [-unidades];
  let procomun = 0;
  let netx = 0;
  const filas: FilaAnio[] = [];

  for (let t = 1; t <= H; t++) {
    const ingresos = p.ingresos(t);
    const costos = p.costos(t);
    const aFundacion = p.canon + p.regalia * ingresos;
    const comision = p.comision * levantado;
    let caja = ingresos - costos - aFundacion - comision;
    if (t === H) {
      caja += reserva; // lo que queda de la reserva se libera al final
      reserva = 0;
      caja += p.multiploSalida * Math.max(0, ingresos - costos - aFundacion - comision);
    }

    // Notas Verdes: solo interés en la gracia, después una anualidad.
    let pagoNotas = 0;
    if (saldoNotas > 1e-6) {
      pagoNotas = t <= p.graciaNotas ? saldoNotas * p.tasaNotas : Math.min(cuota, saldoNotas * (1 + p.tasaNotas));
    }
    caja -= pagoNotas;
    if (t > p.graciaNotas && saldoNotas > 1e-6) {
      saldoNotas = Math.max(0, saldoNotas * (1 + p.tasaNotas) - pagoNotas);
    }

    // Faltantes: primero la reserva, después un déficit que los años siguientes tienen que repagar.
    if (caja < 0) {
      const toma = Math.min(reserva, -caja);
      reserva -= toma;
      caja += toma;
      deficit += -caja;
      caja = 0;
    } else {
      const repago = Math.min(deficit, caja);
      deficit -= repago;
      caja -= repago;
    }

    // Unidades: hasta su tope.
    cuentaUn *= 1 + p.topeUnidades;
    let pagoUn = Math.min(caja, cuentaUn);
    cuentaUn -= pagoUn;
    caja -= pagoUn;
    // Primera pérdida: después de las Unidades, hasta su meta.
    cuentaPp *= 1 + p.metaPrimeraPerdida;
    const pagoPp = Math.min(caja, cuentaPp);
    cuentaPp -= pagoPp;
    caja -= pagoPp;
    // Excedente sobre los dos topes: casi todo al procomún, una parte a las Unidades.
    const extraUn = caja * p.parteExcedenteUnidades;
    const excedenteProcomun = caja - extraUn;
    pagoUn += extraUn;

    fNotas.push(pagoNotas);
    fPp.push(pagoPp);
    fUn.push(pagoUn);
    procomun += aFundacion + excedenteProcomun;
    netx += comision;
    filas.push({
      anio: t,
      ingresos,
      costos,
      aFundacion,
      comisionNetx: comision,
      notas: pagoNotas,
      unidades: pagoUn,
      primeraPerdida: pagoPp,
      excedenteProcomun,
    });
  }

  return {
    levantado,
    filas,
    notas: p.tieneNotas ? clase(fNotas) : null,
    primeraPerdida: clase(fPp),
    unidades: clase(fUn),
    procomun: { recibe: procomun },
    netx: { recibe: netx },
    flujosUnidades: fUn,
  };
}

/** Arma los parámetros del escenario y corre la cascada. Función pura. */
export function correrSerie<I extends IdEscenario>(
  id: I,
  decididos: ValoresDecididos,
  medidos: DatosMedidos[I],
  supuestos: SupuestosAjustables,
): ResultadoSerie {
  if (id === "vinedo") return cascada(parametrosVinedo(decididos, medidos as DatosMedidos["vinedo"], supuestos));
  return cascada(parametrosAgrovoltaica(decididos, medidos as DatosMedidos["agrovoltaica"], supuestos));
}

/** Escala los flujos de las Unidades a USD 1.000 puestos. `{ total: null, tir: null }` si no pusieron nada. */
export function porMil(flujosUnidades: readonly number[]): { total: number | null; tir: number | null } {
  const pone = -flujosUnidades[0];
  if (!(pone > 0)) return { total: null, tir: null };
  const escala = 1000 / pone;
  const flujos = flujosUnidades.map((v) => v * escala);
  const total = flujos.slice(1).reduce((a, b) => a + b, 0);
  return { total, tir: tir(flujos) };
}
