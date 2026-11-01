import { CIRCULOS_DEL_COMUN } from "@/lib/gobernanza/datos";
import type { Circulo } from "@/lib/gobernanza/tipos";
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import type { Anillo, Punto } from "@/lib/territorios/biopueblo";
import { macrolote7 } from "@/lib/territorios/biopueblo";
import type { Fase } from "@/lib/territorios/fases";
import { distanciaM, puntoEnAnillo } from "@/lib/territorios/geometria";

// Frentes de trabajo de EJEMPLO (boceto aprobado el 29-oct-2026). Los puntos son ilustrativos: no marcan obras reales.
// El inglés de estos datos está pendiente de revisión nativa (`lib/idioma/revision-nativa.ts`).

/** Distancia mínima entre dos puntos de frentes, para que los sellos del mapa no se pisen. */
export const DISTANCIA_MINIMA_M = 300;

export type FrenteBilingue = {
  /** Estable: lo usan `?sel=` del mapa y los tests. */
  id: string;
  nombre: BilingueConOriginal;
  /** Id de un círculo de `CIRCULOS_DEL_COMUN`. */
  circuloId: string;
  necesidad: BilingueConOriginal;
  /** `null` = sin dato (nunca vacío ni 0). */
  faltan: BilingueConOriginal | null;
  /** Texto libre del boceto ("siembra de otoño"), no una fecha; `null` = sin dato. */
  paraCuando: BilingueConOriginal | null;
  desde: Fase;
  /** [lng, lat] dentro del Macrolote 7; `null` = sin lugar en el mapa. */
  lugar: Punto | null;
  ejemplo: true;
};

/** Un frente en un solo idioma, listo para mostrar. */
export type Frente = {
  id: string;
  nombre: string;
  circuloId: string;
  necesidad: string;
  faltan: string | null;
  paraCuando: string | null;
  desde: Fase;
  lugar: Punto | null;
  ejemplo: true;
};

const b = (es: string, en: string): BilingueConOriginal => ({ es, en });

const FRENTES: readonly FrenteBilingue[] = [
  {
    id: "agua-cuenca",
    nombre: b("Agua y cuenca", "Water and watershed"),
    circuloId: "comun-agua",
    necesidad: b("Medir el caudal del canal y diseñar la primera toma", "Measure the canal flow and design the first intake"),
    faltan: b("1 hidróloga, 2 personas para mediciones de campo", "1 hydrologist, 2 people for field measurements"),
    paraCuando: b("antes de diciembre", "before December"),
    desde: 0,
    lugar: [-67.31, -39.13],
    ejemplo: true,
  },
  {
    id: "acceso-camino",
    nombre: b("Acceso y camino", "Access and road"),
    circuloId: "comun-contratistas",
    necesidad: b("Mejorar 3 km de huella para que entre un camión", "Improve 3 km of track so a truck can get in"),
    faltan: b("1 persona con máquina, presupuesto", "1 person with machinery, a budget"),
    paraCuando: b("enero", "January"),
    desde: 0,
    lugar: [-67.305, -39.139],
    ejemplo: true,
  },
  {
    id: "vivero-suelo",
    nombre: b("Vivero y suelo", "Nursery and soil"),
    circuloId: "comun-permacultura",
    necesidad: b("Primer vivero de nativas del monte y ensayo de suelo", "First nursery of native scrub plants and a soil trial"),
    faltan: b("3 voluntarias por mes, 1 persona que sepa de nativas", "3 volunteers per month, 1 person who knows native plants"),
    paraCuando: b("siembra de otoño", "autumn sowing"),
    desde: 0,
    lugar: [-67.316, -39.14],
    ejemplo: true,
  },
  {
    id: "linea-de-base",
    nombre: b("Línea de base", "Baseline"),
    circuloId: "comun-permacultura",
    necesidad: b("Medir suelo, vegetación y agua antes de intervenir (Libro C)", "Measure soil, vegetation and water before intervening (Book C)"),
    faltan: null,
    paraCuando: b("verano", "summer"),
    desde: 0,
    lugar: [-67.309, -39.148],
    ejemplo: true,
  },
  {
    id: "primer-obrador",
    nombre: b("Primer obrador", "First work camp"),
    circuloId: "comun-contratistas",
    necesidad: b("Un lugar para guardar herramientas y dormir 6 personas", "A place to store tools and sleep 6 people"),
    faltan: b("diseño bioclimático, materiales", "bioclimatic design, materials"),
    paraCuando: b("2027", "2027"),
    desde: 1,
    lugar: [-67.3125, -39.1235],
    ejemplo: true,
  },
  {
    id: "parque-agrovoltaico",
    nombre: b("Parque agrovoltaico", "Agrivoltaic park"),
    circuloId: "comun-contratistas",
    necesidad: b("Estudio de suelo y conexión a la red", "Soil study and grid connection"),
    faltan: b("cotización de una desarrolladora", "a quote from a developer"),
    paraCuando: b("2027", "2027"),
    desde: 1,
    lugar: [-67.303, -39.152],
    ejemplo: true,
  },
  {
    id: "papeles-fideicomiso",
    nombre: b("Papeles y fideicomiso", "Paperwork and trust"),
    circuloId: "comun-legal",
    necesidad: b("Fundación, fideicomisos por series, Ordenanza 173", "Foundation, series trusts, Ordinance 173"),
    faltan: b("un abogado o abogada (sin presupuesto)", "a lawyer (no budget)"),
    paraCuando: null,
    desde: 0,
    lugar: null,
    ejemplo: true,
  },
  {
    id: "comunicacion",
    nombre: b("Comunicación", "Communications"),
    circuloId: "comun-marketing",
    necesidad: b("Contar el proyecto y convocar a los primeros equipos", "Tell the project's story and call the first teams"),
    faltan: b("1 persona de contenidos", "1 content person"),
    paraCuando: null,
    desde: 0,
    lugar: null,
    ejemplo: true,
  },
];

