import { azar, mancha, n1 } from "../geometria";
import { C, Capas, Halo, Piedra, Sombra, TRAZO } from "./piezas";

// Gobernanza: el fogón, el círculo original del Fogón: una ronda de doce piedras con el fuego en el centro y tocones para
// sentarse. Al activarla el fuego titila y suben chispas. De noche emite luz.

const PIEDRAS = Array.from({ length: 12 }, (_, i) => {
  const ang = (i / 12) * Math.PI * 2 + 0.2;
  return { x: n1(Math.cos(ang) * 58), y: n1(Math.sin(ang) * 27 + 6), i };
}).sort((a, b) => a.y - b.y);

const TOCONES = [
  [-86, 28],
  [80, 30],
  [-6, 58],
  [-66, -22],
  [72, -18],
] as const;

function Tocon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Sombra x={x + 6} y={y + 5} rx={11} ry={3.4} opacidad={0.2} />
      <path d={`M${x - 9} ${y}L${x - 9} ${y - 8}A9 4 0 0 1 ${x + 9} ${y - 8}L${x + 9} ${y}A9 4 0 0 1 ${x - 9} ${y}Z`} fill={C.arcilla} {...TRAZO} />
      <ellipse cx={x} cy={y - 8} rx={9} ry={4} fill={C.ocre} {...TRAZO} />
      <ellipse cx={x} cy={y - 8} rx={5} ry={2.2} fill="none" stroke={C.arcilla} strokeOpacity={0.5} strokeWidth={0.8} />
    </g>
  );
}

export function Gobernanza() {
  const a = azar(61);
  const chispas = Array.from({ length: 5 }, (_, i) => ({ x: n1(-8 + a() * 16), i }));
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 8, 112, 52, 51, 0.05, 10)} fill={C.salvia} fillOpacity={0.7} />
          <path d={mancha(0, 8, 92, 42, 52, 0.05, 10)} fill={C.arena} fillOpacity={0.85} />
          <ellipse cx={0} cy={8} rx={40} ry={17} fill={C.trazo} fillOpacity={0.28} />
          <Sombra x={8} y={42} rx={80} ry={8} opacidad={0.07} />
        </>
      }
    >
      <Halo x={0} y={-6} rx={130} ry={90} />
      {TOCONES.filter(([, y]) => y < 10).map(([x, y]) => (
        <Tocon key={`${x}${y}`} x={x} y={y} />
      ))}
      {PIEDRAS.filter((p) => p.y < 8).map((p) => (
        <Piedra key={p.i} x={p.x} y={p.y} w={16} h={11} semilla={70 + p.i} />
      ))}
      {/* Leños cruzados y fuego. */}
      <path d="M-26 12L22 4" stroke={C.trazo} strokeOpacity={0.9} strokeWidth={7} strokeLinecap="round" />
      <path d="M-26 11L22 3" stroke={C.arcilla} strokeWidth={5} strokeLinecap="round" />
      <path d="M24 12L-22 3" stroke={C.trazo} strokeOpacity={0.9} strokeWidth={7} strokeLinecap="round" />
      <path d="M24 11L-22 2" stroke={C.ocre} strokeWidth={5} strokeLinecap="round" />
      <g className="anim-fuego">
        <path d="M0 8C-22 6 -24 -14 -10 -28C-8 -20 -4 -18 -2 -24C0 -34 6 -40 8 -46C18 -34 24 -18 20 -4C18 4 10 8 0 8Z" fill={C.fuego} {...TRAZO} strokeOpacity={0.4} />
        <path d="M0 7C-13 5 -14 -8 -5 -17C-3 -12 0 -11 1 -16C4 -22 6 -26 7 -30C13 -22 15 -11 12 -3C10 3 6 7 0 7Z" fill={C.sol} />
        <path d="M0 6C-6 5 -6 -2 -2 -7C0 -4 2 -4 4 -9C7 -4 8 1 6 4C5 6 3 6 0 6Z" fill={C.rioBrillo} fillOpacity={0.9} />
      </g>
      {chispas.map((c) => (
        <circle key={c.i} className="anim-chispa" cx={c.x} cy={-30} r={1.5} fill={C.sol} style={{ animationDelay: `${c.i * 0.27}s` }} />
      ))}
      <path d="M2 -48Q-6 -62 4 -72Q12 -82 2 -94" fill="none" stroke={C.trazo} strokeOpacity={0.13} strokeWidth={4} strokeLinecap="round" />
      {PIEDRAS.filter((p) => p.y >= 8).map((p) => (
        <Piedra key={p.i} x={p.x} y={p.y} w={16} h={11} semilla={70 + p.i} />
      ))}
      {TOCONES.filter(([, y]) => y >= 10).map(([x, y]) => (
        <Tocon key={`${x}${y}`} x={x} y={y} />
      ))}
    </Capas>
  );
}
