import { esPublica } from "@/lib/sesion/rutas-publicas";

/**
 * Niveles de acceso según cómo se suma la persona (Sumarte). Cada uno incluye todo lo del anterior.
 * `fundador` es quien tiene el Pase Fundador (sin Plan Tribu). Votar en el Fideicomiso no sale de este orden sino de la
 * puerta `voto-fideicomiso` (`lib/permisos/tabla.ts`): un líder de tribu sin pase no vota ahí.
 * `sin-cuenta` no es un plan: es quien todavía no se registró. `superadmin` no se elige: viene de `LH_PERSONAS`.
 */
export const NIVELES = ["sin-cuenta", "explorador", "miembro", "fundador", "lider", "superadmin"] as const;
export type Nivel = (typeof NIVELES)[number];

export const ETIQUETA_NIVEL: Record<Nivel, string> = {
  "sin-cuenta": "Sin cuenta",
  explorador: "Explorador",
  miembro: "Miembro",
  fundador: "Fundador",
  lider: "Líder de tribu",
  superadmin: "Super admin",
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

const NOMBRE_DE_RUTA: readonly [string, string][] = [
  ["/pactos", "Pactos"],
  ["/semillas", "Semillas"],
  ["/fogon", "Fogón"],
  ["/compromisos", "Compromisos"],
  ["/congreso", "Congreso"],
  ["/perfil", "Perfil"],
  ["/pasaporte", "Pasaporte"],
  ["/panel", "Mi recorrido"],
  ["/bandeja", "Bandeja"],
  ["/configuracion", "Configuración"],
  ["/netx", "NetX"],
];

/** Aviso de Sumarte cuando alguien abre por dirección una página que su nivel no habilita. */
export function avisoDeRuta(ruta: string): string {
  const r = limpiar(ruta);
  const nombre = NOMBRE_DE_RUTA.find(([base]) => dentroDe(r, base))?.[1] ?? "Esta página";
  const minimo = nivelMinimoDeRuta(r);
  if (minimo === "superadmin") return `${nombre} es solo para el super admin del prototipo.`;
  if (minimo === "fundador") return `${nombre} se habilita con el Pase Fundador.`;
  if (minimo === "lider") return `${nombre} se habilita con el Plan Tribu.`;
  if (minimo === "miembro") return `${nombre} se habilita con el plan Miembro.`;
  return `${nombre} se habilita al sumarte gratis como Explorador.`;
}

/** Aviso cuando una acción (no una página) pide un nivel, por ejemplo adherir a una tribu. */
export function avisoDeNivel(minimo: Nivel): string {
  if (minimo === "explorador") return "Esta acción se habilita al sumarte gratis como Explorador.";
  if (minimo === "miembro") return "Esta acción se habilita con el plan Miembro.";
  if (minimo === "fundador") return "Esta acción se habilita con el Pase Fundador.";
  if (minimo === "lider") return "Esta acción se habilita con el Plan Tribu.";
  return "Esta acción no se habilita desde Sumarte.";
}

/** Convierte lo que viene en la dirección (`?para=`) en un nivel que se puede elegir en Sumarte, o null. */
export function nivelDeParametro(valor: string | null | undefined): Nivel | null {
  return valor === "explorador" || valor === "miembro" || valor === "lider" ? valor : null;
}

/** Ayuda corta de un destino deshabilitado en el rail. */
export function ayudaDeRuta(ruta: string): string {
  return nivelMinimoDeRuta(ruta) === "explorador" ? "Sumate gratis para usar esto" : "Sumate para participar";
}

/** Solo rutas internas ("/algo"): evita volver a una dirección externa o con barras dobles. */
export function esRutaInterna(ruta: string | null | undefined): ruta is string {
  // Sin caracteres de control (tab, CR, LF…): el navegador los borra y "/\t/sitio.com" pasaría a ser "//sitio.com".
  return typeof ruta === "string" && /^\/(?![/\\])/.test(ruta) && !/[\\\u0000-\u001f\u007f]/.test(ruta);
}
