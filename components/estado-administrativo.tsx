import { AnotarExposicion } from "@/components/anotar-exposicion";
import { TerminoLegal } from "@/components/termino-legal";
import {
  ESTADOS_ADMINISTRATIVOS,
  textoExpediente,
  textoFechaAprobacion,
  textoTitular,
  type IdProyecto,
} from "@/lib/legal/estado-administrativo";
import type { Idioma } from "@/lib/idioma/tipos";

// Aviso obligatorio en toda vista con lotes (regla C1). Texto + ícono: nunca solo color.
export function EstadoAdministrativo({
  proyecto,
  compacto = false,
  idioma = "es",
}: {
  proyecto: IdProyecto;
  compacto?: boolean;
  idioma?: Idioma;
}) {
  const base = ESTADOS_ADMINISTRATIVOS[proyecto];
  // Se decide por el dato, no por el nombre del proyecto.
  const supuesto = !!base.supuestoDeTrabajo;
  // Los textos en inglés existen solo para Norte; Soluna no cambia.
  const en = idioma === "en" && !!base.en;
  const idiomaTermino = en ? "en" : "es";
  const e = en && base.en ? { ...base, ...base.en } : base;
  const clave = supuesto ? "loteonorte" : "loteo";
  const sinDato = en ? "no data" : "sin dato";
  const dato = (v: string) => (v === "sin dato" ? sinDato : v);
  const L =
    en
      ? { titular: "Holder", expediente: "File", aprobacion: "Municipal approval", fecha: "Date" }
      : { titular: "Titular", expediente: "Expediente", aprobacion: "Aprobación municipal", fecha: "Fecha" };
  const aprobacion = supuesto
    ? (e.supuestoDeTrabajo || sinDato)
    : e.aprobacionMunicipal
      ? "aprobada"
      : "pendiente";
  const detalle = supuesto
    ? `${L.titular}: ${dato(textoTitular(base))} · ${L.expediente}: ${dato(textoExpediente(base))} · ${L.aprobacion}: ${aprobacion} · ${L.fecha}: ${dato(textoFechaAprobacion(base))}`
    : `Titular: ${textoTitular(base)} · Expediente: ${textoExpediente(base)} · Aprobación municipal: ${aprobacion}`;
  const compactoTexto = supuesto ? `${e.estado} · ${L.aprobacion}: ${aprobacion}` : `${e.estado} · ${e.normaCorta}`;
  // Se anota exactamente lo que cada vista muestra en pantalla.
  const anotar = compacto ? (
    <AnotarExposicion proyectoId={proyecto} titulo={supuesto ? e.estado : `${e.estado}`} texto={supuesto ? `${L.aprobacion}: ${aprobacion}` : e.normaCorta} />
  ) : (
    <AnotarExposicion proyectoId={proyecto} titulo={`${e.proyecto} · ${e.estado} · ${e.norma}`} texto={detalle} />
  );

  if (compacto) {
    return (
      <p
        role="note"
        aria-label={en ? "Administrative status" : "Estado administrativo"}
        className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink"
      >
        <span aria-hidden="true">▲ </span>
        {compactoTexto}
        <TerminoLegal clave={clave} idioma={idiomaTermino} />
        {anotar}
      </p>
    );
  }

  return (
    <section
      aria-label={en ? "Administrative status" : "Estado administrativo"}
      className="mt-4 grid gap-1 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink"
    >
      <p className="font-semibold">
        <span aria-hidden="true">▲ </span>
        {e.proyecto} · {e.estado} · {e.norma}
        <TerminoLegal clave={clave} idioma={idiomaTermino} />
      </p>
      <p>{detalle}</p>
      {anotar}
    </section>
  );
}
