// Cálculo del barrio de la propuesta v0.1: traducción fiel de `NS_Tokenomics/sim/barrio_stack_sim.py` v0.1 (ver
// `VERSION_SIM_BARRIO`). Puro: sin React ni Next. Los parámetros salen de `lib/bien-comun/modelo.ts`; los cinco que la
// persona puede mover llegan en `Entradas`. Son números de ejemplo, no un pronóstico ni una oferta.
// Una entrada inválida devuelve `{ ok: false }`: la pantalla dice "sin dato", nunca 0.
import { BARRIO } from "./modelo";

export type Entradas = {
  /** USD por lote. */
  precioLote: number;
  /** Lotes que se venden por trimestre (entero, al menos 1). */
  ritmo: number;
  /** Cuotas de lo que no es anticipo (entero; 0 = contado). */
  cuotas: number;
  /** USD de infraestructura por lote. */
  infraestructuraPorLote: number;
  /** Prima anual simple del inversor, como fracción (0,10 = 10 %). */
  prima: number;
};

export type CampoEntrada = keyof Entradas;

export const CAMPOS: readonly CampoEntrada[] = ["precioLote", "ritmo", "cuotas", "infraestructuraPorLote", "prima"];

/** Valores de partida, del módulo. */
export const ENTRADAS_DE_PARTIDA: Entradas = {
  precioLote: BARRIO.precioLote.valor,
  ritmo: BARRIO.ritmo.valor,
  cuotas: BARRIO.cuotas.valor,
  infraestructuraPorLote: BARRIO.infraestructuraPorLote.valor,
  prima: BARRIO.prima.valor,
};

export type Fallo = { ok: false };
export type Con<T> = { ok: true } & T;

const numero = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const entero = (n: unknown): n is number => numero(n) && Number.isInteger(n);

/** Los campos que hay que revisar (vacíos, negativos, no numéricos o no enteros donde corresponde). */
export function camposInvalidos(e: Partial<Record<CampoEntrada, number>>): CampoEntrada[] {
  const malos: CampoEntrada[] = [];
  if (!numero(e.precioLote) || e.precioLote <= 0) malos.push("precioLote");
  if (!entero(e.ritmo) || e.ritmo < 1) malos.push("ritmo");
  if (!entero(e.cuotas) || e.cuotas < 0) malos.push("cuotas");
  if (!numero(e.infraestructuraPorLote) || e.infraestructuraPorLote < 0) malos.push("infraestructuraPorLote");
  if (!numero(e.prima) || e.prima < 0) malos.push("prima");
  return malos;
}

const valida = (e: Entradas) => camposInvalidos(e).length === 0;

const LOTES = BARRIO.lotes.valor;
const HORIZONTE = BARRIO.horizonteMeses.valor;
const PARTE_DEL_FIDEICOMISO = 1 - BARRIO.parteDueno.valor - BARRIO.corredor.valor - BARRIO.contratoNetx.valor - BARRIO.parteComun.valor;

/** Años del horizonte del modelo, para el texto "no en N años". */
export const ANIOS_DEL_HORIZONTE = HORIZONTE / 12;

/** Lo que el fideicomiso se queda de cada dólar que paga un comprador (0,68 en el caso base). */
export const parteQueQuedaEnElFideicomiso = (): number => PARTE_DEL_FIDEICOMISO;

/** Plata que tiene que traer el Token Inversor: infraestructura con imprevistos más el armado legal. */
export function montoALevantar(e: Entradas): Con<{ valor: number }> | Fallo {
  if (!valida(e)) return { ok: false };
  return { ok: true, valor: montoSinValidar(e) };
}

const montoSinValidar = (e: Entradas) =>
  LOTES * e.infraestructuraPorLote * (1 + BARRIO.imprevistos.valor) + BARRIO.armadoLegal.valor;

