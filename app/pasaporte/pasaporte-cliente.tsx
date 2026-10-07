"use client";

import { useEffect, useMemo, useState } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { caminos, TEXTO_ESTADO, type EstadoCamino } from "@/lib/pasaporte/caminos";
import { DATOS_VACIOS, leerDatos, type DatosPersona } from "@/lib/pasaporte/datos";
import { CLAVES } from "@/lib/demo/claves";
import { EMISION } from "@/lib/sumarte/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni KYC real.
const CLAVE = CLAVES.pasaporte;

const CAMPO =
  "mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const TARJETA = "grid content-start gap-4 rounded-xl border border-faint bg-surface p-5";

const ICONO: Record<EstadoCamino, string> = { abierto: "✓", no: "!", condiciones: "~", completar: "?" };
const ETIQUETA: Record<EstadoCamino, string> = {
  abierto: "border-deep bg-green-soft text-deep",
  no: "border-warn-ink bg-warn-bg text-warn-ink",
  condiciones: "border-gold-ink bg-gold-soft text-gold-ink",
  completar: "border-muted bg-surface-2 text-muted",
};

function Opcion<T extends string>({
  nombre,
  valor,
  actual,
  etiqueta,
  alElegir,
}: {
  nombre: string;
  valor: T;
  actual: T | undefined;
  etiqueta: string;
  alElegir: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="radio" name={nombre} checked={actual === valor} onChange={() => alElegir(valor)} />
      {etiqueta}
    </label>
  );
}

export function PasaporteCliente() {
  const [datos, setDatos] = useState<DatosPersona>(DATOS_VACIOS);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setDatos(leerDatos(window.localStorage.getItem(CLAVE)));
    } catch {
      setFalloAlmacen(true);
    }
  }, []);

  function cambiar(parcial: Partial<DatosPersona>) {
    const siguiente = { ...datos, ...parcial };
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    setDatos(siguiente);
  }

  const lista = useMemo(() => caminos(datos, EMISION), [datos]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="titulo-datos" className={TARJETA}>
        <h2 id="titulo-datos" className="text-xl font-semibold">
          Tus datos
        </h2>
        <p className="text-sm text-muted">
          Simulado: no se verifica nada y lo que cargues queda solo en este navegador.
        </p>

        <fieldset className="grid gap-2">
          <legend className="font-medium">Nacionalidad</legend>
          <div className="flex flex-wrap gap-4">
            <Opcion nombre="nacionalidad" valor="argentina" actual={datos.nacionalidad} etiqueta="Argentina" alElegir={(v) => cambiar({ nacionalidad: v })} />
            <Opcion nombre="nacionalidad" valor="otra" actual={datos.nacionalidad} etiqueta="Otra" alElegir={(v) => cambiar({ nacionalidad: v })} />
          </div>
          {datos.nacionalidad === "otra" && (
            <div>
              <label htmlFor="pais-nacionalidad" className="text-sm">País de nacionalidad</label>
              <input
                id="pais-nacionalidad"
                type="text"
                maxLength={120}
                className={CAMPO}
                value={datos.paisNacionalidad ?? ""}
                onChange={(e) => cambiar({ paisNacionalidad: e.target.value || undefined })}
              />
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium">
            Residencia fiscal<TerminoLegal clave="hacienda" />
          </legend>
          <div className="flex flex-wrap gap-4">
            <Opcion nombre="residencia" valor="argentina" actual={datos.residencia} etiqueta="Argentina" alElegir={(v) => cambiar({ residencia: v })} />
            <Opcion nombre="residencia" valor="exterior" actual={datos.residencia} etiqueta="Exterior" alElegir={(v) => cambiar({ residencia: v })} />
          </div>
          {datos.residencia === "exterior" && (
            <div>
              <label htmlFor="pais-residencia" className="text-sm">País de residencia fiscal</label>
              <input
                id="pais-residencia"
                type="text"
                maxLength={120}
                className={CAMPO}
                value={datos.paisResidencia ?? ""}
                onChange={(e) => cambiar({ paisResidencia: e.target.value || undefined })}
              />
            </div>
          )}
        </fieldset>

        <div>
          <label htmlFor="origen-fondos" className="font-medium">Origen de fondos</label>
          <input
            id="origen-fondos"
            type="text"
            maxLength={120}
            className={CAMPO}
            value={datos.origenFondos ?? ""}
            onChange={(e) => cambiar({ origenFondos: e.target.value || undefined })}
          />
        </div>

        <fieldset className="grid gap-2">
          <legend className="font-medium">
            Tipo de inversor<TerminoLegal clave="calificado" />
          </legend>
          <div className="flex flex-wrap gap-4">
            <Opcion nombre="inversor" valor="no-calificado" actual={datos.inversor} etiqueta="No calificado" alElegir={(v) => cambiar({ inversor: v })} />
            <Opcion nombre="inversor" valor="calificado" actual={datos.inversor} etiqueta="Calificado" alElegir={(v) => cambiar({ inversor: v })} />
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium">Modalidad de aporte</legend>
          <div className="flex flex-wrap gap-4">
            <Opcion nombre="modalidad" valor="obra" actual={datos.modalidad} etiqueta="Obra presencial" alElegir={(v) => cambiar({ modalidad: v })} />
            <Opcion nombre="modalidad" valor="remoto" actual={datos.modalidad} etiqueta="Remoto" alElegir={(v) => cambiar({ modalidad: v })} />
          </div>
        </fieldset>

        {datos.modalidad === "obra" && (
          <div>
            <label htmlFor="horas" className="font-medium">Horas por mes</label>
            <input
              id="horas"
              type="number"
              min={0}
              max={744}
              className={CAMPO}
              value={datos.horas ?? ""}
              onChange={(e) => {
                const n = e.target.value === "" ? undefined : Number(e.target.value);
                cambiar({ horas: n !== undefined && Number.isFinite(n) && n >= 0 && n <= 744 ? Math.round(n) : undefined });
              }}
            />
          </div>
        )}

        {falloAlmacen && (
          <p role="alert" className="text-sm font-medium text-warn-ink">
            No pudimos guardar tus datos en este navegador. Se ven ahora, pero se pierden al recargar.
          </p>
        )}
        <p className="text-sm text-muted">
          Estos datos los custodiaría el fiduciario. La plataforma guardaría qué se te mostró y cuándo.
        </p>
      </section>

      <section aria-labelledby="titulo-caminos" className={TARJETA}>
        <h2 id="titulo-caminos" className="text-xl font-semibold">
          Tus caminos
        </h2>
        <ul className="grid gap-4" aria-live="polite">
          {lista.map((c) => (
            <li key={c.id} data-camino={c.id} className="grid gap-1">
              <p className="flex flex-wrap items-center gap-2">
                <span aria-hidden="true">{ICONO[c.estado]}</span>
                <strong>{c.titulo}</strong>
                {c.legalTitulo?.map((k) => <TerminoLegal key={k} clave={k} />)}
                <span className={`rounded-full border px-2 py-0.5 text-sm font-medium ${ETIQUETA[c.estado]}`}>
                  {TEXTO_ESTADO[c.estado]}
                </span>
              </p>
              <p className="text-sm">
                {c.texto}
                {c.legalTexto?.map((k) => <TerminoLegal key={k} clave={k} />)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
