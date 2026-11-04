import type { Anillo, Punto } from "./biopueblo";
import { ESTADOS_EJEMPLO } from "./loteo-estados";
import { anilloDentro, areaM2, distanciaM, seSuperponen, TOLERANCIA_BORDE_M } from "./geometria";
import type { ArchivoLoteo, RasgoLoteo, TipoRasgoLoteo } from "./loteo";

// Importador de KML/KMZ al formato de `loteo-norte.json` (spec loteo-norte, design §8). Todo acá es puro: el comando
// (`scripts/importar-loteo.ts`) solo lee el archivo, llama a esto y escribe si no hay errores.

export type Placemark = {
  nombre: string;
  anillo: Anillo | null;
  /** El trazo de un `LineString`: los planos que salen de CAD no traen polígonos. */
  trazo: Anillo | null;
  /** El número al final del id del Placemark (`…masterplan.12`), si lo tiene. */
  numero: number | null;
};

const decodificar = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

function leerCoordenadas(texto: string): Anillo {
  return texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.split(",").map(Number))
    .filter((c) => c.length >= 2 && c.every((n) => !Number.isNaN(n)))
    .map((c): Punto => [c[0], c[1]]);
}

/** Cada `Placemark` con su nombre y el anillo exterior de su primer polígono (null si no tiene polígono). */
export function leerKml(xml: string): Placemark[] {
  const salida: Placemark[] = [];
  for (const m of xml.matchAll(/<Placemark\b([^>]*)>([\s\S]*?)<\/Placemark>/g)) {
    const cuerpo = m[2];
    const nombre = decodificar(cuerpo.match(/<name\b[^>]*>([\s\S]*?)<\/name>/)?.[1] ?? "");
    const exterior = cuerpo.match(/<Polygon\b[\s\S]*?<outerBoundaryIs>[\s\S]*?<coordinates\b[^>]*>([\s\S]*?)<\/coordinates>/);
    const linea = cuerpo.match(/<LineString\b[\s\S]*?<coordinates\b[^>]*>([\s\S]*?)<\/coordinates>/);
    const numero = m[1].match(/\bid="[^"]*?\.(\d+)"/)?.[1];
    salida.push({
      nombre,
      anillo: exterior ? leerCoordenadas(exterior[1]) : null,
      trazo: linea ? leerCoordenadas(linea[1]) : null,
      numero: numero ? Number(numero) : null,
    });
  }
  return salida;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export type Clasificacion = { tipo: TipoRasgoLoteo; id: string; numero?: number };

/** Clasifica un polígono por su nombre (sin distinguir mayúsculas ni acentos). null si no lo entiende. */
export function clasificar(nombre: string): Clasificacion | null {
  const n = normalizar(nombre);
  const lote = n.match(/^(?:lote|l)[\s_-]*0*(\d+)$/);
  if (lote) return { tipo: "lote", id: `lote-${Number(lote[1])}`, numero: Number(lote[1]) };
  if (n.includes("comun")) return { tipo: "uso-comun", id: "sector-norte-comun" };
  if (n.includes("produccion")) return { tipo: "produccion", id: "sector-norte-produccion" };
  if (n.includes("camino") || n.includes("calle")) return { tipo: "calle", id: "sector-norte-calle" };
  if (n.includes("sector")) return { tipo: "sector", id: "sector-norte" };
  return null;
}

const redondear = (n: number, decimales = 0) => Math.round(n * 10 ** decimales) / 10 ** decimales;

export type Conversion = { rasgos: RasgoLoteo[]; errores: string[] };

/** KML → rasgos del formato del loteo. Un polígono que no se entiende se informa y es un error: nunca se descarta. */
export function convertirKml(xml: string): Conversion {
  const errores: string[] = [];
  const rasgos: RasgoLoteo[] = [];
  const placemarks = leerKml(xml);
  if (placemarks.length === 0) errores.push("El archivo no tiene ningún polígono (<Placemark>).");
  for (const p of placemarks) {
    const c = clasificar(p.nombre);
    if (!c) {
      errores.push(`No entiendo el nombre del polígono "${p.nombre}": no es un lote, el sector, el uso común, la producción ni el camino.`);
      continue;
    }
    if (!p.anillo) {
      errores.push(`"${p.nombre}" no tiene un polígono (por ejemplo, es un punto o una línea).`);
      continue;
    }
    const propiedades: RasgoLoteo["properties"] = {
      tipo: c.tipo,
      id: c.id,
      nombre: c.tipo === "lote" ? `Lote ${c.numero}` : p.nombre,
      ...(c.tipo === "lote" ? { numero: c.numero, superficie_m2: redondear(areaM2(p.anillo)) } : {}),
      ...(c.tipo === "sector" ? { area_ha: redondear(areaM2(p.anillo) / 10_000, 1) } : {}),
      ilustrativo: true,
    };
    rasgos.push({ type: "Feature", properties: propiedades, geometry: { type: "Polygon", coordinates: [p.anillo] } });
  }
  return { rasgos, errores };
}

/**
 * Para un plano sin nombres (CAD): dice qué es cada Placemark, por su número. Todo Placemark tiene que estar acá, o ser
 * copia exacta de uno que esté: nunca se descarta nada en silencio, y lo que se ignora dice por qué.
 */
export type MapeoPlano = {
  sector: number;
  /** Número de lote → número de Placemark. */
  lotes: Record<string, number>;
  /** Número de finca de BioPueblo → su Placemark y su superficie oficial: los primeros lotes que se venden, fuera del 7A (R40). */
  primeros?: Record<string, { placemark: number; m2: number }>;
  /** Código del plano de Martín → número de Placemark. */
  parcelas: Record<string, number>;
  /** Número de Placemark → por qué no se usa. */
  ignorar: Record<string, string>;
};

const claveGeometria = (a: Anillo) =>
  a
    .map(([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`)
    .sort()
    .filter((p, i, todos) => p !== todos[i - 1])
    .join(" ");

/** Un trazo cerrado es un anillo (CAD deja el último vértice a milímetros del primero); uno abierto, no. */
function anilloDeTrazo(t: Anillo | null): Anillo | null {
  if (!t || t.length < 4 || distanciaM(t[0], t[t.length - 1]) > TOLERANCIA_BORDE_M) return null;
  return [...t.slice(0, -1), t[0]];
}

/** KML sin nombres + mapeo → rasgos. Lo que el mapeo no explica, lo que nombra y no existe o lo que clasifica dos veces es un error. */
export function convertirConMapeo(xml: string, mapeo: MapeoPlano): Conversion {
  const errores: string[] = [];
  const rasgos: RasgoLoteo[] = [];
  const clases = new Map<number, string[]>();
  const anotar = (numero: number, clase: string) => clases.set(numero, [...(clases.get(numero) ?? []), clase]);
  anotar(mapeo.sector, "sector");
  for (const [lote, n] of Object.entries(mapeo.lotes)) anotar(n, `lote-${lote}`);
  for (const [finca, { placemark }] of Object.entries(mapeo.primeros ?? {})) anotar(placemark, `primero-${finca}`);
  for (const [codigo, n] of Object.entries(mapeo.parcelas)) anotar(n, `parcela-${codigo}`);
  for (const n of Object.keys(mapeo.ignorar)) anotar(Number(n), "ignorar");

  const placemarks = leerKml(xml);
  if (placemarks.length === 0) errores.push("El archivo no tiene ningún polígono (<Placemark>).");
  const numeros = new Set(placemarks.map((p) => p.numero));
  for (const [n, c] of clases) {
    if (!numeros.has(n)) errores.push(`El mapeo nombra el Placemark ${n} (${c.join(", ")}), que no está en el plano.`);
    if (c.length > 1) errores.push(`El mapeo clasifica dos veces el Placemark ${n}: ${c.join(" y ")}.`);
  }

  const grupos = new Map<string, Placemark[]>();
  for (const p of placemarks) {
    const clave = claveGeometria(p.anillo ?? p.trazo ?? []);
    grupos.set(clave, [...(grupos.get(clave) ?? []), p]);
  }
  for (const copias of grupos.values()) {
    const nombres = copias.map((p) => p.numero ?? "sin número").join(", ");
    const conClase = copias.flatMap((p) => (p.numero !== null && clases.has(p.numero) ? [{ p, clase: clases.get(p.numero)![0] }] : []));
    if (conClase.length === 0) {
      errores.push(`El Placemark ${nombres} no está en el mapeo.`);
      continue;
    }
    if (new Set(conClase.map((c) => c.clase)).size > 1) {
      errores.push(`Los Placemarks ${nombres} tienen la misma geometría y el mapeo les da clases distintas.`);
      continue;
    }
    const { p, clase } = conClase[0];
    if (clase === "ignorar") continue;
    const anillo = p.anillo ?? anilloDeTrazo(p.trazo);
    if (!anillo) {
      errores.push(`El Placemark ${p.numero} (${clase}) no es un polígono cerrado.`);
      continue;
    }
    const lote = clase.match(/^lote-(\d+)$/);
    const primero = clase.match(/^primero-(\d+)$/);
    const propiedades: RasgoLoteo["properties"] = primero
      ? {
          tipo: "lote",
          id: `lote-${primero[1]}`,
          nombre: `Lote ${primero[1]}`,
          numero: Number(primero[1]),
          grupo: "primeros",
          superficie_m2: mapeo.primeros![primero[1]].m2,
          ilustrativo: true,
        }
      : lote
        ? { tipo: "lote", id: clase, nombre: `Lote ${lote[1]}`, numero: Number(lote[1]), superficie_m2: redondear(areaM2(anillo)), ilustrativo: true }
        : clase === "sector"
          ? { tipo: "sector", id: "sector-norte", nombre: "Sector norte", area_ha: redondear(areaM2(anillo) / 10_000, 1), ilustrativo: true }
          : { tipo: "parcela", id: clase, nombre: clase.replace(/^parcela-/, ""), ilustrativo: true };
    rasgos.push({ type: "Feature", properties: propiedades, geometry: { type: "Polygon", coordinates: [anillo] } });
  }
  return { rasgos, errores };
}

export const AVISO_RIO = "Franja del río: sin verificar (sin dato)";

export type Validacion = { errores: string[]; avisos: string[] };

const ZONAS_ESPERADAS: { tipo: TipoRasgoLoteo; id: string; nombre: string }[] = [
  { tipo: "sector", id: "sector-norte", nombre: "el sector norte" },
  { tipo: "uso-comun", id: "sector-norte-comun", nombre: "el espacio de uso común" },
  { tipo: "produccion", id: "sector-norte-produccion", nombre: "la producción" },
  { tipo: "calle", id: "sector-norte-calle", nombre: "el camino" },
];

function anilloValido(a: Anillo): boolean {
  if (a.length < 4) return false;
  const primero = a[0];
  const ultimo = a[a.length - 1];
  if (primero[0] !== ultimo[0] || primero[1] !== ultimo[1]) return false;
  const distintos = new Set(a.slice(0, -1).map((p) => `${p[0]},${p[1]}`));
  return distintos.size >= 3;
}

/**
 * Valida un loteo contra el polígono del 7A. `previo` son los ids de lote del archivo anterior, para avisar cuáles
 * desaparecen. Nada de esto escribe: si hay errores, el comando no toca el archivo.
 */
export function validarLoteo(
  rasgos: RasgoLoteo[],
  anillo7A: Anillo,
  previo: readonly string[] = [],
  estadosEjemplo: readonly string[] = Object.keys(ESTADOS_EJEMPLO),
): Validacion {
  const errores: string[] = [];
  const avisos: string[] = [];
  const lotes = rasgos.filter((r) => r.properties.tipo === "lote");

  if (lotes.length === 0) errores.push("No hay ningún lote.");

  for (const r of rasgos) {
    if (!anilloValido(r.geometry.coordinates[0] ?? [])) {
      errores.push(`${r.properties.id}: el anillo no es válido (tiene que estar cerrado y tener 3 vértices distintos o más).`);
    }
  }

  // Ids de lote: formato y repetidos.
  const vistos = new Map<string, string[]>();
  for (const l of lotes) {
    if (!/^lote-[1-9]\d*$/.test(l.properties.id)) errores.push(`${l.properties.id}: el id no tiene el formato lote-<número>.`);
    vistos.set(l.properties.id, [...(vistos.get(l.properties.id) ?? []), l.properties.nombre]);
  }
  for (const [id, nombres] of vistos) {
    if (nombres.length > 1) errores.push(`${id}: el id está repetido (${nombres.join(", ")}).`);
  }

  // Dos polígonos que dan el mismo id de zona (por ejemplo, dos caminos).
  const zonas = new Map<string, string[]>();
  for (const r of rasgos.filter((x) => x.properties.tipo !== "lote")) {
    zonas.set(r.properties.id, [...(zonas.get(r.properties.id) ?? []), r.properties.nombre]);
  }
  for (const [id, nombres] of zonas) {
    if (nombres.length > 1) errores.push(`${id}: ${nombres.map((n) => `"${n}"`).join(" y ")} dan el mismo id de zona.`);
  }

  // Geometría: solo de los anillos válidos, para no cascadear errores.
  const geometricos = lotes.filter((l) => anilloValido(l.geometry.coordinates[0] ?? []));
  for (const l of geometricos) {
    // Los primeros lotes están fuera del 7A a propósito (R40).
    if (l.properties.grupo !== "primeros" && !anilloDentro(l.geometry.coordinates[0], anillo7A)) errores.push(`${l.properties.id}: queda fuera del polígono del 7A.`);
  }
  for (let i = 0; i < geometricos.length; i++) {
    for (let j = i + 1; j < geometricos.length; j++) {
      if (seSuperponen(geometricos[i].geometry.coordinates[0], geometricos[j].geometry.coordinates[0])) {
        errores.push(`${geometricos[i].properties.id} y ${geometricos[j].properties.id} se superponen.`);
      }
    }
  }

  // Una parcela sin uso definido no puede pisar un lote: se vería como parte de lo que se vende.
  for (const p of rasgos.filter((r) => r.properties.tipo === "parcela" && anilloValido(r.geometry.coordinates[0] ?? []))) {
    for (const l of geometricos) {
      if (seSuperponen(p.geometry.coordinates[0], l.geometry.coordinates[0])) {
        errores.push(`${p.properties.id} y ${l.properties.id} se superponen.`);
      }
    }
  }

  // Avisos.
  for (const z of ZONAS_ESPERADAS) {
    if (!rasgos.some((r) => r.properties.tipo === z.tipo)) avisos.push(`Falta ${z.nombre}: la pantalla dice "sin dato".`);
  }
  const ahora = new Set(lotes.map((l) => l.properties.id));
  for (const id of previo) {
    if (!ahora.has(id)) avisos.push(`${id} ya no está (afecta a los estados de ejemplo y a las reservas guardadas).`);
  }
  for (const id of estadosEjemplo) {
    if (!ahora.has(id)) avisos.push(`${id} tiene un estado de ejemplo pero ya no existe.`);
  }
  avisos.push(AVISO_RIO);

  return { errores, avisos };
}

/** El archivo de datos que escribe el comando: mismo formato del boceto, con `fuenteId: "martin"`. */
export function armarSalida(rasgos: RasgoLoteo[], archivo: string, importado: string): ArchivoLoteo {
  const orden: TipoRasgoLoteo[] = ["sector", "parcela", "produccion", "uso-comun", "calle", "lote"];
  const ordenados = [...rasgos].sort(
    (a, b) =>
      orden.indexOf(a.properties.tipo) - orden.indexOf(b.properties.tipo) || (a.properties.numero ?? 0) - (b.properties.numero ?? 0),
  );
  return {
    type: "FeatureCollection",
    metadata: { fuente: "Plano de Martín", fuenteId: "martin", archivo, importado },
    features: ordenados,
  };
}

/** Texto del archivo: un rasgo por línea, para que el diff de un reemplazo se pueda leer. */
export function serializar(salida: ArchivoLoteo): string {
  return `{"type":"FeatureCollection","metadata":${JSON.stringify(salida.metadata)},"features":[\n${salida.features
    .map((f) => JSON.stringify(f))
    .join(",\n")}\n]}\n`;
}
