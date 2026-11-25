"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTextos } from "@/lib/idioma/cliente";
import { RUTA_SECCION, SECCIONES_EXPLORAR, type SeccionExplorar } from "@/lib/explorar/destino";

/**
 * Pestañas de Explorar (spec explorar-paginas): tres enlaces entre páginas, pegados debajo de la barra superior (48 px).
 * La pestaña de la página actual lleva `aria-current="page"` y, además del color, borde inferior y negrita (nunca solo color).
 * Sin IntersectionObserver ni anclas: la ruta decide cuál es la actual.
 */
export function PestanasExplorar() {
  const t = useTextos("explorar");
  const ruta = (usePathname() ?? "").replace(/\/+$/, "");
  const etiquetas: Record<SeccionExplorar, string> = { territorio: t.barra.territorio, barrio: t.barra.barrio, lotes: t.barra.lotes };

  return (
    <nav aria-label={t.barra.aria} className="sticky top-12 z-20 border-b border-line bg-surface">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-8">
        {SECCIONES_EXPLORAR.map((s) => {
          const esActual = ruta === RUTA_SECCION[s];
          return (
            <li key={s} className="shrink-0">
              <Link
                href={RUTA_SECCION[s]}
                aria-current={esActual ? "page" : undefined}
                className={`flex min-h-11 items-center border-b-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-deep ${
                  esActual ? "border-ink font-bold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {etiquetas[s]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
