import { ALTO_MAPA, ANCHO_MAPA } from "./ubicaciones";
import { azar, distancia, mancha, muestrear, n1, suave, yEn, type Punto } from "./geometria";
import { Arbol, Alamo, C, Mata, Piedra, TRAZO } from "./formas/piezas";

// El territorio de fondo del mapa de Participa, de norte (arriba) a sur: el río Negro con su bosque de sauces y la costanera,
// la planicie aluvial con chacras, vides, olivos y cortinas de álamos, la barda con sus cárcavas, las mesetas de estepa y,
// cruzando de sur a norte, el cañadón: un corredor verde con diques de piedra que desemboca en el humedal junto al río.
// Es una ilustración: no lleva datos ni medidas.

/** La orilla sur del río, de oeste a este. */
const ORILLA: Punto[] = [
  [0, 132], [100, 118], [190, 100], [300, 118], [420, 140], [560, 162], [700, 150], [820, 128], [950, 112], [1070, 130], [1200, 118],
];
/** El borde de la barda: arriba la planicie, abajo la meseta. */
const BARDA: Punto[] = [
  [0, 500], [140, 486], [300, 500], [470, 478], [600, 494], [760, 472], [900, 492], [1060, 474], [1200, 490],
];
/** El eje del cañadón, del sur al norte. */
const CANADON: Punto[] = [
  [596, 900], [642, 830], [566, 752], [612, 672], [590, 600], [628, 530], [596, 450], [636, 372], [608, 300], [642, 244],
];
/** Dónde están las formas: el fondo evita llenar de detalle debajo de ellas. */
const CENTROS: Punto[] = [
  [168, 296], [404, 282], [820, 228], [1030, 338], [296, 428], [642, 244], [872, 530], [900, 742], [596, 654],
];

const MUESTRAS_CANADON = muestrear(CANADON, 60);

function cercaDeForma(x: number, y: number, radio = 120): boolean {
  return CENTROS.some((c) => distancia(c, [x, y]) < radio);
}
function cercaDelCanadon(x: number, y: number, radio = 62): boolean {
  return MUESTRAS_CANADON.some((c) => distancia(c, [x, y]) < radio);
}

