import type {
  DatosMedidos,
  IdEscenario,
  Metadato,
  SupuestosAjustables,
  ValoresDecididos,
} from "./tipos";

// Los dos escenarios del modelo (A · Viñedo, B · Agrovoltaica): valores de partida, metadatos de cada control
// (unidad, rango, paso, quién decide o fuente) y supuestos fijos. Todo es ilustrativo, no un pronóstico ni una oferta.
// El dueño del modelo es NS_Tokenomics (ADR-010): si el `.py` cambia, se abre otro cambio con números nuevos.

/** Versión del modelo copiado. Una sola constante: la pantalla, el comentario del modelo y los tests la citan. */
export const VERSION_MODELO = {
  fuente: "NS_Tokenomics/sim/series_waterfall_sim.py",
  version: "v0.1",
  fecha: "2026-10-17",
} as const;

/** Fuente común de los supuestos fijos. */
export const FUENTE_SUPUESTOS = `NS_Tokenomics, doc 28 §7 y sim/series_waterfall_sim.py (${VERSION_MODELO.version}, 17-oct-2026)`;

export const FUENTE_ENOLOGO = "Supuesto del modelo, a confirmar con un enólogo local";
export const FUENTE_DESARROLLADOR = "Supuesto del modelo, a confirmar con la cotización de un desarrollador";
export const FUENTE_VAGNER = "Supuesto del modelo, a confirmar con Vagner";

export type ClaveDecidida = keyof ValoresDecididos;
export type ClaveSupuestoNum = Exclude<keyof SupuestosAjustables, "curvaEscalada">;

export const CLAVES_DECIDIDAS: readonly ClaveDecidida[] = [
  "regalia",
  "canonPorHa",
  "topeUnidades",
  "parteExcedenteUnidades",
  "comisionNetx",
  "metaPrimeraPerdida",
  "descuentoSafu",
];

export type EscenarioDef = {
  id: IdEscenario;
  etiqueta: string;
  horizonte: number;
  hectareas: number;
  tieneNotas: boolean;
  plazoNotas: number;
  graciaNotas: number;
  decididos: Record<ClaveDecidida, Metadato>;
  medidos: Record<string, Metadato>;
  /** Supuestos con control. */
  supuestos: Partial<Record<ClaveSupuestoNum, Metadato>>;
  /** Supuestos sin control, con su valor del modelo (fracción). */
  supuestosSinControl: Partial<Record<ClaveSupuestoNum, number>>;
  /** El viñedo tiene la casilla de la curva escalada. */
  curvaEscaladaControl: boolean;
  fijos: string[];
};

/** Estado de los controles, en las unidades que se muestran (un porcentaje en puntos: 5 = 5 %). */
export type EstadoControles = {
  decididos: Record<ClaveDecidida, number>;
  medidos: Record<string, number>;
  supuestos: Partial<Record<ClaveSupuestoNum, number>>;
  curvaEscalada: boolean;
};

export const QUIEN_DECIDE_VIVIENDA = "Asamblea de residentes + Consejo, después de la aprobación municipal";

function decididos(p: {
  regalia: number;
  canon: number;
  tope: number;
  excedente: number;
  comision: number;
  meta: number;
  safu: number;
}): Record<ClaveDecidida, Metadato> {
  return {
    regalia: {
      etiqueta: "Regalía de regeneración",
      unidad: "% de los ingresos brutos",
      partida: p.regalia,
      min: 0,
      max: 15,
      paso: 0.5,
      quienDecide: "Consejo de la Fundación, con la Voz de la Tierra y consulta a residentes y miembros RAIZ",
    },
    canonPorHa: {
      etiqueta: "Canon",
      unidad: "USD por ha por año",
      partida: p.canon,
      min: 0,
      max: 500,
      paso: 10,
      quienDecide: "Consejo de la Fundación",
    },
    topeUnidades: {
      etiqueta: "Tope de las Unidades",
      unidad: "% anual",
      partida: p.tope,
      min: 0,
      max: 20,
      paso: 0.5,
      quienDecide: "Consejo de la Fundación al abrir cada serie; los inversores aceptan o no al entrar",
    },
    parteExcedenteUnidades: {
      etiqueta: "Reparto del excedente sobre el tope (parte de las Unidades)",
      unidad: "%",
      partida: p.excedente,
      min: 0,
      max: 50,
      paso: 5,
      quienDecide: "Consejo de la Fundación",
    },
    comisionNetx: {
      etiqueta: "Comisión de gestión de NetX",
      unidad: "% anual del capital",
      partida: p.comision,
      min: 0,
      max: 3,
      paso: 0.25,
      quienDecide: "Asamblea de inversores de cada serie (es su costo)",
    },
    metaPrimeraPerdida: {
      etiqueta: "Meta de la primera pérdida",
      unidad: "% anual",
      partida: p.meta,
      min: 0,
      max: 10,
      paso: 0.5,
      quienDecide: "Se negocia con cada inversor catalítico",
    },
    descuentoSafu: {
      etiqueta: "Descuento del SAFU al convertir",
      unidad: "%",
      partida: p.safu,
      min: 0,
      max: 40,
      paso: 5,
      quienDecide: "NetX + Fundación, una vez por emisión",
      ayuda: "No cambia la serie: solo la conversión del SAFU",
    },
  };
}

