import { AnotarExposicion } from "@/components/anotar-exposicion";
import { TerminoLegal } from "@/components/termino-legal";
import { ESTADOS_ADMINISTRATIVOS, textoExpediente, type IdProyecto } from "@/lib/legal/estado-administrativo";

// Aviso obligatorio en toda vista con lotes (regla C1). Texto + ícono: nunca solo color.
export function EstadoAdministrativo({ proyecto, compacto = false }: { proyecto: IdProyecto; compacto?: boolean }) {
  const e = ESTADOS_ADMINISTRATIVOS[proyecto];
  const anotar = (
    <AnotarExposicion
      proyectoId={proyecto}
      titulo={`${e.proyecto} · ${e.estado}`}
      texto={`${e.norma} · Expediente: ${textoExpediente(e)} · Aprobación municipal: ${e.aprobacionMunicipal ? "aprobada" : "pendiente"}`}
    />
  );

  if (compacto) {
    return (
      <p
        role="note"
        aria-label="Estado administrativo"
        className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink"
      >
        <span aria-hidden="true">▲ </span>
        {e.estado} · {e.normaCorta}
        <TerminoLegal clave="loteo" />
        {anotar}
      </p>
    );
  }

  return (
    <section
      aria-label="Estado administrativo"
      className="mt-4 grid gap-1 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink"
    >
      <p className="font-semibold">
        <span aria-hidden="true">▲ </span>
        {e.proyecto} · {e.estado} · {e.norma}
        <TerminoLegal clave="loteo" />
      </p>
      <p>
        Titular: {e.titular} · Expediente: {textoExpediente(e)} · Aprobación municipal:{" "}
        {e.aprobacionMunicipal ? "aprobada" : "pendiente"}
      </p>
      {anotar}
    </section>
  );
}
