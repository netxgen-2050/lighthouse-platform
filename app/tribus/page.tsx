import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { SelloTribu } from "@/components/sello-tribu";
import { agruparPorEstado, rutaProponerComunidad } from "@/lib/tribus/datos";
import { TEXTO_ESTADO, type Tribu } from "@/lib/tribus/tipos";

export const metadata: Metadata = { title: "Tribus del Lighthouse" };

const enlaceTarjeta =
  "flex h-full gap-3 rounded-xl border border-faint bg-surface p-4 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function Tarjeta({ t, children }: { t: Tribu; children: ReactNode }) {
  return (
    <Link href={`/tribus/${t.id}`} className={enlaceTarjeta}>
      <SelloTribu iniciales={t.iniciales} estado={t.estado} />
      <span className="grid content-start gap-1">
        <span className="font-semibold">{t.nombre}</span>
        <span className="text-sm text-muted">Barrio {t.barrio} · {t.foco}</span>
        {children}
        <span className="text-sm font-medium">Estado: {TEXTO_ESTADO[t.estado]}</span>
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

export default function TribusPage() {
  const { activas, formacion, vacantes } = agruparPorEstado();
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">Tribus del Lighthouse</h1>
      <p className="mt-2 mb-4 text-muted">Doce barrios, una tribu en cada uno. Encontrá la tuya.</p>
      <AvisoEjemplo />
      <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>

      <Seccion
        id="sec-activas"
        titulo="Tribus activas"
        explicacion="Ya tienen un compromiso con el Lighthouse y están construyendo su barrio."
      >
        {activas.map((t) => (
          <li key={t.id}>
            <Tarjeta t={t}>
              <span className="text-sm text-muted">{t.hogares}</span>
              <span className="text-sm">
                <span className="font-medium">Aporta al pozo común:</span>{" "}
                {t.pozo?.length ? t.pozo.join("; ") : "sin dato"}
              </span>
            </Tarjeta>
          </li>
        ))}
      </Seccion>

      <Seccion
        id="sec-formacion"
        titulo="En formación"
        explicacion="Se están organizando para postularse a un barrio del Lighthouse."
      >
        {formacion.map((t) => (
          <li key={t.id}>
            <Tarjeta t={t}>
              <span className="text-sm">
                <span className="font-medium">Etapa:</span> {t.etapa ?? "sin dato"}
              </span>
              <span className="text-sm">
                <span className="font-medium">Roles que busca:</span> {t.busca.length ? t.busca.join(", ") : "sin dato"}
              </span>
            </Tarjeta>
          </li>
        ))}
      </Seccion>

      <Seccion
        id="sec-vacantes"
        titulo="Barrios vacantes"
        explicacion="Buscan una comunidad. ¿Tenés una?"
      >
        {vacantes.map((t) => (
          <li key={t.id} className="grid gap-2">
            <Tarjeta t={t}>
              <span className="text-sm text-muted">{t.hogares}</span>
              <span className="text-sm">
                <span className="font-medium">El barrio necesita:</span> {t.busca.length ? t.busca.join(", ") : "sin dato"}
              </span>
            </Tarjeta>
            <div>
              <EnlaceConCuenta
                href={rutaProponerComunidad(t.id)}
                etiqueta={`Proponer una comunidad para el Barrio ${t.barrio}`}
                textoEntrar="Entrá para proponer una comunidad"
                clase="inline-block rounded-lg bg-deep px-4 py-2 text-sm font-semibold text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
              >
                Proponer una comunidad
              </EnlaceConCuenta>
            </div>
          </li>
        ))}
      </Seccion>
    </div>
  );
}
