// Idiomas de la vitrina del Congreso (español con voseo / inglés). Módulo puro, sin dependencias:
// lo usan las piezas portables del evento, el contenido y las piezas de NetX dentro de /congreso.

export type Idioma = "es" | "en";

export const IDIOMAS: readonly Idioma[] = ["es", "en"];

export function esIdioma(x: unknown): x is Idioma {
  return x === "es" || x === "en";
}

/** Un texto en los dos idiomas. Si falta `en` (o está vacío), se usa el español y se anota la ruta. */
export type Bilingue = { es: string; en?: string };

/** Valores que pueden ser iguales en español y en inglés: nombres propios, marcas y códigos. */
export const NEUTROS: readonly string[] = [
  "NetX",
  "UnityHub",
  "Genesis",
  "GENESIS 2027",
  "USD",
  "ES",
  "EN",
  "LH27-8F3K-2Q",
  "Lighthouse",
  "Río Negro",
  "BioPueblo",
  "Puerto Madryn",
  "Playas Doradas",
  "Patagonia, Argentina",
  "7 min",
  "min",
  "FAQ",
  "speakers",
  "The Venus Project",
  "P2P Foundation",
  "Earthship Biotecture",
  "Regen Dev Corp",
  "Stripe",
];

/** ¿Puede este valor ser igual en los dos idiomas? Nombres de la lista, o solo números y signos ("10.000", "8–9"). */
export function esNeutro(valor: string): boolean {
  const v = valor.trim();
  return NEUTROS.includes(v) || /^[\d\s.,–-]+$/.test(v);
}

function esBilingue(v: unknown): v is Bilingue {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const claves = Object.keys(v);
  if (claves.length === 0 || !claves.includes("es")) return false;
  if (!claves.every((c) => c === "es" || c === "en")) return false;
  const o = v as Record<string, unknown>;
  return typeof o.es === "string" && (o.en === undefined || typeof o.en === "string");
}

/**
 * Resuelve en un idioma todo texto `{ es, en }` de la fuente. En inglés, si falta la traducción (o es vacía o solo
 * espacios) devuelve el español y anota la ruta del texto ("voces.principales.0.afiliacion"): nunca devuelve vacío.
 */
export function resolver<R = unknown>(fuente: unknown, idioma: Idioma): { valor: R; sinTraducir: string[] } {
  const sinTraducir: string[] = [];
  const recorrer = (v: unknown, ruta: string): unknown => {
    if (esBilingue(v)) {
      if (idioma === "es") return v.es;
      if (v.en !== undefined && v.en.trim() !== "") return v.en;
      sinTraducir.push(ruta);
      return v.es;
    }
    if (Array.isArray(v)) return v.map((x, i) => recorrer(x, ruta ? `${ruta}.${i}` : String(i)));
    if (v && typeof v === "object") {
      const salida: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) salida[k] = recorrer(x, ruta ? `${ruta}.${k}` : k);
      return salida;
    }
    return v;
  };
  const valor = recorrer(fuente, "") as R;
  return { valor, sinTraducir };
}
