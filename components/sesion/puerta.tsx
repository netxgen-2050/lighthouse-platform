"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { nivelMinimoDeRuta, puedeCapacidad, puedeRuta, type Capacidad } from "@/lib/permisos/niveles";
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
 * Muestra la página solo si el nivel de la persona la habilita (`lib/permisos/niveles.ts`). Si no, va a Sumarte con el aviso
 * de qué plan la habilita y, al sumarse, vuelve a esta página. Sin pantalla de entrada repetida: la puerta de entrada es Sumarte.
 * Lo que no es una sesión (verificando, sin acceso con `LH_ACCESO=lista`, error) sí muestra su aviso.
 */
export function Puerta({ children }: { children: ReactNode }) {
  const { estado, nivel, nivelListo } = useSesion();
  const ruta = usePathname();
  // Mientras se verifica la sesión se espera ("Cargando…"): mostrar la página y rearmarla al confirmar la sesión
  // haría perder lo que la persona ya estaba haciendo (foco, scroll, casillas).
  if (estado === "sin-sesion") return puedeRuta("sin-cuenta", ruta) ? <>{children}</> : <IrASumarte ruta={ruta} />;
  if (estado !== "ok") return <PantallaDeEntrada />;
  if (!nivelListo) return <PantallaDeEntrada />;
  // NetX no redirige: su propia página explica que es solo del super admin.
  if (!puedeRuta(nivel, ruta) && nivelMinimoDeRuta(ruta) !== "superadmin") return <IrASumarte ruta={ruta} />;
  return <ConSesion>{children}</ConSesion>;
}

/** Lleva a Sumarte con la página que se quería abrir, para avisar qué plan la habilita y volver después. */
function IrASumarte({ ruta }: { ruta: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/sumarte?volver=${encodeURIComponent(ruta)}`);
  }, [router, ruta]);
  return (
    <div className="mx-auto max-w-xl p-6 sm:p-10">
      <p role="status" className="text-muted">
        Cargando…
      </p>
    </div>
  );
}

/** Dibuja `children` solo si hay una sesión válida (para piezas fijas del layout). */
export function SoloConSesion({ children }: { children: ReactNode }) {
  const { estado } = useSesion();
  return estado === "ok" ? <>{children}</> : null;
}

/** Dibuja `children` solo si el nivel de la persona habilita la capacidad (por ejemplo Hifa o el botón de reportes). */
export function SoloConCapacidad({ capacidad, children }: { capacidad: Capacidad; children: ReactNode }) {
  const { estado, nivel } = useSesion();
  return estado === "ok" && puedeCapacidad(nivel, capacidad) ? <>{children}</> : null;
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

/** Lo que se ve cuando todavía no hay sesión utilizable: verificando, sin acceso (`LH_ACCESO=lista`) o con error. */
function PantallaDeEntrada() {
  const { estado, emailIntento, salir } = useSesion();

  if (estado === "cargando" || estado === "ok" || estado === "sin-sesion") {
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
