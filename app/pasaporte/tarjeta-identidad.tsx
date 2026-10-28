"use client";

import { useEffect, useRef, type Ref } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { DatosPersona } from "@/lib/pasaporte/datos";
import { fechaLarga, type EstadoKyc } from "@/lib/pasaporte/kyc";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;

const ETAPAS = [
  { estado: "sin-tramite", clave: "sinTramite" },
  { estado: "en-tramite", clave: "enTramite" },
  { estado: "aprobado", clave: "aprobado" },
] as const;

/** Tarjeta principal de la verificación de identidad (KYC simulado), arriba de los sellos. */
export function TarjetaIdentidad({
  kyc,
  datos,
  alCompletar,
  alAprobar,
  botonRef,
}: {
  kyc: EstadoKyc;
  datos: DatosPersona;
  alCompletar: () => void;
  alAprobar: () => void;
  botonRef: Ref<HTMLButtonElement>;
}) {
  const idioma = useIdioma();
  const pasaporte = useTextos("pasaporte");
  const t = pasaporte.identidad;
  const titulo = useRef<HTMLHeadingElement>(null);

  // Enlace directo `/pasaporte#identidad`: lleva a la tarjeta y deja el foco en su encabezado.
  useEffect(() => {
    function ir() {
      if (window.location.hash !== "#identidad") return;
      titulo.current?.scrollIntoView();
      titulo.current?.focus();
    }
    ir();
    window.addEventListener("hashchange", ir);
    return () => window.removeEventListener("hashchange", ir);
  }, []);

  const actual = ETAPAS.findIndex((e) => e.estado === kyc.estado);

  return (
    <section
      id="identidad"
      aria-labelledby="titulo-identidad"
      className="grid content-start gap-4 rounded-xl border-2 border-deep bg-surface p-5 scroll-mt-4"
    >
      <h2
        id="titulo-identidad"
        ref={titulo}
        tabIndex={-1}
        className={`text-xl font-semibold ${FOCO}`}
      >
        {t.titulo}
        <TerminoLegal clave="kyc" idioma={idioma} />
      </h2>

      <ol aria-label={t.estadoDeTuVerificacion} className="flex flex-wrap gap-2 text-sm">
        {ETAPAS.map((e, i) => {
          const esActual = i === actual;
          return (
            <li
              key={e.estado}
              aria-current={esActual ? "step" : undefined}
              className={`rounded-full px-3 py-1 ${
                esActual
                  ? "border-2 border-solid border-deep bg-green-soft font-semibold text-deep"
                  : "border border-dashed border-muted text-muted"
              }`}
            >
              {esActual ? "● " : "○ "}
              {i + 1}. {t.etapas[e.clave]}
              {esActual && t.estasAca}
            </li>
          );
        })}
      </ol>

      {kyc.estado === "aprobado" ? (
        <div className="grid gap-1">
          <p className="font-medium">{t.verificadaEl(fechaLarga(kyc.aprobado, idioma))}</p>
          {datos.residencia === "exterior" ? (
            <p className="text-sm">
              {t.exterior}
              <TerminoLegal clave="inversorexterior" idioma={idioma} />
            </p>
          ) : datos.residencia === "argentina" ? (
            <p className="text-sm">{t.habilitado}</p>
          ) : (
            <p className="text-sm">{t.sinResidencia}</p>
          )}
        </div>
      ) : (
        <>
          <p>{t.loPide}</p>
          <p className="text-sm text-muted">{t.noHaceFalta}</p>
          {kyc.estado === "en-tramite" ? (
            <div className="grid gap-3">
              <p className="font-medium">{t.enviasteEl(fechaLarga(kyc.enviado, idioma))}</p>
              <button type="button" data-foco-kyc className={BOTON_PRIMARIO} onClick={alAprobar}>
                {t.simularAprobada}
              </button>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium">{t.quePide}</p>
                <ol className="list-decimal pl-5 text-sm">
                  {pasaporte.kyc.pasos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </div>
              <button ref={botonRef} type="button" className={BOTON_PRIMARIO} onClick={alCompletar}>
                {t.completar}
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
