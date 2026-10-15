"use client";

import { Bug } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { TAMANO_FLOTANTE } from "@/lib/ui/flotantes";
import {
  armarContexto,
  CONTEXTO_VACIO,
  MAX_CONTACTO,
  MAX_ESPERABAS,
  MAX_QUE_PASO,
  TEXTO_TIPO,
  TIPOS,
  textoParaCopiar,
  validarReporte,
  type CampoReporte,
  type Contexto,
  type TipoReporte,
} from "@/lib/reportes/reporte";

type Estado =
  | { fase: "editando" }
  | { fase: "enviando" }
  | { fase: "listo"; numero: number }
  | { fase: "fallo"; motivo: "sin-configurar" | "error" }
  | { fase: "fallo"; motivo: "limite"; segundos: number | null };

const AVISO_SIN_CUENTA =
  "Estás reportando sin cuenta. Tu reporte se publica como un issue en GitHub, donde lo ve el equipo de NetX y quien tenga acceso a ese repositorio. Si dejás tu email, queda escrito en el issue. También se envía lo que ves en «Esto se adjunta al reporte». Tu IP solo se usa un rato para limitar los envíos y no va al issue.";

function textoLimite(segundos: number | null): string {
  if (segundos === null) return "Llegaste al límite de reportes por ahora. Probá de nuevo en un rato.";
  const minutos = Math.max(1, Math.ceil(segundos / 60));
  return `Llegaste al límite de reportes por ahora. Probá de nuevo en ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`;
}

const campo =
  "mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-[invalid=true]:border-warn-ink";
const boton =
  "rounded-full px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

