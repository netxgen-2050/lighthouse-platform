"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";

/** Cuánto hay que arrastrar hacia abajo (px) para que la hoja se cierre. */
export const UMBRAL_CIERRE = 80;

/** ¿Un arrastre vertical de `dy` px (positivo = hacia abajo) cierra la hoja? */
export function cierraAlArrastrar(dy: number): boolean {
  return dy > UMBRAL_CIERRE;
}

/** Estado siguiente de la hoja persistente: acepta un valor o una función del valor actual (el que manda es el de afuera si la controlan). */
export function siguienteExpansion(actual: boolean, v: boolean | ((e: boolean) => boolean)): boolean {
  return typeof v === "function" ? v(actual) : v;
}

const FOCALIZABLES =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Props = {
  abierta: boolean;
  alCerrar: () => void;
  titulo: string;
  /** Nombre del botón que cierra (en el idioma de la persona). */
  etiquetaCerrar: string;
  children: ReactNode;
  /** Dónde vuelve el foco al cerrar; sin esto vuelve al elemento que lo tenía al abrir. */
  devolverFoco?: RefObject<HTMLElement | null>;
  /** Variante siempre visible (la lista de lotes sobre el mapa): alto mínimo, se expande al arrastrar o con el asa. */
  persistente?: boolean;
  /** Nombre del asa de la variante persistente (expandir o contraer). */
  etiquetaAsa?: string;
  /** Persistente controlada desde afuera (un botón "Ver lista" / "Ver mapa" hace lo mismo que arrastrar). Sin esto, ella decide. */
  expandida?: boolean;
  alExpandir?: (expandida: boolean) => void;
};

/**
 * Hoja que sube desde abajo (ux-celular, design §3). Modal: `role="dialog"`, foco atrapado, Escape y arrastrar hacia abajo
 * cierran, y el foco vuelve al disparador. Persistente: panel siempre visible que se expande, sin trampa de foco.
 */
export function Hoja(props: Props) {
  return props.persistente ? <HojaPersistente {...props} /> : props.abierta ? <HojaModal {...props} /> : null;
}

/** Arrastre vertical del asa: devuelve el desplazamiento actual y los manejadores. */
function useArrastre(alSoltar: (dy: number) => void) {
  const [dy, setDy] = useState(0);
  const inicio = useRef<number | null>(null);
  return {
    dy,
    manejadores: {
      onPointerDown(e: PointerEvent<HTMLElement>) {
        inicio.current = e.clientY;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      },
      onPointerMove(e: PointerEvent<HTMLElement>) {
        if (inicio.current !== null) setDy(e.clientY - inicio.current);
      },
      onPointerUp(e: PointerEvent<HTMLElement>) {
        if (inicio.current === null) return;
        const final = e.clientY - inicio.current;
        inicio.current = null;
        setDy(0);
        alSoltar(final);
      },
      onPointerCancel() {
        inicio.current = null;
        setDy(0);
      },
    },
  };
}

function Asa() {
  return <span aria-hidden="true" className="block h-1 w-9 rounded-full bg-faint" />;
}

function HojaModal({ alCerrar, titulo, etiquetaCerrar, children, devolverFoco }: Props) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef(alCerrar);
  // (el arrastre y Escape leen siempre la última función)
  useEffect(() => {
    cerrar.current = alCerrar;
  }, [alCerrar]);
  const arrastre = useArrastre((dy) => {
    if (cierraAlArrastrar(dy)) cerrar.current();
  });

  useEffect(() => {
    // El disparador ya existe al abrir: se guarda ahora y ahí vuelve el foco.
    const antes = devolverFoco?.current ?? (document.activeElement as HTMLElement | null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>(FOCALIZABLES)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      antes?.focus?.();
    };
  }, [devolverFoco]);

  useEffect(() => {
    function alTeclear(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") cerrar.current();
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);

  function atrapar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const todos = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCALIZABLES) ?? []);
    if (todos.length === 0) return;
    const primero = todos[0];
    const ultimo = todos[todos.length - 1];
    const activo = document.activeElement;
    if (e.shiftKey && (activo === primero || !panel.current?.contains(activo))) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && (activo === ultimo || !panel.current?.contains(activo))) {
      e.preventDefault();
      primero.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/40" onClick={alCerrar} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        onKeyDown={atrapar}
        style={arrastre.dy > 0 ? { transform: `translateY(${arrastre.dy}px)` } : undefined}
        className="hoja-sube absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] max-w-xl flex-col rounded-t-[var(--radius-l)] bg-surface pb-[env(safe-area-inset-bottom,0px)] text-ink shadow-[var(--sombra-3)]"
      >
        <div {...arrastre.manejadores} className="flex shrink-0 touch-none justify-center pb-1 pt-3">
          <Asa />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2">
          <h2 id={`${id}-titulo`} className="font-display text-lg font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={alCerrar}
            className={`min-h-11 rounded-[var(--radius-s)] px-3 text-sm font-medium hover:bg-surface-2 ${FOCO}`}
          >
            {etiquetaCerrar}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

function HojaPersistente({ titulo, children, etiquetaAsa = titulo, expandida: expandidaFuera, alExpandir }: Props) {
  const id = useId();
  const [propia, setPropia] = useState(false);
  const expandida = expandidaFuera ?? propia;
  const setExpandida = (v: boolean | ((e: boolean) => boolean)) => {
    const nuevo = siguienteExpansion(expandida, v);
    setPropia(nuevo);
    alExpandir?.(nuevo);
  };
  const arrastre = useArrastre((dy) => {
    if (dy < -UMBRAL_CIERRE) setExpandida(true);
    else if (cierraAlArrastrar(dy)) setExpandida(false);
  });
  return (
    <section
      aria-labelledby={`${id}-titulo`}
      style={arrastre.dy !== 0 ? { transform: `translateY(${Math.max(arrastre.dy, -UMBRAL_CIERRE)}px)` } : undefined}
      className={`fixed inset-x-0 bottom-[var(--alto-barra-inferior)] z-30 flex flex-col rounded-t-[var(--radius-l)] border border-line bg-surface text-ink shadow-[var(--sombra-3)] transition-[max-height] duration-[var(--dur)] ${
        expandida ? "max-h-[85dvh]" : "max-h-28"
      }`}
    >
      <div {...arrastre.manejadores} className="flex shrink-0 touch-none justify-center">
        <button
          type="button"
          aria-expanded={expandida}
          aria-label={etiquetaAsa}
          onClick={() => setExpandida((e) => !e)}
          className={`flex min-h-11 w-full items-center justify-center ${FOCO}`}
        >
          <Asa />
        </button>
      </div>
      <h2 id={`${id}-titulo`} className="shrink-0 px-4 pb-2 font-display text-lg font-semibold">
        {titulo}
      </h2>
      {/* En reposo la hoja no hace scroll: su contenido está inerte y una región con scroll sin nada enfocable falla en axe. */}
      <div className={`min-h-0 flex-1 overscroll-contain px-4 pb-4 ${expandida ? "overflow-y-auto" : "overflow-hidden"}`}>{children}</div>
    </section>
  );
}
