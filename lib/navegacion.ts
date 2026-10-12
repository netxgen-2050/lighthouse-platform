import {
  BarChart3,
  CalendarDays,
  Compass,
  FileSignature,
  Flame,
  Handshake,
  Home,
  IdCard,
  Leaf,
  Map as MapaIcono,
  Settings,
  Sprout,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type IdGrupo = "descubrir" | "participar" | "sumarte" | "persona" | "interno";

export type Destino = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Grupo del rail al que pertenece. "persona" va en el menú del avatar y "interno" (NetX) en la barra superior, junto a la campanita. */
  grupo: IdGrupo;
  /** ¿Existe la página en app/? Se mantiene a mano y lo vigila lib/navegacion.test.ts contra el disco. */
  existe: boolean;
};

// Única lista de destinos, en el orden del rail. El rail muestra solo los que existen.
// No se lee el disco en runtime (en Vercel los .tsx de app/ no están); el test de unidad
// falla si `existe` no coincide con las páginas reales de app/.
export const DESTINOS: readonly Destino[] = [
  { href: "/", etiqueta: "Inicio", icono: Home, grupo: "descubrir", existe: true },
  { href: "/territorios/lighthouse", etiqueta: "Territorio", icono: MapaIcono, grupo: "descubrir", existe: true },
  { href: "/tribus", etiqueta: "Tribus", icono: Users, grupo: "descubrir", existe: true },
  { href: "/pactos", etiqueta: "Pactos", icono: FileSignature, grupo: "participar", existe: true },
  { href: "/semillas", etiqueta: "Semillas", icono: Leaf, grupo: "participar", existe: true },
  { href: "/fogon", etiqueta: "Fogón", icono: Flame, grupo: "participar", existe: true },
  { href: "/compromisos", etiqueta: "Compromisos", icono: Handshake, grupo: "participar", existe: true },
  { href: "/congreso", etiqueta: "Congreso", icono: CalendarDays, grupo: "participar", existe: true },
  { href: "/sumarte", etiqueta: "Sumarte", icono: Sprout, grupo: "sumarte", existe: true },
  { href: "/perfil", etiqueta: "Perfil", icono: UserRound, grupo: "persona", existe: true },
  { href: "/pasaporte", etiqueta: "Pasaporte", icono: IdCard, grupo: "persona", existe: true },
  { href: "/panel", etiqueta: "Mi recorrido", icono: Compass, grupo: "persona", existe: true },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings, grupo: "persona", existe: true },
  { href: "/netx", etiqueta: "NetX", icono: BarChart3, grupo: "interno", existe: true },
];

export function destinosDisponibles() {
  return DESTINOS.filter((d) => d.existe);
}

/** Grupos que se muestran con título en el rail, en orden. */
export const GRUPOS_RAIL: readonly { id: IdGrupo; titulo: string }[] = [
  { id: "descubrir", titulo: "Descubrir" },
  { id: "participar", titulo: "Participar" },
  { id: "sumarte", titulo: "Sumarte" },
];

export function destinosDeGrupo(grupo: IdGrupo) {
  return destinosDisponibles().filter((d) => d.grupo === grupo);
}
