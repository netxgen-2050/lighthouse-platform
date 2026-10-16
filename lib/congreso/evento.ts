// Contenido del evento del Congreso. Las pantallas lo leen SOLO con obtenerEvento():
// esa función es la costura donde más adelante entra la integración con UnityHub.
// Corre solo en el servidor; las piezas cliente reciben los datos por props.
//
// Los tipos llevan un parámetro `Tx` para el tipo de los textos traducibles: `string` (el evento ya resuelto en un
// idioma, lo que ven las piezas) o `Bilingue` (el contenido de ejemplo, con `{ es, en }`). Lo que no se traduce
// (ids, URLs, fechas ISO, iniciales, nombres de personas y del evento, montos) queda siempre `string`.
import { EVENTO_EJEMPLO } from "./evento-ejemplo";
import { resolver, type Bilingue, type Idioma } from "./idioma";

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

export type Parada<Tx = string> = {
  id: string;
  etiquetaCorta: Tx;
  cuando: Tx;
  titulo: Tx;
  texto: Tx;
  lugar: Tx;
  destacada: boolean;
};

export type Voz<Tx = string> = {
  id: string;
  nombre: string;
  afiliacion: Tx;
  iniciales: string;
  estado: EstadoVoz;
  tono: TonoVoz;
};

export type Eje<Tx = string> = {
  id: string;
  titulo: Tx;
  texto: Tx;
  icono: IconoEje;
};

export type TipoEntrada<Tx = string> = {
  id: string;
  nombre: Tx;
  etiqueta: Tx;
  descripcion: Tx;
  /** Ausente = "Precio sin dato". Si está, es mayor que 0. */
  precio?: { monto: number; moneda: "USD"; unidad?: Tx };
  esEjemplo: boolean;
  destacado: boolean;
  textoBoton: Tx;
};

export type Pregunta<Tx = string> = {
  id: string;
  pregunta: Tx;
  respuesta: Tx;
};

export type Cifra<Tx = string> = {
  /** Texto porque hay valores como "7 min" o "10.000". */
  valor: Tx;
  etiqueta: Tx;
};

export type EnlaceExterno<Tx = string> = {
  url: string;
  etiqueta: Tx;
  esEjemplo: boolean;
};

export type Evento<Tx = string> = {
  esEjemplo: boolean;
  nombre: string;
  sobreTitulo: Tx;
  lema: Tx;
  bajada: Tx;
  /** Fechas ISO sin hora (AAAA-MM-DD). */
  fechas: { inicio: string; fin: string };
  /** Con desfase horario: 2027-02-06T12:00:00-03:00. */
  momentoClave: { etiqueta: Tx; iso: string };
  lugar: { detalle: Tx; region: Tx };
  cifras: Cifra<Tx>[];
  encuentro: { manifiesto: Tx; destacado: Tx; parrafos: Tx[] };
  recorrido: { titulo: Tx; bajada: Tx; paradas: Parada<Tx>[] };
  voces: {
    titulo: Tx;
    principales: Voz<Tx>[];
    regionalesTitulo: Tx;
    /** Personas reales: llevan estado como las principales (por-confirmar hasta que haya confirmación). */
    regionales: Voz<Tx>[];
    notaHibrido: Tx;
  };
  ejes: { titulo: Tx; items: Eje<Tx>[] };
  entradas: { titulo: Tx; bajada: Tx; tipos: TipoEntrada<Tx>[]; nota: Tx };
  preguntas: { titulo: Tx; items: Pregunta<Tx>[] };
  cierre: { frase: Tx; convocan: Tx; entradasCon: Tx };
  paginaOficial?: EnlaceExterno<Tx>;
};

/** El evento ya resuelto en un idioma, con la lista de rutas de los textos que cayeron al español. */
export type EventoEnIdioma = Evento<string> & { idioma: Idioma; sinTraducir: readonly string[] };

/**
 * Única forma de leer el evento. Hoy devuelve el contenido de ejemplo del repo, sin red, sin variables de entorno ni
 * credenciales, resuelto en el idioma pedido (por defecto español). Si falta una traducción cae al español y anota
 * la ruta en `sinTraducir`: nunca devuelve un texto vacío.
 */
export async function obtenerEvento(idioma: Idioma = "es"): Promise<EventoEnIdioma> {
  return resolverEvento(EVENTO_EJEMPLO, idioma);
}

/** Resuelve un evento bilingüe en un idioma (separado de `obtenerEvento` para probar la caída con contenido a medida). */
export function resolverEvento(fuente: Evento<Bilingue>, idioma: Idioma): EventoEnIdioma {
  const { valor, sinTraducir } = resolver<Evento<string>>(fuente, idioma);
  return { ...valor, idioma, sinTraducir };
}