export function frentesBilingues(): readonly FrenteBilingue[] {
  return FRENTES;
}

function enIdioma(f: FrenteBilingue, idioma: Idioma): Frente {
  return {
    id: f.id,
    nombre: textoEn(f.nombre, idioma),
    circuloId: f.circuloId,
    necesidad: textoEn(f.necesidad, idioma),
    faltan: f.faltan ? textoEn(f.faltan, idioma) : null,
    paraCuando: f.paraCuando ? textoEn(f.paraCuando, idioma) : null,
    desde: f.desde,
    lugar: f.lugar,
    ejemplo: true,
  };
}

/** Los frentes de un círculo del común, en el idioma pedido y en el orden de los datos. */
export function frentesDe(circuloId: string, idioma: Idioma): Frente[] {
  return FRENTES.filter((f) => f.circuloId === circuloId).map((f) => enIdioma(f, idioma));
}

/** Vacío en español o en inglés (un `en` ausente es otra cosa: cae al español). */
const vacio = (x: BilingueConOriginal | null): boolean =>
  x !== null && (x.es.trim() === "" || (x.en !== undefined && x.en.trim() === ""));

/**
 * Revisa los frentes y devuelve un mensaje por cada error (lista vacía = todo bien). Cada mensaje nombra el frente.
 * Errores: círculo inexistente, id repetido, punto fuera del contorno, texto vacío donde debería ser `null`, y dos
 * puntos a menos de `DISTANCIA_MINIMA_M`.
 */
export function validarFrentes(
  lista: readonly FrenteBilingue[] = FRENTES,
  circulos: readonly Pick<Circulo, "id">[] = CIRCULOS_DEL_COMUN,
  contorno: Anillo = macrolote7().anillo,
): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  for (const f of lista) {
    if (ids.has(f.id)) errores.push(`${f.id}: id repetido`);
    ids.add(f.id);
    if (!circulos.some((c) => c.id === f.circuloId)) errores.push(`${f.id}: el círculo ${f.circuloId} no existe`);
    if (f.lugar && !puntoEnAnillo(f.lugar, contorno)) errores.push(`${f.id}: el punto está fuera del Macrolote 7`);
    if (vacio(f.faltan)) errores.push(`${f.id}: "faltan" está vacío (debe ser null si no hay dato)`);
    if (vacio(f.paraCuando)) errores.push(`${f.id}: "paraCuando" está vacío (debe ser null si no hay dato)`);
  }
  const conLugar = lista.filter((f) => f.lugar);
  for (let i = 0; i < conLugar.length; i++) {
    for (let j = i + 1; j < conLugar.length; j++) {
      if (distanciaM(conLugar[i].lugar!, conLugar[j].lugar!) < DISTANCIA_MINIMA_M) {
        errores.push(`${conLugar[i].id} y ${conLugar[j].id}: puntos a menos de ${DISTANCIA_MINIMA_M} m`);
      }
    }
  }
  return errores;
}

/** Todos los frentes en el idioma pedido y en el orden de los datos. */
export function listarFrentes(idioma: Idioma): Frente[] {
  return FRENTES.map((f) => enIdioma(f, idioma));
}
