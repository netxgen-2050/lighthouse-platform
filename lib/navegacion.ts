import { existsSync } from "node:fs";
import path from "node:path";
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

export type Destino = { href: string; etiqueta: string; icono: LucideIcon };

// Única lista de destinos, en el orden del rail. El rail muestra solo los que existen en app/.
export const DESTINOS: readonly Destino[] = [
  { href: "/", etiqueta: "Inicio", icono: Home },
  { href: "/territorio", etiqueta: "Territorio", icono: MapaIcono },
  { href: "/tribus", etiqueta: "Tribus", icono: Users },
  { href: "/perfil", etiqueta: "Perfil", icono: UserRound },
  { href: "/compromisos", etiqueta: "Compromisos", icono: Handshake },
  { href: "/congreso", etiqueta: "Congreso", icono: CalendarDays },
  { href: "/sumarte", etiqueta: "Sumarte", icono: Sprout },
  { href: "/panel", etiqueta: "Mi recorrido", icono: Compass },
];

export function filtrarDestinos(existe: (href: string) => boolean, destinos: readonly Destino[] = DESTINOS) {
  return destinos.filter((d) => existe(d.href));
}

/** ¿Hay una página en app/ para esta ruta? (solo servidor) */
export function rutaExiste(href: string): boolean {
  const base = path.join(process.cwd(), "app", href === "/" ? "" : href);
  return ["page.tsx", "page.ts", "page.jsx", "page.js"].some((n) => existsSync(path.join(base, n)));
}

export function destinosDisponibles() {
  return filtrarDestinos(rutaExiste);
}
