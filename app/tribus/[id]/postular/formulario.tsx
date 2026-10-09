"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { TerminoLegal } from "@/components/termino-legal";
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
  etiqueta: string;
  obligatorio?: boolean;
  tipo?: "texto" | "numero" | "largo" | "forma";
  ayuda?: string;
};

type Grupo = { titulo: string; legal?: "personeria" | "ritual"; campos: Def[] };

// Las ocho preguntas de ejemplo, en el orden de la spec.
const GRUPOS: Grupo[] = [
  {
    titulo: "1. Quién postula",
    campos: [
      { campo: "nombreComunidad", etiqueta: "Nombre de la comunidad", obligatorio: true },
      { campo: "lider", etiqueta: "Persona que lidera la postulación", obligatorio: true },
      {
        campo: "contacto",
        etiqueta: "Contacto de esa persona",
        obligatorio: true,
        ayuda: "Ejemplo del prototipo: no escribas datos reales; queda solo en este navegador.",
      },
    ],
  },
  {
    titulo: "2. Quiénes son",
    campos: [
      { campo: "personas", etiqueta: "Cantidad de personas", obligatorio: true, tipo: "numero" },
      { campo: "hogares", etiqueta: "Cantidad de hogares", obligatorio: true, tipo: "numero" },
      { campo: "desdeCuando", etiqueta: "Desde cuándo se conocen o trabajan juntos", ayuda: "Opcional." },
    ],
  },
  {
    titulo: "3. Qué aportan al barrio",
    campos: [
      { campo: "foco", etiqueta: "Qué van a producir o aportar en el barrio", obligatorio: true, tipo: "largo" },
      { campo: "rolesTienen", etiqueta: "Roles que ya tienen", tipo: "largo", ayuda: "Opcional." },
      { campo: "rolesBuscan", etiqueta: "Roles que buscan", tipo: "largo", ayuda: "Opcional." },
    ],
  },
  {
    titulo: "4. Pozo común",
    campos: [{ campo: "pozo", etiqueta: "Qué aportarían al pozo común del Lighthouse", obligatorio: true, tipo: "largo" }],
  },
  {
    titulo: "5. Forma jurídica",
    legal: "personeria",
    campos: [{ campo: "formaJuridica", etiqueta: "Forma jurídica actual o prevista", obligatorio: true, tipo: "forma" }],
  },
  {
    titulo: "6. Decisiones y entrada",
    legal: "ritual",
    campos: [
      { campo: "decisiones", etiqueta: "Cómo toman decisiones", obligatorio: true, tipo: "largo" },
      { campo: "ritual", etiqueta: "Cuál sería su ritual de entrada", obligatorio: true, tipo: "largo" },
    ],
  },
  {
    titulo: "7. Tierra y experiencia",
    campos: [
      {
        campo: "tierra",
        etiqueta: "Su relación con la regeneración de la tierra y experiencia previa en proyectos colectivos",
        tipo: "largo",
        ayuda: "Opcional.",
      },
    ],
  },
  {
    titulo: "8. Tiempo",
    campos: [
      {
        campo: "compromisoTiempo",
        etiqueta: "Compromiso inicial de tiempo de la comunidad durante la fase de formación",
        obligatorio: true,
        tipo: "largo",
      },
    ],
  },
];

// Orden en pantalla, para llevar el foco al primer error.
const ORDEN: CampoBorrador[] = GRUPOS.flatMap((g) => g.campos.map((c) => c.campo));

export function FormularioPostulacion({ tribuId, barrio }: { tribuId: string; barrio: number }) {
  const id = useId();
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
    const nuevos = validar(b);
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
    registrarEvento(EVENTOS.enviastePostulacion(b.nombreComunidad.trim() || "tu comunidad"));
    registrarEvento(EVENTOS.postulacionRecibida(p.id));
    setEnviada(true);
  }

  if (enviada) {
    return (
      <div className="mt-6 grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
        <p ref={confirmacion} role="status" tabIndex={-1} className="font-medium focus-visible:outline-2 focus-visible:outline-deep">
          Recibimos tu postulación (simulado). Un administrador del Lighthouse la va a revisar.
        </p>
        <a
          href={ENLACE_LLAMADA}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}
        >
          Agendar una llamada
          <span className="sr-only"> (enlace de ejemplo, se abre en otra pestaña)</span>
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
          {d.etiqueta}
          {d.obligatorio ? " (obligatorio)" : ""}
        </label>
        {d.tipo === "forma" ? (
          <select
            {...comunes}
            onChange={(e) => cambiar(d.campo, e.target.value as FormaJuridica | "")}
            className={`${CAMPO} sm:w-fit`}
          >
            <option value="">Elegí una</option>
            {(Object.keys(FORMAS_JURIDICAS) as FormaJuridica[]).map((f) => (
              <option key={f} value={f}>
                {FORMAS_JURIDICAS[f]}
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
            {d.ayuda}
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
    <form onSubmit={enviar} noValidate className="mt-6 grid gap-6" aria-label="Postulación de una comunidad">
      <p className="text-sm text-muted">
        Preguntas de ejemplo. Los textos pueden tener hasta {MAX_TEXTO} caracteres. En el prototipo la postulación queda solo
        en este navegador.
      </p>
      {GRUPOS.map((g) => (
        <fieldset key={g.titulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
          <legend className="px-1 text-lg font-semibold">
            {g.titulo}
            {g.legal && <TerminoLegal clave={g.legal} />}
          </legend>
          {g.campos.map(campoDe)}
        </fieldset>
      ))}

      {falloGuardar && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que la postulación no se pudo guardar.
        </p>
      )}

      <button type="submit" className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}>
        Enviar postulación (simulado)
      </button>
    </form>
  );
}
