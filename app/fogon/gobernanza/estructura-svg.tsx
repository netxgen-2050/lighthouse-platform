import type { Textos } from "@/lib/idioma/tipos";
import type { gobernanza } from "@/lib/idioma/textos/gobernanza";
import type { VistaGobernanza } from "@/lib/gobernanza/vista";

type Tx = Textos<(typeof gobernanza)["es"]>;

const ANCHO = 800;
const ALTO = 740;
const CX = 400;
const CY = 290;
const RX = 300;
const RY = 215;
const CAJA_W = 140;
const CAJA_H = 46;

// Clases por estado: además del color, cada estado lleva su palabra con un símbolo y el borde cambia de trazo.
const CLASE_ESTADO = {
  activa: "fill-green-soft stroke-deep",
  formacion: "fill-gold-soft stroke-gold-ink",
  vacante: "fill-surface-2 stroke-faint",
} as const;

/**
 * Dibujo de la estructura: el común al centro, las tribus en anillo y el consejo en una banda aparte. Es solo una
 * ayuda visual (role="img"): lo mismo está, completo, en la lista anidada de la página.
 */
export function EstructuraSvg({ vista, tx }: { vista: VistaGobernanza; tx: Tx }) {
  const d = tx.dibujo;
  const glifo = { activa: d.estadoActiva, formacion: d.estadoFormacion, vacante: d.estadoVacante };
  const lugares = vista.lugares;
  const anchoLugar = 76;
  const separacion = 8;
  const totalLugares = lugares.length * anchoLugar + Math.max(0, lugares.length - 1) * separacion;
  const x0 = CX - totalLugares / 2;

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={d.descripcion}
      className="h-auto w-full rounded-xl border border-faint bg-surface"
    >
      <defs>
        <marker id="flecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-deep" />
        </marker>
      </defs>

      {vista.tribus.map((t, i) => {
        const ang = (i * 30 - 90) * (Math.PI / 180);
        const x = CX + RX * Math.cos(ang);
        const y = CY + RY * Math.sin(ang);
        return (
          <line
            key={`l-${t.id}`}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            className="stroke-deep"
            strokeWidth={2}
            strokeDasharray={t.validada ? undefined : "2 6"}
            markerEnd={t.validada ? "url(#flecha)" : undefined}
          />
        );
      })}

      <circle cx={CX} cy={CY} r={66} className="fill-deep stroke-deep" strokeWidth={2} />
      <text x={CX} y={CY - 2} textAnchor="middle" className="fill-on-deep" fontSize={18} fontWeight={700}>
        {d.centro}
      </text>
      <text x={CX} y={CY + 18} textAnchor="middle" className="fill-on-deep" fontSize={13}>
        {d.centroSub}
      </text>

      {vista.tribus.map((t, i) => {
        const ang = (i * 30 - 90) * (Math.PI / 180);
        const x = CX + RX * Math.cos(ang) - CAJA_W / 2;
        const y = CY + RY * Math.sin(ang) - CAJA_H / 2;
        return (
          <g key={t.id}>
            <rect
              x={x}
              y={y}
              width={CAJA_W}
              height={CAJA_H}
              rx={10}
              strokeWidth={2}
              strokeDasharray={t.estado === "vacante" ? "5 4" : undefined}
              className={CLASE_ESTADO[t.estado]}
            />
            <text x={x + CAJA_W / 2} y={y + 17} textAnchor="middle" className="fill-ink" fontSize={11} fontWeight={700}>
              {t.nombre}
            </text>
            <text x={x + CAJA_W / 2} y={y + 31} textAnchor="middle" className="fill-ink" fontSize={10}>
              {glifo[t.estado]}
            </text>
            <text x={x + CAJA_W / 2} y={y + 43} textAnchor="middle" className="fill-muted" fontSize={10}>
              {t.circulos.length > 0 ? d.cantidadCirculos(t.circulos.length) : d.sinCirculos}
            </text>
          </g>
        );
      })}

      {vista.transversales.map((c, i) => (
        <g key={c.id}>
          <rect
            x={CX - 120}
            y={CY + 84 + i * 50}
            width={240}
            height={42}
            rx={21}
            className="fill-surface stroke-deep"
            strokeWidth={2}
            strokeDasharray="6 3"
          />
          <text x={CX} y={CY + 102 + i * 50} textAnchor="middle" className="fill-ink" fontSize={11} fontWeight={700}>
            {c.nombre}
          </text>
          <text x={CX} y={CY + 117 + i * 50} textAnchor="middle" className="fill-muted" fontSize={10}>
            {d.transversales}: {c.tribus.map((n) => n).join(" · ")}
          </text>
        </g>
      ))}

      <line x1={CX} y1={CY + RY + CAJA_H / 2 + 8} x2={CX} y2={600} className="stroke-deep" strokeWidth={2} markerEnd="url(#flecha)" />
      <text x={CX + 12} y={590} className="fill-ink" fontSize={11}>
        {d.sube}
      </text>

      <rect x={40} y={606} width={720} height={116} rx={14} className="fill-surface-2 stroke-deep" strokeWidth={2} />
      <text x={CX} y={632} textAnchor="middle" className="fill-ink" fontSize={14} fontWeight={700}>
        {d.consejo}
      </text>
      {lugares.map((l, i) => (
        <g key={l.tribuId}>
          <rect
            x={x0 + i * (anchoLugar + separacion)}
            y={648}
            width={anchoLugar}
            height={40}
            rx={8}
            className="fill-surface stroke-deep"
            strokeWidth={1.5}
          />
          <text x={x0 + i * (anchoLugar + separacion) + anchoLugar / 2} y={673} textAnchor="middle" className="fill-ink" fontSize={14} fontWeight={700}>
            {l.iniciales}
          </text>
        </g>
      ))}
      <text x={CX} y={712} textAnchor="middle" className="fill-muted" fontSize={11}>
        {d.leyenda}
      </text>
    </svg>
  );
}
