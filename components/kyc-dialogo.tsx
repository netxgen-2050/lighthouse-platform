"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EnEspanol } from "@/components/en-espanol";
import { useSesion } from "@/components/sesion/contexto";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { registrarConsentimientoSensible } from "@/lib/privacidad/consentimiento";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import {
  BORRADOR_VACIO,
  fechaLarga,
  MAX_TEXTO,
  validarPaso,
  type BorradorKyc,
  type ErroresKyc,
  type EstadoKyc,
} from "@/lib/pasaporte/kyc";

const BOTON =
  "rounded-full px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const SUAVE = `${BOTON} border border-faint bg-surface hover:bg-surface-2`;
const CAMPO =
  "mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-[invalid=true]:border-warn-ink";

type Props = {
  abierto: boolean;
  kyc: EstadoKyc;
  /** Se llama al cerrar (botón, Esc). */
  alCerrar: () => void;
  /** Guarda el trámite. false: el navegador no dejó guardar y el diálogo avisa. */
  alEnviar: (borrador: BorradorKyc) => boolean;
  /** Aprobación simulada. */
  alAprobar: () => boolean;
  /** Para avisar qué se está intentando hacer ("Para pedir una invitación…"). */
  motivo?: string;
};

/**
 * Verificación de identidad (KYC) por pasos, simulada. Es un diálogo modal nativo:
 * el foco queda atrapado adentro, Esc lo cierra y el foco vuelve a quien lo abrió.
 */