const multiplo = (partida: number): Metadato => ({
  etiqueta: "Múltiplo de salida",
  unidad: "veces",
  partida,
  min: 0,
  max: 10,
  paso: 0.5,
  fuente: FUENTE_VAGNER,
  ayuda: "Veces la caja operativa del último año",
});

const partePrimeraPerdida = (partida: number): Metadato => ({
  etiqueta: "Parte de primera pérdida",
  unidad: "% del capital",
  partida,
  min: 0,
  max: 20,
  paso: 5,
  fuente: FUENTE_VAGNER,
});

export const ESCENARIOS: Record<IdEscenario, EscenarioDef> = {
  vinedo: {
    id: "vinedo",
    etiqueta: "Viñedo · 10 ha",
    horizonte: 15,
    hectareas: 10,
    tieneNotas: false,
    plazoNotas: 0,
    graciaNotas: 0,
    decididos: decididos({ regalia: 5, canon: 100, tope: 9, excedente: 20, comision: 1.5, meta: 4, safu: 20 }),
    medidos: {
      rendimientoMadurezTHa: {
        etiqueta: "Rendimiento del viñedo en madurez",
        unidad: "t por ha",
        partida: 7,
        min: 0,
        max: 12,
        paso: 0.5,
        fuente: FUENTE_ENOLOGO,
      },
      precioVinoUsd: {
        etiqueta: "Precio del vino",
        unidad: "USD por botella (neto para la serie)",
        partida: 6,
        min: 0,
        max: 20,
        paso: 0.5,
        fuente: FUENTE_ENOLOGO,
      },
    },
    supuestos: {
      multiploSalida: multiplo(6),
      partePrimeraPerdida: partePrimeraPerdida(15),
      reservaUsd: {
        etiqueta: "Reserva",
        unidad: "USD",
        partida: 220000,
        min: 0,
        max: 400000,
        paso: 10000,
        fuente: FUENTE_VAGNER,
        ayuda: "Parte de lo levantado: subirla sube el capital de la serie",
      },
    },
    supuestosSinControl: { parteNotas: 0, tasaNotas: 0 },
    curvaEscaladaControl: true,
    fijos: [
      "Horizonte: 15 años",
      "10 hectáreas",
      "Inversión física: USD 30.000 por ha más USD 50.000 de permisos y diseño",
      "Costos: USD 6.000 por ha por año más USD 2,5 por botella",
      "El vino se vende al año siguiente de la cosecha (750 botellas por tonelada)",
      "Sin Notas Verdes: un viñedo joven no puede cargar deuda",
    ],
  },
  agrovoltaica: {
    id: "agrovoltaica",
    etiqueta: "Agrovoltaica · 5 MW",
    horizonte: 20,
    hectareas: 12,
    tieneNotas: true,
    plazoNotas: 12,
    graciaNotas: 1,
    decididos: decididos({ regalia: 5, canon: 100, tope: 10, excedente: 20, comision: 1, meta: 5, safu: 20 }),
    medidos: {
      costoUsdPorMw: {
        etiqueta: "Costo del parque solar",
        unidad: "USD por MW",
        partida: 800000,
        min: 400000,
        max: 1600000,
        paso: 50000,
        fuente: FUENTE_DESARROLLADOR,
      },
      precioEnergiaUsdMwh: {
        etiqueta: "Precio de la energía",
        unidad: "USD por MWh",
        partida: 60,
        min: 0,
        max: 150,
        paso: 5,
        fuente: `${FUENTE_DESARROLLADOR} y la consulta a la red`,
      },
    },
    supuestos: {
      multiploSalida: multiplo(3),
      parteNotas: {
        etiqueta: "Parte de Notas Verdes",
        unidad: "% del capital",
        partida: 60,
        min: 0,
        max: 70,
        paso: 5,
        fuente: FUENTE_VAGNER,
      },
      tasaNotas: {
        etiqueta: "Tasa de las Notas Verdes",
        unidad: "% anual",
        partida: 7,
        min: 0,
        max: 15,
        paso: 0.5,
        fuente: FUENTE_VAGNER,
      },
      partePrimeraPerdida: partePrimeraPerdida(10),
      reservaUsd: {
        etiqueta: "Reserva",
        unidad: "USD",
        partida: 0,
        min: 0,
        max: 1000000,
        paso: 50000,
        fuente: FUENTE_VAGNER,
        ayuda: "Parte de lo levantado: subirla sube el capital de la serie",
      },
    },
    supuestosSinControl: {},
    curvaEscaladaControl: false,
    fijos: [
      "Horizonte: 20 años",
      "Potencia: 5 MW; unas 12 hectáreas para el canon",
      "Notas Verdes a 12 años, 1 de gracia",
      "Energía: 1.900 MWh por MW por año, con una pérdida de 0,5 % por año",
      "Costos: USD 15.000 por MW por año más USD 10.000 de cuidado de la vegetación",
    ],
  },
};

