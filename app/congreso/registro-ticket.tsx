"use client";

import { useEffect, useRef, useState } from "react";
import { esCodigoValido, normalizarCodigo } from "@/lib/congreso/ticket";

const CLAVE = "lh-congreso-ticket";

export function RegistroTicket() {
  const [listo, setListo] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const mensajeRef = useRef<HTMLParagraphElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const moverFoco = useRef<"mensaje" | "campo" | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado && esCodigoValido(guardado)) setTicket(normalizarCodigo(guardado));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (moverFoco.current === "mensaje") mensajeRef.current?.focus();
    if (moverFoco.current === "campo") campoRef.current?.focus();
    moverFoco.current = null;
  }, [ticket]);

  function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!esCodigoValido(texto)) {
      setError(true);
      return;
    }
    const codigo = normalizarCodigo(texto);
    try {
      window.localStorage.setItem(CLAVE, codigo);
    } catch {
      setFalloAlmacen(true);
      return;
    }
    setFalloAlmacen(false);
    moverFoco.current = "mensaje";
    setTicket(codigo);
    setError(false);
    setTexto("");
  }

  function quitar() {
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      setFalloAlmacen(true);
      return;
    }
    moverFoco.current = "campo";
    setTicket(null);
  }

  return (
    <section aria-labelledby="tu-ticket" className="grid grid-cols-1 content-start gap-3 rounded-xl border border-faint bg-surface p-4">
      <h2 id="tu-ticket" className="text-xl font-semibold">Tu ticket</h2>
      <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Modo demostración: el registro queda solo en este navegador.
      </p>
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el ticket no se puede registrar ni quitar acá. Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      )}
      {!listo ? null : ticket ? (
        <div className="grid gap-3" role="status">
          <p ref={mensajeRef} tabIndex={-1} className="outline-none">
            <span aria-hidden="true">✓ </span>
            <b>Ticket {ticket} registrado</b>
          </p>
          <p className="rounded-lg border border-faint p-3 text-sm">
            <b>Genesis pendiente</b>: se confirma cuando el anfitrión escanea tu ticket en el territorio
          </p>
          <button
            type="button"
            onClick={quitar}
            className="w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            Quitar ticket
          </button>
        </div>
      ) : (
        <form onSubmit={registrar} noValidate className="grid grid-cols-1 gap-2">
          <label htmlFor="codigo-ticket" className="text-sm text-muted">
            Código de tu ticket (te llega por mail al comprarlo)
          </label>
          <div className="flex gap-2">
            <input
              id="codigo-ticket"
              ref={campoRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej.: LH27-8F3K-2Q"
              autoComplete="off"
              aria-invalid={error}
              aria-describedby={error ? "error-ticket" : undefined}
              className="min-w-0 flex-1 rounded-lg border border-muted bg-surface px-3 py-1.5"
            />
            <button
              type="submit"
              className="rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              Registrar
            </button>
          </div>
          {error && (
            <p id="error-ticket" role="alert" className="text-sm font-medium text-danger">
              Error: el código no tiene el formato LH27-XXXX-XX (letras y números).
            </p>
          )}
          <p className="text-sm text-muted">
            ¿Todavía no tenés ticket? Lo vende el organizador del Congreso.
          </p>
        </form>
      )}
    </section>
  );
}