function cobros(e: Entradas): number[] {
  const pagado = new Array<number>(HORIZONTE + 1).fill(0);
  let vendidos = 0;
  let mes = 0;
  while (vendidos < LOTES && mes <= HORIZONTE) {
    const tanda = Math.min(e.ritmo, LOTES - vendidos);
    if (e.cuotas === 0) {
      pagado[mes] += tanda * e.precioLote;
    } else {
      pagado[mes] += tanda * e.precioLote * BARRIO.anticipo.valor;
      const cuota = (e.precioLote * (1 - BARRIO.anticipo.valor)) / e.cuotas;
      for (let m = mes + 1; m <= Math.min(mes + e.cuotas, HORIZONTE); m++) pagado[m] += tanda * cuota;
    }
    vendidos += tanda;
    mes += 3;
  }
  return pagado;
}

/** Lo que pagan los compradores en cada mes (0 a 72). Los lotes se venden al inicio de cada trimestre. */
export function cobrosPorMes(e: Entradas): Con<{ valor: number[] }> | Fallo {
  if (!valida(e)) return { ok: false };
  return { ok: true, valor: cobros(e) };
}

/** Simula el cobro con las cuotas, mes a mes (0 a 72). Una sola fuente para el resultado y para la serie de la curva. */
function simularCobroConCuotas(e: Entradas) {
  let debido = montoSinValidar(e);
  let prima = 0;
  let total = 0;
  let sobrante = 0;
  let mesFinal: number | null = null;
  const devueltoPorMes: number[] = [];
  const devueltoEnElMes: number[] = [];
  cobros(e).forEach((pagado, mes) => {
    const antes = total;
    if (mesFinal === null && mes > 0) prima += (debido * e.prima) / 12;
    let caja = pagado * PARTE_DEL_FIDEICOMISO;
    if (mesFinal === null) {
      const pagaPrima = Math.min(caja, prima);
      prima -= pagaPrima;
      caja -= pagaPrima;
      const pagaCapital = Math.min(caja, debido);
      debido -= pagaCapital;
      caja -= pagaCapital;
      total += pagaPrima + pagaCapital;
      if (debido < 0.5 && prima < 0.5) mesFinal = mes;
    }
    sobrante += caja;
    devueltoPorMes.push(total);
    devueltoEnElMes.push(total - antes);
  });
  return { mes: mesFinal as number | null, total, sobrante, devueltoPorMes, devueltoEnElMes };
}

/** Si el fideicomiso cobra a medida que entran las cuotas: mes en que se termina de devolver (null = no en el horizonte), total y sobrante. */
export function cobrandoConLasCuotas(
  e: Entradas,
): Con<{ mes: number | null; totalRecibido: number; sobranteFideicomiso: number }> | Fallo {
  if (!valida(e)) return { ok: false };
  const s = simularCobroConCuotas(e);
  return { ok: true, mes: s.mes, totalRecibido: s.total, sobranteFideicomiso: s.sobrante };
}

export type MesDelBarrio = {
  mes: number;
  /** Lo que pagan los compradores ese mes. */
  pagado: number;
  /** Lo que entra al fideicomiso (su parte de lo pagado). */
  alFideicomiso: number;
  /** Lo que se le devuelve al inversor ese mes. */
  devueltoEnElMes: number;
  /** Lo devuelto al inversor hasta ese mes, acumulado. */
  devueltoAcumulado: number;
  /** La parte de lo pagado que va al común. */
  alComun: number;
};

/** Serie mensual (mes 0 a 72) del cobro con las cuotas, para la curva y el libro. Sale de la misma simulación que `cobrandoConLasCuotas`. */
export function serieMensualDelBarrio(e: Entradas): Con<{ meses: MesDelBarrio[]; aportado: number }> | Fallo {
  if (!valida(e)) return { ok: false };
  const s = simularCobroConCuotas(e);
  const pagos = cobros(e);
  const meses = pagos.map((pagado, mes) => ({
    mes,
    pagado,
    alFideicomiso: pagado * PARTE_DEL_FIDEICOMISO,
    devueltoEnElMes: s.devueltoEnElMes[mes],
    devueltoAcumulado: s.devueltoPorMes[mes],
    alComun: pagado * BARRIO.parteComun.valor,
  }));
  return { ok: true, meses, aportado: montoSinValidar(e) };
}

