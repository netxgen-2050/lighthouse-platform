import { marco } from "@/lib/idioma/textos/marco";
import { sumarte } from "@/lib/idioma/textos/sumarte";
import type { Idioma } from "@/lib/idioma/tipos";
import { esPublica } from "@/lib/sesion/rutas-publicas";

/**
 * Niveles de acceso según cómo se suma la persona (Sumarte). Cada uno incluye todo lo del anterior.
 * `fundador` es quien tiene el Pase Fundador (sin Plan Tribu). Votar en el Fideicomiso no sale de este orden sino de la
 * puerta `voto-fideicomiso` (`lib/permisos/tabla.ts`): un líder de tribu sin pase no vota ahí.
 * `sin-cuenta` no es un plan: es quien todavía no se registró. `superadmin` no se elige: viene de `LH_PERSONAS`.
 */
export const NIVELES = ["sin-cuenta", "explorador", "miembro", "fundador", "lider", "superadmin"] as const;
export type Nivel = (typeof NIVELES)[number];

const CLAVE_NIVEL = {
  "sin-cuenta": "sinCuenta",
  explorador: "explorador",
  miembro: "miembro",
  fundador: "fundador",
  lider: "lider",
  superadmin: "superadmin",
} as const satisfies Record<Nivel, keyof typeof marco.es.niveles>;

/** El nombre de un nivel en un idioma (del diccionario del marco, que toma los términos del glosario). */
export function etiquetaDeNivel(nivel: Nivel, idioma: Idioma = "es"): string {
  return marco[idioma].niveles[CLAVE_NIVEL[nivel]];
}

export const ETIQUETA_NIVEL: Record<Nivel, string> = {
  "sin-cuenta": etiquetaDeNivel("sin-cuenta"),
  explorador: etiquetaDeNivel("explorador"),
  miembro: etiquetaDeNivel("miembro"),
  fundador: etiquetaDeNivel("fundador"),
  lider: etiquetaDeNivel("lider"),
  superadmin: etiquetaDeNivel("superadmin"),
};

/** Lo que una persona puede hacer en la plataforma. */
export type Capacidad =
  | "descubrir"
  | "sumarte"
  | "hifa"
  | "congreso"
  | "personal"
  | "reportar"
  | "participar"
  | "adherir"
  | "admin-tribu"
  | "netx";

/** Nivel mínimo que habilita cada capacidad. */
export const NIVEL_MINIMO: Record<Capacidad, Nivel> = {
  descubrir: "sin-cuenta",
  sumarte: "sin-cuenta",
  hifa: "explorador",
  congreso: "explorador",
  personal: "explorador",
  reportar: "sin-cuenta",
  participar: "miembro",
  adherir: "miembro",
  "admin-tribu": "lider",
  netx: "superadmin",
};

/** ¿Este nivel llega al mínimo pedido? */
export function alcanza(nivel: Nivel, minimo: Nivel): boolean {
  return NIVELES.indexOf(nivel) >= NIVELES.indexOf(minimo);
}

export function puedeCapacidad(nivel: Nivel, capacidad: Capacidad): boolean {
  return alcanza(nivel, NIVEL_MINIMO[capacidad]);
}

/** Los destinos de "Participar" (Pactos, Semillas, Fogón, Compromisos) piden ser Miembro. */
const PARTICIPAR = ["/pactos", "/semillas", "/fogon", "/compromisos"];

function limpiar(ruta: string): string {
  const sinQuery = ruta.split(/[?#]/)[0] ?? "";
  return sinQuery.length > 1 ? sinQuery.replace(/\/+$/, "") : sinQuery;
}

function dentroDe(ruta: string, base: string): boolean {
  return ruta === base || ruta.startsWith(`${base}/`);
}

/** Qué capacidad pide abrir una ruta. Lo que no se lista es del espacio personal (Explorador). */
export function capacidadDeRuta(ruta: string): Capacidad {
  const r = limpiar(ruta);
  if (dentroDe(r, "/sumarte")) return "sumarte";
  if (esPublica(r)) return "descubrir";
  if (dentroDe(r, "/netx")) return "netx";
  if (PARTICIPAR.some((p) => dentroDe(r, p))) return "participar";
  if (dentroDe(r, "/congreso")) return "congreso";
  return "personal";
}

export function nivelMinimoDeRuta(ruta: string): Nivel {
  return NIVEL_MINIMO[capacidadDeRuta(ruta)];
}

export function puedeRuta(nivel: Nivel, ruta: string): boolean {
  return alcanza(nivel, nivelMinimoDeRuta(ruta));
}

const NOMBRE_DE_RUTA: readonly [string, keyof (typeof sumarte)["es"]["avisos"]["rutas"]][] = [
  ["/pactos", "pactos"],
  ["/semillas", "semillas"],
  ["/fogon", "fogon"],
  ["/compromisos", "compromisos"],
  ["/congreso", "congreso"],
  ["/perfil", "perfil"],
  ["/pasaporte", "pasaporte"],
  ["/panel", "panel"],
  ["/bandeja", "bandeja"],
  ["/configuracion", "configuracion"],
  ["/netx", "netx"],
];

/** Aviso de Sumarte cuando alguien abre por dirección una página que su nivel no habilita. */
export function avisoDeRuta(ruta: string, idioma: Idioma = "es"): string {
  const t = sumarte[idioma].avisos;
  const r = limpiar(ruta);
  const nombre = t.rutas[NOMBRE_DE_RUTA.find(([base]) => dentroDe(r, base))?.[1] ?? "otra"];
  const minimo = nivelMinimoDeRuta(r);
  if (minimo === "superadmin") return t.rutaSuperadmin(nombre);
  if (minimo === "fundador") return t.rutaFundador(nombre);
  if (minimo === "lider") return t.rutaLider(nombre);
  if (minimo === "miembro") return t.rutaMiembro(nombre);
  return t.rutaExplorador(nombre);
}

/** Aviso cuando una acción (no una página) pide un nivel, por ejemplo adherir a una tribu. */
export function avisoDeNivel(minimo: Nivel, idioma: Idioma = "es"): string {
  const t = sumarte[idioma].avisos;
  if (minimo === "explorador") return t.accionExplorador;
  if (minimo === "miembro") return t.accionMiembro;
  if (minimo === "fundador") return t.accionFundador;
  if (minimo === "lider") return t.accionLider;
  return t.accionNinguna;
}

/** Convierte lo que viene en la dirección (`?para=`) en un nivel que se puede elegir en Sumarte, o null. */
export function nivelDeParametro(valor: string | null | undefined): Nivel | null {
  return valor === "explorador" || valor === "miembro" || valor === "lider" ? valor : null;
}

/** Ayuda corta de un destino deshabilitado en el rail. */
export function ayudaDeRuta(ruta: string, idioma: Idioma = "es"): string {
  const t = marco[idioma].rail;
  return nivelMinimoDeRuta(ruta) === "explorador" ? t.ayudaExplorador : t.ayudaMiembro;
}

/** Solo rutas internas ("/algo"): evita volver a una dirección externa o con barras dobles. */
export function esRutaInterna(ruta: string | null | undefined): ruta is string {
  // Sin caracteres de control (tab, CR, LF…): el navegador los borra y "/\t/sitio.com" pasaría a ser "//sitio.com".
  return typeof ruta === "string" && /^\/(?![/\\])/.test(ruta) && !/[\\\u0000-\u001f\u007f]/.test(ruta);
}
