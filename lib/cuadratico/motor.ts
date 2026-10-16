/**
 * Motor del voto cuadrático: funciones puras, sin nada del Fogón ni de React (lo puede importar el servidor
 * y, más adelante, otros mecanismos). Poner n votos a una opción cuesta n² créditos.
 * Los montos van en centavos enteros; un monto que falta es `null` ("sin dato"), nunca 0.
 */

/** Votos por opción (id de opción → votos). Negativo = en contra. */
export type Reparto = Readonly<Record<string, number>>;

export type Reglas = {
  creditos: number;
  opciones: readonly string[];
  votosEnContra: boolean;
};

/** Regla 6 (una persona, una voz): todas las personas reciben los mismos créditos en cada consulta. */
export const CREDITOS_POR_PERSONA = 100;

export type MotivoInvalido = "excede-creditos" | "no-entero" | "en-contra-no-permitido" | "opcion-ajena";

export type Validacion =
  | { ok: true; usados: number; restantes: number }
  | { ok: false; motivos: MotivoInvalido[] };

export const TEXTO_MOTIVO: Record<MotivoInvalido, string> = {
  "excede-creditos": "Te pasás de los créditos",
  "no-entero": "Los votos tienen que ser números enteros",
  "en-contra-no-permitido": "Esta consulta no permite votos en contra",
  "opcion-ajena": "Hay una opción que no es de esta consulta",
};

export function costo(votos: number): number {
  return votos * votos;
}

export function costoReparto(reparto: Reparto): number {
  return Object.values(reparto).reduce((suma, v) => suma + costo(v), 0);
}

export function validarReparto(reglas: Reglas, reparto: Reparto): Validacion {
  const motivos = new Set<MotivoInvalido>();
  for (const [id, votos] of Object.entries(reparto)) {
    if (!reglas.opciones.includes(id)) motivos.add("opcion-ajena");
    if (typeof votos !== "number" || !Number.isInteger(votos)) {
      motivos.add("no-entero");
      continue;
    }
    if (votos < 0 && !reglas.votosEnContra) motivos.add("en-contra-no-permitido");
  }
  if (motivos.size === 0) {
    const usados = costoReparto(reparto);
    if (usados > reglas.creditos) motivos.add("excede-creditos");
    else return { ok: true, usados, restantes: reglas.creditos - usados };
  }
  return { ok: false, motivos: [...motivos] };
}

export type FilaAgregado = {
  opcion: string;
  /** Votos a favor menos votos en contra, sumados de todas las personas. */
  neto: number;
  /** Personas con votos a favor. */
  apoyos: number;
  /** Personas con votos en contra. */
  enContra: number;
};

export type Agregado = FilaAgregado[];

/** Suma votos (no créditos) por opción, en el orden de `opciones`. Se espera el último reparto válido de cada persona. */
export function agregar(opciones: readonly string[], repartos: readonly Reparto[]): Agregado {
  return opciones.map((opcion) => {
    let neto = 0;
    let apoyos = 0;
    let enContra = 0;
    for (const r of repartos) {
      const v = r[opcion] ?? 0;
      neto += v;
      if (v > 0) apoyos += 1;
      if (v < 0) enContra += 1;
    }
    return { opcion, neto, apoyos, enContra };
  });
}

/**
 * Porcentaje entero por opción (parte de la suma de votos netos positivos), por resto mayor, de modo que sumen 100.
 * `null` si no hay ningún voto positivo: la pantalla muestra "sin dato".
 */
export function porcentajes(agregado: Agregado): Record<string, number> | null {
  const pesos = agregado.map((f) => Math.max(0, f.neto));
  const total = pesos.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return repartoProporcional(
    agregado.map((f) => f.opcion),
    pesos,
    100,
  );
}

/** Reparte `cantidad` (entero) en proporción a pesos enteros, por resto mayor (empata el orden original). */
export function repartoProporcional(ids: readonly string[], pesos: readonly number[], cantidad: number): Record<string, number> {
  const total = pesos.reduce((a, b) => a + b, 0);
  const resultado: Record<string, number> = {};
  const restos: { id: string; resto: number; orden: number }[] = [];
  let asignado = 0;
  ids.forEach((id, i) => {
    const exacto = (cantidad * pesos[i]) / total;
    const piso = Math.floor(exacto);
    resultado[id] = piso;
    asignado += piso;
    restos.push({ id, resto: exacto - piso, orden: i });
  });
  restos.sort((a, b) => b.resto - a.resto || a.orden - b.orden);
  for (let i = 0; i < cantidad - asignado; i++) resultado[restos[i].id] += 1;
  return resultado;
}

/** Por votos netos (mayor primero), después por personas que apoyaron y después por el orden original. */
export function ordenar(agregado: Agregado): Agregado {
  return agregado
    .map((fila, orden) => ({ fila, orden }))
    .sort((a, b) => b.fila.neto - a.fila.neto || b.fila.apoyos - a.fila.apoyos || a.orden - b.orden)
    .map((x) => x.fila);
}

