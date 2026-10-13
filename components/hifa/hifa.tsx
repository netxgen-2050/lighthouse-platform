"use client";

import { X } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { CLAVES } from "@/lib/demo/claves";
import { ATAJOS } from "@/lib/hifa/guion";
import {
  ESTADO_INICIAL,
  ETIQUETA_DEJARLO,
  ETIQUETA_NO,
  ETIQUETA_REINTENTAR,
  ETIQUETA_SI,
  MAX_MENSAJE,
  armarReporteHifa,
  idMensaje,
  leerGuardado,
  reducir,
  textoParaCopiarHifa,
} from "@/lib/hifa/estado";
import { armarContexto } from "@/lib/reportes/reporte";
import { useSesion } from "@/components/sesion/contexto";
import { EntrarPara } from "@/components/sesion/entrar-para";
import { TAMANO_FLOTANTE } from "@/lib/ui/flotantes";
import { AvatarHifa } from "./avatar-hifa";

const BOTON =
  "rounded-full border border-faint bg-surface px-3 py-1.5 text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";
const BOTON_PRINCIPAL =
  "rounded-full bg-deep px-4 py-1.5 text-sm font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";

export function Hifa({ version, entorno }: { version: string; entorno: string }) {
  const { cabeceras, estado: estadoSesion } = useSesion();
  const conSesion = estadoSesion === "ok";
  const { mostrarHifa } = usePreferencias();
  const [abierto, setAbierto] = useState(false);
  const [estado, despachar] = useReducer(reducir, ESTADO_INICIAL);
  const [listo, setListo] = useState(false);
  const [texto, setTexto] = useState("");
  const [copiado, setCopiado] = useState<"si" | "no" | null>(null);
  const disparador = useRef<HTMLButtonElement | null>(null);
  const campo = useRef<HTMLInputElement | null>(null);
  const registro = useRef<HTMLDivElement | null>(null);
  const ventana = useRef<HTMLElement | null>(null);
  const enCurso = useRef(false);

  const fase = estado.pendiente?.fase;

  useEffect(() => {
    // Sin sesión la conversación vive solo en la página: no se lee ni se guarda nada, y al salir se borra
    // para que la próxima persona de este navegador no vea la conversación de la anterior.
    if (!conSesion) {
      setListo(false);
      despachar({ tipo: "borrar" });
      return;
    }
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const guardado = leerGuardado(window.localStorage.getItem(CLAVES.hifa));
      if (guardado !== ESTADO_INICIAL) despachar({ tipo: "cargar", estado: guardado });
    } catch {
      // Sin almacenamiento la conversación dura mientras la página siga abierta.
    }
    setListo(true);
  }, [conSesion]);

  useEffect(() => {
    if (!listo) return;
    try {
      if (estado === ESTADO_INICIAL) window.localStorage.removeItem(CLAVES.hifa);
      else window.localStorage.setItem(CLAVES.hifa, JSON.stringify(estado));
    } catch {
      // Sin almacenamiento no se guarda; la conversación sigue funcionando.
    }
  }, [estado, listo]);

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  useEffect(() => {
    const r = registro.current;
    if (abierto && r) r.scrollTop = r.scrollHeight;
  }, [abierto, estado.total, fase]);

  // Escape cierra el chat esté donde esté el foco (también tras un clic en la página).
  useEffect(() => {
    if (!abierto) return;
    function alTeclear(ev: KeyboardEvent) {
      if (ev.key !== "Escape" || ev.defaultPrevented) return;
      // Si Escape es para otra capa (diálogo nativo como Reportar, o un tooltip visible), no se cierra Hifa.
      if (document.querySelector("dialog[open], [role='tooltip']")) return;
      const dentro = ventana.current?.contains(document.activeElement) ?? false;
      setAbierto(false);
      if (dentro) disparador.current?.focus();
    }
    // En captura, para mirar el tooltip antes de que el listener de Reportar lo descarte en el mismo evento.
    document.addEventListener("keydown", alTeclear, true);
    return () => document.removeEventListener("keydown", alTeclear, true);
  }, [abierto]);

  // Envío al equipo: se dispara cuando la persona aceptó (fase "enviando").
  useEffect(() => {
    const pendiente = estado.pendiente;
    if (pendiente?.fase !== "enviando" || enCurso.current) return;
    enCurso.current = true;
    const contexto = armarContexto({
      url: window.location.href,
      titulo: document.title,
      ancho: window.innerWidth,
      alto: window.innerHeight,
      navegador: navigator.userAgent,
      version,
      entorno,
    });
    cabeceras()
      .then((extra) =>
        fetch("/api/reportes", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...extra },
          body: JSON.stringify(armarReporteHifa(pendiente, contexto)),
        }),
      )
      .then(async (res) => {
        if (!res.ok) throw new Error("rechazado");
        const datos = (await res.json()) as { numero?: number };
        despachar({ tipo: "envio-ok", numero: typeof datos.numero === "number" ? datos.numero : 0 });
      })
      .catch(() => despachar({ tipo: "envio-fallo" }))
      .finally(() => {
        enCurso.current = false;
      });
  }, [estado.pendiente, version, entorno, cabeceras]);

  function cerrar() {
    setAbierto(false);
    disparador.current?.focus();
  }

  // El botón que se apretó desaparece y el campo puede quedar deshabilitado:
  // el foco pasa a la conversación para que el teclado siga dentro del chat.
  function decidir(enviar: boolean) {
    despachar({ tipo: "decidir", enviar });
    registro.current?.focus();
  }

  function enviarTexto(ev: React.FormEvent) {
    ev.preventDefault();
    if (texto.trim() === "") return;
    despachar({ tipo: "escribir", texto, azar: Math.random() });
    setTexto("");
    setCopiado(null);
  }

  async function copiar() {
    if (!estado.pendiente) return;
    try {
      await navigator.clipboard.writeText(textoParaCopiarHifa(estado.pendiente));
      setCopiado("si");
    } catch {
      setCopiado("no");
    }
  }

  function borrar() {
    despachar({ tipo: "borrar" });
    setCopiado(null);
    campo.current?.focus();
  }

  const ocupada = fase === "enviando";

  // Se apaga en Configuración. La conversación guardada se conserva para cuando vuelva a prenderse.
  // Hasta saber si hay sesión no se dibuja: así no hay destello con las preferencias de otra persona (el servidor no las conoce).
  if (estadoSesion === "cargando" || !mostrarHifa) return null;

  return (
    <div>
      <button
        ref={disparador}
        type="button"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        aria-label="Hablar con Hifa"
        aria-expanded={abierto}
        aria-controls="chat-hifa"
        className={`fixed bottom-4 right-4 z-40 grid ${TAMANO_FLOTANTE} place-items-center rounded-full border-2 border-deep bg-surface shadow-lg hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep`}
      >
        <AvatarHifa className="size-10" />
      </button>

      <section
        id="chat-hifa"
        ref={ventana}
        role="dialog"
        aria-label="Chat con Hifa"
        hidden={!abierto}
        className="fixed bottom-20 right-[4.75rem] z-50 flex max-h-[min(34rem,calc(100dvh-6rem))] w-[min(22rem,calc(100vw-8rem))] flex-col overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-lg"
      >
        <header className="flex items-center gap-2 border-b border-line bg-deep px-3 py-2 text-on-deep">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface">
            <AvatarHifa className="size-7" />
          </span>
          <h2 className="flex-1 font-display text-base font-semibold">Hifa</h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar el chat con Hifa"
            className="grid size-8 place-items-center rounded-full hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-deep"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div
          ref={registro}
          role="log"
          aria-label="Conversación con Hifa"
          tabIndex={0}
          className="flex-1 space-y-2 overflow-y-auto p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-deep"
        >
          {estado.mensajes.map((m, i) => (
            <p
              key={idMensaje(estado, i)}
              className={
                m.de === "hifa"
                  ? "max-w-[90%] rounded-lg bg-green-soft px-3 py-2"
                  : "ml-auto max-w-[90%] rounded-lg bg-surface-2 px-3 py-2"
              }
            >
              <span className="sr-only">{m.de === "hifa" ? "Hifa: " : "Vos: "}</span>
              {m.texto}
            </p>
          ))}
        </div>

        <div className="grid gap-2 border-t border-line p-3">
          {fase === "ofrecido" && (
            <div className="flex flex-wrap gap-2">
              {conSesion ? (
                <button type="button" className={BOTON_PRINCIPAL} onClick={() => decidir(true)}>
                  {ETIQUETA_SI}
                </button>
              ) : (
                <EntrarPara texto="Sumate para pasárselo al equipo" clase={BOTON_PRINCIPAL} />
              )}
              <button type="button" className={BOTON} onClick={() => decidir(false)}>
                {ETIQUETA_NO}
              </button>
            </div>
          )}
          {fase === "fallo" && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BOTON_PRINCIPAL} onClick={() => decidir(true)}>
                {ETIQUETA_REINTENTAR}
              </button>
              <button type="button" className={BOTON} onClick={copiar}>
                Copiar el texto
              </button>
              <button type="button" className={BOTON} onClick={() => decidir(false)}>
                {ETIQUETA_DEJARLO}
              </button>
            </div>
          )}
          <p role="status" className="text-xs font-medium">
            {ocupada ? "Enviando al equipo…" : copiado === "si" ? "Texto copiado." : copiado === "no" ? "No se pudo copiar; seleccionalo a mano." : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {ATAJOS.map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={ocupada}
                className={BOTON}
                onClick={() => despachar({ tipo: "atajo", atajo: a.id })}
              >
                {a.etiqueta}
              </button>
            ))}
          </div>

          <form onSubmit={enviarTexto} className="flex gap-2">
            <label htmlFor="hifa-texto" className="sr-only">
              Escribile a Hifa
            </label>
            <input
              id="hifa-texto"
              ref={campo}
              type="text"
              value={texto}
              maxLength={MAX_MENSAJE}
              disabled={ocupada}
              autoComplete="off"
              placeholder="Escribile a Hifa…"
              onChange={(e) => setTexto(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-faint bg-surface px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            />
            <button type="submit" disabled={ocupada} className={BOTON_PRINCIPAL}>
              Enviar
            </button>
          </form>

          <div className="flex items-center justify-between gap-2 text-xs text-muted">
            <p>
              Hifa es un guion: no usa IA todavía.{" "}
              {conSesion ? "Se guarda en tu navegador." : "Sin entrar, la conversación no se guarda."}
            </p>
            <button
              type="button"
              onClick={borrar}
              disabled={ocupada}
              className="shrink-0 rounded underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              Borrar conversación
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
