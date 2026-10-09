"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import {
  BORRADOR_VACIO,
  fechaLarga,
  MAX_TEXTO,
  PASOS_KYC,
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
  const dialogo = useRef<HTMLDialogElement | null>(null);
  const titulo = useRef<HTMLHeadingElement | null>(null);
  const refs = useRef<Partial<Record<keyof BorradorKyc, HTMLElement | null>>>({});
  const [paso, setPaso] = useState(1);
  const [b, setB] = useState<BorradorKyc>(BORRADOR_VACIO);
  const [errores, setErrores] = useState<ErroresKyc>({});
  const [fallo, setFallo] = useState(false);
  const moverFoco = useRef(false);

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
  }, [paso, kyc.estado]);

  function cambiar<K extends keyof BorradorKyc>(campo: K, valor: BorradorKyc[K]) {
    setB((x) => ({ ...x, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  function primerError(e: ErroresKyc) {
    const orden = Object.keys(BORRADOR_VACIO) as (keyof BorradorKyc)[];
    return orden.find((k) => e[k]);
  }

  function siguiente() {
    const e = validarPaso(paso, b);
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
    const e = validarPaso(5, b);
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
          Verificar mi identidad
          <TerminoLegal clave="kyc" />
        </h2>
        <button type="button" onClick={alCerrar} className={SUAVE}>
          Cerrar
        </button>
      </div>
      <p className="mt-2 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Simulación: no se verifica ningún documento ni se cobra nada, y lo que cargues queda solo en este navegador. En la
        versión real lo hace el fiduciario.
      </p>
      {motivo && <p className="mt-2 text-sm">{motivo}</p>}

      {enCurso && (
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
              Paso {paso} de {PASOS_KYC.length}
            </p>
            <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              <span className="sr-only">Paso {paso} de {PASOS_KYC.length}: </span>
              {PASOS_KYC[paso - 1]}
            </h3>
          </div>

          {paso === 1 && (
            <>
              <div>
                <label htmlFor={id("nombre")} className="font-medium">Nombre completo</label>
                <input type="text" maxLength={MAX_TEXTO} autoComplete="name" value={b.nombre} onChange={(e) => cambiar("nombre", e.target.value)} {...props("nombre")} />
                {error("nombre")}
              </div>
              <div>
                <label htmlFor={id("documento")} className="font-medium">Número de documento</label>
                <input type="text" maxLength={20} autoComplete="off" value={b.documento} onChange={(e) => cambiar("documento", e.target.value)} {...props("documento")} />
                {error("documento")}
              </div>
              <div>
                <label htmlFor={id("nacimiento")} className="font-medium">Fecha de nacimiento</label>
                <input type="date" autoComplete="bday" value={b.nacimiento} onChange={(e) => cambiar("nacimiento", e.target.value)} {...props("nacimiento")} />
                {error("nacimiento")}
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <fieldset className="grid gap-2">
                <legend className="font-medium">Nacionalidad</legend>
                <div className="flex flex-wrap gap-4">
                  {([["argentina", "Argentina"], ["otra", "Otra"]] as const).map(([v, t], i) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={id("nacionalidad")}
                        ref={i === 0 ? ref("nacionalidad") : undefined}
                        checked={b.nacionalidad === v}
                        aria-describedby={describe("nacionalidad")}
                        onChange={() => cambiar("nacionalidad", v)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
                {error("nacionalidad")}
                {b.nacionalidad === "otra" && (
                  <div>
                    <label htmlFor={id("paisNacionalidad")} className="text-sm">País de nacionalidad</label>
                    <input type="text" maxLength={MAX_TEXTO} value={b.paisNacionalidad} onChange={(e) => cambiar("paisNacionalidad", e.target.value)} {...props("paisNacionalidad")} />
                    {error("paisNacionalidad")}
                  </div>
                )}
              </fieldset>
              <fieldset className="grid gap-2">
                <legend className="font-medium">
                  Residencia fiscal<TerminoLegal clave="hacienda" />
                </legend>
                <div className="flex flex-wrap gap-4">
                  {([["argentina", "Argentina"], ["exterior", "Exterior"]] as const).map(([v, t], i) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={id("residencia")}
                        ref={i === 0 ? ref("residencia") : undefined}
                        checked={b.residencia === v}
                        aria-describedby={describe("residencia")}
                        onChange={() => cambiar("residencia", v)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
                {error("residencia")}
                {b.residencia === "exterior" && (
                  <div>
                    <label htmlFor={id("paisResidencia")} className="text-sm">País de residencia fiscal</label>
                    <input type="text" maxLength={MAX_TEXTO} value={b.paisResidencia} onChange={(e) => cambiar("paisResidencia", e.target.value)} {...props("paisResidencia")} />
                    {error("paisResidencia")}
                  </div>
                )}
              </fieldset>
            </>
          )}

          {paso === 3 && (
            <div>
              <label htmlFor={id("origenFondos")} className="font-medium">¿De dónde vienen los fondos?</label>
              <input type="text" maxLength={MAX_TEXTO} value={b.origenFondos} onChange={(e) => cambiar("origenFondos", e.target.value)} {...props("origenFondos")} />
              <p className="mt-1 text-sm text-muted">Por ejemplo: ahorros de mi trabajo, venta de un inmueble, herencia.</p>
              {error("origenFondos")}
            </div>
          )}

          {paso === 4 && (
            <fieldset className="grid gap-2">
              <legend className="font-medium">
                Tipo de inversor<TerminoLegal clave="calificado" />
              </legend>
              <div className="flex flex-wrap gap-4">
                {([["no-calificado", "No calificado"], ["calificado", "Calificado"]] as const).map(([v, t], i) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={id("inversor")}
                      ref={i === 0 ? ref("inversor") : undefined}
                      checked={b.inversor === v}
                      aria-describedby={describe("inversor")}
                      onChange={() => cambiar("inversor", v)}
                    />
                    {t}
                  </label>
                ))}
              </div>
              {error("inversor")}
            </fieldset>
          )}

          {paso === 5 && (
            <dl className="grid gap-1 rounded-lg bg-surface-2 p-3 text-sm">
              {[
                ["Nombre", b.nombre],
                ["Documento", b.documento],
                ["Nacimiento", b.nacimiento],
                ["Nacionalidad", b.nacionalidad === "otra" ? `Otra · ${b.paisNacionalidad}` : "Argentina"],
                ["Residencia fiscal", b.residencia === "exterior" ? `Exterior · ${b.paisResidencia}` : "Argentina"],
                ["Origen de los fondos", b.origenFondos],
                ["Tipo de inversor", b.inversor === "calificado" ? "Calificado" : "No calificado"],
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
              Error: tu navegador no permite guardar datos en este sitio, así que la verificación no se pudo enviar.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {paso > 1 && (
              <button type="button" onClick={atras} className={SUAVE}>
                Atrás
              </button>
            )}
            <button type="submit" className={PRIMARIO}>
              {paso === 5 ? "Enviar verificación (simulado)" : "Siguiente"}
            </button>
          </div>
        </form>
      )}

      {kyc.estado === "en-tramite" && (
        <div className="mt-4 grid gap-3">
          <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Verificación en trámite
          </h3>
          <p role="status">Enviaste tus datos el {fechaLarga(kyc.enviado)}. En el prototipo la aprobación se simula.</p>
          {fallo && (
            <p role="alert" className="text-sm font-medium text-warn-ink">
              Error: tu navegador no permite guardar datos en este sitio.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={aprobar} className={PRIMARIO}>
              Simular: verificación aprobada
            </button>
          </div>
        </div>
      )}

      {kyc.estado === "aprobado" && (
        <div className="mt-4 grid gap-3">
          <h3 ref={titulo} tabIndex={-1} className="text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
            Identidad verificada
          </h3>
          <p role="status">Tu verificación fue aprobada el {fechaLarga(kyc.aprobado)} (simulado). Ya tenés el sello de identidad.</p>
          <div>
            <button type="button" onClick={alCerrar} className={PRIMARIO}>
              Listo
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
