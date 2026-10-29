import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { SelloTribu } from "@/components/sello-tribu";
import { SumarmeEquipo } from "@/components/sumarme-equipo";
import { listarEquipos } from "@/lib/equipos/equipos";
import type { Frente } from "@/lib/equipos/frentes";
import { sinDato } from "@/lib/idioma/formatos";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { agruparPorEstado, listarTribus, rutaProponerComunidad } from "@/lib/tribus/datos";
import { textoDeEstado, type Tribu } from "@/lib/tribus/tipos";

export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("tribus", await idiomaDelPedido()).titulo };
}

const enlaceTarjeta =
  "flex h-full gap-3 rounded-xl border border-faint bg-surface p-4 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function Tarjeta({ t, idioma, children }: { t: Tribu; idioma: Idioma; children: ReactNode }) {
  const tx = textos("tribus", idioma);
  return (
    <Link href={`/tribus/${t.id}`} className={enlaceTarjeta}>
      <SelloTribu iniciales={t.iniciales} estado={t.estado} />
      <span className="grid content-start gap-1">
        {/* El nombre de una tribu es propio: no se traduce. El de un barrio vacante ("Barrio 3") es un rótulo: sí. */}
        {t.estado === "vacante" ? (
          <span className="font-semibold">{tx.barrio(t.barrio)}</span>
        ) : (
          <span className="font-semibold" translate="no">{t.nombre}</span>
        )}
        <span className="text-sm text-muted">{tx.barrioFoco(t.barrio, t.foco)}</span>
        {children}
        <span className="text-sm font-medium">{tx.estado} {textoDeEstado(t.estado, idioma)}</span>
        <span className={marcaEjemplo}>{tx.equipos.marca}</span>
      </span>
    </Link>
  );
}

