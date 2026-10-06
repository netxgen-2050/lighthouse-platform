import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { SelloTribu } from "@/components/sello-tribu";
import { TerminoLegal } from "@/components/termino-legal";
import { buscarTribu, listarTribus } from "@/lib/tribus/datos";

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
        <li key={i} className="rounded-full border border-line-strong px-3 py-1 text-sm">{i}</li>
      ))}
    </ul>
  );
}

const tarjeta = "grid content-start gap-3 rounded-xl border border-line-strong bg-surface p-4";

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
          Un barrio del Lighthouse para una tribu de {t.foco}, con {t.hogares}.
        </p>
        <AvisoEjemplo />
        <section className={`${tarjeta} mt-6`}>
          <h2 className="text-lg font-semibold">Lo que el Lighthouse necesita de este barrio</h2>
          <Etiquetas items={t.busca} />
        </section>
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
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">Lo que tiene</h2>
          <p className="text-sm text-muted">{t.hogares}</p>
          <Etiquetas items={t.tiene} />
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
                      className={`rounded-full border px-3 py-1 text-sm ${abierta ? "border-gold-ink bg-gold-soft font-semibold" : "border-line-strong"}`}
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
          <TerminoLegal clave="personeria" />
        </p>
      </section>
    </div>
  );
}
