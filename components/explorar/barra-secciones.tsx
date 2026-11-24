"use client";

import { useEffect, useState } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { SECCIONES_EXPLORAR, type SeccionExplorar } from "@/lib/explorar/destino";

/**
 * Barra de secciones de `/explorar`: tres anclas que quedan pegadas debajo de la barra superior (48 px). El enlace de la sección
 * que se está leyendo lleva `aria-current="location"` y, además del color, un subrayado y el peso de la letra (nunca solo color).
 * Sin JavaScript las anclas igual saltan a su sección. La sección actual se decide con un IntersectionObserver sobre una franja
 * cerca del borde de arriba, y al tocar un enlace se marca en el acto (la última sección puede ser demasiado corta para llegar a la franja).
 */
export function BarraSecciones() {
  const t = useTextos("explorar");
  const [actual, setActual] = useState<SeccionExplorar | null>(null);

  useEffect(() => {
    // Al llegar con un ancla (o al cambiarla con atrás/adelante) la sección del ancla es la actual.
    const leerHash = () => {
      const desdeHash = window.location.hash.slice(1);
      const delHash = SECCIONES_EXPLORAR.find((s) => s === desdeHash);
      if (delHash) setActual(delHash);
    };
    leerHash();
    window.addEventListener("hashchange", leerHash);

    const elementos = SECCIONES_EXPLORAR.map((s) => document.getElementById(s)).filter((e): e is HTMLElement => e !== null);
    const visibles = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target.id);
          else visibles.delete(e.target.id);
        }
        // La primera sección (en el orden de la página) que cruza la franja es la que se está leyendo.
        const primera = SECCIONES_EXPLORAR.find((s) => visibles.has(s));
        if (primera) setActual(primera);
      },
      // Franja fina entre el 20 % y el 25 % de la pantalla, medida desde arriba: debajo de la barra superior y la de secciones,
      // y justo abajo de donde cae una sección al saltar a su ancla (112 px). Entre dos secciones queda la anterior.
      { rootMargin: "-20% 0px -75% 0px" },
    );
    for (const e of elementos) observador.observe(e);
    return () => {
      observador.disconnect();
      window.removeEventListener("hashchange", leerHash);
    };
  }, []);

  const etiquetas: Record<SeccionExplorar, string> = { territorio: t.barra.territorio, barrio: t.barra.barrio, lotes: t.barra.lotes };

  return (
    <nav aria-label={t.barra.aria} className="sticky top-12 z-20 border-b border-line bg-surface">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-8">
        {SECCIONES_EXPLORAR.map((s) => {
          const esActual = actual === s;
          return (
            <li key={s} className="shrink-0">
              <a
                href={`#${s}`}
                aria-current={esActual ? "location" : undefined}
                onClick={() => setActual(s)}
                className={`flex min-h-11 items-center border-b-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-deep ${
                  esActual ? "border-ink font-bold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {etiquetas[s]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