export type OpcionPresupuesto = {
  id: string;
  /** Votos netos de la opción (solo cuenta si es positivo). */
  peso: number;
  /** Lo máximo que puede recibir, en centavos. */
  topeCentavos?: number;
  /** Lo mínimo que recibe si tiene votos, en centavos. */
  pisoCentavos?: number;
};

export type AvisoPresupuesto = "pisos-imposibles";

export const TEXTO_AVISO: Record<AvisoPresupuesto, string> = {
  "pisos-imposibles": "Los pisos suman más que el monto: no se aplicaron",
};

export type ResultadoPresupuesto = {
  /** Centavos por opción; `null` = sin dato (monto desconocido o ningún voto positivo). */
  partes: Record<string, number | null>;
  /** Centavos que ninguna opción pudo recibir; `null` = sin dato. */
  sinAsignar: number | null;
  avisos: AvisoPresupuesto[];
};

/**
 * Reparte el monto en proporción a los votos netos positivos, con tope y piso por opción ("llenado con límites"):
 * se reparte lo libre en proporción al peso entre las opciones no fijadas; si alguna pasa su tope, se fija en su tope
 * y se repite; si no, si alguna queda bajo su piso, se fija en su piso y se repite. Primero topes, después pisos.
 * Cálculo exacto con enteros grandes; el redondeo a centavos es por resto mayor, así que todo suma el monto.
 */
export function repartirPresupuesto(entrada: {
  montoCentavos: number | null;
  opciones: readonly OpcionPresupuesto[];
}): ResultadoPresupuesto {
  const { montoCentavos, opciones } = entrada;
  const avisos: AvisoPresupuesto[] = [];
  const peso = (o: OpcionPresupuesto) => Math.max(0, Math.trunc(o.peso));
  const conVotos = opciones.filter((o) => peso(o) > 0);

  if (montoCentavos === null || conVotos.length === 0) {
    return { partes: Object.fromEntries(opciones.map((o) => [o.id, null])), sinAsignar: null, avisos };
  }

  const partes: Record<string, number | null> = {};
  for (const o of opciones) partes[o.id] = 0;

  const sumaPisos = conVotos.reduce((s, o) => s + (o.pisoCentavos ?? 0), 0);
  const usarPisos = sumaPisos <= montoCentavos;
  if (!usarPisos) avisos.push("pisos-imposibles");

  const monto = BigInt(montoCentavos);
  const fijas = new Map<string, number>();
  let libre = monto;
  let sueltas = conVotos;

  const fijar = (o: OpcionPresupuesto, cantidad: number) => {
    const c = BigInt(cantidad) > libre ? libre : BigInt(cantidad);
    fijas.set(o.id, Number(c));
    libre -= c;
  };

  while (sueltas.length > 0) {
    const total = sueltas.reduce((s, o) => s + BigInt(peso(o)), BigInt(0));
    // parte de o ≷ límite  ⇔  libre·peso ≷ límite·total (sin decimales)
    const parteX = (o: OpcionPresupuesto) => libre * BigInt(peso(o));
    const pasaTope = sueltas.filter((o) => o.topeCentavos !== undefined && parteX(o) > BigInt(o.topeCentavos) * total);
    if (pasaTope.length > 0) {
      pasaTope.forEach((o) => fijar(o, o.topeCentavos!));
      sueltas = sueltas.filter((o) => !pasaTope.includes(o));
      continue;
    }
    const bajoPiso = usarPisos
      ? sueltas.filter((o) => (o.pisoCentavos ?? 0) > 0 && parteX(o) < BigInt(o.pisoCentavos!) * total)
      : [];
    if (bajoPiso.length > 0) {
      bajoPiso.forEach((o) => fijar(o, o.pisoCentavos!));
      sueltas = sueltas.filter((o) => !bajoPiso.includes(o));
      continue;
    }
    break;
  }

  for (const [id, c] of fijas) partes[id] = c;

  let sinAsignar = 0;
  if (sueltas.length === 0) {
    sinAsignar = Number(libre);
  } else {
    const total = sueltas.reduce((s, o) => s + BigInt(peso(o)), BigInt(0));
    const base = sueltas.map((o) => ({ o, num: libre * BigInt(peso(o)) }));
    let asignado = BigInt(0);
    const restos = base.map(({ o, num }, orden) => {
      const piso = num / total;
      asignado += piso;
      partes[o.id] = Number(piso);
      return { id: o.id, resto: num % total, orden };
    });
    restos.sort((a, b) => (a.resto === b.resto ? a.orden - b.orden : a.resto > b.resto ? -1 : 1));
    const faltan = Number(libre - asignado);
    for (let i = 0; i < faltan; i++) partes[restos[i].id] = (partes[restos[i].id] as number) + 1;
  }

  return { partes, sinAsignar, avisos };
}
