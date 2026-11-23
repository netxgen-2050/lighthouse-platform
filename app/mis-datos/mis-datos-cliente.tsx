"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { borrarDemo } from "@/lib/demo/borrar";
import { CLAVES_COMPARTIDAS } from "@/lib/demo/claves";
import { quitarConstanciasDe } from "@/lib/pactos/registro-compartido";
import { retirarConsentimiento, type CanalConsentimiento } from "@/lib/privacidad/consentimiento";
import { exportarMisDatos, nombreArchivoDatos } from "@/lib/privacidad/exportar";
import { fechaYHora } from "@/lib/privacidad/fecha";
import { darNovedades, leerNovedades, retirarNovedades, type CanalNovedades, type Novedades } from "@/lib/privacidad/novedades";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { RESPONSABLE } from "@/lib/privacidad/politica";
import { armarContexto } from "@/lib/reportes/reporte";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2 disabled:opacity-70`;
const BOTON_SECUNDARIO = `${BOTON} border border-muted hover:bg-surface-2`;
const SECCION = "grid gap-3 rounded-xl border border-faint bg-surface p-4";

type EstadoPedido =
  | { fase: "inicial" }
  | { fase: "enviando" }
  | { fase: "listo"; numero: number }
  | { fase: "fallo"; motivo: "sin-configurar" | "error" };

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={SECCION}>
      <h2 id={id} className="text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** El camino por el que aceptó, en palabras; sin camino (registro anterior a `consentimiento-alta`) es "sin dato". */
const CAMINO_CONSENTIMIENTO: Record<CanalConsentimiento, string> = {
  alta: "al crear tu cuenta",
  "al-entrar": "al entrar",
  "nueva-version": "cuando cambió la política",
};

const CAMINO_NOVEDADES: Record<CanalNovedades, string> = {
  ...CAMINO_CONSENTIMIENTO,
  "mis-datos": "desde Mis datos",
};

export function MisDatosCliente() {
  const { sesion, estado, billetera, salir, cabeceras } = useSesion();
  const { registro } = useConsentimiento(sesion?.idPersona ?? null);
  const idPersona = sesion?.idPersona ?? null;
  const [novedades, setNovedades] = useState<Novedades | null>(null);
  const [anuncioNovedades, setAnuncioNovedades] = useState({ n: 0, texto: "" });
  useEffect(() => {
    if (!idPersona) return;
    try {
      // Lectura del almacenamiento del navegador tras hidratar.
      setNovedades(leerNovedades(window.localStorage, idPersona));
    } catch {
      setNovedades(null);
    }
  }, [idPersona]);
  const [descarga, setDescarga] = useState<{ n: number; texto: string; error: boolean }>({ n: 0, texto: "", error: false });
  const [confirmando, setConfirmando] = useState(false);
  const [falloRetiro, setFalloRetiro] = useState(false);
  const [pedido, setPedido] = useState<EstadoPedido>({ fase: "inicial" });
  const botonRetirar = useRef<HTMLButtonElement>(null);
  const botonConfirmar = useRef<HTMLButtonElement>(null);

  if (estado !== "ok" || !sesion) return null;

  function descargar() {
    if (!sesion) return;
    try {
      const datos = exportarMisDatos({
        almacen: window.localStorage,
        idPersona: sesion.idPersona,
        email: sesion.email,
        billetera,
      });
      const nombre = nombreArchivoDatos();
      const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      // Revocar enseguida puede cancelar la descarga en Safari y Firefox: se espera un momento.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setDescarga((d) => ({ n: d.n + 1, texto: `Listo: se descargó el archivo ${nombre}.`, error: false }));
    } catch {
      setDescarga((d) => ({
        n: d.n + 1,
        texto: "Error: no se pudo armar el archivo. Probá de nuevo o pedí tus datos por email.",
        error: true,
      }));
    }
  }

  function cambiarNovedades(dar: boolean) {
    if (!sesion) return;
    const canal = { canal: "mis-datos" as const };
    const guardado = dar ? darNovedades(window.localStorage, sesion.idPersona, canal) : retirarNovedades(window.localStorage, sesion.idPersona, canal);
    if (!guardado) {
      setAnuncioNovedades((a) => ({ n: a.n + 1, texto: "Error: tu navegador no deja guardar este cambio." }));
      return;
    }
    setNovedades(leerNovedades(window.localStorage, sesion.idPersona));
    setAnuncioNovedades((a) => ({
      n: a.n + 1,
      texto: dar ? "Listo: pediste recibir novedades por email." : "Listo: dejaste de recibir novedades por email.",
    }));
  }

  async function retirar() {
    // Retirar el consentimiento general también retira las novedades. Primero ellas y después el general: si algo falla,
    // nunca queda el general retirado con las novedades vigentes.
    if (sesion && leerNovedades(window.localStorage, sesion.idPersona)?.evento === "acepta") {
      retirarNovedades(window.localStorage, sesion.idPersona, { canal: "mis-datos" });
    }
    // Primero se borra (con la persona todavía en sesión: las claves llevan su prefijo) y recién después se sale.
    const fallidas = borrarDemo((c) => window.localStorage.removeItem(c));
    // Sus constancias de pactos también salen del registro compartido (las de otras personas quedan).
    if (sesion && !quitarConstanciasDe(sesion.idPersona)) fallidas.push(CLAVES_COMPARTIDAS.pactosConstancias);
    const consentimientoQuitado = sesion ? retirarConsentimiento(window.localStorage, sesion.idPersona) : false;
    if (fallidas.length > 0 || !consentimientoQuitado) {
      setFalloRetiro(true);
      return;
    }
    setFalloRetiro(false);
    await salir();
    // Recarga completa para que no quede nada de esta persona en pantalla.
    window.location.assign("/");
  }

  async function pedirBorrado() {
    if (!sesion) return;
    setPedido({ fase: "enviando" });
    const contexto = armarContexto({
      url: window.location.href,
      titulo: document.title,
      ancho: window.innerWidth,
      alto: window.innerHeight,
      navegador: navigator.userAgent,
      version: "sin dato",
      entorno: "sin dato",
    });
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await cabeceras()) },
        body: JSON.stringify({
          tipo: "pregunta",
          privacidad: true,
          quePaso: "Pido que borren mi cuenta y todos mis datos (pedido hecho desde Mis datos).",
          esperabas: "Que me confirmen por email cuando esté hecho.",
          contacto: sesion.email,
          contexto,
          sitioWeb: "",
        }),
      });
      if (res.ok) {
        const datos = (await res.json()) as { numero?: number };
        setPedido({ fase: "listo", numero: typeof datos.numero === "number" ? datos.numero : 0 });
      } else {
        setPedido({ fase: "fallo", motivo: res.status === 503 ? "sin-configurar" : "error" });
      }
    } catch {
      setPedido({ fase: "fallo", motivo: "error" });
    }
  }

  return (
    <div className="grid gap-6">
      <Seccion id="descargar" titulo="Descargar mis datos">
        <p className="text-sm text-muted">
          Un archivo JSON con todo lo que el prototipo guarda de vos ({sesion.email}): tu perfil, tus pactos, tus Semillas, tus
          contactos y lo demás. No incluye nada de otras personas. Lo que no cargaste figura como “null” (sin dato).
        </p>
        <button type="button" onClick={descargar} className={BOTON_PRIMARIO}>
          Descargar mis datos
        </button>
        <p role="status" className={`text-sm font-medium ${descarga.error ? "text-danger" : ""}`}>
          <span key={descarga.n}>{descarga.texto}</span>
        </p>
      </Seccion>

      <Seccion id="constancia" titulo="Tu consentimiento">
        {registro ? (
          <p className="text-sm">
            Aceptaste la versión {registro.version} el {fechaYHora(registro.aceptadoEn)}
            {registro.canal ? `, ${CAMINO_CONSENTIMIENTO[registro.canal]}.` : ". Camino: sin dato."}
          </p>
        ) : (
          <p className="text-sm">Sin dato: no hay un consentimiento registrado.</p>
        )}
        {registro?.sensibles && (
          <p className="text-sm text-muted">
            Datos sensibles del Pasaporte: aceptaste la versión {registro.sensibles.version} el {fechaYHora(registro.sensibles.aceptadoEn)}.
          </p>
        )}
      </Seccion>

      <Seccion id="novedades" titulo="Novedades por email">
        <p className="text-sm">
          {novedades?.evento === "acepta"
            ? `Pediste recibir novedades por email el ${fechaYHora(novedades.registradoEn)}, ${CAMINO_NOVEDADES[novedades.canal]}.`
            : "No recibís novedades por email."}
        </p>
        <p className="text-sm text-muted">Es opcional y no cambia tu consentimiento de la política. Prototipo: todavía no mandamos emails.</p>
        <button type="button" onClick={() => cambiarNovedades(novedades?.evento !== "acepta")} className={BOTON_SECUNDARIO}>
          {novedades?.evento === "acepta" ? "Dejar de recibir novedades" : "Quiero recibir novedades"}
        </button>
        <p role="status" className="text-sm font-medium">
          <span key={anuncioNovedades.n}>{anuncioNovedades.texto}</span>
        </p>
      </Seccion>

      <Seccion id="retirar" titulo="Retirar mi consentimiento">
        <p className="text-sm text-muted">
          Cierra tu sesión y borra tus datos de este navegador (perfil, pactos, Semillas, contactos, verificación y el registro de
          tu consentimiento). Para volver a usar la plataforma con tu cuenta vas a tener que aceptar la política otra vez.
        </p>
        {confirmando ? (
          <div role="group" aria-labelledby="retirar-pregunta" className="grid gap-3 rounded-lg border border-warn-ink bg-warn-bg p-3 text-warn-ink">
            <p id="retirar-pregunta" className="font-medium">
              ¿Seguro? Se borran tus datos de este navegador y se cierra tu sesión. No se puede deshacer.
            </p>
            <div className="flex flex-wrap gap-3">
              <button ref={botonConfirmar} type="button" onClick={() => void retirar()} className={`${BOTON} bg-deep text-on-deep hover:bg-deep-2`}>
                Sí, retirar y borrar mis datos
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmando(false);
                  setFalloRetiro(false);
                  // El botón que abrió la pregunta vuelve a existir en el próximo ciclo.
                  setTimeout(() => botonRetirar.current?.focus(), 0);
                }}
                className={`${BOTON} border border-muted bg-surface text-ink hover:bg-surface-2`}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={botonRetirar}
            type="button"
            onClick={() => {
              setConfirmando(true);
              setTimeout(() => botonConfirmar.current?.focus(), 0);
            }}
            className={BOTON_SECUNDARIO}
          >
            Retirar mi consentimiento
          </button>
        )}
        {falloRetiro && (
          <p role="alert" className="text-sm font-medium text-danger">
            Error: no se pudo borrar todo. Algunos datos siguen guardados en este navegador y tu sesión sigue abierta.
          </p>
        )}
      </Seccion>

      <Seccion id="borrar-cuenta" titulo="Pedir que borren mi cuenta">
        <p className="text-sm text-muted">
          En el prototipo el pedido le llega al equipo de NetX (junto con tu email, para poder responderte), por el mismo camino que
          Reportar, con la etiqueta “privacidad”. También podés escribir a {RESPONSABLE.contacto} (email de ejemplo).
        </p>
        <button type="button" onClick={() => void pedirBorrado()} disabled={pedido.fase === "enviando" || pedido.fase === "listo"} className={BOTON_SECUNDARIO}>
          {pedido.fase === "enviando" ? "Enviando…" : "Pedir que borren mi cuenta"}
        </button>
        <p role="status" className="text-sm font-medium">
          {pedido.fase === "listo"
            ? `Listo: le avisamos al equipo${pedido.numero > 0 ? ` (pedido #${pedido.numero})` : ""}. Te van a escribir por email.`
            : ""}
        </p>
        {pedido.fase === "fallo" && (
          <p role="alert" className="text-sm font-medium text-danger">
            {pedido.motivo === "sin-configurar"
              ? `Error: el envío no está configurado en este entorno. Escribinos a ${RESPONSABLE.contacto}.`
              : `Error: no se pudo enviar el pedido. Probá de nuevo en un rato o escribinos a ${RESPONSABLE.contacto}.`}
          </p>
        )}
      </Seccion>
    </div>
  );
}