function Seccion({
  id,
  titulo,
  explicacion,
  children,
}: {
  id: string;
  titulo: string;
  explicacion: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-2xl font-semibold">{titulo}</h2>
      <p className="mt-1 text-muted">{explicacion}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}

const marcaEjemplo = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";

function Pestanas({ idioma, actual }: { idioma: Idioma; actual: "equipos" | "tribus" }) {
  const p = textos("tribus", idioma).equipos.pestanas;
  const base = "px-1 pb-1 underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
  const clase = (esActual: boolean) => `${base} ${esActual ? "font-bold underline decoration-4" : "text-muted hover:underline"}`;
  return (
    <nav aria-label={p.aria} className="mt-6 flex flex-wrap gap-6 border-b border-faint">
      <Link href="/tribus" className={clase(actual === "equipos")} aria-current={actual === "equipos" ? "page" : undefined}>
        {p.equipos}
      </Link>
      <Link href="/tribus?ver=tribus" className={clase(actual === "tribus")} aria-current={actual === "tribus" ? "page" : undefined}>
        {p.tribus}
      </Link>
    </nav>
  );
}

function FrenteItem({ f, idioma, futuro }: { f: Frente; idioma: Idioma; futuro: boolean }) {
  const e = textos("tribus", idioma).equipos;
  const nd = sinDato(idioma);
  return (
    <li className="grid gap-0.5 rounded-lg border border-faint bg-surface-2 p-3 text-sm">
      <p className="font-semibold">
        {f.nombre} <span className={marcaEjemplo}>{e.marca}</span>
      </p>
      <p>
        <span className="font-medium">{e.necesita}</span> {f.necesidad}
      </p>
      <p>
        <span className="font-medium">{e.faltan}</span> {f.faltan ?? nd}
      </p>
      <p>
        <span className="font-medium">{e.paraCuando}</span> {f.paraCuando ?? nd}
      </p>
      <p>
        <span className="font-medium">{e.lugar}</span> {f.lugar ? e.enElMapa : e.sinLugar}
      </p>
      {futuro && <p className="font-medium">{e.masAdelante(f.desde)}</p>}
    </li>
  );
}

function PestanaEquipos({ idioma }: { idioma: Idioma }) {
  const e = textos("tribus", idioma).equipos;
  const nd = sinDato(idioma);
  return (
    <section aria-labelledby="sec-equipos" className="mt-6">
      <h2 id="sec-equipos" className="text-2xl font-semibold">{e.pestanas.equipos}</h2>
      <p className="mt-1 text-muted">{e.explicacion}</p>
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {e.ejemploAviso}
      </p>
      <p className="mt-2 text-sm text-muted">{e.tribuAdelante}</p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {listarEquipos(idioma).map(({ circulo, frentesAhora, frentesDespues }) => {
          const nombre = textoEn(circulo.nombre, idioma);
          const decide = circulo.decide?.length ? circulo.decide.map((d) => textoEn(d, idioma)).join(", ") : nd;
          return (
            <li key={circulo.id} className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
              <h3 className="text-lg font-semibold">{nombre}</h3>
              <p className="text-sm">
                <span className="font-medium">{e.decideSobre}</span> {decide}
              </p>
              {frentesAhora.length === 0 && frentesDespues.length === 0 ? (
                <p className="text-sm text-muted">{e.sinFrentes}</p>
              ) : (
                <ul aria-label={e.frentes} className="grid gap-2">
                  {frentesAhora.map((f) => (
                    <FrenteItem key={f.id} f={f} idioma={idioma} futuro={false} />
                  ))}
                  {frentesDespues.map((f) => (
                    <FrenteItem key={f.id} f={f} idioma={idioma} futuro />
                  ))}
                </ul>
              )}
              <SumarmeEquipo circuloId={circulo.id} nombreEquipo={nombre} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TribusPage({ searchParams }: Props) {
  const idioma = await idiomaDelPedido();
  const tx = textos("tribus", idioma);
  const l = tx.listado;
  // Cualquier valor de `ver` que no sea "tribus" muestra la pestaña por defecto.
  const vision = (await searchParams).ver === "tribus";
  const { activas, formacion, vacantes } = agruparPorEstado(listarTribus(idioma));
  const nd = sinDato(idioma);
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">{tx.volverInicio}</Link>
      </p>
      <h1 className="text-3xl font-semibold">{tx.titulo}</h1>
      <p className="mt-2 mb-4 text-muted">{tx.intro}</p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {textos("marco", idioma).aviso}
      </p>
      <Pestanas idioma={idioma} actual={vision ? "tribus" : "equipos"} />
      {!vision ? (
        <PestanaEquipos idioma={idioma} />
      ) : (
        <>
      <p className="mt-6 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {tx.equipos.visionAviso}
      </p>

      <Seccion id="sec-activas" titulo={l.activas.titulo} explicacion={l.activas.explicacion}>
        {activas.map((t) => (
          <li key={t.id}>
            <Tarjeta t={t} idioma={idioma}>
              <span className="text-sm text-muted">{t.hogares}</span>
              <span className="text-sm">
                <span className="font-medium">{l.aportaAlPozo}</span>{" "}
                {t.pozo?.length ? t.pozo.join("; ") : nd}
              </span>
            </Tarjeta>
          </li>
        ))}
      </Seccion>

      <Seccion id="sec-formacion" titulo={l.formacion.titulo} explicacion={l.formacion.explicacion}>
        {formacion.map((t) => (
          <li key={t.id}>
            <Tarjeta t={t} idioma={idioma}>
              <span className="text-sm">
                <span className="font-medium">{l.etapa}</span> {t.etapa ?? nd}
              </span>
              <span className="text-sm">
                <span className="font-medium">{l.rolesQueBusca}</span> {t.busca.length ? t.busca.join(", ") : nd}
              </span>
            </Tarjeta>
          </li>
        ))}
      </Seccion>

      <Seccion id="sec-vacantes" titulo={l.vacantes.titulo} explicacion={l.vacantes.explicacion}>
        {vacantes.map((t) => (
          <li key={t.id} className="grid gap-2">
            <Tarjeta t={t} idioma={idioma}>
              <span className="text-sm text-muted">{t.hogares}</span>
              <span className="text-sm">
                <span className="font-medium">{l.barrioNecesita}</span> {t.busca.length ? t.busca.join(", ") : nd}
              </span>
            </Tarjeta>
            <div>
              <EnlaceConCuenta
                href={rutaProponerComunidad(t.id)}
                etiqueta={l.proponerEtiqueta(t.barrio)}
                textoEntrar={l.proponerEntrar}
                clase="inline-block rounded-lg bg-deep px-4 py-2 text-sm font-semibold text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
              >
                {l.proponer}
              </EnlaceConCuenta>
            </div>
          </li>
        ))}
      </Seccion>
        </>
      )}
    </div>
  );
}
