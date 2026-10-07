"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { TERMINOS, type ClaveTermino } from "@/lib/legal/terminos";

const EVENTO_ABRIR = "termino-legal:abrir";

function sinHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
}

// La explicación de un término legal se muestra como tooltip flotante:
// mouse (entrar/salir), teclado (foco/blur, Escape) y toque (dispositivos sin hover).
export function TerminoLegal({ clave }: { clave: ClaveTermino }) {
  const termino = TERMINOS[clave];
  const [conMouse, setConMouse] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const [conToque, setConToque] = useState(false);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const visible = conMouse || conFoco || conToque;
  const id = useId();
  const contenedor = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);

  function esconder() {
    setConMouse(false);
    setConFoco(false);
    setConToque(false);
  }

  // Mostrar un ⚖ esconde cualquier otro que estuviera visible.
  useEffect(() => {
    function alMostrarOtro(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) esconder();
    }
    document.addEventListener(EVENTO_ABRIR, alMostrarOtro);
    return () => document.removeEventListener(EVENTO_ABRIR, alMostrarOtro);
  }, [id]);

  useEffect(() => {
    if (!visible) return;
    document.dispatchEvent(new CustomEvent(EVENTO_ABRIR, { detail: id }));
  }, [visible, id]);

  useEffect(() => {
    if (!visible) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") esconder();
    }
    function alTocarAfuera(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) esconder();
    }
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("pointerdown", alTocarAfuera);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("pointerdown", alTocarAfuera);
    };
  }, [visible]);

  // Mantiene el tooltip dentro de la pantalla sin moverlo del ⚖.
  useLayoutEffect(() => {
    if (!visible || !tooltip.current) {
      setDesplazamiento(0);
      return;
    }
    const caja = tooltip.current.getBoundingClientRect();
    const margen = 8;
    const sobra = caja.right + desplazamiento - (window.innerWidth - margen);
    const falta = margen - (caja.left - desplazamiento);
    setDesplazamiento(sobra > 0 ? -sobra : falta > 0 ? falta : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <span
      ref={contenedor}
      className="relative inline-block align-baseline"
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setConMouse(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setConMouse(false);
      }}
    >
      <button
        type="button"
        aria-describedby={visible ? id : undefined}
        aria-label={`Qué significa legalmente: ${termino.titulo}`}
        onFocus={(e) => {
          // Solo con teclado: el foco que deja un clic de mouse no lo mantiene abierto.
          if (e.currentTarget.matches(":focus-visible")) setConFoco(true);
        }}
        onBlur={() => setConFoco(false)}
        onClick={() => {
          if (sinHover()) setConToque((v) => !v);
        }}
        className="ml-1 rounded px-1 text-gold-ink hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink"
      >
        <span aria-hidden="true">⚖</span>
      </button>
      {visible && (
        <span
          ref={tooltip}
          id={id}
          role="tooltip"
          style={{ transform: `translateX(${desplazamiento}px)` }}
          className="absolute bottom-full left-0 z-10 block w-72 max-w-[calc(100vw-1rem)] pb-1 text-sm font-normal text-ink"
        >
          <span className="block rounded-lg border border-gold-ink bg-surface p-3 shadow-lg">
            <strong className="block">{termino.titulo}</strong>
            {termino.texto}
          </span>
        </span>
      )}
    </span>
  );
}
