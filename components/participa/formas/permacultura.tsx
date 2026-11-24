import { arcoDeElipse, azar, mancha, n1 } from "../geometria";
import { Arbol, C, Capas, Sombra } from "./piezas";

// Permacultura y regeneración: bosque comestible en curvas de nivel. Tres anillos de copas que siguen la pendiente,
// abiertos por delante para que se pueda entrar, con un frutal grande en el centro. Al activarla, las copas se mecen.

const ANILLOS = [
  { rx: 98, ry: 47, n: 10, r: 15 },
  { rx: 68, ry: 32, n: 7, r: 13 },
  { rx: 40, ry: 19, n: 4, r: 11 },
] as const;

type Arb = { x: number; y: number; r: number; semilla: number };

function arboles(): Arb[] {
  const a = azar(11);
  const lista: Arb[] = [];
  ANILLOS.forEach((anillo, k) => {
    // Hueco de entrada al frente (ángulos cerca de π/2, donde y es positivo).
    const desde = Math.PI * 0.62;
    const hasta = Math.PI * 2.38;
    for (let i = 0; i < anillo.n; i++) {
      const ang = desde + ((hasta - desde) * (i + 0.5)) / anillo.n + (a() - 0.5) * 0.12;
      lista.push({
        x: n1(Math.cos(ang) * anillo.rx),
        y: n1(Math.sin(ang) * anillo.ry + 4),
        r: n1(anillo.r + (a() - 0.5) * 3),
        semilla: 20 + k * 20 + i,
      });
    }
  });
  return lista.sort((p, q) => p.y - q.y);
}

const ARBOLES = arboles();

export function Permacultura() {
  return (
    <Capas
      suelo={
        <>
          <path d={mancha(0, 6, 116, 60, 5, 0.06, 10)} fill={C.salvia} fillOpacity={0.75} />
          <path d={mancha(0, 8, 104, 52, 6, 0.06, 10)} fill={C.verde} fillOpacity={0.22} />
          {/* Los bordos de las curvas de nivel: una cinta de tierra y un hilo de pasto encima. */}
          {ANILLOS.map((an, i) => (
            <g key={i}>
              <path
                d={arcoDeElipse(0, 6, an.rx, an.ry, Math.PI * 0.6, Math.PI * 2.4)}
                fill="none"
                stroke={C.ocre}
                strokeOpacity={0.55}
                strokeWidth={8}
                strokeLinecap="round"
              />
              <path
                d={arcoDeElipse(0, 5, an.rx, an.ry, Math.PI * 0.6, Math.PI * 2.4)}
                fill="none"
                stroke={C.salvia}
                strokeOpacity={0.9}
                strokeWidth={2.5}
                strokeDasharray="1 6"
                strokeLinecap="round"
              />
            </g>
          ))}
          <Sombra x={8} y={12} rx={104} ry={50} opacidad={0.06} />
        </>
      }
    >
      {ARBOLES.map((t, i) => (
        <Arbol key={i} x={t.x} y={t.y} r={t.r} semilla={t.semilla} meciendo demora={(i % 5) * 0.12} tono={i % 4 === 0 ? "salvia" : "verde"} />
      ))}
      {/* El frutal del centro, con sus frutos. */}
      <Arbol x={0} y={14} r={19} semilla={91} meciendo />
      {[
        [-8, -10],
        [6, -3],
        [-1, -15],
        [10, -11],
        [-11, 3],
      ].map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r={2.3} fill={i % 2 ? C.fuego : C.arcilla} stroke={C.trazo} strokeOpacity={0.4} strokeWidth={0.8} />
      ))}
    </Capas>
  );
}
