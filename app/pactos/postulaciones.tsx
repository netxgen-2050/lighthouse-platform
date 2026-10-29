"use client";

import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { HORAS_PUNTUAL, ROLES, textoDeRol, type ClaveRol } from "@/lib/pactos/datos";
import { MAX_DESCRIPCION, MAX_ROL_OTRO, faltaDelPuntual, type EdicionPuntual, type PactoPuntual } from "@/lib/pactos/estado";
import { loAdministraHifa, nombreDeHolon } from "@/lib/pactos/postulacion";
import { buscarNecesidad, holonDe, type Tope } from "@/lib/tribus/necesidades";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-muted hover:bg-surface-2`;
const CAMPO = `rounded-lg border border-muted bg-surface px-3 py-1.5 ${FOCO}`;

type Props = {
  comunidad: string;
  puntuales: PactoPuntual[];
  alEditar: (necesidadId: string, cambios: EdicionPuntual) => void;
  alEnviar: (necesidadId: string) => void;
  alRetirar: (necesidadId: string) => void;
  alDescartar: (necesidadId: string) => void;
};

/** "Mis postulaciones a tareas": un `<article>` por postulación, con su estado en texto. El estado vive en `PactosCliente`. */
export function PostulacionesATareas({ comunidad, puntuales, alEditar, alEnviar, alRetirar, alDescartar }: Props) {
  const idioma = useIdioma();
  const t = useTextos("pactos").puntual;
  const comunes = useTextos("comunes");
  // Lo que escribe la persona nunca se traduce: con la interfaz en inglés se marca como español.
  const langTexto = idioma === "en" ? "es" : undefined;

  function maximos(p: PactoPuntual) {
    const linea = (tope: Tope | null, horas: (n: number) => string, semillas: (n: number) => string, aclaracion: string) =>
      tope && (
        <p className="text-sm text-muted">
          {tope.unidad === "horas" ? horas(tope.valor) : semillas(tope.valor)} · {aclaracion}
        </p>
      );
    return (
      <>
        {linea(p.tope, t.maximoHoras, t.maximoSemillas, t.horasDeMas)}
        {linea(p.topeTotal, t.maximoTotalHoras, t.maximoTotalSemillas, t.totalAclaracion)}
      </>
    );
  }

  return (
    <section aria-labelledby="titulo-postulaciones" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
      <h2 id="titulo-postulaciones" className="text-xl font-semibold">
        {t.titulo}
      </h2>
      {puntuales.map((p) => {
        const n = buscarNecesidad(p.necesidadId, idioma);
        const holon = n ? nombreDeHolon(holonDe(n), idioma) : null;
        const holonTexto = holon ? t.holon(holon.nombre, holon.tipo) : comunes.sinDato;
        const borrador = p.paso === "borrador";
        const falta = faltaDelPuntual(p);
        const idEstado = `estado-puntual-${p.necesidadId}`;
        const idAyuda = `ayuda-puntual-${p.necesidadId}`;
        return (
          <article key={p.necesidadId} aria-labelledby={`titulo-puntual-${p.necesidadId}`} className="grid gap-3 rounded-lg border border-faint p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 id={`titulo-puntual-${p.necesidadId}`} className="text-lg font-semibold">
                <Link className="underline" href={`/tribus/${comunidad}#necesidad-${p.necesidadId}`}>
                  {n?.titulo ?? comunes.sinDato}
                </Link>
              </h3>
              <span className="text-sm text-muted">{t.nombrePacto}</span>
              <TerminoLegal clave="pactopuntual" idioma={idioma} />
            </div>
            {holon && <p className="text-sm">{t.responde(holon.nombre, holon.tipo)}</p>}
            {n && loAdministraHifa(holonDe(n)) && <p className="text-sm text-muted">{t.administraHifa}</p>}
            <p className="text-sm">
              <span className="font-medium">{t.estado}: </span>
              <span
                id={idEstado}
                tabIndex={-1}
                data-estado-puntual={p.paso}
                className={`rounded-full border px-3 py-0.5 font-medium ${FOCO} ${p.paso === "borrador" ? "border-faint" : "border-deep bg-green-soft text-deep"}`}
              >
                {p.paso === "borrador" ? t.pasoBorrador : p.paso === "enviado" ? t.pasoEnviada : t.pasoPreadmitida}
              </span>
            </p>
            <fieldset disabled={!borrador} className="grid content-start gap-3 border-0 p-0">
              <legend className="sr-only">{n?.titulo ?? comunes.sinDato}</legend>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{t.rol}</span>
                <select
                  value={p.rol}
                  onChange={(e) => alEditar(p.necesidadId, { rol: e.target.value as ClaveRol | "" })}
                  className={`${CAMPO} w-fit`}
                >
                  <option value="">{t.elegiRol}</option>
                  {ROLES.map((r) => (
                    <option key={r.clave} value={r.clave}>
                      {textoDeRol(r, idioma).nombre}
                    </option>
                  ))}
                </select>
              </label>
              {p.rol === "otro" && (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{t.queRol}</span>
                  <input
                    type="text"
                    maxLength={MAX_ROL_OTRO}
                    value={p.rolOtro}
                    lang={langTexto}
                    onChange={(e) => alEditar(p.necesidadId, { rolOtro: e.target.value })}
                    className={CAMPO}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{t.descripcion}</span>
                <textarea
                  rows={3}
                  maxLength={MAX_DESCRIPCION}
                  value={p.descripcion}
                  lang={langTexto}
                  onChange={(e) => alEditar(p.necesidadId, { descripcion: e.target.value })}
                  className={CAMPO}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{t.horas}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={HORAS_PUNTUAL.min}
                  max={HORAS_PUNTUAL.max}
                  step={HORAS_PUNTUAL.paso}
                  value={p.horas ?? ""}
                  onChange={(e) => alEditar(p.necesidadId, { horas: e.target.value === "" ? null : Number(e.target.value) })}
                  className={`${CAMPO} w-40`}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{t.fecha}</span>
                <input
                  type="date"
                  value={p.fecha ?? ""}
                  onChange={(e) => alEditar(p.necesidadId, { fecha: e.target.value === "" ? null : e.target.value })}
                  className={`${CAMPO} w-fit`}
                />
              </label>
            </fieldset>
            {maximos(p)}
            {p.paso === "borrador" && p.noPreadmitida && (
              <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink" data-testid="aviso-no-preadmitida">
                <span lang={langTexto}>{t.noPreadmitida(holonTexto[0].toUpperCase() + holonTexto.slice(1), p.noPreadmitida.motivo)}</span>
              </p>
            )}
            {p.paso === "enviado" && <p className="text-sm font-medium" data-testid="esperando-respuesta-puntual">{t.esperando(holonTexto)}</p>}
            {p.paso === "preadmitido" && (
              <>
                <p className="text-sm font-medium">{t.preadmitida(holonTexto)}</p>
                <p className="text-sm text-muted">{t.sinSemillasTodavia}</p>
              </>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {p.paso === "borrador" && (
                <>
                  <button
                    type="button"
                    className={BOTON_PRIMARIO}
                    aria-disabled={falta !== null}
                    aria-describedby={falta !== null ? idAyuda : undefined}
                    onClick={() => {
                      if (falta === null) alEnviar(p.necesidadId);
                    }}
                  >
                    {t.enviar}
                  </button>
                  <button type="button" className={BOTON_SECUNDARIO} onClick={() => alDescartar(p.necesidadId)}>
                    {t.descartar}
                  </button>
                  {falta !== null && (
                    <span id={idAyuda} className="text-sm text-muted">
                      {falta === "rol" ? (p.rol === "otro" ? t.faltaRolOtro : t.faltaRol) : t.falta}
                    </span>
                  )}
                </>
              )}
              {p.paso === "enviado" && (
                <button type="button" className={BOTON_SECUNDARIO} onClick={() => alRetirar(p.necesidadId)}>
                  {t.retirar}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
