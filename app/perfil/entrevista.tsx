"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { ESTADO_INICIAL, cantidadConfirmados, estaCompleta, leerGuardado, reducir } from "@/lib/perfil/estado";
import { CHATS } from "@/lib/perfil/preguntas";

const CLAVE = "lh-perfil-entrevista";
const BOTON =
  "rounded-lg border border-stone-600 px-3 py-1.5 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";
const BOTON_PRINCIPAL =
  "rounded-lg bg-emerald-800 px-4 py-1.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";

export function Entrevista() {
  const [estado, despachar] = useReducer(reducir, ESTADO_INICIAL);
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [errorEdicion, setErrorEdicion] = useState(false);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const moverFoco = useRef(false);

  const n = estado.items.length;
  const completa = estaCompleta(estado);
  const confirmados = cantidadConfirmados(estado);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const guardado = leerGuardado(window.localStorage.getItem(CLAVE));
      if (guardado.items.length > 0) despachar({ tipo: "cargar", estado: guardado });
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      if (estado.items.length === 0) window.localStorage.removeItem(CLAVE);
      else window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      setFalloAlmacen(true);
    }
  }, [estado, listo]);

  useEffect(() => {
    if (moverFoco.current) campoRef.current?.focus();
    moverFoco.current = false;
  }, [n]);

  function responder(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    moverFoco.current = true;
    despachar({ tipo: "responder", texto });
    setTexto("");
  }

  function empezarCorreccion(i: number) {
    setEditando(i);
    setTextoEdicion(estado.items[i].confirmado ?? estado.items[i].propuesta);
    setErrorEdicion(false);
  }

  function confirmarCorreccion(e: React.FormEvent, i: number) {
    e.preventDefault();
    if (textoEdicion.trim() === "") {
      setErrorEdicion(true);
      return;
    }
    despachar({ tipo: "corregir", indice: i, texto: textoEdicion });
    setEditando(null);
  }

  function borrar() {
    despachar({ tipo: "borrar" });
    setTexto("");
    setError(false);
    setEditando(null);
    moverFoco.current = true;
  }

  if (!listo) return <p className="text-stone-700">Cargando…</p>;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <section aria-labelledby="conversacion" className="grid content-start gap-3 rounded-xl border border-stone-400 p-4">
        <h2 id="conversacion" className="text-xl font-semibold">Conversación</h2>
        <div aria-live="polite" className="grid gap-3">
          {estado.items.map((item, i) => (
            <div key={i} className="grid gap-2">
              <p className="rounded-lg bg-stone-100 px-3 py-2">
                <span className="block text-xs font-medium text-stone-700">Agente NetX</span>
                {CHATS[i].texto}
              </p>
              <p className="justify-self-end rounded-lg border border-emerald-800 px-3 py-2">
                <span className="block text-xs font-medium text-stone-700">Vos</span>
                {item.respuesta}
              </p>
            </div>
          ))}
          {completa ? (
            <p className="rounded-lg bg-stone-100 px-3 py-2">
              <span className="block text-xs font-medium text-stone-700">Agente NetX</span>
              ¡Gracias! Terminamos la entrevista. Podés revisar tu perfil a la derecha.
            </p>
          ) : (
            <p className="rounded-lg bg-stone-100 px-3 py-2">
              <span className="block text-xs font-medium text-stone-700">
                Agente NetX · pregunta {n + 1} de {CHATS.length}
              </span>
              {CHATS[n].texto}
            </p>
          )}
        </div>
        {completa ? (
          <Link className={`${BOTON_PRINCIPAL} w-fit`} href="/tribus">Ver las tribus</Link>
        ) : (
          <form onSubmit={responder} noValidate className="grid gap-2">
            <label htmlFor="respuesta" className="text-sm text-stone-700">Tu respuesta</label>
            <textarea
              id="respuesta"
              ref={campoRef}
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-invalid={error}
              aria-describedby={error ? "error-respuesta" : undefined}
              className="rounded-lg border border-stone-600 px-3 py-1.5"
            />
            {error && (
              <p id="error-respuesta" role="alert" className="text-sm font-medium text-red-800">
                Error: escribí una respuesta para seguir.
              </p>
            )}
            <button type="submit" className={`${BOTON_PRINCIPAL} w-fit`}>Responder</button>
          </form>
        )}
      </section>

      <aside aria-labelledby="tu-perfil" className="grid content-start gap-3 rounded-xl border border-stone-400 p-4">
        <div className="flex items-baseline justify-between">
          <h2 id="tu-perfil" className="text-xl font-semibold">Tu perfil</h2>
          <span className="text-sm text-stone-700" data-testid="avance">
            {confirmados}/{CHATS.length} confirmados
          </span>
        </div>
        <progress className="w-full" max={CHATS.length} value={confirmados} aria-label="Datos confirmados" />
        <p className="rounded-lg border border-dashed border-stone-500 bg-amber-50 px-3 py-2 text-sm text-stone-800">
          Tus respuestas quedan solo en este navegador.
        </p>
        {falloAlmacen && (
          <p role="alert" className="text-sm font-medium text-red-800">
            Error: tu navegador no permite guardar datos en este sitio, así que tus respuestas se pierden al recargar.
          </p>
        )}
        {n === 0 && <p className="text-sm text-stone-700">Los datos aparecen acá a medida que conversan.</p>}
        <ul className="grid gap-3">
          {estado.items.map((item, i) => (
            <li key={i} className="grid gap-1 rounded-lg border border-stone-400 p-3">
              <span className="text-sm font-medium text-stone-700">{CHATS[i].etiqueta}</span>
              {editando === i ? (
                <form onSubmit={(e) => confirmarCorreccion(e, i)} noValidate className="grid gap-2">
                  <label htmlFor={`corregir-${i}`} className="text-sm">
                    Corregir: {CHATS[i].etiqueta}
                  </label>
                  <input
                    id={`corregir-${i}`}
                    value={textoEdicion}
                    onChange={(e) => setTextoEdicion(e.target.value)}
                    aria-invalid={errorEdicion}
                    aria-describedby={errorEdicion ? `error-corregir-${i}` : undefined}
                    autoFocus
                    className="rounded-lg border border-stone-600 px-3 py-1.5"
                  />
                  {errorEdicion && (
                    <p id={`error-corregir-${i}`} role="alert" className="text-sm font-medium text-red-800">
                      Error: el dato no puede quedar vacío.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" className={BOTON_PRINCIPAL}>Confirmar corrección</button>
                    <button type="button" className={BOTON} onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <span>{item.confirmado ?? item.propuesta}</span>
                  {item.confirmado !== null ? (
                    <span className="text-sm font-medium"><span aria-hidden="true">✓ </span>Confirmado</span>
                  ) : (
                    <span className="text-sm text-stone-700">Propuesto: falta que lo confirmes</span>
                  )}
                  <div className="flex gap-2">
                    {item.confirmado === null && (
                      <button
                        type="button"
                        className={BOTON}
                        aria-label={`Confirmar: ${CHATS[i].etiqueta}`}
                        onClick={() => despachar({ tipo: "confirmar", indice: i })}
                      >
                        Confirmar
                      </button>
                    )}
                    <button
                      type="button"
                      className={BOTON}
                      aria-label={`Corregir: ${CHATS[i].etiqueta}`}
                      onClick={() => empezarCorreccion(i)}
                    >
                      Corregir
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className={`${BOTON} w-fit`} onClick={borrar}>Borrar mis respuestas</button>
      </aside>
    </div>
  );
}
