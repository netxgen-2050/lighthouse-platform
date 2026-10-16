// Revisión por un hablante nativo del inglés escrito por agentes (decisión de Gus, 15-oct-2026: más adelante).
// Todo entra como `pendiente`; pasa a `revisado` solo cuando Gus lo indica, con quién y cuándo.
// La clave es la fuente: `textos/<zona>` para cada diccionario de DICCIONARIOS, `glosario`, y la ruta del archivo para
// los datos de ejemplo con inglés (`lib/tribus/datos.ts`…) y el catálogo legal (`lib/legal/terminos.ts`).
import { GLOSARIO } from "./glosario";
import { hojas } from "./recorrer";
import { DICCIONARIOS } from "./textos";

export type EstadoRevision = "pendiente" | "revisado";

export type Revision = {
  estado: EstadoRevision;
  /** Qué es la fuente, en una línea. */
  que: string;
  revisadoPor?: string;
  fecha?: string;
};

export const REVISION_NATIVA: Record<string, Revision> = {
  "textos/marco": {
    estado: "pendiente",
    que: "Marco de la plataforma: rail, barra superior, menú de la persona, campanita, pie, 404 y pantallas de la puerta",
  },
  "textos/comunes": {
    estado: "pendiente",
    que: "Textos que se repiten en todas las zonas (cargando, cancelar, sin dato, notas de traducción…)",
  },
  "textos/portada": {
    estado: "pendiente",
    que: "Portada: título, bajada, los tres caminos y la cantidad de barrios",
  },
  "textos/sumarte": {
    estado: "pendiente",
    que: "Sumarte: planes, niveles del pase (Seed, Sprout, Root, a confirmar), inversores, avisos de nivel, formulario de pedido de contacto y panel Entrar como…",
  },
  "lib/sumarte/datos.ts": {
    estado: "pendiente",
    que: "Comparativa de planes de Sumarte (filas de ejemplo con su inglés)",
  },
  "textos/tribus": {
    estado: "pendiente",
    que: "Tribus: listado, ficha, botones de membresía, interfaz del manifiesto y postulación de una comunidad (formulario, requisitos y errores)",
  },
  "textos/territorio": {
    estado: "pendiente",
    que: "Territorio: vitrina, leyenda y controles del mapa, ficha lateral y marcadores",
  },
  "lib/tribus/datos.ts": {
    estado: "pendiente",
    que: "Datos de ejemplo de las 12 tribus con su inglés (foco, qué tiene, qué busca, ritual, forma jurídica…) y la declaración de cada tribu, traducida del español",
  },
  "lib/manifiestos/datos.ts": {
    estado: "pendiente",
    que: "Manifiestos de ejemplo (el del Lighthouse y siete de tribus) traducidos del español: voz de la comunidad, a revisar también con quien los escriba de verdad",
  },
  "lib/territorios/textos.ts": {
    estado: "pendiente",
    que: "Textos del territorio con su inglés: terreno común, descripción y nombres descriptivos de los lugares, bienes comunes",
  },
  glosario: {
    estado: "pendiente",
    que: "Glosario de términos de la plataforma (Pase Fundador, Fogón…); confirmado por Gus el 15-oct-2026, falta el nativo",
  },
  "lib/legal/terminos.ts": {
    estado: "pendiente",
    que: "Catálogo de términos legales (⚖) con su explicación en inglés; borradores sin revisión legal",
  },
  "lib/congreso/evento-ejemplo.ts": {
    estado: "pendiente",
    que: "Página del Congreso en inglés (/congreso/en): datos de ejemplo del evento",
  },
};

/** Cantidad de textos en inglés de una fuente, si se puede contar sin leer el archivo. */
export function cantidadEnIngles(fuente: string): number | null {
  if (fuente === "glosario") return Object.keys(GLOSARIO).length;
  const zona = fuente.replace(/^textos\//, "") as keyof typeof DICCIONARIOS;
  if (fuente.startsWith("textos/") && zona in DICCIONARIOS) return hojas(DICCIONARIOS[zona].en).length;
  return null;
}

/** Fuentes que un diccionario o el glosario exigen anotar. */
export function fuentesObligatorias(): string[] {
  return [
    ...Object.keys(DICCIONARIOS).map((z) => `textos/${z}`),
    "glosario",
    // Archivos con inglés propio fuera de los diccionarios.
    "lib/legal/terminos.ts",
    "lib/congreso/evento-ejemplo.ts",
    "lib/sumarte/datos.ts",
    "lib/tribus/datos.ts",
    "lib/manifiestos/datos.ts",
    "lib/territorios/textos.ts",
  ];
}

/** La lista de pendientes en Markdown (la versiona `docs/idioma/revisar-nativo.md`). */
export function listaPendientes(revision: Record<string, Revision> = REVISION_NATIVA): string {
  const pendientes = Object.entries(revision)
    .filter(([, r]) => r.estado === "pendiente")
    .sort(([a], [b]) => a.localeCompare(b));
  const filas = pendientes.map(([fuente, r]) => {
    const n = cantidadEnIngles(fuente);
    return `| \`${fuente}\` | ${r.que} | ${n ?? "—"} |`;
  });
  return [
    "# Inglés pendiente de revisión por un hablante nativo",
    "",
    "Este archivo lo genera `pnpm idioma:pendientes` (no se edita a mano) a partir de `lib/idioma/revision-nativa.ts`.",
    "Todo el inglés lo escribió un agente y está pendiente hasta que un hablante nativo lo revise.",
    "",
    "**Cómo marcar algo como revisado:** en `lib/idioma/revision-nativa.ts`, cambiá el `estado` de la fuente a `\"revisado\"`",
    "y sumá `revisadoPor` y `fecha` (AAAA-MM-DD). Después corré `pnpm idioma:pendientes`.",
    "",
    `Fuentes pendientes: ${pendientes.length}`,
    "",
    "| Fuente | Qué es | Textos en inglés |",
    "|---|---|---|",
    ...filas,
    "",
  ].join("\n");
}
