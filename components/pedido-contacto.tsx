"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { TerminoLegal } from "@/components/termino-legal";
import { CANALES, crearPedido, MAX_MENSAJE, MOMENTOS, validar } from "@/lib/contactos/pedidos";
import type { Canal, Errores, Momento, Motivo, Pedido } from "@/lib/contactos/tipos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { origenDelNavegador } from "@/lib/origen/origen";

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
  const idioma = useIdioma();
  const t = useTextos("sumarte").pedido;
  const comunes = useTextos("comunes");
  const [canal, setCanal] = useState<Canal | "">("");
  const [momento, setMomento] = useState<Momento | "">("");
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [falloGuardar, setFalloGuardar] = useState(false);
  const [recibido, setRecibido] = useState(false);
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
    const nuevos = validar({ canal, mensaje }, idioma);
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
      { motivo, referencia, canal, momento, mensaje, estadoMostrado, origen: origenDelNavegador() },
      new Date(),
      idPedido.current,
    );
    const resultado = alEnviar(pedido);
    if (resultado !== true) {
      setFalloGuardar(resultado === false);
      return;
    }
    setFalloGuardar(false);
    setRecibido(true);
  }

  function cancelar() {
    alCancelar();
    document.getElementById(idBoton)?.focus();
  }

  return (
    <div className="grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
      <p ref={titulo} tabIndex={-1} id={`${id}-titulo`} className="font-semibold focus-visible:outline-2 focus-visible:outline-deep">
        {t.motivos[motivo].etiqueta} · {referencia}
        <TerminoLegal clave="contacto" idioma={idioma} />
      </p>
      <p ref={confirmacion} role="status" tabIndex={-1} className={recibido ? "font-medium" : "sr-only"}>
        {recibido ? t.recibido(t.motivos[motivo].destino) : ""}
      </p>
      {!recibido && (
        <form onSubmit={enviar} noValidate className="grid gap-3">
          {aviso}
          <p className="text-sm text-muted">{t.prototipo}</p>

          <fieldset role="radiogroup" aria-invalid={errores.canal ? true : undefined} className="grid gap-1">
            <legend className="font-medium">{t.comoContactar}</legend>
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
                  {t.canales[c]}
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
              {t.mejorMomento}
            </label>
            <select
              id={`${id}-momento`}
              value={momento}
              onChange={(e) => setMomento(e.target.value as Momento | "")}
              className={`${CAMPO} sm:w-fit`}
            >
              <option value="">{t.sinPreferencia}</option>
              {(Object.keys(MOMENTOS) as Momento[]).map((m) => (
                <option key={m} value={m}>
                  {t.momentos[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor={`${id}-mensaje`} className="font-medium">
              {t.mensaje}
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
              {t.noDatosPersonales(mensaje.length, MAX_MENSAJE)}
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
              {t.errorGuardar}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}>
              {t.enviar}
            </button>
            <button type="button" onClick={cancelar} className={`${BOTON} border border-muted hover:bg-surface`}>
              {comunes.cancelar}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
