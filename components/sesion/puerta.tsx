"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { esPublica } from "@/lib/sesion/rutas-publicas";
import {
  corresponderOfrecerImportacion,
  descartarImportacion,
  importarDatosPrevios,
} from "@/lib/demo/importar";
import { useSesion } from "./contexto";

const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const BOTON_SECUNDARIO = `${BOTON} border border-faint hover:bg-surface-2`;

/**
 * Muestra el contenido solo con una sesión válida; en cualquier otro caso, la pantalla de entrada o el aviso que corresponda.
 * Excepción: las páginas públicas (`lib/sesion/rutas-publicas.ts`) se ven sin sesión; sus acciones con cuenta piden entrar.
 */
export function Puerta({ children }: { children: ReactNode }) {
  const { estado } = useSesion();
  const ruta = usePathname();
  if (estado === "ok") return <ConSesion>{children}</ConSesion>;
  // Mientras se verifica la sesión se espera ("Cargando…"): mostrar la página y rearmarla al confirmar la sesión
  // haría perder lo que la persona ya estaba haciendo (foco, scroll, casillas).
  if (estado === "sin-sesion" && esPublica(ruta)) return <>{children}</>;
  return <PantallaDeEntrada />;
}

/** Dibuja `children` solo si hay una sesión válida (para piezas fijas del layout, como Hifa o el botón de reportes). */
export function SoloConSesion({ children }: { children: ReactNode }) {
  const { estado } = useSesion();
  return estado === "ok" ? <>{children}</> : null;
}

function ConSesion({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const id = sesion?.idPersona ?? "";
  const [ofrecer, setOfrecer] = useState(false);
  // Cambia al importar para volver a leer los datos ya con el prefijo de la persona.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      // Lectura del almacenamiento del navegador tras hidratar.
      setOfrecer(corresponderOfrecerImportacion(window.localStorage, id));
    } catch {
      setOfrecer(false);
    }
  }, [id]);

  return (
    <>
      {ofrecer && (
        <section
          aria-labelledby="importar-titulo"
          className="mx-auto mt-4 max-w-3xl rounded-xl border border-faint bg-surface-2 p-4 text-sm"
        >
          <h2 id="importar-titulo" className="text-base font-semibold">
            Encontramos datos de antes del login
          </h2>
          <p className="mt-1 text-muted">
            Este navegador tiene datos de ejemplo guardados antes de que existieran las cuentas. ¿Querés pasarlos a tu cuenta?
            Se ofrece una sola vez.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={BOTON_PRIMARIO}
              onClick={() => {
                try {
                  importarDatosPrevios(window.localStorage, id);
                } catch {
                  // Si el navegador no deja guardar, no hay nada que importar.
                }
                setOfrecer(false);
                setVersion((v) => v + 1);
              }}
            >
              Importar a mi cuenta
            </button>
            <button
              type="button"
              className={BOTON_SECUNDARIO}
              onClick={() => {
                try {
                  descartarImportacion(window.localStorage);
                } catch {
                  // Sin almacenamiento, se vuelve a ofrecer en la próxima visita.
                }
                setOfrecer(false);
              }}
            >
              No importar
            </button>
          </div>
        </section>
      )}
      {/* La clave hace que cada persona (y cada importación) lea sus datos desde cero. */}
      <div key={`${id}:${version}`}>{children}</div>
    </>
  );
}

function Aviso() {
  return (
    <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      Prototipo interno · datos de ejemplo
    </p>
  );
}

function PantallaDeEntrada() {
  const { estado, emailIntento, privyDisponible, entrar, entrarComo, salir } = useSesion();
  const [emailsPrueba, setEmailsPrueba] = useState<string[]>([]);

  useEffect(() => {
    if (estado !== "sin-sesion") return;
    let vigente = true;
    fetch("/api/sesion/prueba", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { activo?: boolean; emails?: string[] } | null) => {
        if (vigente && d?.activo && Array.isArray(d.emails)) setEmailsPrueba(d.emails);
      })
      .catch(() => {
        // Sin la lista de prueba solo queda "Entrar" con Privy.
      });
    return () => {
      vigente = false;
    };
  }, [estado]);

  if (estado === "cargando") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <Aviso />
        <p role="status" className="text-muted">
          Cargando…
        </p>
      </div>
    );
  }

  if (estado === "sin-acceso") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <Aviso />
        <h1 className="text-2xl font-semibold">Todavía no tenés acceso</h1>
        <p className="mt-3">Tu email todavía no tiene acceso a este prototipo. Pedíselo a Gus.</p>
        {emailIntento && <p className="mt-2 text-sm text-muted">Entraste con {emailIntento}.</p>}
        <button type="button" className={`${BOTON_SECUNDARIO} mt-4`} onClick={() => void salir()}>
          Salir
        </button>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <Aviso />
        <h1 className="text-2xl font-semibold">No pudimos verificar tu sesión</h1>
        <p className="mt-3">Probá de nuevo en un momento.</p>
        <button type="button" className={`${BOTON_SECUNDARIO} mt-4`} onClick={() => void salir()}>
          Volver a la entrada
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6 sm:p-10">
      <Aviso />
      <h1 className="text-3xl font-semibold">Bienvenida al Lighthouse</h1>
      <p className="mt-3 text-muted">
        Esta es la plataforma de NetX para descubrir el territorio, encontrar tu tribu y sumarte al Congreso. Por ahora es un
        prototipo para el equipo: entrá con tu cuenta para verlo.
      </p>
      {privyDisponible && (
        <button type="button" className={`${BOTON_PRIMARIO} mt-5`} onClick={entrar}>
          Entrar
        </button>
      )}
      {emailsPrueba.length > 0 && (
        <section aria-labelledby="entrar-como" className="mt-6 rounded-xl border border-dashed border-faint p-4">
          <h2 id="entrar-como" className="text-base font-semibold">
            Entrar como…
          </h2>
          <p className="mt-1 text-sm text-muted">Modo de prueba: no usa Privy y no existe en producción.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {emailsPrueba.map((e) => (
              <li key={e}>
                <button type="button" className={BOTON_SECUNDARIO} onClick={() => entrarComo(e)}>
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
