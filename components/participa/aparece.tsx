"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hace que lo que está más abajo de la pantalla aparezca con un fundido suave al entrar. Sin JavaScript, o si el bloque ya
 * está a la vista al cargar, se ve de entrada. El fundido solo existe con la preferencia del sistema sin "Reducir animaciones"
 * (ver `vision-2050.css`): con movimiento reducido el atributo no tiene efecto y todo se ve quieto.
 */
export function Aparece({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Ya a la vista (o por encima de la pantalla, si se llegó con un ancla): no se esconde.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.fase = "oculto";
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          el.dataset.fase = "visto";
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return (
    <div ref={ref} className={`vision-aparece ${className}`.trim()}>
      {children}
    </div>
  );
}
