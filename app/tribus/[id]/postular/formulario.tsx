"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { guardarPostulacion } from "@/lib/postulaciones/almacen";
import {
  BORRADOR_VACIO,
  ENLACE_LLAMADA,
  FORMAS_JURIDICAS,
  MAX_TEXTO,
  crearPostulacion,
  validar,
} from "@/lib/postulaciones/postulaciones";
import type { Borrador, CampoBorrador, Errores, FormaJuridica } from "@/lib/postulaciones/tipos";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CAMPO =
  "w-full rounded-lg border border-muted bg-surface p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Def = {
  campo: CampoBorrador;
  obligatorio?: boolean;
  tipo?: "texto" | "numero" | "largo" | "forma";
  /** `true`: "Opcional."; `"contacto"`: la ayuda propia del contacto. */
  ayuda?: "opcional" | "contacto";
};

type GrupoId = "quien" | "quienes" | "aportan" | "pozo" | "forma" | "decisiones" | "tierra" | "tiempo";
type Grupo = { id: GrupoId; legal?: "personeria" | "ritual"; campos: Def[] };

// Las ocho preguntas de ejemplo, en el orden de la spec. Los textos están en el diccionario `tribus`.
const GRUPOS: Grupo[] = [
  {
    id: "quien",
    campos: [
      { campo: "nombreComunidad", obligatorio: true },
      { campo: "lider", obligatorio: true },
      { campo: "contacto", obligatorio: true, ayuda: "contacto" },
    ],
  },
  {
    id: "quienes",
    campos: [
      { campo: "personas", obligatorio: true, tipo: "numero" },
      { campo: "hogares", obligatorio: true, tipo: "numero" },
      { campo: "desdeCuando", ayuda: "opcional" },
    ],
  },
  {
    id: "aportan",
    campos: [
      { campo: "foco", obligatorio: true, tipo: "largo" },
      { campo: "rolesTienen", tipo: "largo", ayuda: "opcional" },
      { campo: "rolesBuscan", tipo: "largo", ayuda: "opcional" },
    ],
  },
  { id: "pozo", campos: [{ campo: "pozo", obligatorio: true, tipo: "largo" }] },
  { id: "forma", legal: "personeria", campos: [{ campo: "formaJuridica", obligatorio: true, tipo: "forma" }] },
  {
    id: "decisiones",
    legal: "ritual",
    campos: [
      { campo: "decisiones", obligatorio: true, tipo: "largo" },
      { campo: "ritual", obligatorio: true, tipo: "largo" },
    ],
  },
  { id: "tierra", campos: [{ campo: "tierra", tipo: "largo", ayuda: "opcional" }] },
  { id: "tiempo", campos: [{ campo: "compromisoTiempo", obligatorio: true, tipo: "largo" }] },
];

// Orden en pantalla, para llevar el foco al primer error.
const ORDEN: CampoBorrador[] = GRUPOS.flatMap((g) => g.campos.map((c) => c.campo));

export function FormularioPostulacion({ tribuId, barrio }: { tribuId: string; barrio: number }) {
  const id = useId();
  const idioma = useIdioma();
  const t = useTextos("tribus").postulacion;
  const [b, setB] = useState<Borrador>(BORRADOR_VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [falloGuardar, setFalloGuardar] = useState(false);
  const [enviada, setEnviada] = useState(false);
  // Mismo id en cada reintento: la lista no suma un duplicado.
  const idPostulacion = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  const confirmacion = useRef<HTMLParagraphElement>(null);

  // Al enviar, el formulario desaparece: el foco pasa a la confirmación.
  useEffect(() => {
    if (enviada) confirmacion.current?.focus();
  }, [enviada]);

  function cambiar(campo: CampoBorrador, valor: string) {
    setB((antes) => ({ ...antes, [campo]: valor }));
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(b, idioma);
    setErrores(nuevos);
    const primero = ORDEN.find((c) => nuevos[c]);
    if (primero) {
      document.getElementById(`${id}-${primero}`)?.focus();
      return;
    }
    const p = crearPostulacion(b, { tribuId, barrio }, new Date(), idPostulacion.current);
    if (!guardarPostulacion(p)) {
      setFalloGuardar(true);
      return;
    }
    setFalloGuardar(false);
    registrarEvento(EVENTOS.enviastePostulacion(b.nombreComunidad.trim()));
    registrarEvento(EVENTOS.postulacionRecibida(p.id));
    setEnviada(true);
  }

  if (enviada) {
    return (
      <div className="mt-6 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
        <p ref={confirmacion} role="status" tabIndex={-1} className="font-medium focus-visible:outline-2 focus-visible:outline-deep">
          {t.recibida}
        </p>
        <a
          href={ENLACE_LLAMADA}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}
        >
          {t.agendar}
          <span className="sr-only">{t.agendarAviso}</span>
        </a>
      </div>
    );
  }

  function campoDe(d: Def) {
    const cid = `${id}-${d.campo}`;
    const err = errores[d.campo];
    const describe = `${d.ayuda ? `${cid}-ayuda ` : ""}${err ? `${cid}-error` : ""}`.trim() || undefined;
    const comunes = {
      id: cid,
      value: b[d.campo],
      "aria-invalid": err ? true : undefined,
      "aria-describedby": describe,
      "aria-required": d.obligatorio ? true : undefined,
      className: CAMPO,
    };
    return (
      <div key={d.campo} className="grid gap-1">
        <label htmlFor={cid} className="font-medium">
          {t.campos[d.campo]}
          {d.obligatorio ? t.obligatorio : ""}
        </label>
        {d.tipo === "forma" ? (
          <select
            {...comunes}
            onChange={(e) => cambiar(d.campo, e.target.value as FormaJuridica | "")}
            className={`${CAMPO} sm:w-fit`}
          >
            <option value="">{t.elegiUna}</option>
            {(Object.keys(FORMAS_JURIDICAS) as FormaJuridica[]).map((f) => (
              <option key={f} value={f}>
                {t.formas[f]}
              </option>
            ))}
          </select>
        ) : d.tipo === "largo" ? (
          <textarea {...comunes} rows={3} onChange={(e) => cambiar(d.campo, e.target.value)} />
        ) : (
          <input
            {...comunes}
            type="text"
            inputMode={d.tipo === "numero" ? "numeric" : undefined}
            onChange={(e) => cambiar(d.campo, e.target.value)}
            className={`${CAMPO} ${d.tipo === "numero" ? "sm:w-40" : ""}`}
          />
        )}
        {d.ayuda && (
          <p id={`${cid}-ayuda`} className="text-sm text-muted">
            {d.ayuda === "contacto" ? t.campos.contactoAyuda : t.opcional}
          </p>
        )}
        {err && (
          <p id={`${cid}-error`} className="text-sm font-medium text-danger">
            <span aria-hidden="true">▲ </span>
            {err}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-6 grid gap-6" aria-label={t.formulario}>
      <p className="text-sm text-muted">{t.nota(MAX_TEXTO)}</p>
      {GRUPOS.map((g) => (
        <fieldset key={g.id} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
          <legend className="px-1 text-lg font-semibold">
            {t.grupos[g.id]}
            {g.legal && <TerminoLegal clave={g.legal} />}
          </legend>
          {g.campos.map(campoDe)}
        </fieldset>
      ))}

      {falloGuardar && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.falloGuardar}
        </p>
      )}

      <button type="submit" className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}>
        {t.enviar}
      </button>
    </form>
  );
}
