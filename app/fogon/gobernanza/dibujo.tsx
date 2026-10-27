"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { empaquetar } from "@/lib/gobernanza/empaquetar";
import { hijosDe, recorrer, type NodoH } from "@/lib/gobernanza/holarquia";
import type { Marca, Pintura, TokenColor } from "@/lib/gobernanza/lentes";
import { DURACION_ZOOM_MS, entraElNombre, etiquetaPersona, interpolar, suavizar, vistaPara, type Vista } from "@/lib/gobernanza/zoom";
import { useTextos } from "@/lib/idioma/cliente";
import { GLIFO_ESTADO } from "./panel-nodo";

const TAMAÑO = 1000;

const color = (t: TokenColor | "ninguno") => (t === "ninguno" ? "none" : `var(--color-${t})`);

type Props = {
  raiz: NodoH;
  foco: NodoH;
  pinturas: ReadonlyMap<string, Pintura>;
  marcas: readonly Marca[];
  /** Persona elegida: sus círculos se resaltan con un borde grueso. */
  personaId: string | null;
  onEnfocar: (id: string) => void;
  onSeleccionar: (id: string) => void;
  onSalir: () => void;
};

type Celda = { nodo: NodoH; x: number; y: number; r: number; hoja: boolean };

/** Los círculos (no cambian durante el zoom, así que React los reutiliza cuadro a cuadro). */
const Circulos = memo(function Circulos({
  celdas,
  pinturas,
  personaId,
  focoId,
  onEnfocar,
  onSeleccionar,
}: {
  celdas: readonly Celda[];
  pinturas: ReadonlyMap<string, Pintura>;
  personaId: string | null;
  focoId: string;
  onEnfocar: (id: string) => void;
  onSeleccionar: (id: string) => void;
}) {
  return (
    <>
      {celdas.map(({ nodo, x, y, r, hoja }) => {
        const base = pinturas.get(nodo.id);
        if (!base) return null;
        const elegida = personaId !== null && nodo.tipo === "rol" && nodo.personaId === personaId;
        const p: Pintura = elegida ? { ...base, borde: "ink", grosor: 3, atenuado: false } : base;
        return (
          <circle
            key={nodo.id}
            data-nodo={nodo.id}
            cx={x}
            cy={y}
            r={r}
            fill={color(p.relleno)}
            stroke={color(p.borde)}
            strokeWidth={p.grosor}
            strokeDasharray={p.punteado ? "5 4" : undefined}
            opacity={p.atenuado ? 0.4 : 1}
            vectorEffect="non-scaling-stroke"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              if (!hoja) {
                if (nodo.id !== focoId) onEnfocar(nodo.id);
              } else onSeleccionar(nodo.id);
            }}
          />
        );
      })}
    </>
  );
});

