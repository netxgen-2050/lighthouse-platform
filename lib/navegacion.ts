import {
  CalendarDays,
  Compass,
  Handshake,
  Home,
  Map as MapaIcono,
  Sprout,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Destino = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  /** ¿Existe la página en app/? Se mantiene a mano y lo vigila lib/navegacion.test.ts contra el disco. */
  existe: boolean;
};

// Única lista de destinos, en el orden del rail. El rail muestra solo los que existen.
// No se lee el disco en runtime (en Vercel los .tsx de app/ no están); el test de unidad
// falla si `existe` no coincide con las páginas reales de app/.
export const DESTINOS: readonly Destino[] = [
  { href: "/", etiqueta: "Inicio", icono: Home, existe: true },
  { href: "/territorios/lighthouse", etiqueta: "Territorio", icono: MapaIcono, existe: true },
  { href: "/tribus", etiqueta: "Tribus", icono: Users, existe: true },
  { href: "/perfil", etiqueta: "Perfil", icono: UserRound, existe: true },
  { href: "/compromisos", etiqueta: "Compromisos", icono: Handshake, existe: true },
  { href: "/congreso", etiqueta: "Congreso", icono: CalendarDays, existe: true },
  { href: "/sumarte", etiqueta: "Sumarte", icono: Sprout, existe: true },
  { href: "/panel", etiqueta: "Mi recorrido", icono: Compass, existe: true },
];

export function destinosDisponibles() {
  return DESTINOS.filter((d) => d.existe);
}
