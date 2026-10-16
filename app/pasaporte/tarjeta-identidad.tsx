"use client";

import { useEffect, useRef, type Ref } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import type { DatosPersona } from "@/lib/pasaporte/datos";
import { fechaLarga, PASOS_KYC, type EstadoKyc } from "@/lib/pasaporte/kyc";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;

const ETAPAS = [
  { estado: "sin-tramite", texto: "Sin empezar" },
  { estado: "en-tramite", texto: "En trámite" },
  { estado: "aprobado", texto: "Verificada" },
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
        Verificá tu identidad (KYC)
        <TerminoLegal clave="kyc" />
      </h2>

      <ol aria-label="Estado de tu verificación" className="flex flex-wrap gap-2 text-sm">
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
              {i + 1}. {e.texto}
              {esActual && " (estás acá)"}
            </li>
          );
        })}
      </ol>

      {kyc.estado === "aprobado" ? (
        <div className="grid gap-1">
          <p className="font-medium">Identidad verificada el {fechaLarga(kyc.aprobado)} (simulado)</p>
          {datos.residencia === "exterior" ? (
            <p className="text-sm">
              Por ahora no quedás habilitado/a como inversor/a: tu residencia fiscal es del exterior.
              <TerminoLegal clave="inversorexterior" />
            </p>
          ) : datos.residencia === "argentina" ? (
            <p className="text-sm">Quedaste habilitado/a como inversor/a (simulado).</p>
          ) : (
            <p className="text-sm">Sin dato de tu residencia fiscal: no podemos decir si quedás habilitado/a como inversor/a.</p>
          )}
        </div>
      ) : (
        <>
          <p>
            Lo pide el fiduciario antes de que aportes plata: para pedir la invitación al proyecto del Lote 7 o registrar un
            aporte en plata en Pactos.
          </p>
          <p className="text-sm text-muted">No hace falta para recorrer, sumarte a una tribu ni proponer pactos de tiempo.</p>
          {kyc.estado === "en-tramite" ? (
            <div className="grid gap-3">
              <p className="font-medium">Enviaste tus datos el {fechaLarga(kyc.enviado)}</p>
              <button type="button" data-foco-kyc className={BOTON_PRIMARIO} onClick={alAprobar}>
                Simular: verificación aprobada
              </button>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium">Qué se te va a pedir</p>
                <ol className="list-decimal pl-5 text-sm">
                  {PASOS_KYC.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </div>
              <button ref={botonRef} type="button" className={BOTON_PRIMARIO} onClick={alCompletar}>
                Completar mi verificación (KYC)
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
