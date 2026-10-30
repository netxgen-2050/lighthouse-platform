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
  "textos/gobernanza": {
    estado: "pendiente",
    que: "Gobernanza fractal: página Cómo decidimos (estructura, círculos, consejo), marca de validación de la ficha de tribu y Quiénes te validaron en Mi recorrido",
  },
  "lib/gobernanza/datos.ts": {
    estado: "pendiente",
    que: "Nombres, propósitos y 'Decide sobre' de los círculos de ejemplo del común, de cada tribu y del círculo transversal, con su inglés",
  },
  "lib/tribus/datos.ts": {
    estado: "pendiente",
    que: "Datos de ejemplo de las 12 tribus con su inglés (foco, qué tiene, qué busca, ritual, forma jurídica…) y la declaración de cada tribu, traducida del español",
  },
  "lib/tribus/necesidades.ts": {
    estado: "pendiente",
    que: "Necesidades de ejemplo de las tribus como tareas (título, qué es y habilidad extra) con su inglés",
  },
  "lib/manifiestos/datos.ts": {
    estado: "pendiente",
    que: "Manifiestos de ejemplo (el del Lighthouse y siete de tribus) traducidos del español: voz de la comunidad, a revisar también con quien los escriba de verdad",
  },
  "textos/manifiestoVrn": {
    estado: "pendiente",
    que: "Manifiesto de Lighthouse VRN: ficha del común, tarjeta de Tribus, lectura completa, principios propios de las tribus, aviso de adhesión y bloque de la Vista NetX",
  },
  "lib/manifiestos/lighthouse-vrn.ts": {
    estado: "pendiente",
    que: "Texto del manifiesto de Lighthouse VRN (propósito, 15 principios, 7 derechos de la tierra, compromisos, cómo se cambia) y nombre visible del común; traducidos del español, borrador a ratificar",
  },
  "lib/territorios/textos.ts": {
    estado: "pendiente",
    que: "Textos del territorio con su inglés: terreno común, descripción y nombres descriptivos de los lugares, bienes comunes",
  },
  "textos/pasaporte": {
    estado: "pendiente",
    que: "Pasaporte: sellos y lo que abren, tarjeta y diálogo de verificación de identidad (KYC) con sus errores, sello de la billetera y datos de aporte",
  },
  "textos/semillas": {
    estado: "pendiente",
    que: "Semillas: libro por comunidad, detalle, meta de sembrador/a activo/a y ronda de reconocimiento (\"Semillas\" no se traduce)",
  },
  "textos/pactos": {
    estado: "pendiente",
    que: "Pactos: pactos de tiempo y de plata, cambios, historial, avisos y anuncios",
  },
  "lib/semillas/datos.ts": {
    estado: "pendiente",
    que: "Datos de ejemplo de la ronda de reconocimiento con su inglés (compañeros, criterios y reconocimiento recibido)",
  },
  "lib/evaluacion/guia.ts": {
    estado: "pendiente",
    que: "Guía por nivel de estrellas (1 a 5) de la evaluación entre pares, rol y cultura",
  },
  "lib/evaluacion/ejemplo.ts": {
    estado: "pendiente",
    que: "Motivos de ejemplo y resumen de ejemplo del feedback de la evaluación entre pares",
  },
  "lib/pactos/datos.ts": {
    estado: "pendiente",
    que: "Roles de ejemplo (nombre y descripción), pestañas y pasos de un pacto, con su inglés",
  },
  "textos/fogon": {
    estado: "pendiente",
    que: "Fogón: encabezado, enlace a Cómo decidimos, filtros por ámbito (Círculo, Tribu, común, Consejo, Fideicomiso), opciones de voto, motivos para no votar, llevar al consejo, acta de ejemplo y ayudas (\"Fideicomiso\" = Trust)",
  },
  "textos/fogonConsultas": {
    estado: "pendiente",
    que: "Consultas del Fogón: lista, reparto de créditos con voto cuadrático, voto abierto o secreto, padrón, resultado por grupo, acta de ejemplo, gráfico de dona y errores de lectura",
  },
  "textos/fogonPropuestas": {
    estado: "pendiente",
    que: "Propuestas del Fogón: fases, discusión, concerns y grupos, acuse y quórum, ámbito del consejo, niveles, acciones, condiciones de la matriz, mecanismos y vista sin cuenta",
  },
  "lib/fogon/propuestas/ejemplos.ts": {
    estado: "pendiente",
    que: "Cinco propuestas de ejemplo del Fogón (problema, propuesta, registros, guiones de Hifa y del Guardián) con su inglés",
  },
  "lib/fogon/propuestas/principios.ts": {
    estado: "pendiente",
    que: "Lista de ejemplo (borrador) de 16 principios del Lighthouse con su explicación en inglés",
  },
  "lib/fogon/consultas/ejemplo.ts": {
    estado: "pendiente",
    que: "Consultas de ejemplo del Fogón (título, descripción, opciones y nota del monto) con su inglés, traducidas del español",
  },
  "textos/compromisos": {
    estado: "pendiente",
    que: "Compromisos y Mercado: formulario, validaciones, tipos y medios de intercambio, filtros y avisos",
  },
  "textos/canales": {
    estado: "pendiente",
    que: "Canales: por qué se abre cada puerta, qué la abre, refuerzo por presencia y nombres de planes y niveles del pase",
  },
  "textos/perfil": {
    estado: "pendiente",
    que: "Perfil: encabezado, formulario, tarjetas, errores de validación y las seis preguntas de la entrevista",
  },
  "textos/recorrido": {
    estado: "pendiente",
    que: "Mi recorrido: próximo paso (cinco pasos), pestañas, línea de tiempo y tabla de la Bitácora",
  },
  "textos/bandeja": {
    estado: "pendiente",
    que: "Bandeja y notificaciones: textos de cada evento de la actividad, que se arman al mostrarlos en el idioma actual",
  },
  "textos/configuracion": {
    estado: "pendiente",
    que: "Configuración: apariencia, avisos por tipo, Hifa, moneda, idioma y borrado de lo guardado en el navegador",
  },
  "lib/fogon/datos.ts": {
    estado: "pendiente",
    que: "Decisiones de ejemplo del Fogón (título, lugar y regla; incluye las de círculo, tribu, común y consejo) con su inglés, traducidas del español",
  },
  "lib/compromisos/mercado.ts": {
    estado: "pendiente",
    que: "Ofertas de ejemplo del Mercado con su inglés, traducidas del español (las que publica la persona no se traducen)",
  },
  "lib/economia/terminos.ts": {
    estado: "pendiente",
    que: "Término económico 🌱 de Semillas en inglés (borrador, sin revisión)",
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
    "lib/tribus/necesidades.ts",
    "lib/gobernanza/datos.ts",
    "lib/manifiestos/datos.ts",
    "lib/manifiestos/lighthouse-vrn.ts",
    "lib/territorios/textos.ts",
    "lib/semillas/datos.ts",
    "lib/evaluacion/guia.ts",
    "lib/evaluacion/ejemplo.ts",
    "lib/pactos/datos.ts",
    "lib/fogon/datos.ts",
    "lib/fogon/consultas/ejemplo.ts",
    "lib/compromisos/mercado.ts",
    "lib/economia/terminos.ts",
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
