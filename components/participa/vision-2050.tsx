import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PanelVidrio } from "@/components/ui/panel-vidrio";
import { vision2050 } from "@/lib/idioma/textos/vision-2050";
import type { Idioma } from "@/lib/idioma/tipos";
import { Aparece } from "./aparece";
import { Alamo, Arbol, C, Halo, Mata, Piedra } from "./formas/piezas";
import { azar, n1, suave, type Punto } from "./geometria";
import "./participa.css";
import "./vision-2050.css";

// Pestaña Visión de Participa: el manifiesto "Lighthouse 2050" (spec participa-vision). El texto vive en
// `lib/idioma/textos/vision-2050.ts`. La cabecera es una escena de amanecer hecha con los tokens del mapa ilustrado
// (`--color-ilus-*`): claro = amanecer, oscuro = última hora de la noche.

const ANCHO = 1200;
const ALTO = 300;
const SOL: Punto = [600, 198];
const FARO_X = 846;
const FARO_BASE = 270;

/** El ancho de la torre del faro a una altura dada: se afina hacia arriba. */
const mitad = (y: number) => 15 - ((FARO_BASE - y) / 80) * 6;
const franja = (y1: number, y2: number) =>
  `M${n1(FARO_X - mitad(y2))} ${y2}L${n1(FARO_X - mitad(y1))} ${y1}H${n1(FARO_X + mitad(y1))}L${n1(FARO_X + mitad(y2))} ${y2}Z`;

