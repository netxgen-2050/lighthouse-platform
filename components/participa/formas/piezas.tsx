import type { CSSProperties, ReactNode } from "react";
import { azar, mancha, n1 } from "../geometria";

// Piezas sueltas con las que se dibujan el territorio y las formas de los equipos. Todo con los tokens `--color-ilus-*`
// (claro = mediodía, oscuro = noche de luna). La luz viene de arriba a la izquierda: los brillos van al noroeste y las
// sombras proyectadas hacia el sudeste.

export const C = {
  rio: "var(--color-ilus-rio)",
  rioHondo: "var(--color-ilus-rio-hondo)",
  rioBrillo: "var(--color-ilus-rio-brillo)",
  verde: "var(--color-ilus-verde)",
  verdeHondo: "var(--color-ilus-verde-hondo)",
  salvia: "var(--color-ilus-salvia)",
  arena: "var(--color-ilus-arena)",
  ocre: "var(--color-ilus-ocre)",
  arcilla: "var(--color-ilus-arcilla)",
  fuego: "var(--color-ilus-fuego)",
  sol: "var(--color-ilus-sol)",
  trazo: "var(--color-ilus-trazo)",
  /** Del tema (no de la ilustración): lo que contrasta con el texto del mapa. */
  superficie: "var(--color-surface)",
  tinta: "var(--color-ink)",
} as const;