export function KycDialogo({ abierto, kyc, alCerrar, alEnviar, alAprobar, motivo }: Props) {
  const idBase = useId();
  const idioma = useIdioma();
  const pasaporteTextos = useTextos("pasaporte");
  const t = pasaporteTextos.kyc;
  const comunes = useTextos("comunes");
  const dialogo = useRef<HTMLDialogElement | null>(null);
  const titulo = useRef<HTMLHeadingElement | null>(null);
  const refs = useRef<Partial<Record<keyof BorradorKyc, HTMLElement | null>>>({});
  const [paso, setPaso] = useState(1);
  const [b, setB] = useState<BorradorKyc>(BORRADOR_VACIO);
  const [errores, setErrores] = useState<ErroresKyc>({});
  const [fallo, setFallo] = useState(false);
  const moverFoco = useRef(false);
  // Los datos de identidad, residencia fiscal y origen de fondos son sensibles: antes del primer paso se pide un consentimiento aparte.
  const { sesion } = useSesion();
  const { sensibles } = useConsentimiento(sesion?.idPersona ?? null);
  const [acepta, setAcepta] = useState(false);
  const [errorConsentimiento, setErrorConsentimiento] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      d.showModal();
      // El foco empieza en el título del paso, no en el primer botón.
      titulo.current?.focus();
    }
    if (!abierto && d.open) d.close();
  }, [abierto]);

  // Al cambiar de paso (o de pantalla) el foco va al título del paso, para que se anuncie.
  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    titulo.current?.focus();
  }, [paso, kyc.estado, sensibles]);

  function consentir() {
    if (!acepta) {
      setErrorConsentimiento("Error: para empezar tenés que marcar la casilla.");
      return;
    }
    let guardado = false;
    try {
      guardado = registrarConsentimientoSensible(window.localStorage);
    } catch {
      guardado = false;
    }
    if (!guardado) {
      setErrorConsentimiento("Error: no pudimos registrar tu consentimiento. Revisá que tu navegador permita guardar datos en este sitio.");
      return;
    }
    setErrorConsentimiento(null);
    moverFoco.current = true;
  }

  function cambiar<K extends keyof BorradorKyc>(campo: K, valor: BorradorKyc[K]) {
    setB((x) => ({ ...x, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  function primerError(e: ErroresKyc) {
    const orden = Object.keys(BORRADOR_VACIO) as (keyof BorradorKyc)[];
    return orden.find((k) => e[k]);
  }

  function siguiente() {
    const e = validarPaso(paso, b, new Date(), idioma);
    setErrores(e);
    const k = primerError(e);
    if (k) {
      refs.current[k]?.focus();
      return;
    }
    moverFoco.current = true;
    setPaso(paso + 1);
  }

  function atras() {
    setErrores({});
    moverFoco.current = true;
    setPaso(Math.max(1, paso - 1));
  }

  function enviar() {
    // En la revisión se vuelve a validar todo: si algo quedó mal, se vuelve a ese paso.
    const e = validarPaso(5, b, new Date(), idioma);
    const k = primerError(e);
    if (k) {
      setErrores(e);
      const aPaso = (["nombre", "documento", "nacimiento"] as const).some((c) => c === k)
        ? 1
        : (["nacionalidad", "paisNacionalidad", "residencia", "paisResidencia"] as const).some((c) => c === k)
          ? 2
          : k === "origenFondos"
            ? 3
            : 4;
      moverFoco.current = true;
      setPaso(aPaso);
      return;
    }
    if (!alEnviar(b)) {
      setFallo(true);
      return;
    }
    setFallo(false);
    // Los datos personales no se guardan: se limpian apenas se envía.
    setB(BORRADOR_VACIO);
    setPaso(1);
    moverFoco.current = true;
  }

  function aprobar() {
    if (alAprobar()) moverFoco.current = true;
    else setFallo(true);
  }

  const id = (c: string) => `${idBase}-${c}`;
  const describe = (c: keyof BorradorKyc) => (errores[c] ? id(`err-${c}`) : undefined);
  const error = (c: keyof BorradorKyc) =>
    errores[c] ? (
      <p id={id(`err-${c}`)} role="alert" className="mt-1 text-sm font-medium text-warn-ink">
        Error: {errores[c]}
      </p>
    ) : null;
  const ref = (c: keyof BorradorKyc) => (el: HTMLElement | null) => {
    refs.current[c] = el;
  };
  const props = (c: keyof BorradorKyc) => ({
    id: id(c),
    ref: ref(c) as never,
    "aria-invalid": errores[c] ? (true as const) : undefined,
    "aria-describedby": describe(c),
    className: CAMPO,
  });

  const enCurso = kyc.estado === "sin-tramite";

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={id("titulo")}
      // Solo el cierre que hace la persona (Esc): el que sigue a `abierto = false` ya lo avisó quien cerró.
      onClose={() => {
        if (abierto) alCerrar();
      }}
      className="m-auto max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-line bg-surface p-5 text-ink backdrop:bg-ink/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={id("titulo")} className="text-xl font-semibold">
          {t.titulo}
          <TerminoLegal clave="kyc" idioma={idioma} />
        </h2>
        <button type="button" onClick={alCerrar} className={SUAVE}>
          {comunes.cerrar}
        </button>
      </div>
      <p className="mt-2 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        {t.simulacion}
      </p>
      {motivo && <p className="mt-2 text-sm">{motivo}</p>}

      {enCurso && !sensibles && (
        // El consentimiento de datos sensibles tiene peso legal: su traducción llega con `idioma-legal`. Mientras tanto,
        // en inglés se muestra en español, marcado.
        <EnEspanol>
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            consentir();
          }}
        >
          <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Antes de empezar: tus datos sensibles
            <TerminoLegal clave="datos" />
          </h3>
          <p>
            Para verificar tu identidad vas a cargar tu nombre, documento, fecha de nacimiento, nacionalidad, residencia fiscal y
            el origen de tus fondos. Son datos sensibles y necesitamos tu consentimiento específico para tratarlos.
          </p>
          <p className="text-sm text-muted">
            En la versión real los verifica un tercero (el fiduciario o un proveedor de KYC), que los custodia. Podés retirar
            tu consentimiento cuando quieras desde Mis datos.
          </p>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={acepta}
              aria-describedby={errorConsentimiento ? id("err-consentimiento") : undefined}
              onChange={(e) => {
                setAcepta(e.target.checked);
                setErrorConsentimiento(null);
              }}
              className="mt-1 size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            />
            <span>
              Acepto que NetXGen trate mis datos de identidad, residencia fiscal y origen de fondos para verificar mi identidad.
            </span>
          </label>
          {errorConsentimiento && (
            <p id={id("err-consentimiento")} role="alert" className="text-sm font-medium text-warn-ink">
              {errorConsentimiento}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={PRIMARIO}>
              Aceptar y empezar
            </button>
            <button type="button" onClick={alCerrar} className={SUAVE}>
              Ahora no
            </button>
          </div>
        </form>
        </EnEspanol>
      )}

      {enCurso && sensibles && (
        <form
          className="mt-4 grid gap-4"
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            if (paso === 5) enviar();
            else siguiente();
          }}
        >
          <div>
            <p className="text-sm text-muted" aria-hidden="true">
              {t.pasoDe(paso, t.pasos.length)}
            </p>
            <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              <span className="sr-only">{t.pasoDe(paso, t.pasos.length)}: </span>
              {t.pasos[paso - 1]}
            </h3>
          </div>

          {paso === 1 && (
            <>
              <div>
                <label htmlFor={id("nombre")} className="font-medium">{t.nombre}</label>
                <input type="text" maxLength={MAX_TEXTO} autoComplete="name" value={b.nombre} onChange={(e) => cambiar("nombre", e.target.value)} {...props("nombre")} />
                {error("nombre")}
              </div>
              <div>
                <label htmlFor={id("documento")} className="font-medium">{t.documento}</label>
                <input type="text" maxLength={20} autoComplete="off" value={b.documento} onChange={(e) => cambiar("documento", e.target.value)} {...props("documento")} />
                {error("documento")}
              </div>
              <div>
                <label htmlFor={id("nacimiento")} className="font-medium">{t.nacimiento}</label>
                <input type="date" autoComplete="bday" value={b.nacimiento} onChange={(e) => cambiar("nacimiento", e.target.value)} {...props("nacimiento")} />
                {error("nacimiento")}
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <fieldset className="grid gap-2">
                <legend className="font-medium">{t.nacionalidad}</legend>
                <div className="flex flex-wrap gap-4">
                  {([["argentina", t.argentina], ["otra", t.otra]] as const).map(([v, texto], i) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={id("nacionalidad")}
                        ref={i === 0 ? ref("nacionalidad") : undefined}
                        checked={b.nacionalidad === v}
                        aria-describedby={describe("nacionalidad")}
                        onChange={() => cambiar("nacionalidad", v)}
                      />
                      {texto}
                    </label>
                  ))}
                </div>
                {error("nacionalidad")}
                {b.nacionalidad === "otra" && (
                  <div>
                    <label htmlFor={id("paisNacionalidad")} className="text-sm">{t.paisNacionalidad}</label>
                    <input type="text" maxLength={MAX_TEXTO} value={b.paisNacionalidad} onChange={(e) => cambiar("paisNacionalidad", e.target.value)} {...props("paisNacionalidad")} />
                    {error("paisNacionalidad")}
                  </div>
                )}
              </fieldset>
              <fieldset className="grid gap-2">
                <legend className="font-medium">
                  {t.residenciaFiscal}<TerminoLegal clave="hacienda" idioma={idioma} />
                </legend>
                <div className="flex flex-wrap gap-4">
                  {([["argentina", t.argentina], ["exterior", t.exteriorOpcion]] as const).map(([v, texto], i) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={id("residencia")}
                        ref={i === 0 ? ref("residencia") : undefined}
                        checked={b.residencia === v}
                        aria-describedby={describe("residencia")}
                        onChange={() => cambiar("residencia", v)}
                      />
                      {texto}
                    </label>
                  ))}
                </div>
                {error("residencia")}
                {b.residencia === "exterior" && (
                  <div>
                    <label htmlFor={id("paisResidencia")} className="text-sm">{t.paisResidencia}</label>
                    <input type="text" maxLength={MAX_TEXTO} value={b.paisResidencia} onChange={(e) => cambiar("paisResidencia", e.target.value)} {...props("paisResidencia")} />
                    {error("paisResidencia")}
                  </div>
                )}
              </fieldset>
            </>
          )}

          {paso === 3 && (
            <div>
              <label htmlFor={id("origenFondos")} className="font-medium">{t.origenFondos}</label>
              <input type="text" maxLength={MAX_TEXTO} value={b.origenFondos} onChange={(e) => cambiar("origenFondos", e.target.value)} {...props("origenFondos")} />
              <p className="mt-1 text-sm text-muted">{t.origenEjemplo}</p>
              {error("origenFondos")}
            </div>
          )}

          {paso === 4 && (
            <fieldset className="grid gap-2">
              <legend className="font-medium">
                {t.tipoInversor}<TerminoLegal clave="calificado" idioma={idioma} />
              </legend>
              <div className="flex flex-wrap gap-4">
                {([["no-calificado", t.noCalificado], ["calificado", t.calificado]] as const).map(([v, texto], i) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={id("inversor")}
                      ref={i === 0 ? ref("inversor") : undefined}
                      checked={b.inversor === v}
                      aria-describedby={describe("inversor")}
                      onChange={() => cambiar("inversor", v)}
                    />
                    {texto}
                  </label>
                ))}
              </div>
              {error("inversor")}
            </fieldset>
          )}

          {paso === 5 && (
            <dl className="grid gap-1 rounded-lg bg-surface-2 p-3 text-sm">
              {[
                [t.resumen.nombre, b.nombre],
                [t.resumen.documento, b.documento],
                [t.resumen.nacimiento, b.nacimiento],
                [t.resumen.nacionalidad, b.nacionalidad === "otra" ? t.resumen.otraEn(b.paisNacionalidad) : t.argentina],
                [t.resumen.residenciaFiscal, b.residencia === "exterior" ? t.resumen.exteriorEn(b.paisResidencia) : t.argentina],
                [t.resumen.origenFondos, b.origenFondos],
                [t.resumen.tipoInversor, b.inversor === "calificado" ? t.calificado : t.noCalificado],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap gap-x-2">
                  <dt className="font-medium">{k}:</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {fallo && (
            <p role="alert" className="text-sm font-medium text-warn-ink">
              {t.errorGuardarEnvio}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {paso > 1 && (
              <button type="button" onClick={atras} className={SUAVE}>
                {t.atras}
              </button>
            )}
            <button type="submit" className={PRIMARIO}>
              {paso === 5 ? t.enviar : t.siguiente}
            </button>
          </div>
        </form>
      )}

      {kyc.estado === "en-tramite" && (
        <div className="mt-4 grid gap-3">
          <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            {t.enTramite}
          </h3>
          <p role="status">{t.enviadaEl(fechaLarga(kyc.enviado, idioma))}</p>
          {fallo && (
            <p role="alert" className="text-sm font-medium text-warn-ink">
              {t.errorGuardar}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={aprobar} className={PRIMARIO}>
              {pasaporteTextos.identidad.simularAprobada}
            </button>
          </div>
        </div>
      )}

      {kyc.estado === "aprobado" && (
        <div className="mt-4 grid gap-3">
          <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            {t.aprobadaTitulo}
          </h3>
          <p role="status">{t.aprobadaEl(fechaLarga(kyc.aprobado, idioma))}</p>
          <div>
            <button type="button" onClick={alCerrar} className={PRIMARIO}>
              {t.listo}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
