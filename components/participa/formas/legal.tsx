import { mancha, n1 } from "../geometria";
import { Alamo, C, Capas, Sombra, TRAZO } from "./piezas";

// Legal: una cortina rompevientos de álamos que abraza una chacra (protege lo que hay adentro), con un mojón y su banderita
// que marcan el límite. Al activarla, las hojas de los álamos tiemblan con el viento.

// Esquinas de la chacra, vista levemente inclinada: A (noroeste), B (noreste), C (sudeste), D (sudoeste).
const A = [-70, -6] as const;
const B = [46, -30] as const;
const D = [-26, 40] as const;
const C2 = [B[0] + (D[0] - A[0]), B[1] + (D[1] - A[1])] as const;

const lerp = (p: readonly [number, number], q: readonly [number, number], t: number) =>
  [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t] as const;

function alamos() {
  const lista: { x: number; y: number; alto: number; semilla: number }[] = [];
  // Lado norte (A→B) y lado oeste (A→D), con una esquina extra al noreste.
  for (let i = 0; i <= 7; i++) {
    const [x, y] = lerp([A[0] - 6, A[1] - 8], [B[0] + 4, B[1] - 8], i / 7);
    lista.push({ x: n1(x), y: n1(y), alto: 46 + (i % 3) * 3, semilla: 100 + i });
  }
  for (let i = 1; i <= 5; i++) {
    const [x, y] = lerp([A[0] - 8, A[1]], [D[0] - 8, D[1]], i / 5);
    lista.push({ x: n1(x), y: n1(y), alto: 44 + (i % 2) * 4, semilla: 120 + i });
  }
  return lista.sort((p, q) => p.y - q.y);
}
const ALAMOS = alamos();

export function Legal() {
  const surcos = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 0.7) / 7.4;
    const [x0, y0] = lerp(A, D, t);
    const [x1, y1] = lerp(B, C2, t);
    return `M${n1(x0 + 4)} ${n1(y0)}L${n1(x1 - 4)} ${n1(y1)}`;
  });
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(10, 8, 112, 58, 8, 0.06, 10)} fill={C.salvia} fillOpacity={0.6} />
          <path
            d={`M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${C2[0]} ${C2[1]}L${D[0]} ${D[1]}Z`}
            fill={C.arena}
            {...TRAZO}
          />
          <path d={surcos.join("")} fill="none" stroke={C.verde} strokeWidth={3.2} strokeLinecap="round" strokeOpacity={0.75} />
          <path d={surcos.join("")} fill="none" stroke={C.salvia} strokeWidth={1} strokeLinecap="round" strokeOpacity={0.9} transform="translate(0 -1.4)" />
        </>
      }
    >
      {ALAMOS.map((a, i) => (
        <Alamo key={i} x={a.x} y={a.y} alto={a.alto} semilla={a.semilla} tiembla demora={(i % 6) * 0.07} />
      ))}
      {/* Mojón del límite con su banderita. */}
      <Sombra x={34} y={22} rx={11} ry={3} opacidad={0.2} />
      <path d="M22 20L24 8L36 8L38 20Z" fill={C.arena} {...TRAZO} />
      <path d="M36 8L38 20L33 21L33 9Z" fill={C.trazo} fillOpacity={0.14} />
      <line x1={30} y1={8} x2={30} y2={-14} stroke={C.trazo} strokeOpacity={0.7} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M30 -14L44 -10L30 -6Z" fill={C.arcilla} {...TRAZO} />
    </Capas>
  );
}
