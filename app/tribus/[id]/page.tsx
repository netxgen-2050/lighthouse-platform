import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { MarcaAdmin } from "@/components/sesion/marca-admin";
import { SelloTribu } from "@/components/sello-tribu";
import { TerminoLegal } from "@/components/termino-legal";
import { Medidor } from "@/components/medidor";
import { destinosDisponibles } from "@/lib/navegacion";
import { buscarTribu, listarTribus, rutaProponerComunidad } from "@/lib/tribus/datos";
import { MembresiaAcciones } from "@/components/membresia-acciones";
import { VerBarrio } from "./acciones";

export const dynamicParams = false;

export function generateStaticParams() {
  return listarTribus().map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = buscarTribu((await params).id);
  if (!t) return {};
  return { title: t.estado === "vacante" ? `Barrio ${t.barrio} busca tribu` : t.nombre };
}

function Etiquetas({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((i) => (
        <li key={i} className="rounded-full border border-faint px-3 py-1 text-sm">{i}</li>
      ))}
    </ul>
  );
}

function Prototipo() {
  return (
    <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      Prototipo interno · datos de ejemplo
    </p>
  );
}

const tarjeta ="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";

export default async function TribuPage({ params }: Props) {
  const t = buscarTribu((await params).id);
  if (!t) notFound();

  const volver = (
    <p className="mb-2 text-sm">
      <Link className="underline" href="/tribus">← Tribus</Link>
    </p>
  );

  if (t.estado === "vacante") {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10">
        {volver}
        <h1 className="text-3xl font-semibold">Barrio {t.barrio} busca tribu</h1>
        <p className="mt-2 mb-4 text-muted">
          Un barrio del Lighthouse para una tribu de <strong>{t.foco}</strong>, con {t.hogares}. La tribu recibe una
          licencia de uso
          <TerminoLegal clave="licencia" /> y adhiere al proyecto
          <TerminoLegal clave="adherente" />.
        </p>
        <AvisoEjemplo />
        <Prototipo />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold">Lo que el Lighthouse necesita de este barrio</h2>
            <Etiquetas items={t.busca} />
            <Medidor titulo="Plata para arrancar" actual={0} tope={t.plata.meta} unidad="USD " />
            <Medidor titulo="Roles" actual={0} tope={t.roles.necesarios} dorado />
          </section>
          <section id="proponer" className={tarjeta}>
            <h2 className="text-lg font-semibold">¿Tenés una tribu?</h2>
            <p className="text-sm">
              Proponela: contá quiénes son, qué van a producir y qué van a aportar al pozo común. La tribu define su
              propio ritual de entrada
              <TerminoLegal clave="ritual" />.
            </p>
            <EnlaceConCuenta
              href={rutaProponerComunidad(t.id)}
              textoEntrar="Sumate para proponer una comunidad"
              clase="w-fit rounded-lg bg-gold px-4 py-1.5 font-medium text-ink hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              Proponer una comunidad
            </EnlaceConCuenta>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      {volver}
      <p className="text-sm text-muted">Barrio {t.barrio} · {t.foco}</p>
      <div className="mt-2 mb-4 flex items-center gap-4">
        <SelloTribu iniciales={t.iniciales} estado={t.estado} grande />
        <div>
          <h1 className="text-3xl font-semibold">{t.nombre}</h1>
          {t.declaracion && <p className="mt-1 text-muted">{t.declaracion}</p>}
        </div>
      </div>
      <AvisoEjemplo />
      <Prototipo />
      <MarcaAdmin tribu={t.id} nombre={t.nombre} />
      {t.estado === "formacion" && (
        <p
          role="note"
          className="mt-4 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium"
        >
          Esta comunidad está en formación: todavía no tiene un compromiso firmado con el Lighthouse
          {t.etapa ? ` (etapa: ${t.etapa})` : ""}.
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">Lo que tiene</h2>
          <p className="text-sm text-muted">{t.hogares}</p>
          <Etiquetas items={t.tiene} />
          <Medidor titulo="Plata comprometida" actual={t.plata.comprometida} tope={t.plata.meta} unidad="USD " />
          <Medidor titulo="Roles cubiertos" actual={t.roles.cubiertos} tope={t.roles.necesarios} dorado />
        </section>
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">Lo que busca</h2>
          <Etiquetas items={t.busca} />
          {t.areas && (
            <>
              <h3 className="text-sm font-medium">Áreas · convocatoria abierta</h3>
              <ul className="flex flex-wrap gap-2">
                {t.areas.map((a) => {
                  const abierta = t.areasAbiertas?.includes(a);
                  return (
                    <li
                      key={a}
                      className={`rounded-full border px-3 py-1 text-sm ${abierta ? "border-gold-ink bg-gold-soft font-semibold" : "border-faint"}`}
                    >
                      {a}
                      {abierta && " (abierta)"}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
        {t.pozo && (
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold">Lo que aporta al pozo común</h2>
            <ul className="list-disc pl-5 text-sm">
              {t.pozo.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <section className={`${tarjeta} mt-4`}>
        <h2 className="text-lg font-semibold">Cómo se entra</h2>
        <p>
          <strong>
            Ritual de entrada
            <TerminoLegal clave="ritual" />:
          </strong>{" "}
          {t.ritual}
        </p>
        <p>
          <strong>Forma jurídica:</strong> {t.formaJuridica}
          <TerminoLegal clave="personeria" /> · adherente al proyecto del Lote 7
          <TerminoLegal clave="adherente" />
        </p>
        <p>
          <strong>Su barrio:</strong> licencia de uso del Barrio {t.barrio}
          <TerminoLegal clave="licencia" />
        </p>
      </section>
      <section className={`${tarjeta} mt-4`}>
        <h2 className="text-lg font-semibold">Red de confianza</h2>
        <p>
          {t.avales} {t.avales === 1 ? "persona de la red avala" : "personas de la red avalan"} a esta tribu{" "}
          <span className="rounded-full border border-faint px-2 py-0.5 text-xs">(ejemplo)</span>
        </p>
        <div aria-hidden="true" className="flex gap-1">
          {Array.from({ length: t.avales }, (_, i) => (
            <span
              key={i}
              className="grid size-8 place-items-center rounded-full bg-green-soft text-sm font-medium text-deep"
            >
              {"MJSAR"[i % 5]}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted">&ldquo;Si confiás en quien confía en ellos, empezás con confianza.&rdquo;</p>
      </section>
      <div className="mt-4">
        <MembresiaAcciones
          comunidad={t.id}
          nombre={t.nombre}
          pactos={destinosDisponibles().some((d) => d.href === "/pactos")}
          extra={<VerBarrio />}
        />
      </div>
    </div>
  );
}
