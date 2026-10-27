"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { capacidadDeRuta, nivelMinimoDeRuta, puedeCapacidad, puedeRuta, type Capacidad } from "@/lib/permisos/niveles";
import {
  corresponderOfrecerImportacion,
  descartarImportacion,
  importarDatosPrevios,
} from "@/lib/demo/importar";
import { rutaPideConsentimiento } from "@/lib/privacidad/consentimiento";
import { ProveedorIdioma, useIdioma, useTextos } from "@/lib/idioma/cliente";
import { estaTraducida } from "@/lib/idioma/rutas";
import { AvisoSinTraducir } from "@/components/aviso-sin-traducir";
import { useSesion } from "./contexto";
import { PantallaConsentimiento } from "./pantalla-consentimiento";

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
  const { estado, nivel, nivelListo, consentimiento } = useSesion();
  const ruta = usePathname();
  // /admin la protege el servidor (ADR-016): sin permiso ya respondió 403 y no armó nada. Se deja pasar a `children` mientras
  // la sesión del navegador no está lista (también en el servidor) para que esa respuesta llegue con su estado HTTP 403 y
  // para que quien no tiene sesión vea el 403 y no sea llevado a Sumarte. `SoloSuperAdmin` cubre la pantalla.
  if (estado !== "ok" && capacidadDeRuta(ruta) === "admin") return <Contenido>{children}</Contenido>;
  // Mientras se verifica la sesión se espera ("Cargando…"): mostrar la página y rearmarla al confirmar la sesión
  // haría perder lo que la persona ya estaba haciendo (foco, scroll, casillas).
  if (estado === "sin-sesion") {
    return puedeRuta("sin-cuenta", ruta) ? <Contenido>{children}</Contenido> : <IrASumarte ruta={ruta} />;
  }
  if (estado !== "ok") return <PantallaDeEntrada />;
  if (!nivelListo) return <PantallaDeEntrada />;
  // Sin aceptar la política de privacidad vigente no se usa la app con sesión. Va antes de aplicar el plan elegido en
  // Sumarte (el registro): Sumarte no se dibuja hasta aceptar. Las páginas públicas de Descubrir quedan abiertas.
  if (rutaPideConsentimiento(ruta)) {
    if (consentimiento === "cargando") return <PantallaDeEntrada />;
    // La pantalla de consentimiento todavía es solo en español (llega con `idioma-legal`): se marca como tal.
    if (consentimiento === "pendiente") {
      return (
        <Contenido sinTraducir>
          <PantallaConsentimiento />
        </Contenido>
      );
    }
  }
  // NetX no redirige: su propia página explica que es solo del super admin.
  if (!puedeRuta(nivel, ruta) && nivelMinimoDeRuta(ruta) !== "superadmin") return <IrASumarte ruta={ruta} />;
  return <ConSesion>{children}</ConSesion>;
}

/**
 * Con la plataforma en inglés, una página que todavía no se tradujo (fuera de `RUTAS_TRADUCIDAS`) se muestra en español:
 * arriba va el aviso y todo lo de adentro queda marcado `lang="es"` y con el idioma de la plataforma fijado en español,
 * para que lo que pida la página (textos, montos, ⚖) salga en español y coincida con su `lang`. El marco queda afuera, en inglés.
 */
export function Contenido({ children, sinTraducir = false }: { children: ReactNode; sinTraducir?: boolean }) {
  const idioma = useIdioma();
  const ruta = usePathname();
  if (idioma !== "en" || (!sinTraducir && estaTraducida(ruta))) return <>{children}</>;
  return (
    <>
      <AvisoSinTraducir />
      <div lang="es">
        <ProveedorIdioma idioma="es" soloContenido>
          {children}
        </ProveedorIdioma>
      </div>
    </>
  );
}

/** Lleva a Sumarte con la página que se quería abrir, para avisar qué plan la habilita y volver después. */
function IrASumarte({ ruta }: { ruta: string }) {
  const router = useRouter();
  const t = useTextos("comunes");
  useEffect(() => {
    // Se conserva la query (por ejemplo ?sel=) para volver exactamente a la misma vista.
    router.replace(`/sumarte?volver=${encodeURIComponent(ruta + window.location.search)}`);
  }, [router, ruta]);
  return (
    <div className="mx-auto max-w-xl p-6 sm:p-10">
      <p role="status" className="text-muted">
        {t.cargando}
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
  const { estado, nivel, consentimiento } = useSesion();
  // Hifa y Reportar guardan datos de la persona: no aparecen hasta que aceptó la política de privacidad.
  return estado === "ok" && consentimiento === "vigente" && puedeCapacidad(nivel, capacidad) ? <>{children}</> : null;
}

function ConSesion({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const t = useTextos("marco");
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
            {t.puerta.importarTitulo}
          </h2>
          <p className="mt-1 text-muted">{t.puerta.importarTexto}</p>
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
              {t.puerta.importar}
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
              {t.puerta.noImportar}
            </button>
          </div>
        </section>
      )}
      {/* La clave hace que cada persona (y cada importación) lea sus datos desde cero. */}
      <div key={`${id}:${version}`}>
        <Contenido>{children}</Contenido>
      </div>
    </>
  );
}

function Aviso() {
  const t = useTextos("marco");
  return (
    <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      {t.aviso}
    </p>
  );
}

/** Lo que se ve cuando todavía no hay sesión utilizable: verificando, sin acceso (`LH_ACCESO=lista`) o con error. */
function PantallaDeEntrada() {
  const { estado, emailIntento, salir } = useSesion();
  const t = useTextos("marco");
  const comunes = useTextos("comunes");

  if (estado === "cargando" || estado === "ok" || estado === "sin-sesion") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <Aviso />
        <p role="status" className="text-muted">
          {comunes.cargando}
        </p>
      </div>
    );
  }

  if (estado === "sin-acceso") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <Aviso />
        <h1 className="text-2xl font-semibold">{t.puerta.sinAccesoTitulo}</h1>
        <p className="mt-3">{t.puerta.sinAccesoTexto}</p>
        {emailIntento && <p className="mt-2 text-sm text-muted">{t.puerta.entraste(emailIntento)}</p>}
        <button type="button" className={`${BOTON_SECUNDARIO} mt-4`} onClick={() => void salir()}>
          {t.barra.salir}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6 sm:p-10">
      <Aviso />
      <h1 className="text-2xl font-semibold">{t.puerta.errorTitulo}</h1>
      <p className="mt-3">{t.puerta.errorTexto}</p>
      <button type="button" className={`${BOTON_SECUNDARIO} mt-4`} onClick={() => void salir()}>
        {t.puerta.volverAEntrada}
      </button>
    </div>
  );
}
