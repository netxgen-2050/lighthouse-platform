import { MOTIVO_DE_COLUMNA, PUERTAS, TABLA } from "./tabla";
import type { Celda, Columna, Grado, Motivo, Persona, Puerta, Resultado } from "./tipos";

const RANGO: Grado[] = [
  "visita",
  "abierta",
  "segun estatuto",
  "1 voz",
  "1 persona = 1 voto",
  "completa",
];

function columnasActivas(p: Persona): Columna[] {
  const cols: Columna[] = [p.plan];
  if (p.pase) cols.push("pase");
  if (p.tribus.length > 0) cols.push("tribu");
  if (p.presenciaGenesis) cols.push("presencia");
  if (p.residente) cols.push("residente");
  return cols;
}

/**
 * La celda "su tribu" solo cuenta cuando se pasa `tribuId` y la persona fue
 * aceptada en esa tribu. Sin `tribuId` no se concede más de lo que vale para
 * cualquier tribu (criterio conservador).
 */
function calcularPuerta(p: Persona, puerta: Puerta, tribuId?: string): Resultado {
  const fila = TABLA[puerta];
  const abren: Array<{ col: Columna; celda: Celda }> = [];
  let refuerzo = false;

  for (const col of columnasActivas(p)) {
    const celda = fila[col];
    if (!celda) continue;
    if (col === "tribu" && celda.soloSuTribu && (tribuId === undefined || !p.tribus.includes(tribuId))) {
      continue;
    }
    if (celda.soloRefuerzo) {
      refuerzo = true;
      continue;
    }
    abren.push({ col, celda });
  }

  if (abren.length === 0) return { abierta: false, grado: null, motivos: [] };

  const motivos: Motivo[] = [];
  for (const a of abren) {
    const m = MOTIVO_DE_COLUMNA[a.col];
    if (!motivos.includes(m)) motivos.push(m);
  }
  const grado = abren
    .map((a) => a.celda.grado)
    .reduce((a, b) => (RANGO.indexOf(b) > RANGO.indexOf(a) ? b : a));

  const resultado: Resultado = { abierta: true, grado, motivos };
  if (abren.some((a) => a.col === "tribu")) {
    resultado.tribusPropias = tribuId !== undefined ? [tribuId] : [...p.tribus];
  }
  if (refuerzo) resultado.refuerzoPresencia = "a decidir";
  return resultado;
}

export function calcularPermisos(persona: Persona): Record<Puerta, Resultado> {
  const out = {} as Record<Puerta, Resultado>;
  for (const puerta of PUERTAS) out[puerta] = calcularPuerta(persona, puerta);
  return out;
}

/** Consulta una puerta; `tribuId` acota las puertas que dependen de una tribu. */
export function puede(persona: Persona, puerta: Puerta, tribuId?: string): Resultado {
  return calcularPuerta(persona, puerta, tribuId);
}
