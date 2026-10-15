// Contenido del evento del Congreso. Las pantallas lo leen SOLO con obtenerEvento():
// esa función es la costura donde más adelante entra la integración con UnityHub.
// Corre solo en el servidor; las piezas cliente reciben los datos por props.
import { EVENTO_EJEMPLO } from "./evento-ejemplo";

export type EstadoVoz = "confirmada" | "por-confirmar";

export type IconoEje =
  | "agua"
  | "suelo"
  | "restauracion"
  | "habitat"
  | "energia"
  | "economia"
  | "gobernanza"
  | "cultura";

/** Tono del degradado del retrato de una voz (sin foto). */
export type TonoVoz = 1 | 2 | 3 | 4;

export type Parada = {
  id: string;
  etiquetaCorta: string;
  cuando: string;
  titulo: string;
  texto: string;
  lugar: string;
  destacada: boolean;
};

export type Voz = {
  id: string;
  nombre: string;
  afiliacion: string;
  iniciales: string;
  estado: EstadoVoz;
  tono: TonoVoz;
};

export type Eje = {
  id: string;
  titulo: string;
  texto: string;
  icono: IconoEje;
};

export type TipoEntrada = {
  id: string;
  nombre: string;
  etiqueta: string;
  descripcion: string;
  /** Ausente = "Precio sin dato". Si está, es mayor que 0. */
  precio?: { monto: number; moneda: "USD"; unidad?: string };
  esEjemplo: boolean;
  destacado: boolean;
  textoBoton: string;
};

export type Pregunta = {
  id: string;
  pregunta: string;
  respuesta: string;
};

export type Cifra = {
  /** Texto porque hay valores como "7 min" o "10.000". */
  valor: string;
  etiqueta: string;
};

export type EnlaceExterno = {
  url: string;
  etiqueta: string;
  esEjemplo: boolean;
};

export type Evento = {
  esEjemplo: boolean;
  nombre: string;
  sobreTitulo: string;
  lema: string;
  bajada: string;
  /** Fechas ISO sin hora (AAAA-MM-DD). */
  fechas: { inicio: string; fin: string };
  /** Con desfase horario: 2027-02-06T12:00:00-03:00. */
  momentoClave: { etiqueta: string; iso: string };
  lugar: { detalle: string; region: string };
  cifras: Cifra[];
  encuentro: { manifiesto: string; destacado: string; parrafos: string[] };
  recorrido: { titulo: string; bajada: string; paradas: Parada[] };
  voces: {
    titulo: string;
    principales: Voz[];
    regionalesTitulo: string;
    /** Personas reales: llevan estado como las principales (por-confirmar hasta que haya confirmación). */
    regionales: Voz[];
    notaHibrido: string;
  };
  ejes: { titulo: string; items: Eje[] };
  entradas: { titulo: string; bajada: string; tipos: TipoEntrada[]; nota: string };
  preguntas: { titulo: string; items: Pregunta[] };
  cierre: { frase: string; convocan: string; entradasCon: string };
  paginaOficial?: EnlaceExterno;
};

/**
 * Única forma de leer el evento. Hoy devuelve el contenido de ejemplo del repo,
 * sin red, sin variables de entorno ni credenciales.
 */
export async function obtenerEvento(): Promise<Evento> {
  return EVENTO_EJEMPLO;
}
