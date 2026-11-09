import {
  BarChart3,
  CalendarDays,
  Compass,
  FileSignature,
  Flame,
  Handshake,
  Home,
  IdCard,
  LandPlot,
  Leaf,
  Map as MapaIcono,
  Settings,
  ShieldCheck,
  Sprout,
  Trees,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { marco } from "@/lib/idioma/textos/marco";
import type { Idioma } from "@/lib/idioma/tipos";

export type IdGrupo = "descubrir" | "sumarte" | "viene" | "persona" | "interno";

/** Clave del nombre de un destino en el diccionario del marco (`destinos`); el nombre sale del glosario. */
export type ClaveDestino = keyof typeof marco.es.destinos;

export type Destino = {
  href: string;
  clave: ClaveDestino;
  icono: LucideIcon;
  /** Grupo del rail al que pertenece. "persona" va en el menú del avatar; "interno": NetX en la barra superior, junto a la campanita, y Admin en el rail (solo super admin). */
  grupo: IdGrupo;
  /** ¿Existe la página en app/? Se mantiene a mano y lo vigila lib/navegacion.test.ts contra el disco. */
  existe: boolean;
  /**
   * Solo saca el destino de los menús (rail, barra superior, menú del avatar): la página sigue con su URL y su permiso.
   * Compromisos se oculta por decisión de Gus del 27-oct-2026 (el Mercado se lleva fuera de la plataforma);
   * para volver, ver docs/notas/compromisos-en-pausa.md.
   * Congreso se oculta con el menú de fase 1 (2-nov-2026, ADR-030); para volver, ver docs/notas/congreso-en-pausa.md.
   */
  oculto?: true;
};

// Única lista de destinos, en el orden del rail. El rail muestra solo los que existen.
// No se lee el disco en runtime (en Vercel los .tsx de app/ no están); el test de unidad
// falla si `existe` no coincide con las páginas reales de app/.
export const DESTINOS: readonly Destino[] = [
  { href: "/", clave: "inicio", icono: Home, grupo: "descubrir", existe: true },
  { href: "/territorios/lighthouse", clave: "territorio", icono: MapaIcono, grupo: "descubrir", existe: true },
  { href: "/lotes", clave: "lotes", icono: LandPlot, grupo: "descubrir", existe: true },
  { href: "/bien-comun", clave: "biencomun", icono: Trees, grupo: "descubrir", existe: true },
  { href: "/sumarte", clave: "sumarte", icono: Sprout, grupo: "sumarte", existe: true },
  { href: "/tribus", clave: "tribus", icono: Users, grupo: "viene", existe: true },
  { href: "/pactos", clave: "pactos", icono: FileSignature, grupo: "viene", existe: true },
  { href: "/semillas", clave: "semillas", icono: Leaf, grupo: "viene", existe: true },
  { href: "/fogon", clave: "fogon", icono: Flame, grupo: "viene", existe: true },
  { href: "/compromisos", clave: "compromisos", icono: Handshake, grupo: "viene", existe: true, oculto: true },
  { href: "/congreso", clave: "congreso", icono: CalendarDays, grupo: "viene", existe: true, oculto: true },
  { href: "/perfil", clave: "perfil", icono: UserRound, grupo: "persona", existe: true },
  { href: "/pasaporte", clave: "pasaporte", icono: IdCard, grupo: "persona", existe: true },
  { href: "/panel", clave: "miRecorrido", icono: Compass, grupo: "persona", existe: true },
  { href: "/configuracion", clave: "configuracion", icono: Settings, grupo: "persona", existe: true },
  { href: "/mis-datos", clave: "misDatos", icono: ShieldCheck, grupo: "persona", existe: true },
  { href: "/netx", clave: "netx", icono: BarChart3, grupo: "interno", existe: true },
  { href: "/admin", clave: "admin", icono: UserCog, grupo: "interno", existe: true },
];

/** El nombre de un destino en un idioma. */
export function etiquetaDeDestino(d: Destino, idioma: Idioma): string {
  return marco[idioma].destinos[d.clave];
}

export function destinosDisponibles() {
  return DESTINOS.filter((d) => d.existe);
}

/** El título del grupo "Interno" (el ítem Admin del rail, solo para el super admin). */
export function tituloGrupoInterno(idioma: Idioma): string {
  return marco[idioma].rail.grupos.interno;
}

/** Grupos que se muestran con título en el rail, en orden. */
export const GRUPOS_RAIL: readonly { id: "descubrir" | "sumarte" | "viene" }[] = [
  { id: "descubrir" },
  { id: "sumarte" },
  { id: "viene" },
];

/** El título de un grupo del rail en un idioma. */
export function tituloDeGrupo(id: (typeof GRUPOS_RAIL)[number]["id"], idioma: Idioma): string {
  return marco[idioma].rail.grupos[id];
}

export function destinosDeGrupo(grupo: IdGrupo) {
  return destinosDisponibles().filter((d) => d.grupo === grupo && !d.oculto);
}