/** Contorno fino y cálido, de grosor irregular según la pieza: nunca negro puro. */
export const TRAZO = {
  stroke: C.trazo,
  strokeOpacity: 0.5,
  strokeWidth: 1.3,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

/** Sombra proyectada al sudeste. */
export function Sombra({ x, y, rx, ry, opacidad = 0.2 }: { x: number; y: number; rx: number; ry: number; opacidad?: number }) {
  return <ellipse cx={n1(x)} cy={n1(y)} rx={n1(rx)} ry={n1(ry)} fill={C.trazo} fillOpacity={opacidad} />;
}

/**
 * Una copa de árbol en tres tonos: sombra del tronco, volumen y brillo al noroeste.
 * `(x, y)` es el pie del tronco; la copa va encima. Con `meciendo` el árbol se mece al activar la forma.
 */
export function Arbol({
  x,
  y,
  r,
  semilla,
  tono = "verde",
  meciendo = false,
  demora = 0,
  clase,
}: {
  x: number;
  y: number;
  r: number;
  semilla: number;
  tono?: "verde" | "salvia" | "ocre";
  meciendo?: boolean;
  demora?: number;
  clase?: string;
}) {
  const medio = tono === "verde" ? C.verde : tono === "salvia" ? C.salvia : C.ocre;
  const hondo = tono === "verde" ? C.verdeHondo : tono === "salvia" ? C.verde : C.arcilla;
  const luz = tono === "verde" ? C.salvia : C.sol;
  const cy = y - r * 0.95;
  const estilo: CSSProperties | undefined = meciendo ? { animationDelay: `${demora}s` } : undefined;
  return (
    <g>
      <Sombra x={x + r * 0.55} y={y + r * 0.05} rx={r * 0.95} ry={r * 0.3} opacidad={0.16} />
      <g className={meciendo ? `anim-copa ${clase ?? ""}` : clase} style={estilo}>
        <rect x={n1(x - r * 0.09)} y={n1(y - r * 0.9)} width={n1(r * 0.18)} height={n1(r * 0.9)} rx={n1(r * 0.05)} fill={C.arcilla} />
        <path d={mancha(x, cy, r, r * 0.92, semilla, 0.1, 8)} fill={hondo} {...TRAZO} strokeOpacity={0.35} />
        <path d={mancha(x - r * 0.1, cy - r * 0.12, r * 0.84, r * 0.76, semilla + 1, 0.1, 8)} fill={medio} />
        <path d={mancha(x - r * 0.34, cy - r * 0.38, r * 0.36, r * 0.28, semilla + 2, 0.12, 6)} fill={luz} fillOpacity={0.55} />
      </g>
    </g>
  );
}

/** Álamo: copa alta y angosta, de los que forman las cortinas rompevientos. */
export function Alamo({
  x,
  y,
  alto = 46,
  semilla,
  tiembla = false,
  demora = 0,
}: {
  x: number;
  y: number;
  alto?: number;
  semilla: number;
  tiembla?: boolean;
  demora?: number;
}) {
  const ancho = alto * 0.2;
  const cy = y - alto * 0.55;
  return (
    <g>
      <path
        d={`M${n1(x)} ${n1(y)}L${n1(x + alto * 0.62)} ${n1(y + alto * 0.14)}L${n1(x + alto * 0.74)} ${n1(y + alto * 0.1)}Z`}
        fill={C.trazo}
        fillOpacity={0.15}
      />
      <g className={tiembla ? "anim-tiembla" : undefined} style={tiembla ? { animationDelay: `${demora}s` } : undefined}>
        <rect x={n1(x - 1.2)} y={n1(y - alto * 0.18)} width={2.4} height={n1(alto * 0.18)} fill={C.arcilla} />
        <path d={mancha(x, cy, ancho, alto * 0.5, semilla, 0.07, 8)} fill={C.verdeHondo} {...TRAZO} strokeOpacity={0.3} />
        <path d={mancha(x - ancho * 0.18, cy - alto * 0.04, ancho * 0.7, alto * 0.42, semilla + 1, 0.07, 8)} fill={C.verde} />
        <path d={mancha(x - ancho * 0.4, cy - alto * 0.18, ancho * 0.22, alto * 0.2, semilla + 2, 0.1, 6)} fill={C.salvia} fillOpacity={0.6} />
      </g>
    </g>
  );
}

/** Piedra con su brillo al noroeste y su sombra. */
export function Piedra({ x, y, w, h, semilla }: { x: number; y: number; w: number; h: number; semilla: number }) {
  return (
    <g>
      <Sombra x={x + w * 0.3} y={y + h * 0.3} rx={w * 0.55} ry={h * 0.3} opacidad={0.2} />
      <path d={mancha(x, y, w / 2, h / 2, semilla, 0.14, 7)} fill={C.arena} {...TRAZO} />
      <path d={mancha(x - w * 0.14, y - h * 0.16, w * 0.22, h * 0.2, semilla + 1, 0.12, 6)} fill={C.rioBrillo} fillOpacity={0.5} />
    </g>
  );
}

/** Mata de estepa: un puñado de trazos curvos que salen del mismo punto. */
export function Mata({ x, y, escala = 1, tono = "verdeHondo" }: { x: number; y: number; escala?: number; tono?: "verdeHondo" | "ocre" | "salvia" }) {
  const color = C[tono];
  const s = escala;
  const tallo = (dx: number, dy: number, cx: number) =>
    `M${n1(x)} ${n1(y)}Q${n1(x + cx * s)} ${n1(y + dy * 0.55 * s)} ${n1(x + dx * s)} ${n1(y + dy * s)}`;
  return (
    <path
      d={`${tallo(-7, -8, -6)}${tallo(-3, -11, -3)}${tallo(2, -12, 1)}${tallo(7, -9, 5)}${tallo(10, -5, 8)}`}
      fill="none"
      stroke={color}
      strokeWidth={n1(1.5 * s)}
      strokeLinecap="round"
      strokeOpacity={0.85}
    />
  );
}

/** Una persona de ejemplo, de lejos: cabeza y cuerpo, sin cara. */
export function Persona({ x, y, ropa = "rioHondo", piel = "ocre" }: { x: number; y: number; ropa?: "rioHondo" | "arcilla" | "verdeHondo"; piel?: "ocre" | "arcilla" }) {
  return (
    <g>
      <Sombra x={x + 3} y={y + 1} rx={6} ry={2} opacidad={0.2} />
      <path d={`M${n1(x - 4.5)} ${n1(y)}Q${n1(x - 5)} ${n1(y - 9)} ${n1(x)} ${n1(y - 10)}Q${n1(x + 5)} ${n1(y - 9)} ${n1(x + 4.5)} ${n1(y)}Z`} fill={C[ropa]} {...TRAZO} />
      <circle cx={n1(x)} cy={n1(y - 14)} r={3.6} fill={C[piel]} {...TRAZO} />
    </g>
  );
}

/** Junco o totora: tallos finos con la punta marcada. */
export function Junco({ x, y, alto = 16, semilla = 1 }: { x: number; y: number; alto?: number; semilla?: number }) {
  const a = azar(semilla);
  const tallos = Array.from({ length: 3 }, (_, i) => {
    const dx = (i - 1) * 3 + (a() - 0.5) * 2;
    const h = alto * (0.75 + a() * 0.35);
    return (
      <g key={i}>
        <path d={`M${n1(x)} ${n1(y)}Q${n1(x + dx * 0.6)} ${n1(y - h * 0.6)} ${n1(x + dx)} ${n1(y - h)}`} fill="none" stroke={C.verdeHondo} strokeWidth={1.3} strokeLinecap="round" />
        <ellipse cx={n1(x + dx)} cy={n1(y - h - 1.5)} rx={1.4} ry={3} fill={C.arcilla} fillOpacity={0.9} />
      </g>
    );
  });
  return <g>{tallos}</g>;
}

/** Halo de luz propia (faro, fogón, ventanas): solo se ve de noche. */
export function Halo({ x, y, rx, ry, id = "ilus-halo-fuego" }: { x: number; y: number; rx: number; ry: number; id?: string }) {
  return <ellipse cx={n1(x)} cy={n1(y)} rx={rx} ry={ry} fill={`url(#${id})`} className="ilus-luz" />;
}

/** Una forma de equipo: dos capas, el suelo (que no se mueve) y el cuerpo (que se eleva al destacarla). */
export function Capas({ suelo, children }: { suelo: ReactNode; children: ReactNode }) {
  return (
    <>
      <g className="forma-suelo">{suelo}</g>
      <g className="forma-cuerpo">{children}</g>
    </>
  );
}
