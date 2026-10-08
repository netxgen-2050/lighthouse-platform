"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const EVENTO_ABRIR = "termino-legal:abrir";

type Props = {
  titulo: string;
  texto: string;
  /** Símbolo visible del botón (⚖ o 🌱). */
  simbolo: string;
  /** Nombre accesible del botón. */
  etiqueta: string;
  /** Clases de color del botón. */
  claseBoton: string;
  /** Clases de color del borde del tooltip. */
  claseBorde: string;
  borrador: boolean;
  /** Se llama cada vez que el tooltip pasa a mostrarse. */
  alMostrar?: () => void;
};

// La explicación de un término se muestra como tooltip flotante:
// mouse (entrar/salir), teclado (foco/blur, Escape) y toque (dispositivos sin hover).
// Lo comparten el ⚖ legal y el 🌱 económico.
export function TooltipTermino({ titulo, texto, simbolo, etiqueta, claseBoton, claseBorde, borrador, alMostrar }: Props) {
  const [conMouse, setConMouse] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const [conToque, setConToque] = useState(false);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [abajo, setAbajo] = useState(false);
  const visible = conMouse || conFoco || conToque;
  const id = useId();
  // Tipo del último puntero que apretó el botón: se decide por el evento, no por el dispositivo (híbridos).
  const ultimoPuntero = useRef("");
  const contenedor = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const alMostrarRef = useRef(alMostrar);
  alMostrarRef.current = alMostrar;

  function esconder() {
    setConMouse(false);
    setConFoco(false);
    setConToque(false);
  }

  // Mostrar un tooltip esconde cualquier otro que estuviera visible.
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
    alMostrarRef.current?.();
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

  // Mantiene el tooltip dentro de la pantalla: abre hacia arriba y, si no hay lugar, hacia abajo.
  useLayoutEffect(() => {
    if (!visible || !tooltip.current) {
      setDesplazamiento(0);
      setAbajo(false);
      return;
    }
    const caja = tooltip.current.getBoundingClientRect();
    const margen = 8;
    if (!abajo && caja.top < margen) setAbajo(true);
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
        aria-label={etiqueta}
        onFocus={(e) => {
          // Solo con teclado: el foco que deja un clic de mouse no lo mantiene abierto.
          if (e.currentTarget.matches(":focus-visible")) setConFoco(true);
        }}
        onBlur={() => setConFoco(false)}
        onPointerDown={(e) => {
          ultimoPuntero.current = e.pointerType;
        }}
        onClick={() => {
          // Con mouse el tooltip sigue al puntero y con teclado al foco: el clic solo alterna si fue un toque.
          if (ultimoPuntero.current === "touch") setConToque((v) => !v);
          ultimoPuntero.current = "";
        }}
        className={`ml-1 rounded px-1 focus-visible:outline-2 focus-visible:outline-offset-2 ${claseBoton}`}
      >
        <span aria-hidden="true">{simbolo}</span>
      </button>
      {visible && (
        <span
          ref={tooltip}
          id={id}
          role="tooltip"
          style={{ transform: `translateX(${desplazamiento}px)` }}
          className={`absolute left-0 z-10 block w-72 max-w-[calc(100vw-1rem)] text-sm font-normal text-ink ${abajo ? "top-full pt-1" : "bottom-full pb-1"}`}
        >
          <span className={`block rounded-lg border bg-surface p-3 shadow-lg ${claseBorde}`}>
            <strong className="block">{titulo}</strong>
            {texto}
            {borrador && <em className="mt-1 block text-muted">Borrador: texto a revisar</em>}
          </span>
        </span>
      )}
    </span>
  );
}
