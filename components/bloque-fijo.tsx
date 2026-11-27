"use client";

import { useEffect, useRef } from "react";

/**
 * Bloque fijo de arriba (cinta de prototipo + barra superior). Publica su alto real en `--alto-fijo` para que lo que se pega
 * debajo (la barra de secciones de Explorar) y los `scroll-mt` de las anclas no queden tapados, en escritorio ni en celular.
 */
export function BloqueFijo({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publicar = () => document.documentElement.style.setProperty("--alto-fijo", `${el.getBoundingClientRect().height}px`);
    publicar();
    const observador = new ResizeObserver(publicar);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    // z-55: por encima de la barra pegada del Congreso (z-50), que si no tapa los menús desplegables de la barra superior.
    // La hoja modal (z-70) y su fondo quedan por encima de todo.
    <div ref={ref} className="sticky top-0 z-[55]">
      {children}
    </div>
  );
}
