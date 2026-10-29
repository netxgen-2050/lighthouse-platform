export type Dimension = "rol" | "cultura";

export type Evaluacion = { de: string; a: string; dimension: Dimension; nota: number; motivo: string };

export type MotivoDescarte = "autoevaluacion" | "fuera-del-equipo" | "sin-motivo" | "nota-invalida" | "reciprocidad";

export type Agregado = "mediana" | "media-recortada";

export type Parametros = {
  agregado: Agregado;
  reciprocidadActiva: boolean;
  umbralReciprocidad: number;
  topePorEvaluador: number;
  minimoEvaluadores: number;
  pesoRol: number;
  fuerza: number;
};

export type ResultadoDimension = { nota: number | null; evaluadores: number; suficiente: boolean };

/** Solo agregados: sin ids ni nombres de quien evaluó, sin los motivos escritos. */
export type Resultado = {
  factor: number;
  fuerza: number;
  rango: [number, number];
  dimensiones: Record<Dimension, ResultadoDimension>;
  descartes: Record<MotivoDescarte, number>;
  resumenDisponible: boolean;
};
