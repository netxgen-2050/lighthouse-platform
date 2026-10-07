"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { cargar, reducir } from "@/lib/compromisos/estado";
import { describirCompromiso, TEXTO_CLASE, TEXTO_LIGHTHOUSE, TEXTO_TIPO } from "@/lib/compromisos/formato";
import {
  MAX_BIENES,
  MAX_DESCRIPCION,
  PARA_LIGHTHOUSE,
  type Borrador,
  type ClaseCompromiso,
  type TipoCompromiso,
} from "@/lib/compromisos/tipos";
import { validarCompromiso, type CampoError } from "@/lib/compromisos/validar";

const CLAVE = "lighthouse.compromisos.v1";

const VACIO: Borrador = {
  tipo: "ofrezco",
  clase: "tiempo",
  descripcion: "",
  horas: "",
  bienes: "",
  para: PARA_LIGHTHOUSE,
};

const campo =
  "mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-[invalid=true]:border-warn-ink";
const boton =
  "rounded-full px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function Formulario({ tribus }: { tribus: { id: string; nombre: string }[] }) {
  const [lista, despachar] = useReducer(reducir, []);
  const [cargado, setCargado] = useState(false);
  const [b, setB] = useState<Borrador>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<CampoError, string>>>({});
  const [aviso, setAviso] = useState("");
  const refs = useRef<Partial<Record<CampoError, HTMLInputElement | null>>>({});

  useEffect(() => {
    let guardado: string | null = null;
    try {
      guardado = window.localStorage.getItem(CLAVE);
    } catch {
      guardado = null;
    }
    // Leer el almacenamiento del navegador solo puede hacerse tras montar.
    despachar({ tipo: "cargar", compromisos: cargar(guardado) });
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch {
      // Sin almacenamiento: la lista vive solo mientras la página esté abierta.
    }
  }, [lista, cargado]);

  function cambiar<K extends keyof Borrador>(k: K, v: Borrador[K]) {
    setB((x) => ({ ...x, [k]: v }));
  }

  function cambiarClase(clase: ClaseCompromiso) {
    // Al cambiar de clase se limpia la cantidad anterior para no mezclar unidades.
    setB((x) => ({ ...x, clase, horas: "", bienes: "" }));
    setErrores((e) => ({ ...e, horas: undefined, bienes: undefined }));
  }

  function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    const r = validarCompromiso(b);
    if (!r.ok) {
      setErrores(r.errores);
      setAviso("");
      const primero = (["descripcion", "horas", "bienes"] as CampoError[]).find((k) => r.errores[k]);
      if (primero) refs.current[primero]?.focus();
      return;
    }
    despachar({ tipo: "registrar", compromiso: r.compromiso });
    setErrores({});
    setB({ ...VACIO, tipo: b.tipo, clase: b.clase, para: b.para });
    // Se alterna un espacio final para que el lector anuncie cada registro aunque el texto sea el mismo.
    setAviso((a) => (a === "Compromiso registrado." ? "Compromiso registrado. " : "Compromiso registrado."));
  }

  const describe = (k: CampoError) => (errores[k] ? `err-${k}` : undefined);

  return (
    <div className="mt-6 grid gap-8">
      <form onSubmit={enviar} noValidate className="grid gap-5 rounded-xl border border-line bg-surface p-5">
        <fieldset className="grid gap-2">
          <legend className="font-medium">Tipo</legend>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(TEXTO_TIPO) as TipoCompromiso[]).map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input type="radio" name="tipo" value={t} checked={b.tipo === t} onChange={() => cambiar("tipo", t)} />
                {TEXTO_TIPO[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium">Clase</legend>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(TEXTO_CLASE) as ClaseCompromiso[]).map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input type="radio" name="clase" value={c} checked={b.clase === c} onChange={() => cambiarClase(c)} />
                {TEXTO_CLASE[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="descripcion" className="font-medium">
            Descripción <span className="font-normal text-muted">(hasta {MAX_DESCRIPCION} caracteres)</span>
          </label>
          <input
            id="descripcion"
            ref={(el) => {
              refs.current.descripcion = el;
            }}
            type="text"
            value={b.descripcion}
            onChange={(e) => cambiar("descripcion", e.target.value)}
            aria-invalid={errores.descripcion ? true : undefined}
            aria-describedby={describe("descripcion")}
            className={campo}
          />
          {errores.descripcion && (
            <p id="err-descripcion" className="mt-1 text-sm font-medium text-warn-ink">
              Error: {errores.descripcion}
            </p>
          )}
        </div>

        {b.clase === "tiempo" ? (
          <div>
            <label htmlFor="horas" className="font-medium">
              Horas por mes <span className="font-normal text-muted">(opcional, de 1 a 160)</span>
            </label>
            <input
              id="horas"
              ref={(el) => {
                refs.current.horas = el;
              }}
              type="text"
              inputMode="numeric"
              value={b.horas}
              onChange={(e) => cambiar("horas", e.target.value)}
              aria-invalid={errores.horas ? true : undefined}
              aria-describedby={describe("horas")}
              className={campo}
            />
            {errores.horas && (
              <p id="err-horas" className="mt-1 text-sm font-medium text-warn-ink">
                Error: {errores.horas}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="bienes" className="font-medium">
              Cantidad orientativa <span className="font-normal text-muted">(opcional, por ejemplo &quot;20 kg por mes&quot;)</span>
            </label>
            <input
              id="bienes"
              ref={(el) => {
                refs.current.bienes = el;
              }}
              type="text"
              value={b.bienes}
              onChange={(e) => cambiar("bienes", e.target.value)}
              aria-invalid={errores.bienes ? true : undefined}
              aria-describedby={describe("bienes")}
              className={campo}
            />
            {errores.bienes && (
              <p id="err-bienes" className="mt-1 text-sm font-medium text-warn-ink">
                Error: {errores.bienes}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">Hasta {MAX_BIENES} caracteres.</p>
          </div>
        )}

        <div>
          <label htmlFor="para" className="font-medium">Para quién</label>
          <select id="para" value={b.para} onChange={(e) => cambiar("para", e.target.value)} className={campo}>
            <option value={PARA_LIGHTHOUSE}>{TEXTO_LIGHTHOUSE}</option>
            {tribus.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button type="submit" className={`${boton} bg-deep text-on-deep hover:bg-deep-2`}>
            Registrar
          </button>
        </div>
      </form>

      <p role="status" aria-live="polite" className="text-sm font-medium">
        {aviso}
      </p>

      <section aria-labelledby="titulo-lista" className="-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-lista" className="text-xl font-semibold">Tus compromisos</h2>
          {lista.length > 0 && (
            <button
              type="button"
              onClick={() => {
                despachar({ tipo: "borrarTodo" });
                setAviso("");
              }}
              className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
            >
              Borrar todo
            </button>
          )}
        </div>
        {!cargado ? null : lista.length === 0 ? (
          <p className="mt-3 text-muted">Todavía no registraste compromisos.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {lista.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <span>{describirCompromiso(c, tribus)}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${c.descripcion}`}
                  onClick={() => {
                    despachar({ tipo: "quitar", id: c.id });
                    setAviso("");
                  }}
                  className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
