"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { CANALES, crearPedido, MAX_MENSAJE, MOMENTOS, MOTIVOS, validar } from "@/lib/contactos/pedidos";
import type { Canal, Errores, Momento, Motivo, Pedido } from "@/lib/contactos/tipos";

type Props = {
  motivo: Motivo;
  referencia: string;
  /** Estado administrativo que se le muestra (solo en pedidos de lotes). */
  estadoMostrado?: string;
  /** Aviso a mostrar dentro del formulario (por ejemplo, el estado administrativo compacto). */
  aviso?: ReactNode;
  /** id del botón que abrió el formulario: el foco vuelve ahí al cancelar. */
  idBoton: string;
  /**
   * Guarda el pedido. true: listo. false: no se pudo guardar y el formulario avisa.
   * "avisado": no se completó, pero ya hay un aviso en la pantalla (no se repite).
   */
  alEnviar: (pedido: Pedido) => boolean | "avisado";
  alCancelar: () => void;
};

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CAMPO =
  "w-full rounded-lg border border-muted bg-surface p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function PedidoContacto({ motivo, referencia, estadoMostrado, aviso, idBoton, alEnviar, alCancelar }: Props) {
  const id = useId();
  const [canal, setCanal] = useState<Canal | "">("");
  const [momento, setMomento] = useState<Momento | "">("");
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [falloGuardar, setFalloGuardar] = useState(false);
  const [recibido, setRecibido] = useState<string | null>(null);
  // Mismo id en cada reintento de este formulario: la bandeja no suma un duplicado.
  const idPedido = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  const titulo = useRef<HTMLParagraphElement>(null);
  const primerCanal = useRef<HTMLInputElement>(null);
  const campoMensaje = useRef<HTMLTextAreaElement>(null);
  const confirmacion = useRef<HTMLParagraphElement>(null);

  // Al abrir, el foco va al título del formulario.
  useEffect(() => {
    titulo.current?.focus();
  }, []);

  // Al enviar, los campos desaparecen: el foco pasa a la confirmación.
  useEffect(() => {
    if (recibido) confirmacion.current?.focus();
  }, [recibido]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar({ canal, mensaje });
    setErrores(nuevos);
    if (nuevos.canal) {
      primerCanal.current?.focus();
      return;
    }
    if (nuevos.mensaje) {
      campoMensaje.current?.focus();
      return;
    }
    const pedido = crearPedido(
      { motivo, referencia, canal, momento, mensaje, estadoMostrado },
      new Date(),
      idPedido.current,
    );
    const resultado = alEnviar(pedido);
    if (resultado !== true) {
      setFalloGuardar(resultado === false);
      return;
    }
    setFalloGuardar(false);
    setRecibido(`Pedido recibido (simulado). Lo vería: ${pedido.destino}.`);
  }

  function cancelar() {
    alCancelar();
    document.getElementById(idBoton)?.focus();
  }

  return (
    <div className="grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
      <p ref={titulo} tabIndex={-1} id={`${id}-titulo`} className="font-semibold focus-visible:outline-2 focus-visible:outline-deep">
        {MOTIVOS[motivo].etiqueta} · {referencia}
        <TerminoLegal clave="contacto" />
      </p>
      <p ref={confirmacion} role="status" tabIndex={-1} className={recibido ? "font-medium" : "sr-only"}>
        {recibido}
      </p>
      {!recibido && (
        <form onSubmit={enviar} noValidate className="grid gap-3">
          {aviso}
          <p className="text-sm text-muted">
            En el prototipo no te pedimos email ni teléfono: el pedido queda solo en este navegador.
          </p>

          <fieldset role="radiogroup" aria-invalid={errores.canal ? true : undefined} className="grid gap-1">
            <legend className="font-medium">Cómo preferís que te contactemos</legend>
            <div className="flex flex-wrap gap-4">
              {(Object.keys(CANALES) as Canal[]).map((c, i) => (
                <label key={c} className="flex items-center gap-2">
                  <input
                    ref={i === 0 ? primerCanal : undefined}
                    type="radio"
                    name={`${id}-canal`}
                    value={c}
                    checked={canal === c}
                    onChange={() => setCanal(c)}
                    aria-describedby={errores.canal ? `${id}-error-canal` : undefined}
                    className="size-4 accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                  />
                  {CANALES[c]}
                </label>
              ))}
            </div>
            {errores.canal && (
              <p id={`${id}-error-canal`} className="text-sm font-medium text-danger">
                <span aria-hidden="true">▲ </span>
                {errores.canal}
              </p>
            )}
          </fieldset>

          <div className="grid gap-1">
            <label htmlFor={`${id}-momento`} className="font-medium">
              Mejor momento (opcional)
            </label>
            <select
              id={`${id}-momento`}
              value={momento}
              onChange={(e) => setMomento(e.target.value as Momento | "")}
              className={`${CAMPO} sm:w-fit`}
            >
              <option value="">Sin preferencia</option>
              {(Object.keys(MOMENTOS) as Momento[]).map((m) => (
                <option key={m} value={m}>
                  {MOMENTOS[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor={`${id}-mensaje`} className="font-medium">
              Mensaje (opcional)
            </label>
            <textarea
              ref={campoMensaje}
              id={`${id}-mensaje`}
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              aria-invalid={errores.mensaje ? true : undefined}
              aria-describedby={`${id}-ayuda-mensaje${errores.mensaje ? ` ${id}-error-mensaje` : ""}`}
              className={CAMPO}
            />
            <p id={`${id}-ayuda-mensaje`} className="text-sm text-muted">
              No escribas datos personales acá. {mensaje.length} de {MAX_MENSAJE} caracteres.
            </p>
            {errores.mensaje && (
              <p id={`${id}-error-mensaje`} className="text-sm font-medium text-danger">
                <span aria-hidden="true">▲ </span>
                {errores.mensaje}
              </p>
            )}
          </div>

          {falloGuardar && (
            <p role="alert" className="text-sm font-medium text-danger">
              Error: tu navegador no permite guardar datos en este sitio, así que el pedido no se pudo guardar.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}>
              Enviar pedido (simulado)
            </button>
            <button type="button" onClick={cancelar} className={`${BOTON} border border-muted hover:bg-surface`}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
