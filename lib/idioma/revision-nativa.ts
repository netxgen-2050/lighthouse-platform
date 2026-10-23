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
