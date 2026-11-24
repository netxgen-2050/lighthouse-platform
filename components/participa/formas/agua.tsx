import { azar, mancha, n1 } from "../geometria";
import { C, Capas, Junco, Piedra, Sombra, TRAZO } from "./piezas";

// Agua: laguna de infiltración en la desembocadura del cañadón, con dos medias lunas cuesta arriba y un dique de piedra
// que frena el cauce seco. Al activarla, ondas concéntricas recorren el agua.

const MEDIA_LUNA = (x: number, y: number, ancho: number) => `M${x} ${y}Q${n1(x + ancho / 2)} ${n1(y - ancho * 0.62)} ${n1(x + ancho)} ${y}`;

const ONDAS = [
  { rx: 17, ry: 7 },
  { rx: 33, ry: 13.5 },
  { rx: 49, ry: 20 },
] as const;

function piedrasDelDique() {
  const a = azar(5);
  return Array.from({ length: 7 }, (_, i) => ({
    x: n1(-104 + i * 5.2 + (a() - 0.5) * 2),
    y: n1(-26 + i * 7.4 + (a() - 0.5) * 2),
    w: n1(9 + a() * 3),
    h: n1(7 + a() * 2),
  }));
}
const DIQUE = piedrasDelDique();

export function Agua() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, -2, 112, 56, 3, 0.07, 10)} fill={C.salvia} fillOpacity={0.55} />
          {/* Cauce seco que baja del cañadón y se frena en el dique. */}
          <path d="M-118 -40Q-96 -22 -76 -12" fill="none" stroke={C.arena} strokeWidth={9} strokeLinecap="round" />
          <path d="M-118 -40Q-96 -22 -76 -12" fill="none" stroke={C.ocre} strokeOpacity={0.5} strokeWidth={1.4} strokeDasharray="2 5" strokeLinecap="round" />
          {/* La laguna: borde de barro, agua, fondo y brillo. */}
          <path d={mancha(2, 4, 82, 38, 21, 0.08, 10)} fill={C.ocre} fillOpacity={0.6} />
          <path d={mancha(2, 3, 74, 32, 22, 0.08, 10)} fill={C.rio} {...TRAZO} strokeOpacity={0.4} />
          <path d={mancha(-4, 7, 54, 20, 23, 0.1, 9)} fill={C.rioHondo} fillOpacity={0.55} />
          <path d="M-46 -8Q-30 -16 -12 -13" fill="none" stroke={C.rioBrillo} strokeWidth={2} strokeLinecap="round" strokeOpacity={0.9} />
          <path d="M18 14Q34 11 48 6" fill="none" stroke={C.rioBrillo} strokeWidth={1.6} strokeLinecap="round" strokeOpacity={0.75} />
          <Sombra x={6} y={46} rx={78} ry={9} opacidad={0.08} />
        </>
      }
    >
      {/* Las ondas: siempre una huella fina, y al activarla se expanden. */}
      <g>
        {ONDAS.map((o, i) => (
          <ellipse
            key={i}
            className="anim-onda"
            cx={2}
            cy={5}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            stroke={C.rioBrillo}
            strokeWidth={1.8}
            strokeOpacity={0.7}
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </g>
      {/* Medias lunas: bordos de tierra en arco que retienen el agua de la lluvia. */}
      {[
        [-54, -48, 46],
        [8, -54, 48],
      ].map(([x, y, w], i) => (
        <g key={i}>
          <path d={MEDIA_LUNA(x, y, w)} fill="none" stroke={C.trazo} strokeOpacity={0.18} strokeWidth={9} strokeLinecap="round" transform="translate(2 3)" />
          <path d={MEDIA_LUNA(x, y, w)} fill="none" stroke={C.ocre} strokeWidth={8} strokeLinecap="round" />
          <path d={MEDIA_LUNA(x, y - 2, w)} fill="none" stroke={C.arena} strokeWidth={2.4} strokeLinecap="round" strokeOpacity={0.9} />
        </g>
      ))}
      {/* Dique de piedra. */}
      {DIQUE.map((p, i) => (
        <Piedra key={i} x={p.x} y={p.y} w={p.w} h={p.h} semilla={40 + i} />
      ))}
      {/* Juncos en la orilla este. */}
      <Junco x={70} y={14} alto={20} semilla={2} />
      <Junco x={78} y={24} alto={16} semilla={3} />
      <Junco x={-62} y={30} alto={14} semilla={4} />
      <ellipse cx={22} cy={-1} rx={3.2} ry={1.6} fill={C.verde} />
      <ellipse cx={-18} cy={14} rx={3.6} ry={1.8} fill={C.verde} />
    </Capas>
  );
}
