import { azar, mancha, n1 } from "../geometria";
import { C, Capas, Halo, Sombra, TRAZO } from "./piezas";

// Gestión de contratistas: el centro agroindustrial. Un galpón de techo a dos aguas con su portón, una carretilla, una pila
// de compost con su horquilla y cajones apilados. Al activarla, la carretilla avanza un poco.

function Compost() {
  const a = azar(33);
  const motas = Array.from({ length: 16 }, (_, i) => ({ x: n1(-110 + a() * 40), y: n1(14 + a() * 12), i }));
  return (
    <g>
      <Sombra x={-72} y={32} rx={34} ry={7} opacidad={0.2} />
      <path d={mancha(-92, 24, 32, 17, 41, 0.1, 9)} fill={C.arcilla} fillOpacity={0.9} {...TRAZO} />
      <path d={mancha(-98, 19, 22, 10, 42, 0.12, 8)} fill={C.ocre} fillOpacity={0.65} />
      {motas.map((m) => (
        <circle key={m.i} cx={m.x} cy={m.y} r={0.9} fill={C.trazo} fillOpacity={0.5} />
      ))}
      {/* Horquilla clavada en la pila. */}
      <path d="M-70 24L-66 -2" stroke={C.trazo} strokeOpacity={0.7} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M-70 24L-72 31M-70 24L-68 32M-70 24L-65 30" stroke={C.trazo} strokeOpacity={0.7} strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
}

function Carretilla() {
  return (
    <g className="anim-carretilla">
      <Sombra x={50} y={46} rx={20} ry={4} opacidad={0.2} />
      <path d="M30 28L62 24L58 40L38 42Z" fill={C.verdeHondo} {...TRAZO} />
      <path d="M32 29L61 25L60 29L33 33Z" fill={C.verde} fillOpacity={0.85} />
      <path d="M62 26L84 16M60 30L84 24" stroke={C.ocre} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M30 29L18 38M32 33L20 42" stroke={C.ocre} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={26} cy={42} r={6} fill={C.trazo} fillOpacity={0.85} />
      <circle cx={26} cy={42} r={2.3} fill={C.arena} />
    </g>
  );
}

export function Contratistas() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 12, 124, 54, 37, 0.06, 10)} fill={C.arena} {...TRAZO} strokeOpacity={0.25} />
          <path d={mancha(4, 14, 108, 44, 38, 0.07, 10)} fill={C.ocre} fillOpacity={0.3} />
          <Sombra x={34} y={14} rx={70} ry={11} opacidad={0.22} />
        </>
      }
    >
      <Compost />
      {/* Galpón: gablete al frente, costado derecho y faldón del techo. */}
      <path d="M10 10L44 -4L44 -50L10 -36Z" fill={C.ocre} {...TRAZO} />
      <path d="M10 10L44 -4L44 -50L10 -36Z" fill={C.trazo} fillOpacity={0.14} />
      <path d="M-70 10H10V-36H-70Z" fill={C.arena} {...TRAZO} />
      <path d="M-62 10V-36M-50 10V-36M-38 10V-36M-26 10V-36M-14 10V-36M-2 10V-36" stroke={C.trazo} strokeOpacity={0.12} strokeWidth={1} />
      <path d="M-70 -36L-30 -64L10 -36Z" fill={C.ocre} {...TRAZO} />
      <path d="M10 -36L-30 -64L4 -78L44 -50Z" fill={C.arcilla} {...TRAZO} />
      <path d="M-30 -64L4 -78" stroke={C.arena} strokeOpacity={0.6} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M-74 -35L-30 -67M10 -35L48 -49" stroke={C.trazo} strokeOpacity={0.35} strokeWidth={1} />
      {/* Portón con travesaños y una ventanita en el gablete. */}
      <rect x={-54} y={-24} width={44} height={34} fill={C.trazo} fillOpacity={0.58} {...TRAZO} />
      <path d="M-54 -24L-10 10M-10 -24L-54 10M-32 -24V10" stroke={C.ocre} strokeOpacity={0.85} strokeWidth={1.6} />
      <circle cx={-30} cy={-44} r={4.4} className="ilus-ventana" {...TRAZO} />
      <Halo x={-32} y={-12} rx={46} ry={34} />
      {/* Cajones apilados. */}
      <path d="M56 22L74 18L74 30L56 34Z" fill={C.ocre} {...TRAZO} />
      <path d="M74 18L84 24L84 36L74 30Z" fill={C.arcilla} {...TRAZO} />
      <path d="M58 10L74 6L74 18L58 22Z" fill={C.arena} {...TRAZO} />
      <path d="M74 6L83 11L84 24L74 18Z" fill={C.ocre} {...TRAZO} />
      <Carretilla />
    </Capas>
  );
}
