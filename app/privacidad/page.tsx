import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import {
  BASE_LEGAL,
  CONSERVACION,
  DATOS_POR_PANTALLA,
  DERECHOS,
  ENCARGADOS,
  FINALIDADES,
  MARCO_LEGAL,
  RESPONSABLE,
  RESUMEN,
  TERMINOS_DE_USO,
  UBICACION_DATOS,
} from "@/lib/privacidad/politica";
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";

export const metadata: Metadata = { title: "Política de privacidad" };

const SECCION = "grid gap-3 rounded-xl border border-faint bg-surface p-4";
const TABLA = "w-full min-w-[32rem] border-collapse text-left text-sm";
const CELDA = "p-2 align-top";

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-3xl font-semibold">Política de privacidad</h1>
      <p role="note" className="mt-3 rounded-lg border border-gold-ink bg-gold-soft px-4 py-3 text-sm font-medium">
        Borrador: este texto lo tiene que revisar un abogado antes de cualquier uso real. Versión {VERSION_POLITICA}.
      </p>

      <div className="mt-6 grid gap-6">
        <section aria-labelledby="resumen" className={SECCION}>
          <h2 id="resumen" className="text-xl font-semibold">En pocas palabras</h2>
          <ul className="grid list-disc gap-2 pl-5">
            {RESUMEN.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="responsable" className={SECCION}>
          <h2 id="responsable" className="text-xl font-semibold">
            Quién es el responsable
            <TerminoLegal clave="datos" />
          </h2>
          <p>
            {RESPONSABLE.nombre}, {RESPONSABLE.detalle}. Para cualquier consulta sobre tus datos escribinos a{" "}
            <b>{RESPONSABLE.contacto}</b> <span className="text-muted">(email de ejemplo, a definir)</span>.
          </p>
        </section>

        <section aria-labelledby="que-datos" className={SECCION}>
          <h2 id="que-datos" className="text-xl font-semibold">Qué datos tratamos, pantalla por pantalla</h2>
          <div className="relative overflow-x-auto">
            <table className={TABLA}>
              <caption className="sr-only">Datos que se tratan en cada pantalla y dónde quedan</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={CELDA}>Pantalla</th>
                  <th scope="col" className={CELDA}>Qué datos</th>
                  <th scope="col" className={CELDA}>Dónde quedan</th>
                </tr>
              </thead>
              <tbody>
                {DATOS_POR_PANTALLA.map((d) => (
                  <tr key={d.pantalla} className="border-b border-line">
                    <th scope="row" className={`${CELDA} font-medium`}>{d.pantalla}</th>
                    <td className={CELDA}>{d.datos}</td>
                    <td className={CELDA}>{d.donde}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="para-que" className={SECCION}>
          <h2 id="para-que" className="text-xl font-semibold">Para qué, con qué base y por cuánto tiempo</h2>
          <h3 className="font-medium">Para qué</h3>
          <ul className="grid list-disc gap-1 pl-5">
            {FINALIDADES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <h3 className="font-medium">Con qué base</h3>
          <p>{BASE_LEGAL}</p>
          <h3 className="font-medium">Por cuánto tiempo</h3>
          <ul className="grid list-disc gap-1 pl-5">
            {CONSERVACION.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="encargados" className={SECCION}>
          <h2 id="encargados" className="text-xl font-semibold">
            Quiénes los procesan y dónde
            <TerminoLegal clave="transferencia" />
          </h2>
          <p>
            Estos servicios tratan datos por cuenta de {RESPONSABLE.nombre}. Todos están en {UBICACION_DATOS}: es una
            transferencia internacional de datos y por eso te pedimos tu consentimiento.
          </p>
          <div className="relative overflow-x-auto">
            <table className={TABLA}>
              <caption className="sr-only">Servicios que tratan datos y dónde están</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className={CELDA}>Servicio</th>
                  <th scope="col" className={CELDA}>Para qué</th>
                  <th scope="col" className={CELDA}>Dónde</th>
                  <th scope="col" className={CELDA}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ENCARGADOS.map((e) => (
                  <tr key={e.nombre} className="border-b border-line">
                    <th scope="row" className={`${CELDA} font-medium`}>{e.nombre}</th>
                    <td className={CELDA}>{e.para}</td>
                    <td className={CELDA}>{e.donde}</td>
                    <td className={CELDA}>{e.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">Los acuerdos con cada servicio sobre cómo tratan los datos todavía están por definirse.</p>
        </section>

        <section aria-labelledby="derechos" className={SECCION}>
          <h2 id="derechos" className="text-xl font-semibold">Tus derechos y cómo ejercerlos</h2>
          <ul className="grid list-disc gap-1 pl-5">
            {DERECHOS.map((d) => (
              <li key={d.nombre}>
                <b>{d.nombre}:</b> {d.que}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">{MARCO_LEGAL}</p>
          <p>
            Si tenés cuenta, descargás tus datos, retirás tu consentimiento o pedís que borren tu cuenta desde{" "}
            <Link className="underline" href="/mis-datos">Mis datos</Link>. También podés escribir a{" "}
            <b>{RESPONSABLE.contacto}</b>.
          </p>
        </section>

        <section id="terminos" aria-labelledby="terminos-titulo" className={`${SECCION} scroll-mt-4`}>
          <h2 id="terminos-titulo" className="text-xl font-semibold">Términos de uso del prototipo</h2>
          <ul className="grid list-disc gap-1 pl-5">
            {TERMINOS_DE_USO.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
