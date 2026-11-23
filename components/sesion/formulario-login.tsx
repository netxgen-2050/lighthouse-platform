"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { estadoDeExcepcion, mensajeDeError } from "@/lib/sesion/errores-login";
import { clienteNeonAuth } from "./neon-auth-cliente";

const CAMPO =
  "w-full max-w-sm rounded-lg border border-faint bg-surface px-3 py-1.5 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-disabled:opacity-60";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-faint hover:bg-surface-2`;
const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Props = {
  /** La sesión ya quedó abierta (código aceptado): el proveedor la vuelve a leer y cierra el paso. */
  alEntrar: () => void;
  alCancelar: () => void;
};

type Resultado = { error?: { status?: number } | null } | undefined;

/** Estado de una respuesta del cliente del SDK: sin error, `ok`; con error, su estado HTTP (o 0 si no hubo respuesta). */
function estadoDe(r: Resultado): number | null {
  if (!r?.error) return null;
  return typeof r.error.status === "number" ? r.error.status : 0;
}

/**
 * Login propio con Neon Auth (login-neon-auth): código por email y Google. Solo se monta dentro del paso de consentimiento,
 * después de aceptar: nada de lo que se escribe acá llega a Neon Auth antes. Paso 1: email; paso 2: el código.
 */
export function FormularioLogin({ alEntrar, alCancelar }: Props) {
  const id = useId();
  const refEmail = useRef<HTMLInputElement | null>(null);
  const refCodigo = useRef<HTMLInputElement | null>(null);
  const [paso, setPaso] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    // El foco va al campo del paso en que está; con un error, vuelve al campo que lo causó.
    (paso === "email" ? refEmail : refCodigo).current?.focus();
  }, [paso]);

  useEffect(() => {
    if (error) (paso === "email" ? refEmail : refCodigo).current?.focus();
  }, [error, paso]);

  /** Devuelve `true` solo si el código se pidió y Neon Auth lo aceptó. */
  async function pedirCodigo(ev?: FormEvent): Promise<boolean> {
    ev?.preventDefault();
    if (ocupado) return false;
    const limpio = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
      setError("Escribí un email válido, por ejemplo nombre@ejemplo.com.");
      return false;
    }
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      const r = (await clienteNeonAuth().emailOtp.sendVerificationOtp({ email: limpio, type: "sign-in" })) as Resultado;
      const estado = estadoDe(r);
      if (estado !== null) {
        setError(mensajeDeError(estado, "pedir"));
        return false;
      }
      setEmail(limpio);
      setCodigo("");
      setPaso("codigo");
      return true;
    } catch (e) {
      setError(mensajeDeError(estadoDeExcepcion(e), "pedir"));
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function entrarConCodigo(ev: FormEvent) {
    ev.preventDefault();
    if (ocupado) return;
    const limpio = codigo.trim();
    if (limpio === "") {
      setError("Escribí el código que te mandamos.");
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      const r = (await clienteNeonAuth().signIn.emailOtp({ email, otp: limpio })) as Resultado;
      const estado = estadoDe(r);
      if (estado !== null) {
        setError(mensajeDeError(estado, "entrar"));
        return;
      }
      alEntrar();
    } catch (e) {
      setError(mensajeDeError(estadoDeExcepcion(e), "entrar"));
    } finally {
      setOcupado(false);
    }
  }

  async function mandarOtro() {
    if (ocupado) return;
    // Solo se avisa si el pedido salió y Neon Auth lo aceptó.
    if (await pedirCodigo()) setAviso("Te mandamos otro código.");
  }

  async function conGoogle() {
    if (ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      // Vuelve a la misma página; la aceptación del paso queda en la pestaña (sessionStorage) y la toma el proveedor.
      const r = (await clienteNeonAuth().signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${window.location.pathname}${window.location.search}`,
      })) as Resultado;
      const estado = estadoDe(r);
      if (estado !== null) setError(mensajeDeError(estado, "pedir"));
    } catch (e) {
      setError(mensajeDeError(estadoDeExcepcion(e), "pedir"));
    } finally {
      setOcupado(false);
    }
  }

  const idError = `${id}-error`;

  return (
    <div data-testid="formulario-login">
      {paso === "email" ? (
        <form noValidate onSubmit={pedirCodigo} aria-label="Entrar con un código por email">
          <label htmlFor={`${id}-email`} className="block text-sm font-medium">
            Tu email
          </label>
          <input
            ref={refEmail}
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            className={`${CAMPO} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className={BOTON_PRIMARIO} aria-disabled={ocupado}>
              Mandame el código
            </button>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm text-muted">O entrá con tu cuenta de Google.</p>
            <button type="button" className={`${BOTON_SECUNDARIO} mt-2`} aria-disabled={ocupado} onClick={() => void conGoogle()}>
              Entrar con Google
            </button>
          </div>
        </form>
      ) : (
        <form noValidate onSubmit={entrarConCodigo} aria-label="Escribir el código">
          <p className="text-sm">
            Te mandamos un código a <strong>{email}</strong>. El mail puede llegar en inglés y con la marca de Neon: es el del proveedor del login.
          </p>
          <label htmlFor={`${id}-codigo`} className="mt-3 block text-sm font-medium">
            Código
          </label>
          <input
            ref={refCodigo}
            id={`${id}-codigo`}
            inputMode="numeric"
            autoComplete="one-time-code"
            className={`${CAMPO} mt-1`}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="submit" className={BOTON_PRIMARIO} aria-disabled={ocupado}>
              Entrar
            </button>
            <button type="button" className={BOTON_SECUNDARIO} aria-disabled={ocupado} onClick={() => void mandarOtro()}>
              Mandar otro código
            </button>
          </div>
          <p className="mt-3 text-sm">
            <button
              type="button"
              className={ENLACE}
              onClick={() => {
                setError(null);
                setAviso(null);
                setPaso("email");
              }}
            >
              Usar otro email
            </button>
          </p>
        </form>
      )}
      {aviso && !error && (
        <p role="status" className="mt-3 text-sm text-muted">
          {aviso}
        </p>
      )}
      {error && (
        <p id={idError} role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="mt-4">
        <button type="button" className={BOTON_SECUNDARIO} onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