/** Si se hubiera prometido devolver todo en `meses`: caja del fideicomiso a esa fecha sobre lo que debe (0,21 = 21 %). */
export function coberturaAFechaFija(e: Entradas, meses: number): Con<{ valor: number }> | Fallo {
  if (!valida(e) || !entero(meses) || meses < 0 || meses > HORIZONTE) return { ok: false };
  const caja = cobros(e).slice(0, meses + 1).reduce((s, x) => s + x, 0) * PARTE_DEL_FIDEICOMISO;
  const debido = montoSinValidar(e) * (1 + (e.prima * meses) / 12);
  return { ok: true, valor: caja / debido };
}

export type FilaComun = {
  anio: number;
  parteDeLosPagos: number;
  expensas: number;
  total: number;
  lotesVendidos: number;
};

/** Lo que le llega al común en cada uno de los 6 años: parte de cada pago más expensas de los lotes vendidos. */
export function alComunPorAnio(e: Entradas): Con<{ filas: FilaComun[] }> | Fallo {
  if (!valida(e)) return { ok: false };
  const pagado = cobros(e);
  const filas: FilaComun[] = [];
  for (let anio = 1; anio <= HORIZONTE / 12; anio++) {
    const inicio = (anio - 1) * 12;
    const fin = anio * 12;
    // Igual que el simulador: del segundo año en adelante el pago del mes inicial ya se contó en el año anterior.
    const parteDeLosPagos =
      pagado.slice(inicio + (anio > 1 ? 1 : 0), fin + 1).reduce((s, x) => s + x, 0) * BARRIO.parteComun.valor;
    const vendidos = Math.min(LOTES, e.ritmo * (Math.floor(fin / 3) + 1));
    // Las expensas se cuentan con los lotes vendidos a mitad de año.
    const vendidosAMitad = Math.min(LOTES, e.ritmo * (Math.floor(Math.floor((inicio + fin) / 2) / 3) + 1));
    const expensas = vendidosAMitad * BARRIO.expensa.valor;
    filas.push({ anio, parteDeLosPagos, expensas, total: parteDeLosPagos + expensas, lotesVendidos: vendidos });
  }
  return { ok: true, filas };
}

/** Qué parte del presupuesto anual del común cubren las expensas de todos los lotes cuando terminan las ventas (0,35 = 35 %). */
export const parteDelPresupuestoQueCubren = (): number =>
  (LOTES * BARRIO.expensa.valor) / BARRIO.presupuestoComun.valor;

export type ResumenObraBarrio = {
  /** USD de infraestructura que financiaría el Token Inversor (con imprevistos y armado legal). null si las entradas no valen. */
  infraestructura: number | null;
  /** Lo juntado: siempre null ("sin dato") mientras no haya plata real. */
  juntado: number | null;
  /** Mes en que se terminaría de devolver al inversor cobrando a medida que entran las cuotas; null = no dentro del horizonte (o sin dato). */
  mesDevolucion: number | null;
  /** Lo que le llega al común en cada año del horizonte (parte de los pagos más expensas). */
  comunPorAnio: (number | null)[];
  /** Cantidad de lotes con la que se hace el cálculo. */
  lotesDelModelo: number;
};

/**
 * Un solo resumen de la obra del barrio, compartido por Inicio, Barrio Norte e Invertir: así nadie arma su propio monto.
 * Sin entradas usa los valores de partida del modelo.
 */
export function resumenObraBarrio(e: Entradas = ENTRADAS_DE_PARTIDA): ResumenObraBarrio {
  const monto = montoALevantar(e);
  const cobrando = cobrandoConLasCuotas(e);
  const comun = alComunPorAnio(e);
  return {
    infraestructura: monto.ok ? monto.valor : null,
    juntado: null,
    mesDevolucion: cobrando.ok ? cobrando.mes : null,
    comunPorAnio: comun.ok ? comun.filas.map((f) => f.total) : [],
    lotesDelModelo: LOTES,
  };
}
