import { mancha, n1 } from "../geometria";
import { C, Capas, Sombra, TRAZO } from "./piezas";

// Tecnología: una granja solar en una chacra de la meseta baja. Dos hileras de paneles inclinados al norte, una casilla con
// el inversor y la zanja del cable. Al activarla, un destello recorre los paneles.

function Panel({ x, y, i }: { x: number; y: number; i: number }) {
  // Cara del panel (paralelogramo), patas del lado sur y rejilla.
  const p = (dx: number, dy: number) => `${n1(x + dx)} ${n1(y + dy)}`;
  return (
    <g>
      <path d={`M${p(4, 20)}L${p(4, 28)}M${p(40, 14)}L${p(40, 24)}`} stroke={C.trazo} strokeOpacity={0.6} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M${p(8, 26)}L${p(54, 26)}L${p(62, 34)}L${p(14, 34)}Z`} fill={C.trazo} fillOpacity={0.14} />
      <path d={`M${p(0, 22)}L${p(6, 0)}L${p(50, -6)}L${p(46, 16)}Z`} fill={C.rioHondo} {...TRAZO} strokeOpacity={0.7} />
      <path d={`M${p(0, 22)}L${p(6, 0)}L${p(50, -6)}L${p(46, 16)}Z`} fill={C.rio} fillOpacity={0.35} />
      {/* Rejilla de celdas. */}
      <path
        d={`M${p(16, 20)}L${p(21, -3)}M${p(31, 18)}L${p(36, -4)}M${p(1.5, 11)}L${p(48, 5)}`}
        stroke={C.rioBrillo}
        strokeOpacity={0.6}
        strokeWidth={0.9}
        fill="none"
      />
      {/* El destello: una franja clara en diagonal, dentro de la cara. */}
      <path
        className="anim-destello"
        d={`M${p(18, 18)}L${p(22, 1)}L${p(30, 0)}L${p(26, 17)}Z`}
        fill={C.sol}
        style={{ animationDelay: `${i * 0.16}s` }}
      />
    </g>
  );
}

export function Plataforma() {
  const filas = [
    { y: -34, xs: [-96, -40, 16] },
    { y: 6, xs: [-82, -26, 30] },
  ];
  let k = 0;
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 8, 118, 58, 27, 0.06, 10)} fill={C.arena} {...TRAZO} strokeOpacity={0.25} />
          <path d={mancha(2, 10, 104, 48, 28, 0.07, 10)} fill={C.ocre} fillOpacity={0.3} />
          {/* Zanja del cable hasta la casilla. */}
          <path d="M-90 52Q10 62 92 40" fill="none" stroke={C.trazo} strokeOpacity={0.35} strokeWidth={1.6} strokeDasharray="5 4" strokeLinecap="round" />
          <Sombra x={0} y={40} rx={100} ry={7} opacidad={0.08} />
        </>
      }
    >
      {filas.map((f) =>
        f.xs.map((x) => <Panel key={`${f.y}-${x}`} x={x} y={f.y} i={k++} />),
      )}
      {/* Casilla del inversor. */}
      <path d="M74 20L74 -2L98 -8L98 14Z" fill={C.arena} {...TRAZO} />
      <path d="M98 -8L110 -2L110 20L98 14Z" fill={C.ocre} {...TRAZO} />
      <path d="M70 -2L86 -18L108 -10L112 -1L98 -8Z" fill={C.arcilla} {...TRAZO} />
      <rect x={79} y={4} width={7} height={11} rx={1} fill={C.trazo} fillOpacity={0.6} />
      <rect x={89} y={2} width={5} height={5} rx={1} className="ilus-ventana" />
      <path d="M104 -12V-30M98 -26H110" stroke={C.trazo} strokeOpacity={0.65} strokeWidth={1.3} strokeLinecap="round" />
    </Capas>
  );
}