function Escena({ aria }: { aria: string }) {
  const a = azar(2050);
  const reflejos = Array.from({ length: 16 }, (_, i) => {
    const ancho = 70 - i * 3;
    return { x: n1(SOL[0] + (a() - 0.5) * ancho * 1.6 - 14), y: n1(231 + i * 2.2), l: n1(12 + a() * 24 + (16 - i)), i };
  });
  const brillos = Array.from({ length: 14 }, (_, i) => ({ x: n1(a() * 1160 + 20), y: n1(230 + a() * 28), l: n1(10 + a() * 16), i }));
  const lejos: Punto[] = [[0, 198], [150, 188], [300, 198], [460, 186], [600, 194], [760, 184], [920, 196], [1080, 186], [1200, 194]];
  const barda: Punto[] = [[0, 218], [180, 208], [340, 220], [520, 210], [700, 222], [880, 208], [1040, 218], [1200, 210]];
  const orilla: Punto[] = [[0, 268], [200, 260], [420, 270], [640, 264], [860, 272], [1040, 262], [1200, 268]];
  const alamosIzq = Array.from({ length: 9 }, (_, i) => ({ x: 52 + i * 36, y: 280 + i * 1.5, alto: 56 - (i % 3) * 5, i }));
  const alamosDer = Array.from({ length: 6 }, (_, i) => ({ x: 980 + i * 32, y: 282 - i * 1.2, alto: 44 - (i % 2) * 4, i }));
  const matas = Array.from({ length: 18 }, (_, i) => ({ x: n1(a() * 1180 + 10), y: n1(284 + a() * 12), e: n1(0.8 + a() * 0.6), i }));
  return (
    <svg
      className="vision-escena"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={aria}
    >
      <defs>
        <radialGradient id="vision-halo-sol">
          <stop offset="0" stopColor="var(--color-ilus-sol)" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="var(--color-ilus-fuego)" stopOpacity="0.38" />
          <stop offset="1" stopColor="var(--color-ilus-fuego)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vision-haz" x1="1" x2="0" y1="0" y2="0">
          <stop offset="0" stopColor="var(--color-ilus-sol)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-ilus-sol)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vision-halo-faro">
          <stop offset="0" stopColor="var(--color-ilus-sol)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-ilus-sol)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* El sol, medio escondido tras las mesetas, con su halo. */}
      <circle cx={SOL[0]} cy={SOL[1]} r={300} fill="url(#vision-halo-sol)" />
      <circle cx={SOL[0]} cy={SOL[1]} r={78} fill={C.sol} fillOpacity={0.35} />
      <circle cx={SOL[0]} cy={SOL[1]} r={54} fill={C.sol} />

      {/* Estepa lejana y la barda, con sus cárcavas. */}
      <path d={`${suave(lejos)}L1200 244L0 244Z`} fill={C.ocre} fillOpacity={0.55} />
      <path d={`${suave(barda)}L1200 246L0 246Z`} fill={C.arcilla} fillOpacity={0.62} />
      <path d={suave(barda)} fill="none" stroke={C.sol} strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" />
      {[110, 290, 470, 640, 810, 990, 1120].map((x, i) => (
        <path key={x} d={`M${x - 7} ${n1(214 + (i % 2) * 4)}L${x} ${n1(236 + (i % 3) * 2)}L${x + 7} ${n1(214 + (i % 2) * 4)}Z`} fill={C.trazo} fillOpacity={0.22} />
      ))}

      {/* El río con el reflejo del sol. */}
      <path d={`M0 228Q300 222 600 228T1200 226L1200 276L0 276Z`} fill={C.rio} />
      <path d={`M0 250Q300 244 600 252T1200 248`} fill="none" stroke={C.rioHondo} strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
      {brillos.map((b) => (
        <path key={b.i} d={`M${b.x} ${b.y}h${b.l}`} stroke={C.rioBrillo} strokeOpacity={0.7} strokeWidth={1.6} strokeLinecap="round" />
      ))}
      {reflejos.map((r) => (
        <path key={r.i} d={`M${r.x} ${r.y}h${r.l}`} stroke={C.sol} strokeOpacity={0.85} strokeWidth={2.6} strokeLinecap="round" />
      ))}

      {/* La orilla de este lado: monte nativo, sauces y los diques de piedra. */}
      <path d={`${suave(orilla)}L1200 300L0 300Z`} fill={C.arena} />
      <path d={`${suave(orilla.map(([x, y]) => [x, y + 8] as Punto))}L1200 300L0 300Z`} fill={C.verde} />
      <path d={`${suave(orilla.map(([x, y]) => [x, y + 26] as Punto))}L1200 300L0 300Z`} fill={C.verdeHondo} fillOpacity={0.7} />
      {matas.map((m) => (
        <Mata key={m.i} x={m.x} y={m.y} escala={m.e} tono={m.i % 3 === 0 ? "ocre" : "salvia"} />
      ))}
      {[548, 561, 574, 587, 600].map((x, k) => (
        <Piedra key={x} x={x} y={n1(272 - Math.sin((k / 4) * Math.PI) * 3)} w={12} h={9} semilla={900 + k} />
      ))}
      {alamosIzq.map((t) => (
        <Alamo key={t.i} x={t.x} y={n1(t.y)} alto={t.alto} semilla={2100 + t.i} />
      ))}
      {alamosDer.map((t) => (
        <Alamo key={t.i} x={t.x} y={n1(t.y)} alto={t.alto} semilla={2200 + t.i} />
      ))}
      <Arbol x={430} y={284} r={19} semilla={2301} tono="salvia" />
      <Arbol x={472} y={286} r={24} semilla={2302} />
      <Arbol x={716} y={284} r={21} semilla={2303} />
      <Arbol x={754} y={287} r={16} semilla={2304} tono="salvia" />

      {/* El faro, con el haz hacia el desierto. */}
      <path d={`M${FARO_X - 6} 177L${FARO_X - 480} 138L${FARO_X - 480} 222Z`} fill="url(#vision-haz)" fillOpacity={0.55} />
      <circle cx={FARO_X} cy={177} r={26} fill="url(#vision-halo-faro)" fillOpacity={0.6} />
      <Halo x={FARO_X} y={177} rx={70} ry={70} id="ilus-halo-fuego" />
      <ellipse cx={FARO_X + 14} cy={FARO_BASE + 2} rx={30} ry={5} fill={C.trazo} fillOpacity={0.2} />
      <path d={franja(190, FARO_BASE)} fill={C.superficie} stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1.3} strokeLinejoin="round" />
      <path d={franja(212, 228)} fill={C.arcilla} />
      <path d={franja(244, 260)} fill={C.arcilla} />
      <rect x={FARO_X - 15} y={184} width={30} height={6} rx={2} fill={C.trazo} fillOpacity={0.85} />
      <rect x={FARO_X - 8} y={168} width={16} height={16} rx={2} fill={C.sol} stroke={C.fuego} strokeWidth={2} />
      <path d={`M${FARO_X - 11} 168L${FARO_X} 156L${FARO_X + 11} 168Z`} fill={C.arcilla} stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1.3} strokeLinejoin="round" />
      <rect x={FARO_X - 4} y={256} width={8} height={14} rx={3} fill={C.trazo} fillOpacity={0.75} />
    </svg>
  );
}

