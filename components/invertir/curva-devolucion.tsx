"use client";

import { useEffect, useId, useRef, useState } from "react";
import { enteroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { usdEn } from "@/lib/lotes/formato";
import { curvaPorTrimestre, type PuntoCurva } from "@/lib/invertir/barrios";

// El dibujo usa el ancho real del contenedor como unidad (1 unidad = 1 px), así las etiquetas de los ejes miden 13 px
// también en el celular (ux-invertir, design §2). 640 es el ancho de partida antes de medir.
const ANCHO_INICIAL = 640;
const ALTO = 320;
const IZQ = 104;
const DER = 16;
const ARRIBA = 32;
const ABAJO = 48;

/**
 * Curva de devolución en SVG propio, sin librerías: lo devuelto al inversor (trazo continuo con relleno) frente a lo que trajo
 * (trazo de rayas), completa hasta el final del horizonte. Las dos series se distinguen por el trazo, no solo por el color.
 * Debajo, una tabla equivalente por trimestre. No lleva animación.
 */
export function CurvaDevolucion({ curva }: { curva: PuntoCurva[] }) {
  const idioma = useIdioma();
  const t = useTextos("invertir").curva;
  const id = useId();
  const caja = useRef<HTMLDivElement>(null);
  const [ANCHO, setAncho] = useState(ANCHO_INICIAL);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setAncho(Math.max(300, Math.round(el.clientWidth)));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [curva.length]);
  if (curva.length === 0) return null;

  const ultimoMes = curva[curva.length - 1].mes;
  const tope = Math.max(...curva.flatMap((p) => [p.devuelto, p.aportado]));
  const x = (mes: number) => IZQ + (mes / ultimoMes) * (ANCHO - IZQ - DER);
  const y = (monto: number) => ALTO - ABAJO - (monto / tope) * (ALTO - ABAJO - ARRIBA);
  const linea = (campo: "devuelto" | "aportado") => curva.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.mes).toFixed(1)} ${y(p[campo]).toFixed(1)}`).join(" ");
  const area = `${linea("devuelto")} L${x(ultimoMes).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const marcasMes = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(ultimoMes * f));
  const marcasMonto = [0, 0.5, 1].map((f) => tope * f);

  const idTitulo = `${id}-titulo`;
  const idDesc = `${id}-desc`;
  const filas = curvaPorTrimestre(curva);

  return (
    <div ref={caja} className="grid gap-3">
      <svg
        role="img"
        aria-labelledby={`${idTitulo} ${idDesc}`}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full"
        data-curva="devolucion"
      >
        <title id={idTitulo}>{t.titulo}</title>
        <desc id={idDesc}>{t.descripcion}</desc>
        {marcasMonto.map((m, i) => (
          <g key={`m${i}`}>
            <line x1={IZQ} x2={ANCHO - DER} y1={y(m)} y2={y(m)} className="stroke-line" strokeWidth={1} />
            <text x={IZQ - 8} y={y(m) + 4} textAnchor="end" className="fill-muted font-mono text-[13px]">
              {usdEn(m, idioma)}
            </text>
          </g>
        ))}
        <text x={IZQ - 8} y={14} textAnchor="end" className="fill-muted text-[13px]">
          {t.ejeMonto}
        </text>
        {marcasMes.map((m, i) => (
          <text key={`x${i}`} x={x(m)} y={ALTO - ABAJO + 18} textAnchor="middle" className="fill-muted font-mono text-[13px]">
            {enteroEn(m, idioma)}
          </text>
        ))}
        <text x={(IZQ + ANCHO - DER) / 2} y={ALTO - 6} textAnchor="middle" className="fill-muted text-[13px]">
          {t.ejeMes}
        </text>
        <path d={area} className="fill-green-soft" stroke="none" />
        <path d={linea("aportado")} className="stroke-ink" fill="none" strokeWidth={2} strokeDasharray="6 5" />
        <path d={linea("devuelto")} className="stroke-green" fill="none" strokeWidth={3} />
      </svg>
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <li className="flex items-center gap-2">
          <svg aria-hidden="true" width="32" height="8" viewBox="0 0 32 8">
            <line x1="0" x2="32" y1="4" y2="4" className="stroke-green" strokeWidth={3} />
          </svg>
          {t.devuelto}
        </li>
        <li className="flex items-center gap-2">
          <svg aria-hidden="true" width="32" height="8" viewBox="0 0 32 8">
            <line x1="0" x2="32" y1="4" y2="4" className="stroke-ink" strokeWidth={2} strokeDasharray="6 5" />
          </svg>
          {t.aportado}
        </li>
      </ul>
      <details className="rounded-lg border border-line bg-surface p-3">
        <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
          {t.tabla}
        </summary>
        <div className="mt-3 max-w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm" data-tabla="curva">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr className="text-left text-muted">
                <th scope="col" className="px-3 py-2 font-normal">
                  {t.colMes}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-normal">
                  {t.colDevuelto}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-normal">
                  {t.colAportado}
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => (
                <tr key={p.mes} className="border-t border-line">
                  <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-mono font-normal text-muted">
                    {t.mes(enteroEn(p.mes, idioma))}
                  </th>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono">{usdEn(p.devuelto, idioma)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono">{usdEn(p.aportado, idioma)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
