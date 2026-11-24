import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { MapaEquipos } from "@/components/participa/mapa-equipos";
import type { EquipoVista, FrenteVista } from "@/components/participa/tipos";
import { VisionComunidades } from "@/components/participa/vision";
import { listarEquipos } from "@/lib/equipos/equipos";
import type { Frente } from "@/lib/equipos/frentes";
import { idCortoDeEquipo, posicionesDe } from "@/lib/equipos/posiciones";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { nombreDelComun } from "@/lib/manifiestos/lighthouse-vrn";
import { esDeHoy } from "@/lib/territorios/vistas";

// Participa (spec participa-mapa-equipos): los equipos del común sobre un mapa ilustrado del territorio, con el detalle de cada
// equipo y sus posiciones abiertas de ejemplo. Pública y bilingüe. La pestaña Visión muestra por ahora las comunidades de ejemplo.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("participa", await idiomaDelPedido()).titulo };
}

function frenteVista(f: Frente, futuro: boolean): FrenteVista {
  return {
    id: f.id,
    nombre: f.nombre,
    necesidad: f.necesidad,
    faltan: f.faltan,
    paraCuando: f.paraCuando,
    lugar: f.lugar !== null,
    hrefMapa: f.lugar ? `/explorar?vista=ahora${esDeHoy(f) ? "" : `&fase=${f.desde}`}&sel=${f.id}#territorio` : null,
    masAdelante: futuro ? f.desde : null,
  };
}

function equiposVista(idioma: Idioma): EquipoVista[] {
  return listarEquipos(idioma).map(({ circulo, frentesAhora, frentesDespues }) => ({
    id: circulo.id,
    corto: idCortoDeEquipo(circulo.id),
    nombre: textoEn(circulo.nombre, idioma),
    decide: (circulo.decide ?? []).map((d) => textoEn(d, idioma)),
    frentes: [...frentesAhora.map((f) => frenteVista(f, false)), ...frentesDespues.map((f) => frenteVista(f, true))],
    posiciones: posicionesDe(circulo.id, idioma),
  }));
}

const base = "px-1 pb-1 underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const clase = (actual: boolean) => `${base} ${actual ? "font-bold underline decoration-4" : "text-muted hover:underline"}`;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ParticipaPage({ searchParams }: Props) {
  const idioma = await idiomaDelPedido();
  const t = textos("participa", idioma);
  const vrn = textos("manifiestoVrn", idioma);
  const nombre = nombreDelComun(idioma);
  const query = await searchParams;
  // Cualquier valor de `ver` que no sea "vision" muestra la pestaña por defecto.
  const vision = query.ver === "vision";
  const equipo = Array.isArray(query.equipo) ? query.equipo[0] : query.equipo;
  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="font-mono text-sm uppercase">{t.sobretitulo}</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{t.titulo}</h1>
      <p className="mt-2 mb-4 max-w-3xl text-muted">{t.bajada}</p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>

      <section aria-labelledby="sec-comun" className="mt-8">
        <h2 id="sec-comun" className="sr-only">
          {nombre}
        </h2>
        <Link
          href="/tribus/lighthouse"
          className="grid gap-1 rounded-xl border-2 border-deep bg-green-soft p-5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          <span className="text-sm font-medium text-muted">{vrn.tarjeta.sobre}</span>
          <span className="text-2xl font-semibold" translate="no">
            {nombre}
          </span>
          <span>{vrn.tarjeta.texto}</span>
          <span className="w-fit rounded-full border border-faint px-2 py-0.5 text-xs">{vrn.borrador}</span>
        </Link>
      </section>

      <nav aria-label={t.pestanas.aria} className="mt-6 flex flex-wrap gap-6 border-b border-faint">
        <Link href="/participa" className={clase(!vision)} aria-current={!vision ? "page" : undefined}>
          {t.pestanas.equipos}
        </Link>
        <Link href="/participa?ver=vision" className={clase(vision)} aria-current={vision ? "page" : undefined}>
          {t.pestanas.vision}
        </Link>
      </nav>

      {vision ? (
        <VisionComunidades idioma={idioma} />
      ) : (
        <section aria-labelledby="sec-equipos" className="mt-6 grid gap-4">
          <div>
            <h2 id="sec-equipos" className="text-2xl font-semibold">
              {t.mapa.titulo}
            </h2>
            <p className="mt-1 max-w-3xl text-muted">{t.mapa.intro}</p>
          </div>
          <MapaEquipos equipos={equiposVista(idioma)} inicial={equipo ? `comun-${equipo}` : null} nombres={t.mapa.nombres} />
        </section>
      )}
    </div>
  );
}