/** Los degradados y el filtro de papel: se definen una sola vez por página (la hoja del detalle los reutiliza). */
export function DefsIlustracion() {
  return (
    <defs>
      <radialGradient id="ilus-halo-fuego">
        <stop offset="0" stopColor="var(--color-ilus-fuego)" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="var(--color-ilus-fuego)" stopOpacity="0.18" />
        <stop offset="1" stopColor="var(--color-ilus-fuego)" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ilus-halo-luna">
        <stop offset="0" stopColor="var(--color-ilus-sol)" stopOpacity="0.5" />
        <stop offset="1" stopColor="var(--color-ilus-sol)" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ilus-haz" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="var(--color-ilus-sol)" stopOpacity="0.85" />
        <stop offset="1" stopColor="var(--color-ilus-sol)" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

function Rio() {
  const a = azar(2);
  const orilla = suave(ORILLA);
  const reflejos = Array.from({ length: 46 }, (_, i) => {
    const x = a() * 1180;
    const y = 12 + a() * (yEn(ORILLA, x) - 30);
    return { x: n1(x), y: n1(y), l: n1(10 + a() * 18), i };
  });
  return (
    <g>
      <path d={`${orilla}L1200 0L0 0Z`} fill={C.rio} />
      {/* Corrientes: cintas más hondas que siguen el cauce. */}
      <path d="M0 74C200 54 360 96 560 72S940 50 1200 80" fill="none" stroke={C.rioHondo} strokeOpacity={0.35} strokeWidth={16} strokeLinecap="round" />
      <path d="M0 34C220 22 420 52 640 30S980 18 1200 44" fill="none" stroke={C.rioHondo} strokeOpacity={0.25} strokeWidth={10} strokeLinecap="round" />
      {reflejos.map((r) => (
        <path key={r.i} d={`M${r.x} ${r.y}q${n1(r.l / 4)} -3 ${n1(r.l / 2)} 0t${n1(r.l / 2)} 0`} fill="none" stroke={C.rioBrillo} strokeOpacity={0.75} strokeWidth={1.6} strokeLinecap="round" />
      ))}
      {/* Banco de arena con tres sauces. */}
      <path d={mancha(310, 86, 76, 11, 7, 0.1, 9)} fill={C.arena} {...TRAZO} strokeOpacity={0.3} />
      <Arbol x={286} y={88} r={10} semilla={81} />
      <Arbol x={316} y={90} r={12} semilla={82} />
      <Arbol x={344} y={87} r={9} semilla={83} />
      {/* La luna: solo se ve de noche, con su reflejo en el agua. */}
      <g className="ilus-luz">
        <circle cx={1010} cy={50} r={70} fill="url(#ilus-halo-luna)" />
        <circle cx={1010} cy={50} r={20} fill={C.sol} />
        <circle cx={1003} cy={44} r={20} fill={C.rio} fillOpacity={0.55} />
        <path d="M980 96q30 -4 60 0M990 108q20 -3 40 0" fill="none" stroke={C.sol} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
        {[
          [140, 30], [380, 18], [610, 40], [760, 16], [880, 36], [1120, 24], [60, 80],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={1.8} fill={C.sol} />
        ))}
      </g>
    </g>
  );
}

function BosqueRibereno() {
  const a = azar(3);
  const arboles = [];
  for (let x = 8; x < 1200; x += 24 + a() * 8) {
    if (x > 570 && x < 700) continue; // la boca del humedal
    arboles.push({ x: n1(x), y: n1(yEn(ORILLA, x) + 12 + a() * 14), r: n1(11 + a() * 7), s: Math.round(a() * 1000) });
  }
  return (
    <g>
      <path d={`${suave(ORILLA)}`} fill="none" stroke={C.arena} strokeWidth={16} strokeLinecap="round" transform="translate(0 6)" strokeOpacity={0.95} />
      {arboles.map((t, i) => (
        <Arbol key={i} x={t.x} y={t.y} r={t.r} semilla={t.s} tono={i % 5 === 0 ? "salvia" : "verde"} />
      ))}
    </g>
  );
}

function Costanera() {
  const pts = ORILLA.map(([x, y]) => [x, y + 44] as Punto);
  return (
    <g>
      <path d={suave(pts)} fill="none" stroke={C.arena} strokeWidth={8} strokeLinecap="round" strokeOpacity={0.9} />
      <path d={suave(pts)} fill="none" stroke={C.superficie} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" strokeOpacity={0.9} />
    </g>
  );
}

function Chacras() {
  const a = azar(4);
  const celdas = [];
  const ancho = 88;
  const alto = 58;
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 14; col++) {
      const x = -30 + col * (ancho + 6);
      const y = 196 + fila * (alto + 6);
      const cx = x + ancho / 2;
      const cy = y + alto / 2;
      if (y + alto > yEn(BARDA, cx) - 12) continue;
      if (cercaDelCanadon(cx, cy, 70) || cercaDeForma(cx, cy, 128)) continue;
      const r = a();
      celdas.push({ x, y, w: ancho, h: alto, tipo: r < 0.34 ? 0 : r < 0.58 ? 1 : r < 0.8 ? 2 : 3, i: celdas.length });
    }
  }
  return (
    <g transform="rotate(-4 600 340)">
      {celdas.map((c) => {
        const fondo = [C.verde, C.arena, C.verdeHondo, C.salvia][c.tipo];
        const op = [0.38, 0.55, 0.22, 0.9][c.tipo];
        return (
          <g key={c.i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={5} fill={fondo} fillOpacity={op} stroke={C.trazo} strokeOpacity={0.18} strokeWidth={1} />
            {c.tipo === 0 && (
              // Hileras de vid.
              <path
                d={Array.from({ length: 9 }, (_, k) => `M${c.x + 8 + k * 9} ${c.y + 5}V${c.y + c.h - 5}`).join("")}
                stroke={C.verdeHondo}
                strokeOpacity={0.7}
                strokeWidth={2.2}
                strokeDasharray="5 2.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            {c.tipo === 2 &&
              // Olivos en línea.
              Array.from({ length: 5 }, (_, k) => (
                <g key={k}>
                  <circle cx={c.x + 12 + k * 16} cy={c.y + 22} r={6.5} fill={C.verdeHondo} fillOpacity={0.9} />
                  <circle cx={c.x + 10.5 + k * 16} cy={c.y + 20.5} r={3.4} fill={C.salvia} fillOpacity={0.7} />
                  <circle cx={c.x + 12 + k * 16} cy={c.y + 40} r={6.5} fill={C.verdeHondo} fillOpacity={0.9} />
                  <circle cx={c.x + 10.5 + k * 16} cy={c.y + 38.5} r={3.4} fill={C.salvia} fillOpacity={0.7} />
                </g>
              ))}
            {c.tipo === 1 && (
              // Barbecho: surcos de tierra.
              <path
                d={Array.from({ length: 5 }, (_, k) => `M${c.x + 6} ${c.y + 8 + k * 10}H${c.x + c.w - 6}`).join("")}
                stroke={C.ocre}
                strokeOpacity={0.55}
                strokeWidth={1.6}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

function Cortinas() {
  // Cortinas de álamos en líneas noroeste–sudeste, en los claros que dejan las formas.
  const lineas: [Punto, Punto][] = [
    [[40, 410], [150, 470]],
    [[640, 196], [700, 226]],
    [[930, 392], [1100, 448]],
    [[368, 206], [520, 252]],
  ];
  return (
    <g>
      {lineas.flatMap(([p, q], li) =>
        Array.from({ length: 7 }, (_, i) => {
          const t = i / 6;
          const x = n1(p[0] + (q[0] - p[0]) * t);
          const y = n1(p[1] + (q[1] - p[1]) * t);
          return cercaDeForma(x, y, 100) || cercaDelCanadon(x, y, 54) || y > yEn(BARDA, x) - 14 ? null : (
            <Alamo key={`${li}-${i}`} x={x} y={y} alto={38 + ((i + li) % 3) * 3} semilla={300 + li * 10 + i} />
          );
        }),
      )}
    </g>
  );
}

function Barda() {
  const a = azar(5);
  const sup = BARDA;
  const inf = BARDA.map(([x, y]) => [x, y + 36] as Punto);
  const cara = `${suave(sup)}L1200 ${inf[inf.length - 1][1]}${suave([...inf].reverse()).replace(/^M[^C]*/, "")}Z`;
  const rayas = [];
  for (let x = 6; x < 1200; x += 11 + a() * 6) {
    const y = yEn(BARDA, x);
    rayas.push({ x: n1(x), y: n1(y + 2), l: n1(14 + a() * 20), d: n1((a() - 0.5) * 5), i: rayas.length });
  }
  const carcavas = Array.from({ length: 9 }, () => n1(60 + a() * 1080));
  const matas = Array.from({ length: 34 }, () => {
    const x = a() * 1200;
    return { x: n1(x), y: n1(yEn(BARDA, x) + (a() < 0.5 ? -10 : 44 + a() * 10)), e: n1(0.7 + a() * 0.5), i: Math.round(a() * 1e4) };
  });
  return (
    <g>
      {/* La sombra que la barda tira sobre la meseta. */}
      <path d={`${suave(inf)}L1200 ${yEn(BARDA, 1200) + 76}L0 ${yEn(BARDA, 0) + 76}Z`} fill={C.trazo} fillOpacity={0.07} />
      <path d={`${suave(inf)}L1200 ${yEn(BARDA, 1200) + 58}L0 ${yEn(BARDA, 0) + 58}Z`} fill={C.trazo} fillOpacity={0.07} />
      <path d={cara} fill={C.ocre} {...TRAZO} strokeOpacity={0.3} />
      <path d={`${suave(inf)}L1200 ${inf[inf.length - 1][1] + 12}L0 ${inf[0][1] + 12}Z`} fill={C.arcilla} fillOpacity={0.28} />
      {rayas.map((r) => (
        <path key={r.i} d={`M${r.x} ${r.y}l${r.d} ${r.l}`} stroke={C.arcilla} strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" />
      ))}
      {carcavas.map((x, i) => {
        const y = yEn(BARDA, x);
        return <path key={i} d={`M${x - 9} ${n1(y + 1)}L${x} ${n1(y + 38)}L${x + 9} ${n1(y + 1)}Z`} fill={C.arcilla} fillOpacity={0.5} />;
      })}
      <path d={suave(sup)} fill="none" stroke={C.sol} strokeOpacity={0.85} strokeWidth={3} strokeLinecap="round" />
      {matas.map((m) => (
        <Mata key={m.i} x={m.x} y={m.y} escala={m.e} tono={m.i % 3 === 0 ? "ocre" : "verdeHondo"} />
      ))}
    </g>
  );
}

function Meseta() {
  const a = azar(6);
  const matas = [];
  for (let i = 0; i < 160; i++) {
    const x = 14 + a() * 1172;
    const y = yEn(BARDA, x) + 70 + a() * (ALTO_MAPA - yEn(BARDA, x) - 80);
    if (cercaDeForma(x, y, 118) || cercaDelCanadon(x, y, 52)) continue;
    matas.push({ x: n1(x), y: n1(y), e: n1(0.6 + a() * 0.7), t: a() });
  }
  const manchas = Array.from({ length: 12 }, (_, i) => ({ x: a() * 1200, y: 580 + a() * 300, rx: 50 + a() * 90, ry: 16 + a() * 28, i }));
  return (
    <g>
      {manchas.map((m) => (
        <path key={m.i} d={mancha(m.x, m.y, m.rx, m.ry, 600 + m.i, 0.2, 8)} fill={C.ocre} fillOpacity={0.14} />
      ))}
      {matas.map((m, i) => (
        <Mata key={i} x={m.x} y={m.y} escala={m.e} tono={m.t < 0.45 ? "ocre" : m.t < 0.8 ? "verdeHondo" : "salvia"} />
      ))}
    </g>
  );
}

function Canadon() {
  const ruta = suave(CANADON);
  const a = azar(7);
  const orilla = muestrear(CANADON, 34);
  const arbustos = orilla.flatMap(([x, y], i) => {
    if (cercaDeForma(x, y, 100)) return [];
    const lado = i % 2 === 0 ? -1 : 1;
    return [{ x: n1(x + lado * (30 + a() * 14)), y: n1(y + a() * 10), r: n1(7 + a() * 5), s: 400 + i }];
  });
  const diques = [0.12, 0.2, 0.3, 0.42].map((t) => muestrear(CANADON, 100)[Math.round(t * 99)]).filter(([x, y]) => !cercaDeForma(x, y, 120));
  return (
    <g>
      <path d={ruta} fill="none" stroke={C.verdeHondo} strokeOpacity={0.2} strokeWidth={92} strokeLinecap="round" strokeLinejoin="round" />
      <path d={ruta} fill="none" stroke={C.salvia} strokeOpacity={0.9} strokeWidth={70} strokeLinecap="round" strokeLinejoin="round" />
      <path d={ruta} fill="none" stroke={C.verde} strokeOpacity={0.5} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
      <path d={ruta} fill="none" stroke={C.arena} strokeOpacity={0.8} strokeWidth={5} strokeDasharray="2 9" strokeLinecap="round" />
      {arbustos.map((t, i) => (
        <Arbol key={i} x={t.x} y={t.y} r={t.r} semilla={t.s} tono={i % 3 === 0 ? "salvia" : "verde"} />
      ))}
      {/* Diques de piedra: una hilera de piedras que cruza el cauce, con la panza hacia arriba. */}
      {diques.map(([x, y], di) =>
        Array.from({ length: 6 }, (_, k) => (
          <Piedra key={`${di}-${k}`} x={n1(x - 25 + k * 10)} y={n1(y + 6 - Math.sin((k / 5) * Math.PI) * 8)} w={9} h={7} semilla={500 + di * 10 + k} />
        )),
      )}
    </g>
  );
}

function Humedal() {
  const a = azar(8);
  const cañas = Array.from({ length: 30 }, (_, i) => {
    const ang = (i / 30) * Math.PI * 2;
    return { x: n1(700 + Math.cos(ang) * (136 + a() * 8)), y: n1(212 + Math.sin(ang) * (38 + a() * 4)), i };
  });
  return (
    <g>
      {/* El humedal se abre al este de la desembocadura del cañadón (donde está Agua) y llega hasta la plaza de Cuidado. */}
      <path d="M690 176C696 164 694 156 692 148" fill="none" stroke={C.rio} strokeWidth={22} strokeLinecap="round" />
      <path d={mancha(700, 212, 150, 46, 71, 0.07, 11)} fill={C.verde} fillOpacity={0.55} />
      <path d={mancha(700, 212, 134, 36, 72, 0.08, 11)} fill={C.rio} {...TRAZO} strokeOpacity={0.3} />
      <path d={mancha(710, 216, 96, 22, 73, 0.1, 9)} fill={C.rioHondo} fillOpacity={0.4} />
      <path d="M628 206q16 -5 32 0M740 224q18 -5 36 0M690 196q12 -4 24 0" fill="none" stroke={C.rioBrillo} strokeWidth={1.8} strokeLinecap="round" strokeOpacity={0.9} />
      {cañas.map((c) => (
        <path key={c.i} d={`M${c.x} ${c.y}q${n1((a() - 0.5) * 4)} -8 ${n1((a() - 0.5) * 6)} -${n1(10 + a() * 8)}`} fill="none" stroke={C.verdeHondo} strokeWidth={1.6} strokeLinecap="round" />
      ))}
    </g>
  );
}

function Acceso() {
  const camino = "M1200 292C1150 296 1118 306 1090 328";
  return (
    <g>
      <path d={camino} fill="none" stroke={C.arena} strokeWidth={14} strokeLinecap="round" />
      <path d={camino} fill="none" stroke={C.ocre} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="6 6" strokeLinecap="round" />
      <path d="M1152 280V300M1174 276V296" stroke={C.arcilla} strokeWidth={3} strokeLinecap="round" />
      <path d="M1152 284H1174" stroke={C.ocre} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function Brujula() {
  return (
    <g transform="translate(110 806)" aria-hidden="true">
      <circle r={38} fill={C.superficie} fillOpacity={0.72} stroke={C.arcilla} strokeWidth={2} />
      <circle r={30} fill="none" stroke={C.arcilla} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="2 4" />
      <path d="M0 -26L7 0L0 26L-7 0Z" fill={C.arcilla} fillOpacity={0.35} />
      <path d="M0 -26L7 0L-7 0Z" fill={C.arcilla} />
      <path d="M-26 0H26" stroke={C.arcilla} strokeOpacity={0.6} strokeWidth={1.2} />
      <text y={-44} textAnchor="middle" fontSize={20} className="ilus-nombre" style={{ fontStyle: "normal", letterSpacing: 0 }}>
        N
      </text>
    </g>
  );
}

export type NombresMapa = { rio: string; planicie: string; barda: string; meseta: string; canadon: string; humedal: string };

/** Todo el fondo del mapa. Es decorativo: lo dibuja con `aria-hidden` quien lo usa. */
export function Territorio({ nombres }: { nombres: NombresMapa }) {
  return (
    <g className="mapa-fondo">
      <rect width={ANCHO_MAPA} height={ALTO_MAPA} fill={C.arena} />
      <Meseta />
      <path d={`M0 90L1200 90L1200 ${yEn(BARDA, 1200)}${suave([...BARDA].reverse()).replace(/^M[^C]*/, "")}Z`} fill={C.salvia} />
      <Chacras />
      <Cortinas />
      <Acceso />
      <Barda />
      <Canadon />
      <Humedal />
      <Rio />
      <BosqueRibereno />
      <Costanera />
      <Brujula />
      {/* Nombres del territorio: cursiva de Fraunces con un halo del color del papel para que se lean sobre cualquier fondo. */}
      <text x={170} y={62} fontSize={24} className="ilus-nombre" style={{ letterSpacing: "0.22em" }}>{nombres.rio.toUpperCase()}</text>
      <text x={34} y={474} fontSize={20} className="ilus-nombre">{nombres.planicie}</text>
      <text x={1090} y={540} fontSize={20} className="ilus-nombre">{nombres.barda}</text>
      <text x={140} y={640} fontSize={20} className="ilus-nombre">{nombres.meseta}</text>
      <text x={660} y={820} fontSize={20} className="ilus-nombre" transform="rotate(-8 660 820)">{nombres.canadon}</text>
      <text x={566} y={206} fontSize={17} className="ilus-nombre" textAnchor="end">{nombres.humedal}</text>
    </g>
  );
}

/**
 * El grano del papel: un solo filtro sobre el territorio. Va en la capa de fondo, debajo de las formas y los carteles
 * (que quedan limpios), y esa capa no se repinta al pasar el puntero.
 */
export function PapelGranulado() {
  return (
    <g aria-hidden="true">
      <filter id="ilus-papel" x="0" y="0" width={ANCHO_MAPA} height={ALTO_MAPA} filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="ruido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.62" result="grano" />
        <feFlood style={{ floodColor: "var(--color-ilus-trazo)" }} result="tinta" />
        <feComposite in="tinta" in2="grano" operator="in" />
      </filter>
      <rect className="mapa-papel" width={ANCHO_MAPA} height={ALTO_MAPA} filter="url(#ilus-papel)" opacity="0.4" />
    </g>
  );
}