export const IDS_ESCENARIOS: readonly IdEscenario[] = ["vinedo", "agrovoltaica"];

export function esPorcentaje(m: Metadato): boolean {
  return m.unidad.startsWith("%");
}

/** Los valores de partida de un escenario, en las unidades que se muestran. */
export function estadoDePartida(id: IdEscenario): EstadoControles {
  const def = ESCENARIOS[id];
  const supuestos: Partial<Record<ClaveSupuestoNum, number>> = {};
  for (const [k, m] of Object.entries(def.supuestos)) supuestos[k as ClaveSupuestoNum] = m.partida;
  return {
    decididos: Object.fromEntries(CLAVES_DECIDIDAS.map((k) => [k, def.decididos[k].partida])) as Record<ClaveDecidida, number>,
    medidos: Object.fromEntries(Object.entries(def.medidos).map(([k, m]) => [k, m.partida])),
    supuestos,
    curvaEscalada: true,
  };
}

function aModelo(m: Metadato, v: number): number {
  return esPorcentaje(m) ? v / 100 : v;
}

/** Pasa el estado de los controles (unidades que se muestran) a los parámetros del modelo (fracciones). */
export function parametrosDesde<I extends IdEscenario>(
  id: I,
  estado: EstadoControles,
): { decididos: ValoresDecididos; medidos: DatosMedidos[I]; supuestos: SupuestosAjustables } {
  const def = ESCENARIOS[id];
  const d = Object.fromEntries(
    CLAVES_DECIDIDAS.map((k) => [k, aModelo(def.decididos[k], estado.decididos[k])]),
  ) as ValoresDecididos;
  const medidos = Object.fromEntries(
    Object.entries(def.medidos).map(([k, m]) => [k, aModelo(m, estado.medidos[k])]),
  ) as DatosMedidos[I];
  const num = (k: ClaveSupuestoNum): number => {
    const m = def.supuestos[k];
    if (m) return aModelo(m, estado.supuestos[k] ?? m.partida);
    return def.supuestosSinControl[k] ?? 0;
  };
  const supuestos: SupuestosAjustables = {
    multiploSalida: num("multiploSalida"),
    parteNotas: num("parteNotas"),
    tasaNotas: num("tasaNotas"),
    partePrimeraPerdida: num("partePrimeraPerdida"),
    reservaUsd: num("reservaUsd"),
    curvaEscalada: def.curvaEscaladaControl ? estado.curvaEscalada : false,
  };
  return { decididos: d, medidos, supuestos };
}
