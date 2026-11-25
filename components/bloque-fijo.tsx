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
    <div ref={ref} className="sticky top-0 z-30">
      {children}
    </div>
  );
}
