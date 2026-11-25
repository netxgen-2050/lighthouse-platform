import { arcoDeElipse, azar, mancha, n1 } from "../geometria";
import { C, Capas, Junco, Persona, Sombra, TRAZO } from "./piezas";

// Cuidado y conflictos: la plaza natural del humedal. Bancos en ronda bajo un sauce llorón, con un charco y juncos.
// Al activarla el sauce se mece y aparecen dos personitas sentadas en los bancos.

const BANCOS: readonly [number, number][] = [
  [0.1, 0.45],
  [0.58, 0.92],
  [1.12, 1.55],
  [1.68, 2.1],
  [2.4, 2.88],
  [3.35, 3.8],
  [4.1, 4.55],
  [4.75, 5.2],
  [5.45, 5.9],
];

function ramas() {
  const a = azar(9);
  return Array.from({ length: 26 }, (_, i) => {
    const t = i / 25;
    const x = n1(-60 + t * 120);
    const arriba = n1(-84 + Math.sin(t * Math.PI) * -6 + 28 * Math.abs(t - 0.5) ** 2 * 4);
    const largo = n1(26 + a() * 20 + Math.sin(t * Math.PI) * 14);
    return { x, y0: arriba + 18, largo, curva: n1((t - 0.5) * 10 + (a() - 0.5) * 6), i };
  });
}
const RAMAS = ramas();

export function Cuidado() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 8, 118, 56, 17, 0.06, 10)} fill={C.salvia} fillOpacity={0.7} />
          <path d={mancha(8, 12, 86, 32, 18, 0.1, 9)} fill={C.rio} fillOpacity={0.85} {...TRAZO} strokeOpacity={0.3} />
          <path d={mancha(10, 15, 58, 18, 19, 0.1, 8)} fill={C.rioHondo} fillOpacity={0.45} />
          <path d="M-14 12Q0 8 16 10M30 22Q44 19 58 22" fill="none" stroke={C.rioBrillo} strokeWidth={1.6} strokeLinecap="round" strokeOpacity={0.85} />
          {/* La ronda de bancos: cintas de madera sobre una elipse, con huecos para pasar. */}
          {BANCOS.map(([d, h], i) => (
            <path
              key={i}
              d={arcoDeElipse(0, 12, 66, 29, d, h)}
              fill="none"
              stroke={C.trazo}
              strokeOpacity={0.18}
              strokeWidth={8}
              strokeLinecap="round"
              transform="translate(3 4)"
            />
          ))}
          <Sombra x={34} y={14} rx={60} ry={9} opacidad={0.14} />
        </>
      }
    >
      {BANCOS.map(([d, h], i) => (
        <g key={i}>
          <path d={arcoDeElipse(0, 12, 66, 29, d, h)} fill="none" stroke={C.arcilla} strokeWidth={8} strokeLinecap="round" />
          <path d={arcoDeElipse(0, 10.5, 66, 29, d, h)} fill="none" stroke={C.ocre} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      ))}
      <Junco x={-82} y={22} alto={18} semilla={7} />
      <Junco x={-90} y={32} alto={13} semilla={8} />
      <Junco x={92} y={14} alto={19} semilla={9} />
      <g className="anim-personas">
        <Persona x={-46} y={30} ropa="arcilla" />
        <Persona x={50} y={32} ropa="verdeHondo" piel="arcilla" />
      </g>
      {/* El sauce: tronco, copa y la cortina de ramas que cuelga. */}
      <path d="M-6 6Q-4 -20 -9 -52L-1 -54Q4 -24 8 6Z" fill={C.arcilla} {...TRAZO} />
      <path d="M-2 -10Q-1 -30 -4 -48" fill="none" stroke={C.ocre} strokeWidth={1.6} strokeLinecap="round" />
      <g className="anim-sauce">
        {RAMAS.map((r) => (
          <path
            key={r.i}
            d={`M${r.x} ${r.y0}Q${n1(r.x + r.curva)} ${n1(r.y0 + r.largo * 0.55)} ${n1(r.x + r.curva * 1.4)} ${n1(r.y0 + r.largo)}`}
            fill="none"
            stroke={r.i % 3 === 0 ? C.salvia : C.verde}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeOpacity={0.95}
          />
        ))}
        <path d={mancha(0, -76, 66, 34, 23, 0.08, 10)} fill={C.verdeHondo} {...TRAZO} strokeOpacity={0.35} />
        <path d={mancha(-6, -80, 54, 27, 24, 0.09, 10)} fill={C.verde} />
        <path d={mancha(-22, -90, 22, 11, 25, 0.1, 7)} fill={C.salvia} fillOpacity={0.6} />
        {RAMAS.filter((r) => r.i % 2 === 0).map((r) => (
          <path key={`h${r.i}`} d={`M${r.x} ${n1(r.y0 - 4)}q${n1(r.curva * 0.3)} ${n1(r.largo * 0.35)} ${n1(r.curva * 0.7)} ${n1(r.largo * 0.55)}`} fill="none" stroke={C.verdeHondo} strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.6} />
        ))}
      </g>
    </Capas>
  );
}
