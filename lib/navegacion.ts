import {
  BarChart3,
  CalendarDays,
  Compass,
  FileSignature,
  Flame,
  Handshake,
  House,
  IdCard,
  Leaf,
  Mountain,
  Settings,
  ShieldCheck,
  Sprout,
  Telescope,
  TrendingUp,
  Trees,
  UserCog,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { marco } from "@/lib/idioma/textos/marco";
import type { Idioma } from "@/lib/idioma/tipos";
import { itemActivo } from "@/lib/ruta-activa";

/**
 * "principal": los destinos del menú. "persona": menú del avatar.
 * "interno": NetX (barra superior) y Admin (rail). "pausa": módulos en pausa de la fase 1, fuera de todo menú.
 */
export type IdGrupo = "principal" | "persona" | "interno" | "pausa";

/** Clave del nombre de un destino en el diccionario del marco (`destinos`); el nombre sale del glosario. */
export type ClaveDestino = keyof typeof marco.es.destinos;

export type Destino = {
  href: string;
  clave: ClaveDestino;
  icono: LucideIcon;
  /** Grupo al que pertenece. */
  grupo: IdGrupo;
  /** ¿Existe la página en app/? Se mantiene a mano y lo vigila lib/navegacion.test.ts contra el disco. */
  existe: boolean;
  /** Rutas que también marcan este destino como actual (Explorar abarca varias secciones). */
  secciones?: readonly string[];
  /**
   * Solo saca el destino de los menús (rail, menú del celular, barra superior, menú del avatar): la página sigue con su URL y su permiso.
   * Compromisos se oculta por decisión de Gus del 27-oct-2026 (el Mercado se lleva fuera de la plataforma);
   * para volver, ver docs/notas/compromisos-en-pausa.md.
   * Congreso se oculta con el menú de fase 1 (2-nov-2026, ADR-030); para volver, ver docs/notas/congreso-en-pausa.md.
   * Pactos, Semillas y Fogón salen del menú con el rediseño de cinco destinos (23-nov-2026); no se borra nada.
   */
  oculto?: true;
  /** Va en la barra inferior del celular (ux-celular). Los demás destinos del menú van en la hoja Más. */
  barra?: true;
};

// Única lista de destinos, en el orden de los menús. Se muestran solo los que existen.
// No se lee el disco en runtime (en Vercel los .tsx de app/ no están); el test de unidad
// falla si `existe` no coincide con las páginas reales de app/.
// Invertir, Mi tierra y Barrios aparecen solos cuando el cambio que crea su página pone `existe: true`.
export const DESTINOS: readonly Destino[] = [
  { href: "/", clave: "inicio", icono: House, grupo: "principal", existe: true, barra: true },
  {
    href: "/explorar/territorio",
    clave: "explorar",
    icono: Telescope,
    grupo: "principal",
    existe: true,
    secciones: ["/explorar", "/territorios", "/barrios", "/lotes"],
    barra: true,
  },
  // Participa (participa-mapa-equipos): los equipos sobre el mapa ilustrado. `/tribus` redirige acá y las fichas `/tribus/[id]` lo marcan.
  {
    href: "/participa",
    clave: "participa",
    icono: UsersRound,
    grupo: "principal",
    existe: true,
    secciones: ["/participa", "/tribus"],
    barra: true,
  },
  { href: "/bien-comun", clave: "biencomun", icono: Trees, grupo: "principal", existe: true },
  { href: "/invertir", clave: "invertir", icono: TrendingUp, grupo: "principal", existe: true, barra: true },
  { href: "/sumarte", clave: "sumarte", icono: Sprout, grupo: "principal", existe: true },
  { href: "/mi-tierra", clave: "miTierra", icono: Mountain, grupo: "principal", existe: true, barra: true },
  { href: "/pactos", clave: "pactos", icono: FileSignature, grupo: "pausa", existe: true, oculto: true },
  { href: "/semillas", clave: "semillas", icono: Leaf, grupo: "pausa", existe: true, oculto: true },
  { href: "/fogon", clave: "fogon", icono: Flame, grupo: "pausa", existe: true, oculto: true },
  { href: "/compromisos", clave: "compromisos", icono: Handshake, grupo: "pausa", existe: true, oculto: true },
  { href: "/congreso", clave: "congreso", icono: CalendarDays, grupo: "pausa", existe: true, oculto: true },
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

export function destinosDeGrupo(grupo: IdGrupo) {
  return destinosDisponibles().filter((d) => d.grupo === grupo && !d.oculto);
}

/**
 * Los destinos que dibujan el rail y el menú del celular: los cinco principales y, después, cualquier destino en pausa
 * al que se le quite la marca `oculto` (así vuelve al menú sin tocar nada más). Con `oculto` puesto no se ve ninguno.
 */
export function destinosDelMenu() {
  return [...destinosDeGrupo("principal"), ...destinosDeGrupo("pausa")];
}

/** Los destinos de la barra inferior del celular, en el orden del menú. */
export function destinosDeLaBarra() {
  return destinosDelMenu().filter((d) => d.barra);
}

/** Los destinos del menú que no están en la barra: van en la hoja Más (un destino en pausa que vuelve aparece acá). */
export function destinosDeMas() {
  return destinosDelMenu().filter((d) => !d.barra);
}

/** El destino del menú marcado como actual en una ruta, o ninguno (en las páginas en pausa ocultas no hay ninguno). */
export function destinoActivo(ruta: string): Destino | undefined {
  return itemActivo(destinosDelMenu(), ruta);
}