/** El dibujo de la holarquía: círculos dentro de círculos, con zoom propio y sin animación si se pide movimiento reducido. */
export function Dibujo({ raiz, foco, pinturas, marcas, personaId, onEnfocar, onSeleccionar, onSalir }: Props) {
  const tx = useTextos("gobernanza");
  const idTitulo = useId();
  const refSvg = useRef<SVGSVGElement>(null);
  const layout = useMemo(() => empaquetar(raiz, TAMAÑO), [raiz]);
  const celdas = useMemo(() => {
    const salida: Celda[] = [];
    recorrer(raiz, (nodo) => {
      const c = layout.get(nodo.id);
      if (c) salida.push({ nodo, ...c, hoja: hijosDe(nodo).length === 0 });
    });
    return salida;
  }, [raiz, layout]);

  const destino = useMemo<Vista>(() => vistaPara(layout.get(foco.id) ?? { x: TAMAÑO / 2, y: TAMAÑO / 2, r: TAMAÑO / 2 }), [layout, foco.id]);
  const [vista, setVista] = useState<Vista>(destino);
  const [ancho, setAncho] = useState(600);
  const [reducido, setReducido] = useState(false);
  const actual = useRef<Vista>(destino);

  // Movimiento reducido: se lee del navegador tras montar y se sigue si cambia.
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setReducido(m.matches);
    leer();
    m.addEventListener("change", leer);
    return () => m.removeEventListener("change", leer);
  }, []);

  // Ancho real del dibujo en pantalla, para saber qué radio tiene cada círculo en píxeles.
  useEffect(() => {
    const el = refSvg.current;
    if (!el) return;
    setAncho(el.getBoundingClientRect().width || 600);
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width || 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom: interpola la vista con suavizado; con movimiento reducido salta directo al final.
  useEffect(() => {
    if (reducido) {
      actual.current = destino;
      setVista(destino);
      return;
    }
    const desde = actual.current;
    const t0 = performance.now();
    let raf = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - t0) / DURACION_ZOOM_MS);
      const v = interpolar(desde, destino, suavizar(t));
      actual.current = v;
      setVista(v);
      if (t < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [destino, reducido]);

  const [cx, cy, w] = vista;
  const k = ancho / w; // píxeles de pantalla por unidad del dibujo
  const px = (n: number) => n / k;

  const etiquetas = hijosDe(foco).map((h) => {
    const c = layout.get(h.id);
    if (!c) return null;
    const rPx = c.r * k;
    if (h.tipo === "rol") {
      const modo = etiquetaPersona(rPx);
      if (modo === "nada") return null;
      return (
        <g key={h.id} textAnchor="middle" pointerEvents="none">
          <text x={c.x} y={modo === "nombre" ? c.y + px(4) : c.y - px(1)} fontSize={px(11)} fontWeight={600} fill="var(--color-ink)">
            {h.persona}
          </text>
          {modo === "nombre-y-rol" && (
            <text x={c.x} y={c.y + px(12)} fontSize={px(10)} fill="var(--color-muted)">
              {tx.roles[h.rol]}
            </text>
          )}
        </g>
      );
    }
    const texto =
      h.tipo === "lugar-libre"
        ? tx.panel.lugarLibre
        : h.tipo === "tribu"
          ? `${h.estado ? GLIFO_ESTADO[h.estado] : ""} ${h.nombre}`.trim()
          : h.nombre;
    if (!entraElNombre(texto, rPx)) return null;
    const tieneHijos = hijosDe(h).length > 0 && h.tipo !== "lugar-libre";
    return (
      <text
        key={h.id}
        x={c.x}
        y={tieneHijos ? c.y - c.r + px(15) : c.y + px(4)}
        textAnchor="middle"
        fontSize={px(11)}
        fontWeight={600}
        fill="var(--color-ink)"
        stroke="var(--color-surface)"
        strokeWidth={px(3)}
        paintOrder="stroke"
        pointerEvents="none"
      >
        {texto}
      </text>
    );
  });

  return (
    <svg
      ref={refSvg}
      data-foco={foco.id}
      viewBox={`${cx - w / 2} ${cy - w / 2} ${w} ${w}`}
      role="img"
      aria-labelledby={idTitulo}
      className="block h-auto w-full rounded-xl border border-faint bg-surface"
      style={{ aspectRatio: "1 / 1" }}
      onClick={onSalir}
    >
      <title id={idTitulo}>{tx.dibujo.nombre}</title>
      <Circulos celdas={celdas} pinturas={pinturas} personaId={personaId} focoId={foco.id} onEnfocar={onEnfocar} onSeleccionar={onSeleccionar} />
      <g aria-hidden="true">{etiquetas}</g>
      <g aria-hidden="true" pointerEvents="none">
        {marcas.map((m) => {
          const c = layout.get(m.nodoId);
          if (!c) return null;
          return (
            <g key={m.nodoId}>
              <circle cx={c.x} cy={c.y - c.r} r={px(11)} fill="var(--color-gold)" stroke="var(--color-ink)" strokeWidth={px(1.5)} />
              <text x={c.x} y={c.y - c.r + px(4)} textAnchor="middle" fontSize={px(12)} fontWeight={700} fill="var(--color-ink)">
                {m.texto}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