export function BotonReportar({ version, entorno }: { version: string; entorno: string }) {
  const { cabeceras, estado: estadoSesion, consentimiento } = useSesion();
  // Con sesión y la política aceptada, el formulario de siempre; en cualquier otro caso, el modo sin cuenta.
  const conCuenta = estadoSesion === "ok" && consentimiento === "vigente";
  const dialogo = useRef<HTMLDialogElement | null>(null);
  const disparador = useRef<HTMLButtonElement | null>(null);
  const refs = useRef<Partial<Record<CampoReporte, HTMLElement | null>>>({});
  const [tipo, setTipo] = useState<TipoReporte>("bug");
  const [quePaso, setQuePaso] = useState("");
  const [esperabas, setEsperabas] = useState("");
  const [contacto, setContacto] = useState("");
  const [trampa, setTrampa] = useState("");
  const [errores, setErrores] = useState<Partial<Record<CampoReporte, string>>>({});
  const [estado, setEstado] = useState<Estado>({ fase: "editando" });
  const [contexto, setContexto] = useState<Contexto>(CONTEXTO_VACIO);
  const [copiado, setCopiado] = useState<"si" | "no" | null>(null);
  const [sobre, setSobre] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const [descartada, setDescartada] = useState(false);
  // Visible mientras el puntero esté encima o el botón tenga foco, salvo que se haya descartado con Escape.
  const sugerencia = (sobre || conFoco) && !descartada;

  // Escape descarta la sugerencia esté donde esté el foco (WCAG 1.4.13), sin mover puntero ni foco.
  useEffect(() => {
    if (!sugerencia) return;
    function alTeclear(ev: KeyboardEvent) {
      if (ev.key !== "Escape") return;
      // Sin preventDefault: un keydown cancelado no cierra un <dialog> abierto.
      setDescartada(true);
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [sugerencia]);

  function leerContexto(): Contexto {
    return armarContexto({
      url: window.location.href,
      titulo: document.title,
      ancho: window.innerWidth,
      alto: window.innerHeight,
      navegador: navigator.userAgent,
      version,
      entorno,
      sinCuenta: !conCuenta,
    });
  }

  function abrir() {
    // Al abrir el diálogo la sugerencia sobra, aunque el navegador no dispare mouseleave.
    setSobre(false);
    // Mientras se envía no se toca nada: reabrir no habilita un segundo envío.
    if (estado.fase === "enviando") {
      dialogo.current?.showModal();
      return;
    }
    setContexto(leerContexto());
    setCopiado(null);
    // Si el reporte anterior ya se registró, se arranca de cero; si no, se conserva lo escrito.
    if (estado.fase === "listo") {
      setQuePaso("");
      setEsperabas("");
      setContacto("");
      setTipo("bug");
    }
    if (estado.fase !== "editando") setEstado({ fase: "editando" });
    setErrores({});
    dialogo.current?.showModal();
  }

  function cerrar() {
    dialogo.current?.close();
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    const entrada = { tipo, quePaso, esperabas, contacto, contexto: leerContexto(), sitioWeb: trampa };
    const r = validarReporte(entrada, { sinCuenta: !conCuenta });
    if (!r.ok) {
      setErrores(r.errores);
      const primero = (["tipo", "quePaso", "esperabas", "contacto"] as CampoReporte[]).find((k) => r.errores[k]);
      if (primero) refs.current[primero]?.focus();
      return;
    }
    setErrores({});
    setContexto(entrada.contexto);
    setEstado({ fase: "enviando" });
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(conCuenta ? await cabeceras() : {}) },
        body: JSON.stringify(entrada),
      });
      if (res.ok) {
        const datos = (await res.json()) as { numero?: number };
        setEstado({ fase: "listo", numero: typeof datos.numero === "number" ? datos.numero : 0 });
      } else if (res.status === 429) {
        const datos = (await res.json().catch(() => ({}))) as { reintentarEnSegundos?: unknown };
        const cabecera = Number(res.headers.get("Retry-After"));
        const segundos =
          typeof datos.reintentarEnSegundos === "number"
            ? datos.reintentarEnSegundos
            : Number.isFinite(cabecera) && cabecera > 0
              ? cabecera
              : null;
        setEstado({ fase: "fallo", motivo: "limite", segundos });
      } else {
        setEstado({ fase: "fallo", motivo: res.status === 503 ? "sin-configurar" : "error" });
      }
    } catch {
      setEstado({ fase: "fallo", motivo: "error" });
    }
  }

  async function copiar() {
    const r = validarReporte({ tipo, quePaso, esperabas, contacto, contexto }, { sinCuenta: !conCuenta });
    if (!r.ok) return;
    try {
      await navigator.clipboard.writeText(textoParaCopiar(r.reporte));
      setCopiado("si");
    } catch {
      setCopiado("no");
    }
  }

  const describe = (k: CampoReporte) => (errores[k] ? `err-rep-${k}` : undefined);
  const filas: [string, string][] = [
    ["URL", contexto.url],
    ["Ruta", contexto.ruta],
    ["Página", contexto.titulo],
    ["Pantalla", contexto.pantalla],
    ["Navegador", contexto.navegador],
    ["Versión", contexto.version],
    ["Entorno", contexto.entorno],
    ["Fecha", contexto.fecha],
  ];

  return (
    <>
      <button
        ref={disparador}
        type="button"
        onClick={abrir}
        aria-label="Reportar un problema o una idea"
        aria-describedby={sugerencia ? "tooltip-reportar" : undefined}
        onMouseEnter={() => {
          setSobre(true);
          setDescartada(false);
        }}
        onMouseLeave={() => setSobre(false)}
        onFocus={() => {
          setConFoco(true);
          setDescartada(false);
        }}
        onBlur={() => setConFoco(false)}
        className="group fixed right-0 top-1/2 z-40 grid -translate-y-1/2 place-items-center rounded-full border-2 border-dashed border-ink p-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        {/* Mismo tamaño que el botón de Hifa (TAMANO_FLOTANTE); el anillo punteado queda separado por 3 px. */}
        <span className={`grid ${TAMANO_FLOTANTE} place-items-center rounded-full bg-deep text-on-deep shadow-lg group-hover:bg-deep-2`}>
          <Bug aria-hidden="true" className="size-7" />
        </span>
        {sugerencia && (
          <span
            id="tooltip-reportar"
            role="tooltip"
            className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-sm font-medium text-bg"
          >
            Reportar
          </span>
        )}
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-reporte"
        onClose={() => disparador.current?.focus()}
        className="m-auto max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-line bg-surface p-5 text-ink backdrop:bg-ink/50"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="titulo-reporte" className="text-xl font-semibold">
            Reportar un problema o una idea
          </h2>
          <button
            type="button"
            onClick={cerrar}
            className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
          >
            Cerrar
          </button>
        </div>

        {estado.fase === "listo" ? (
          <div className="mt-4 grid gap-4">
            <p role="status" className="font-medium">
              ¡Gracias! Quedó registrado{estado.numero > 0 ? ` (#${estado.numero})` : ""}
            </p>
            <div>
              <button type="button" onClick={cerrar} className={`${boton} bg-deep text-on-deep hover:bg-deep-2`}>
                Listo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="mt-4 grid gap-4">
            {!conCuenta && (
              <p id="aviso-rep-sin-cuenta" className="rounded-lg bg-surface-2 p-3 text-sm">
                {AVISO_SIN_CUENTA}
              </p>
            )}
            <fieldset className="grid gap-2">
              <legend className="font-medium">Tipo</legend>
              <div className="flex flex-wrap gap-4">
                {TIPOS.map((t, i) => (
                  <label key={t} className="flex items-center gap-2">
                    <input
                      ref={i === 0 ? (el) => { refs.current.tipo = el; } : undefined}
                      type="radio"
                      name="tipo-reporte"
                      value={t}
                      checked={tipo === t}
                      onChange={() => setTipo(t)}
                    />
                    {TEXTO_TIPO[t]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="rep-que-paso" className="font-medium">
                ¿Qué pasó? <span className="font-normal text-muted">(hasta {MAX_QUE_PASO} caracteres)</span>
              </label>
              <textarea
                id="rep-que-paso"
                ref={(el) => { refs.current.quePaso = el; }}
                rows={4}
                value={quePaso}
                onChange={(e) => setQuePaso(e.target.value)}
                aria-invalid={errores.quePaso ? true : undefined}
                aria-describedby={describe("quePaso")}
                aria-required="true"
                className={campo}
              />
              {errores.quePaso && (
                <p id="err-rep-quePaso" role="alert" className="mt-1 text-sm font-medium text-warn-ink">
                  Error: {errores.quePaso}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="rep-esperabas" className="font-medium">
                ¿Qué esperabas que pasara? <span className="font-normal text-muted">(opcional)</span>
              </label>
              <textarea
                id="rep-esperabas"
                ref={(el) => { refs.current.esperabas = el; }}
                rows={3}
                maxLength={MAX_ESPERABAS + 1}
                value={esperabas}
                onChange={(e) => setEsperabas(e.target.value)}
                aria-invalid={errores.esperabas ? true : undefined}
                aria-describedby={describe("esperabas")}
                className={campo}
              />
              {errores.esperabas && (
                <p id="err-rep-esperabas" role="alert" className="mt-1 text-sm font-medium text-warn-ink">
                  Error: {errores.esperabas}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="rep-contacto" className="font-medium">
                {conCuenta ? "Tu nombre o email" : "Tu email"}{" "}
                <span className="font-normal text-muted">
                  {conCuenta ? "(opcional, para responderte)" : "(opcional)"}
                </span>
              </label>
              <input
                id="rep-contacto"
                ref={(el) => { refs.current.contacto = el; }}
                type={conCuenta ? "text" : "email"}
                autoComplete={conCuenta ? undefined : "email"}
                maxLength={MAX_CONTACTO + 1}
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                aria-invalid={errores.contacto ? true : undefined}
                aria-describedby={[describe("contacto"), "aviso-rep-contacto"].filter(Boolean).join(" ")}
                className={campo}
              />
              <p id="aviso-rep-contacto" className="mt-1 text-sm text-muted">
                {conCuenta
                  ? "Tu reporte, y tu contacto si lo dejás, lo ve el equipo de NetX."
                  : "Solo si querés que te respondamos. Queda escrito en el issue."}
              </p>
              {errores.contacto && (
                <p id="err-rep-contacto" role="alert" className="mt-1 text-sm font-medium text-warn-ink">
                  Error: {errores.contacto}
                </p>
              )}
            </div>

            {/* Campo trampa: las personas no lo ven ni lo alcanzan; los bots lo suelen llenar. */}
            <div hidden>
              <label htmlFor="rep-sitio-web">Sitio web</label>
              <input
                id="rep-sitio-web"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trampa}
                onChange={(e) => setTrampa(e.target.value)}
              />
            </div>

            <section aria-labelledby="titulo-contexto" className="rounded-lg bg-surface-2 p-3 text-sm">
              <h3 id="titulo-contexto" className="font-medium">
                Esto se adjunta al reporte
              </h3>
              <dl className="mt-2 grid gap-1">
                {filas.map(([k, v]) => (
                  <div key={k} className="flex flex-wrap gap-x-2">
                    <dt className="font-medium">{k}:</dt>
                    <dd className="min-w-0 break-words text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {estado.fase === "fallo" && (
              <div role="alert" className="grid gap-2 rounded-lg border border-warn-ink bg-warn-bg p-3 text-sm text-warn-ink">
                <p className="font-medium">
                  {estado.motivo === "sin-configurar"
                    ? "No se pudo registrar: el envío todavía no está configurado en este entorno."
                    : estado.motivo === "limite"
                      ? textoLimite(estado.segundos)
                      : "No se pudo registrar el reporte. Probá de nuevo en un rato."}{" "}
                  Lo que escribiste sigue acá; copialo para no perderlo.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={copiar}
                    className={`${boton} border border-faint bg-surface text-ink hover:bg-surface-2`}
                  >
                    Copiar el reporte
                  </button>
                </div>
              </div>
            )}
            <p role="status" className="text-sm font-medium">
              {copiado === "si"
                ? "Reporte copiado."
                : copiado === "no"
                  ? "No se pudo copiar. Seleccioná lo que escribiste y copialo a mano."
                  : ""}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={estado.fase === "enviando"}
                className={`${boton} bg-deep text-on-deep hover:bg-deep-2 disabled:opacity-70`}
              >
                {estado.fase === "enviando" ? "Enviando…" : "Enviar reporte"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
