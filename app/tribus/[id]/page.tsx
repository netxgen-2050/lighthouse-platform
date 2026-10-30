import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { MarcaAdmin } from "@/components/sesion/marca-admin";
import { PactosParaResponder } from "@/components/sesion/pactos-para-responder";
import { SelloTribu } from "@/components/sello-tribu";
import { TerminoLegal } from "@/components/termino-legal";
import { TextoBilingue } from "@/components/texto-bilingue";
import { Medidor } from "@/components/medidor";
import { validadaPorElComun } from "@/lib/gobernanza/registros";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { nombreDelComun } from "@/lib/manifiestos/lighthouse-vrn";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { destinosDisponibles } from "@/lib/navegacion";
import { buscarTribu, buscarTribuBilingue, listarTribus, rutaProponerComunidad } from "@/lib/tribus/datos";
import { MembresiaAcciones } from "@/components/membresia-acciones";
import { VerBarrio } from "./acciones";
import { FichaComun } from "./ficha-comun";
import { Necesidades } from "./necesidades";

export const dynamicParams = false;

export function generateStaticParams() {
  // `lighthouse` es la ficha del común (Lighthouse VRN): no es una tribu.
  return [...listarTribus().map((t) => ({ id: t.id })), { id: COMUNIDAD_LIGHTHOUSE }];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  if (id === COMUNIDAD_LIGHTHOUSE) return { title: nombreDelComun(await idiomaDelPedido()) };
  const t = buscarTribu(id);
  if (!t) return {};
  const tx = textos("tribus", await idiomaDelPedido());
  return { title: t.estado === "vacante" ? tx.barrioBuscaTribu(t.barrio) : t.nombre };
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

const tarjeta ="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4";

export default async function TribuPage({ params }: Props) {
  const { id } = await params;
  if (id === COMUNIDAD_LIGHTHOUSE) return <FichaComun />;
  const idioma = await idiomaDelPedido();
  const t = buscarTribu(id, idioma);
  const original = buscarTribuBilingue(id);
  if (!t || !original) notFound();
  const tx = textos("tribus", idioma);
  const f = tx.ficha;
  // Validación del común (dato de ejemplo): en palabras, no solo con color.
  const gob = textos("gobernanza", idioma).ficha;
  const validada = validadaPorElComun(t.id);
  const marcaValidacion = (
    <p
      className={`w-fit rounded-full border px-3 py-1 text-sm font-medium ${validada ? "border-deep bg-green-soft text-deep" : "border-faint text-muted"}`}
    >
      <span aria-hidden="true">{validada ? "✓ " : "○ "}</span>
      {validada ? gob.validadaComun : gob.noValidadaComun} {gob.ejemplo}
      <TerminoLegal clave="validacioncomun" idioma={idioma} />
    </p>
  );

  const volver = (
    <p className="mb-2 text-sm">
      <Link className="underline" href="/tribus">{tx.volverTribus}</Link>
    </p>
  );
  const prototipo = (
    <p className="mt-2 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      {textos("marco", idioma).aviso}
    </p>
  );

  if (t.estado === "vacante") {
    const v = f.vacante;
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10">
        {volver}
        <h1 className="text-3xl font-semibold">{tx.barrioBuscaTribu(t.barrio)}</h1>
        <p className="mt-2 mb-4 text-muted">
          {v.introAntes}<strong>{t.foco}</strong>
          {v.introConHogares}{t.hogares}{v.introLicencia}
          <TerminoLegal clave="licencia" />{v.introAdhiere}
          <TerminoLegal clave="adherente" />{v.introFin}
        </p>
        <AvisoEjemplo />
        {prototipo}
        <div className="mt-2">{marcaValidacion}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold">{v.necesita}</h2>
            <Etiquetas items={t.busca} />
            <Medidor titulo={v.plataParaArrancar} actual={0} tope={t.plata.meta} unidad="USD " />
            <Medidor titulo={v.roles} actual={0} tope={t.roles.necesarios} dorado />
          </section>
          <section id="proponer" className={tarjeta}>
            <h2 className="text-lg font-semibold">{v.tieneTribu}</h2>
            <p className="text-sm">
              {v.proponelaAntes}
              <TerminoLegal clave="ritual" />{v.proponelaFin}
            </p>
            <EnlaceConCuenta
              href={rutaProponerComunidad(t.id)}
              textoEntrar={tx.listado.proponerEntrar}
              clase="w-fit rounded-lg bg-gold px-4 py-1.5 font-medium text-ink hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              {tx.listado.proponer}
            </EnlaceConCuenta>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      {volver}
      <p className="text-sm text-muted">{tx.barrioFoco(t.barrio, t.foco)}</p>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-4">
        <SelloTribu iniciales={t.iniciales} estado={t.estado} grande />
        <div>
          <h1 className="text-3xl font-semibold" translate="no">{t.nombre}</h1>
          {/* La declaración es la voz de la tribu: en inglés se muestra traducida, con la nota del idioma original. */}
          {original.declaracion && (
            <p className="mt-1 text-muted">
              <TextoBilingue valor={original.declaracion} />
            </p>
          )}
        </div>
        {/* Al lado del título, para no empujar el resto de la ficha hacia abajo. */}
        <div className="md:ml-auto">{marcaValidacion}</div>
      </div>
      <AvisoEjemplo />
      {prototipo}
      <MarcaAdmin tribu={t.id} nombre={t.nombre} />
      <PactosParaResponder tribu={t.id} />
      {t.estado === "formacion" && (
        <p
          role="note"
          className="mt-4 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium"
        >
          {f.enFormacion(t.etapa ?? null)}
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">{f.loQueTiene}</h2>
          <p className="text-sm text-muted">{t.hogares}</p>
          <Etiquetas items={t.tiene} />
          <Medidor titulo={f.plataComprometida} actual={t.plata.comprometida} tope={t.plata.meta} unidad="USD " />
          <Medidor titulo={f.rolesCubiertos} actual={t.roles.cubiertos} tope={t.roles.necesarios} dorado />
        </section>
        <section className={tarjeta}>
          <h2 className="text-lg font-semibold">{f.loQueBusca}</h2>
          <Necesidades tribuId={t.id} tribuNombre={t.nombre} idioma={idioma} />
          {t.areas && (
            <>
              <h3 className="text-sm font-medium">{f.areas}</h3>
              <ul className="flex flex-wrap gap-2">
                {t.areas.map((a) => {
                  const abierta = t.areasAbiertas?.includes(a);
                  return (
                    <li
                      key={a}
                      className={`rounded-full border px-3 py-1 text-sm ${abierta ? "border-gold-ink bg-gold-soft font-semibold" : "border-faint"}`}
                    >
                      {a}
                      {abierta && f.abierta}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
        {t.pozo && (
          <section className={tarjeta}>
            <h2 className="text-lg font-semibold">{f.aportaAlPozo}</h2>
            <ul className="list-disc pl-5 text-sm">
              {t.pozo.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <section className={`${tarjeta} mt-4`}>
        <h2 className="text-lg font-semibold">{f.comoSeEntra}</h2>
        <p>
          <strong>
            {f.ritualDeEntrada}
            <TerminoLegal clave="ritual" />:
          </strong>{" "}
          {t.ritual}
        </p>
        <p>
          <strong>{f.formaJuridica}</strong> {t.formaJuridica}
          <TerminoLegal clave="personeria" />{f.adherenteAlProyecto} <span translate="no">Lote 7</span>
          <TerminoLegal clave="adherente" />
        </p>
        <p>
          <strong>{f.suBarrio}</strong> {f.licenciaDelBarrio(t.barrio)}
          <TerminoLegal clave="licencia" />
        </p>
      </section>
      <section className={`${tarjeta} mt-4`}>
        <h2 className="text-lg font-semibold">{f.redDeConfianza}</h2>
        <p>
          {f.avalan(t.avales)}{" "}
          <span className="rounded-full border border-faint px-2 py-0.5 text-xs">{tx.ejemplo}</span>
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
        <p className="text-sm text-muted">&ldquo;{f.cita}&rdquo;</p>
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
