import Link from "next/link";
import type { ReactNode } from "react";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { SelloTribu } from "@/components/sello-tribu";
import { sinDato } from "@/lib/idioma/formatos";
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import { agruparPorEstado, listarTribus, rutaProponerComunidad } from "@/lib/tribus/datos";
import { textoDeEstado, type Tribu } from "@/lib/tribus/tipos";

// Pestaña Visión de Participa: por ahora, las comunidades de ejemplo que mostraba "Tribus · visión". El cambio 4 de la serie
// de correcciones la reemplaza por el manifiesto 2050.

const enlaceTarjeta =
  "flex h-full gap-3 rounded-xl border border-faint bg-surface p-4 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const marcaEjemplo = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";

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
          <span className="font-semibold" translate="no">
            {t.nombre}
          </span>
        )}
        <span className="text-sm text-muted">{tx.barrioFoco(t.barrio, t.foco)}</span>
        {children}
        <span className="text-sm font-medium">
          {tx.estado} {textoDeEstado(t.estado, idioma)}
        </span>
        <span className={marcaEjemplo}>{tx.equipos.marca}</span>
      </span>
    </Link>
  );
}

function Seccion({ id, titulo, explicacion, children }: { id: string; titulo: string; explicacion: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8 scroll-mt-28">
      <h2 id={id} className="text-2xl font-semibold">
        {titulo}
      </h2>
      <p className="mt-1 text-muted">{explicacion}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}

export function VisionComunidades({ idioma }: { idioma: Idioma }) {
  const tx = textos("tribus", idioma);
  const l = tx.listado;
  const nd = sinDato(idioma);
  const { activas, formacion, vacantes } = agruparPorEstado(listarTribus(idioma));
  return (
    <div>
      <p className="mt-6 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">{tx.equipos.visionAviso}</p>

      <Seccion id="sec-activas" titulo={l.activas.titulo} explicacion={l.activas.explicacion}>
        {activas.map((t) => (
          <li key={t.id}>
            <Tarjeta t={t} idioma={idioma}>
              <span className="text-sm text-muted">{t.hogares}</span>
              <span className="text-sm">
                <span className="font-medium">{l.aportaAlPozo}</span> {t.pozo?.length ? t.pozo.join("; ") : nd}
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
    </div>
  );
}