/** Las formas del mapa (una hoja, una gota, una llama), como pausa entre secciones. */
function Separador({ forma }: { forma: "hoja" | "gota" | "llama" }) {
  return (
    <div className="vision-separador" aria-hidden="true">
      <svg width={34} height={34} viewBox="0 0 32 32" fill="none">
        {forma === "hoja" && (
          <>
            <path d="M5 26C4 13 12 5 27 5c0 15-8 22-21 21z" fill={C.verde} stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M6 26C11 19 16 14 22 10" stroke={C.salvia} strokeWidth={1.8} strokeLinecap="round" />
          </>
        )}
        {forma === "gota" && (
          <>
            <path d="M16 3C13 9 7 14 7 20a9 9 0 0018 0c0-6-6-11-9-17z" fill={C.rioHondo} stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M11 20a5 5 0 003 4.5" stroke={C.rioBrillo} strokeWidth={2} strokeLinecap="round" />
          </>
        )}
        {forma === "llama" && (
          <>
            <path d="M16 2c1 6 9 9 9 18a9 9 0 01-18 0c0-4 2-7 5-9 0 3 1 4 2 4 0-4-1-8 2-13z" fill={C.fuego} stroke={C.trazo} strokeOpacity={0.5} strokeWidth={1.3} strokeLinejoin="round" />
            <path d="M16 15c1 3 4 4 4 8a4 4 0 01-8 0c0-2 1-3 2-4 1 1 2 1 2-4z" fill={C.sol} />
          </>
        )}
      </svg>
    </div>
  );
}

export function Vision2050({ idioma }: { idioma: Idioma }) {
  const t = vision2050[idioma];
  const { postal, origen, creemos, pedimos } = t;
  const sec = "grid gap-0";
  return (
    <article aria-labelledby="vision-titulo" className="mt-6">
      <header className="vision-cabecera">
        <div className="px-6 pt-10 pb-6 sm:px-12 sm:pt-14 sm:pb-8">
          <h2 id="vision-titulo" className="vision-titulo" translate="no">
            {t.titulo}
          </h2>
          <p className="vision-lema mt-3 max-w-[28ch] text-2xl sm:text-3xl">{t.subtitulo}</p>
          <p className="mt-6 w-fit rounded-full border border-dashed border-deep bg-surface px-3 py-1 text-sm font-medium text-ink">{t.marca}</p>
        </div>
        <Escena aria={t.ilustracionAria} />
      </header>

      <div className="mt-12 grid gap-12 sm:mt-16 sm:gap-16">
        <Aparece>
          <p className="vision-lema vision-texto text-center text-xl text-muted sm:text-2xl">{t.lema}</p>
        </Aparece>

        <Aparece>
          <section aria-labelledby="vision-postal" className={sec}>
            <div className="vision-texto">
              <h3 id="vision-postal" className="vision-seccion-titulo">
                {postal.titulo}
              </h3>
              {postal.parrafos.map((p, i) => (
                <p key={p} className={i === 0 ? "vision-capitular" : i === postal.parrafos.length - 1 ? "vision-remate" : undefined}>
                  {p}
                </p>
              ))}
            </div>
          </section>
        </Aparece>

        <Separador forma="hoja" />

        <Aparece>
          <section aria-labelledby="vision-origen" className={sec}>
            <div className="vision-texto">
              <h3 id="vision-origen" className="vision-seccion-titulo">
                {origen.titulo}
              </h3>
              {origen.parrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        </Aparece>

        <Separador forma="gota" />

        <Aparece>
          <section aria-labelledby="vision-creemos" className="mx-auto w-full max-w-5xl">
            <h3 id="vision-creemos" className="vision-seccion-titulo vision-texto">
              {creemos.titulo}
            </h3>
            <ul className="mt-2 grid list-none gap-4 sm:grid-cols-2">
              {creemos.principios.map((p, i) => (
                <PanelVidrio
                  key={p.frase}
                  como="li"
                  className={`vision-principio ${i === creemos.principios.length - 1 ? "sm:col-span-2" : ""}`.trim()}
                >
                  <strong>{p.frase}</strong>
                  {p.resto}
                </PanelVidrio>
              ))}
            </ul>
          </section>
        </Aparece>

        <Separador forma="llama" />

        <Aparece>
          <section aria-labelledby="vision-pedimos" className={sec}>
            <div className="vision-texto">
              <h3 id="vision-pedimos" className="vision-seccion-titulo">
                {pedimos.titulo}
              </h3>
              {pedimos.parrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        </Aparece>

        <Aparece>
          <div className="vision-cierre mx-auto w-full max-w-5xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <p className="vision-lema text-xl sm:text-2xl">{pedimos.invitacion}</p>
            <p className="vision-frase mx-auto mt-3 max-w-[22ch]">{pedimos.cierre}</p>
            <Link
              href="/participa"
              className="vision-boton mt-8 inline-flex items-center gap-2 rounded-full bg-deep px-7 py-3.5 text-lg font-semibold text-on-deep hover:bg-deep-2"
            >
              {pedimos.boton}
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
          </div>
        </Aparece>
      </div>
    </article>
  );
}
