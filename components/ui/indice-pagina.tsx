"use client";

import { List } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { claseBoton } from "./boton";
import { Hoja } from "./hoja";

/** Una sección de la página: el id del encabezado al que apunta el enlace y su título. */
export type ItemIndice = { id: string; titulo: string };

/** Hasta dónde (px desde arriba) un encabezado cuenta como "ya llegué a esta sección": debajo de la barra fija. */
export const LINEA_DE_LECTURA = 140;

/**
 * La sección que se está leyendo: la última cuyo encabezado ya pasó la línea de lectura. Si todavía ninguno la pasó,
 * la primera. `tops` está en el orden del índice (px del borde de arriba de cada encabezado respecto de la ventana).
 */
export function seccionActiva(
  ids: string[],
  tops: number[],
  linea = LINEA_DE_LECTURA,
  /** Con la página scrolleada hasta el fondo: el alto de la ventana. Los últimos títulos nunca llegan a la línea de lectura, así que cuenta el último que se ve. */
  alFondo?: { alto: number },
): string | null {
  if (ids.length === 0) return null;
  let activa = 0;
  for (let i = 0; i < ids.length; i++) {
    if (alFondo ? tops[i] < alFondo.alto : tops[i] <= linea) activa = i;
  }
  return ids[activa];
}

/** Despliega la sección plegable que contiene al encabezado (si la hay) y lleva la vista hasta él. */
export function irASeccion(id: string, enfocar = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const plegable = el.closest("details");
  if (plegable) plegable.open = true;
  const reducido =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.movimiento === "reducido";
  el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  if (enfocar) {
    // Para que el teclado y el lector sigan desde la sección.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
  window.history.replaceState(null, "", `#${id}`);
}

function useSeccionActiva(items: ItemIndice[]) {
  const [activa, setActiva] = useState<string | null>(items[0]?.id ?? null);
  const clave = items.map((i) => i.id).join("|");
  // La sección que la persona eligió en el índice: manda hasta que vuelve a mover la página ella misma, porque al
  // desplegarla cambia el alto y el recálculo la pisaría con otra.
  const elegida = useRef<string | null>(null);
  useEffect(() => {
    const ids = clave.split("|").filter(Boolean);
    const elementos = ids.map((id) => document.getElementById(id));
    const calcular = () => {
      if (elegida.current) {
        setActiva(elegida.current);
        return;
      }
      const tops = elementos.map((el) => el?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY);
      const alto = window.innerHeight;
      const alFondo = window.scrollY + alto >= document.documentElement.scrollHeight - 2;
      setActiva(seccionActiva(ids, tops, LINEA_DE_LECTURA, alFondo ? { alto } : undefined));
    };
    const soltarElegida = () => {
      elegida.current = null;
      calcular();
    };
    calcular();
    window.addEventListener("wheel", soltarElegida, { passive: true });
    window.addEventListener("touchmove", soltarElegida, { passive: true });
    window.addEventListener("keydown", soltarElegida);
    // Cada vez que un encabezado cruza la línea de lectura se vuelve a calcular.
    const io = new IntersectionObserver(calcular, {
      rootMargin: `-${LINEA_DE_LECTURA}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const el of elementos) if (el) io.observe(el);
    // Plegar o desplegar mueve todo lo de abajo: se recalcula también al cambiar el alto de la página.
    const ro = new ResizeObserver(calcular);
    ro.observe(document.body);
    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("wheel", soltarElegida);
      window.removeEventListener("touchmove", soltarElegida);
      window.removeEventListener("keydown", soltarElegida);
    };
  }, [clave]);
  const elegir = (id: string) => {
    elegida.current = id;
    setActiva(id);
  };
  return [activa, elegir] as const;
}

function Lista({
  items,
  activa,
  alElegir,
}: {
  items: ItemIndice[];
  activa: string | null;
  alElegir: (id: string) => void;
}) {
  return (
    <ul className="grid gap-0.5">
      {items.map((i) => {
        const esta = i.id === activa;
        return (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={esta ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                alElegir(i.id);
              }}
              // La sección visible se marca con negrita y una barra de 2 px, no solo con color.
              className={`block min-h-9 border-l-2 py-1.5 pl-3 pr-2 text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                esta ? "border-deep font-bold text-ink" : "border-line text-muted"
              }`}
            >
              {i.titulo}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Índice de una página larga (ux-bien-comun, design §2): un `nav` con enlaces a los encabezados que marca el que se está
 * leyendo con `aria-current="location"`. En compu va fijo al costado: ponerlo en una columna con `sticky`.
 */
export function IndicePagina({ items, etiqueta }: { items: ItemIndice[]; etiqueta: string }) {
  const [activa, setActiva] = useSeccionActiva(items);
  // Un enlace con #ancla desde afuera también despliega la sección que lo contiene.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    try {
      irASeccion(decodeURIComponent(id), false);
    } catch {
      // Un ancla mal formada (por ejemplo %E0) no es una sección: se ignora.
    }
  }, []);
  return (
    <nav aria-label={etiqueta}>
      <p className="mb-2 px-3 text-sm font-semibold">{etiqueta}</p>
      <Lista
        items={items}
        activa={activa}
        alElegir={(id) => {
          setActiva(id);
          irASeccion(id);
        }}
      />
    </nav>
  );
}

/** El mismo índice para el celular: un botón que abre una hoja desde abajo. Al elegir, la hoja se cierra y se va a la sección. */
export function IndicePaginaMovil({
  items,
  etiqueta,
  etiquetaCerrar,
}: {
  items: ItemIndice[];
  etiqueta: string;
  etiquetaCerrar: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const [activa, setActiva] = useSeccionActiva(items);
  const disparador = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={disparador}
        type="button"
        className={claseBoton("secundario", "m", "w-fit")}
        aria-haspopup="dialog"
        aria-expanded={abierta}
        onClick={() => setAbierta(true)}
      >
        <List aria-hidden="true" size={16} />
        {etiqueta}
      </button>
      <Hoja abierta={abierta} alCerrar={() => setAbierta(false)} titulo={etiqueta} etiquetaCerrar={etiquetaCerrar} devolverFoco={disparador}>
        <nav aria-label={etiqueta}>
          <Lista
            items={items}
            activa={activa}
            alElegir={(id) => {
              setActiva(id);
              setAbierta(false);
              // La hoja devuelve el foco al botón al cerrarse: se va a la sección después de eso.
              window.setTimeout(() => irASeccion(id), 60);
            }}
          />
        </nav>
      </Hoja>
    </>
  );
}
