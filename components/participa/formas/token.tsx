import { mancha } from "../geometria";
import { C, Capas, Sombra, TRAZO } from "./piezas";

// Tokenomics y Semillas: vivero y banco de semillas. Un invernadero de arco con bancales adentro, dos bancales al aire libre
// y un cajón con un saco de semillas. Al activarla, brotan dos hojitas en los bancales.

const ARCO = (dx: number, dy: number) =>
  `M${-58 + dx} ${8 + dy}L${-58 + dx} ${-12 + dy}A58 42 0 0 1 ${58 + dx} ${-12 + dy}L${58 + dx} ${8 + dy}Z`;

function Brote({ x, y, demora }: { x: number; y: number; demora: number }) {
  return (
    <g className="anim-brote" style={{ animationDelay: `${demora}s` }}>
      <path d={`M${x} ${y}Q${x - 1} ${y - 6} ${x} ${y - 9}`} fill="none" stroke={C.verdeHondo} strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M${x} ${y - 7}Q${x - 8} ${y - 12} ${x - 9} ${y - 5}Q${x - 3} ${y - 4} ${x} ${y - 7}Z`} fill={C.verde} {...TRAZO} strokeOpacity={0.35} />
      <path d={`M${x} ${y - 8}Q${x + 8} ${y - 14} ${x + 9} ${y - 6}Q${x + 3} ${y - 5} ${x} ${y - 8}Z`} fill={C.salvia} {...TRAZO} strokeOpacity={0.35} />
    </g>
  );
}

function Bancal({ x, y }: { x: number; y: number }) {
  // Un bancal elevado en perspectiva: borde de madera, tierra y plantines.
  return (
    <g>
      <path d={`M${x} ${y}L${x + 44} ${y - 10}L${x + 56} ${y + 6}L${x + 12} ${y + 18}Z`} fill={C.ocre} {...TRAZO} />
      <path d={`M${x + 3} ${y + 2}L${x + 43} ${y - 7}L${x + 52} ${y + 5}L${x + 13} ${y + 15}Z`} fill={C.arcilla} fillOpacity={0.85} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={x + 10 + i * 11} cy={y + 8 - i * 2.2} r={2.6} fill={C.verde} />
          <circle cx={x + 9 + i * 11} cy={y + 7 - i * 2.2} r={1.2} fill={C.salvia} />
        </g>
      ))}
    </g>
  );
}

export function Token() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(2, 6, 118, 56, 13, 0.06, 10)} fill={C.salvia} fillOpacity={0.6} />
          <path d={mancha(4, 10, 104, 44, 14, 0.07, 10)} fill={C.arena} fillOpacity={0.7} />
          <Sombra x={26} y={14} rx={78} ry={11} opacidad={0.16} />
        </>
      }
    >
      {/* Bancales al aire libre, a la izquierda. */}
      <Bancal x={-112} y={4} />
      <Bancal x={-104} y={30} />
      <Brote x={-92} y={14} demora={0} />
      <Brote x={-78} y={40} demora={0.18} />
      {/* El invernadero: arco de atrás, techo que une los dos arcos y arco de adelante. */}
      <path d={ARCO(24, -14)} fill={C.rioBrillo} fillOpacity={0.4} {...TRAZO} strokeOpacity={0.35} />
      <path d={`M${58} ${-12}L${82} ${-26}L${82} ${-6}L${58} ${8}Z`} fill={C.rioBrillo} fillOpacity={0.55} {...TRAZO} strokeOpacity={0.4} />
      <path d={ARCO(0, 0)} fill={C.rioBrillo} fillOpacity={0.62} {...TRAZO} />
      {/* Nervaduras del arco. */}
      {[-38, -19, 0, 19, 38].map((x) => (
        <path key={x} d={`M${x} 8L${x} ${-12 - 41 * Math.sqrt(Math.max(0, 1 - (x / 58) ** 2)) + 1}`} stroke={C.trazo} strokeOpacity={0.35} strokeWidth={1} fill="none" />
      ))}
      <path d="M-58 -12H58" stroke={C.trazo} strokeOpacity={0.3} strokeWidth={1} />
      {/* Adentro: la puerta con los bancales a la vista. */}
      <path d="M-20 8L-20 -16Q0 -26 20 -16L20 8Z" fill={C.verdeHondo} fillOpacity={0.55} />
      {[-12, -4, 4, 12].map((x, i) => (
        <path key={i} d={`M${x} 6Q${x - 2} 0 ${x - 4} -3M${x} 6Q${x + 2} 0 ${x + 4} -3`} stroke={C.verde} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      ))}
      <rect x={-58} y={8} width={116} height={4} rx={1.5} fill={C.ocre} {...TRAZO} />
      <path d="M-58 8H58" stroke={C.rioBrillo} strokeOpacity={0.6} strokeWidth={1} />
      {/* Cajón con un saco de semillas. */}
      <path d="M62 24L88 18L94 28L68 35Z" fill={C.ocre} {...TRAZO} />
      <path d="M68 35L94 28L94 38L68 45Z" fill={C.arcilla} {...TRAZO} />
      <path d="M62 24L68 35L68 45L62 34Z" fill={C.arcilla} fillOpacity={0.8} {...TRAZO} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={69 + i * 4.4} cy={28 - i * 1.2} r={1.5} fill={C.sol} stroke={C.trazo} strokeOpacity={0.4} strokeWidth={0.6} />
      ))}
      <path d="M96 26Q100 14 108 18Q112 26 104 34Q98 36 96 26Z" fill={C.arena} {...TRAZO} />
      <path d="M100 16Q104 12 108 18" fill="none" stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1} />
    </Capas>
  );
}
