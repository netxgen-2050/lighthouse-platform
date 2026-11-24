import { mancha } from "../geometria";
import { C, Capas, Halo, Mata, Sombra, TRAZO } from "./piezas";

// Marketing y comunicación: el faro en el borde de la barda, "una luz en el borde del desierto". Torre a franjas, galería,
// linterna encendida y dos haces. Al activarla, el haz gira. De noche la linterna emite un halo.

const BASE_Y = -8;
const TOPE_Y = -98;
const ancho = (y: number) => 24 - ((BASE_Y - y) / (BASE_Y - TOPE_Y)) * 9; // semiancho de la torre a esa altura
const BANDAS = [0, 0.22, 0.44, 0.66, 0.88, 1] as const;

function banda(t0: number, t1: number) {
  const y0 = BASE_Y + (TOPE_Y - BASE_Y) * t0;
  const y1 = BASE_Y + (TOPE_Y - BASE_Y) * t1;
  return `M${-ancho(y0)} ${y0}L${-ancho(y1)} ${y1}L${ancho(y1)} ${y1}L${ancho(y0)} ${y0}Z`;
}

export function Marketing() {
  return (
    <Capas
      suelo={
        <>
          {/* El borde de la barda: roca ocre con grietas y jarillas. */}
          <path d={mancha(0, 6, 92, 38, 31, 0.1, 10)} fill={C.ocre} {...TRAZO} strokeOpacity={0.35} />
          <path d={mancha(-4, 2, 78, 28, 32, 0.1, 9)} fill={C.arena} fillOpacity={0.75} />
          <path d="M-50 14L-30 18M30 10L58 16M-12 24L8 28" stroke={C.arcilla} strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round" />
          <Sombra x={34} y={12} rx={62} ry={9} opacidad={0.2} />
          <Mata x={-70} y={14} escala={0.9} />
          <Mata x={72} y={20} escala={0.8} tono="ocre" />
        </>
      }
    >
      <Halo x={0} y={-112} rx={120} ry={90} />
      {/* Los haces de luz: dos cuñas simétricas; al girar se ven como si cambiaran de lado. */}
      <g className="anim-haz ilus-haz">
        <path d="M0 -112L140 -134L140 -90Z" fill="url(#ilus-haz)" />
        <path d="M0 -112L-140 -134L-140 -90Z" fill="url(#ilus-haz)" />
      </g>
      {/* La torre. */}
      <path d={`M${-ancho(BASE_Y)} ${BASE_Y}L${-ancho(TOPE_Y)} ${TOPE_Y}L${ancho(TOPE_Y)} ${TOPE_Y}L${ancho(BASE_Y)} ${BASE_Y}Z`} fill={C.arena} {...TRAZO} />
      {BANDAS.slice(0, -1).map((t, i) =>
        i % 2 === 0 ? <path key={i} d={banda(t, BANDAS[i + 1])} fill={C.arcilla} /> : null,
      )}
      <path d={`M6 ${BASE_Y}L${ancho(TOPE_Y) - 5} ${TOPE_Y}L${ancho(TOPE_Y)} ${TOPE_Y}L${ancho(BASE_Y)} ${BASE_Y}Z`} fill={C.trazo} fillOpacity={0.16} />
      <path d={`M${-ancho(BASE_Y)} ${BASE_Y}L${-ancho(TOPE_Y)} ${TOPE_Y}L${ancho(TOPE_Y)} ${TOPE_Y}L${ancho(BASE_Y)} ${BASE_Y}Z`} fill="none" {...TRAZO} />
      {/* Puerta y ventanita. */}
      <path d="M-5 -8L-5 -22Q0 -27 5 -22L5 -8Z" fill={C.trazo} fillOpacity={0.6} />
      <rect x={-2.6} y={-64} width={5.2} height={8} rx={2.6} className="ilus-ventana" />
      {/* Galería con baranda. */}
      <rect x={-20} y={-104} width={40} height={7} rx={2} fill={C.ocre} {...TRAZO} />
      <path d="M-18 -104V-110M-9 -104V-110M0 -104V-110M9 -104V-110M18 -104V-110M-18 -110H18" stroke={C.trazo} strokeOpacity={0.6} strokeWidth={1} fill="none" />
      {/* Linterna y techo. */}
      <rect x={-10} y={-122} width={20} height={16} rx={2} fill={C.sol} {...TRAZO} />
      <rect x={-5} y={-119} width={10} height={10} rx={5} fill={C.fuego} fillOpacity={0.9} />
      <path d="M-9 -108V-122M9 -108V-122" stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1} />
      <path d="M-14 -122L0 -137L14 -122Z" fill={C.arcilla} {...TRAZO} />
      <circle cx={0} cy={-139} r={2.2} fill={C.ocre} {...TRAZO} />
      {/* Dos gaviotas. */}
      <path d="M-58 -96Q-54 -101 -50 -96M-46 -108Q-43 -112 -40 -108" fill="none" stroke={C.trazo} strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" />
    </Capas>
  );
}
