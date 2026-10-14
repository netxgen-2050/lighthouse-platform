"use client";

import { useEffect, useRef, useState } from "react";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { esCodigoValido, normalizarCodigo } from "@/lib/congreso/ticket";

import { CLAVES } from "@/lib/demo/claves";

// Dos apariencias con la misma lógica y los mismos textos: la de NetX (la de siempre) y la del tema del evento.
const CLASES = {
  netx: {
    seccion: "grid grid-cols-1 content-start gap-3 rounded-xl border border-faint bg-surface p-4",
    titulo: "text-xl font-semibold",
    demo: "rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink",
    error: "text-sm font-medium text-danger",
    quitar:
      "w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep",
    etiqueta: "text-sm text-muted",
    campo: "min-w-0 flex-1 rounded-lg border border-muted bg-surface px-3 py-1.5",
    registrar:
      "rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep",
    nota: "text-sm text-muted",
    estado: "rounded-lg border border-faint p-3 text-sm",
    mensaje: "outline-none",
  },
  evento: {
    seccion: "ev-ticket",
    titulo: "ev-ticket-titulo",
    demo: "ev-ticket-demo",
    error: "ev-ticket-error",
    quitar: "ev-boton ev-boton-linea-clara ev-boton-chico",
    etiqueta: "ev-ticket-etiqueta",
    campo: "ev-ticket-campo",
    registrar: "ev-boton ev-boton-corona",
    nota: "ev-ticket-nota",
    estado: "ev-ticket-estado",
    mensaje: "ev-ticket-mensaje",
  },
} as const;

type Props = {
  /** "evento" usa el estilo del tema del Congreso y baja el título a h3; "netx" (por defecto) se ve como siempre. */
  apariencia?: "netx" | "evento";
  /** Se llama al leer el almacenamiento al cargar, al registrar y al quitar (con el código o null). */
  alCambiar?: (ticket: string | null) => void;
};

export function RegistroTicket({ apariencia = "netx", alCambiar }: Props = {}) {
  const c = CLASES[apariencia];
  const Titulo = apariencia === "evento" ? "h3" : "h2";
  const [listo, setListo] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const mensajeRef = useRef<HTMLParagraphElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const moverFoco = useRef<"mensaje" | "campo" | null>(null);
  const alCambiarRef = useRef(alCambiar);
  alCambiarRef.current = alCambiar;

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    let leido: string | null = null;
    try {
      const guardado = window.localStorage.getItem(CLAVES.congreso);
      if (guardado && esCodigoValido(guardado)) leido = normalizarCodigo(guardado);
    } catch {
      setFalloAlmacen(true);
    }
    setTicket(leido);
    alCambiarRef.current?.(leido);
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
      window.localStorage.setItem(CLAVES.congreso, codigo);
    } catch {
      setFalloAlmacen(true);
      return;
    }
    setFalloAlmacen(false);
    registrarEvento(EVENTOS.registrasteTicket());
    moverFoco.current = "mensaje";
    setTicket(codigo);
    alCambiarRef.current?.(codigo);
    setError(false);
    setTexto("");
  }

  function quitar() {
    try {
      window.localStorage.removeItem(CLAVES.congreso);
    } catch {
      setFalloAlmacen(true);
      return;
    }
    moverFoco.current = "campo";
    setTicket(null);
    alCambiarRef.current?.(null);
  }

  return (
    <section aria-labelledby="tu-ticket" className={c.seccion}>
      <Titulo id="tu-ticket" className={c.titulo}>
        Tu ticket
      </Titulo>
      <p className={c.demo}>Modo demostración: el registro queda solo en este navegador.</p>
      {falloAlmacen && (
        <p role="alert" className={c.error}>
          Error: tu navegador no permite guardar datos en este sitio, así que el ticket no se puede registrar ni quitar acá. Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      )}
      {!listo ? null : ticket ? (
        <div className="grid gap-3" role="status">
          <p ref={mensajeRef} tabIndex={-1} className={c.mensaje}>
            <span aria-hidden="true">✓ </span>
            <b>Ticket {ticket} registrado</b>
          </p>
          <p className={c.estado}>
            <b>Genesis pendiente</b>: se confirma cuando el anfitrión escanea tu ticket en el territorio
          </p>
          <button type="button" onClick={quitar} className={c.quitar}>
            Quitar ticket
          </button>
        </div>
      ) : (
        <form onSubmit={registrar} noValidate className="grid grid-cols-1 gap-2">
          <label htmlFor="codigo-ticket" className={c.etiqueta}>
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
              className={c.campo}
            />
            <button type="submit" className={c.registrar}>
              Registrar
            </button>
          </div>
          {error && (
            <p id="error-ticket" role="alert" className={c.error}>
              Error: el código no tiene el formato LH27-XXXX-XX (letras y números).
            </p>
          )}
          <p className={c.nota}>¿Todavía no tenés ticket? Lo vende el organizador del Congreso.</p>
        </form>
      )}
    </section>
  );
}
