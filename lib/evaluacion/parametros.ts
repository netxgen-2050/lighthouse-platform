import type { Parametros } from "./tipos";

/**
 * Valores de partida: se calibran con simulación (NS_Tokenomics 29 K11). Partimos de que todos son honestos: la
 * reciprocidad está apagada hasta que la comunidad la active o K11 lo pida. El peso 50/50 entre rol y cultura lo podrán
 * cambiar los admins por gobernanza más adelante.
 */
export const PARAMETROS_DE_PARTIDA: Parametros = {
  agregado: "mediana",
  reciprocidadActiva: false,
  umbralReciprocidad: 1.5,
  topePorEvaluador: 1,
  minimoEvaluadores: 3,
  pesoRol: 0.5,
  fuerza: 0.2,
};

export const FUERZAS = [0, 0.05, 0.1, 0.15, 0.2] as const;

/** Se sube con cada cambio del orden del cálculo o de los parámetros de partida (ADR-019). */
export const VERSION_EVALUACION = 1;

export const FACTOR_MIN = 0.8;
export const FACTOR_MAX = 1.2;
