"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CLAVE_ULTIMA_PERSONA, establecerPersona } from "@/lib/demo/claves";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { calcularNivel, EVENTO_NIVEL, leerEstadoGuardado } from "@/lib/sesion/nivel";
import { INICIAL, type EstadoSumarte } from "@/lib/sumarte/estado";
import { ContextoSesion, type EstadoSesion, type PrivyMinimo, type SesionCliente, type ValorSesion } from "./contexto";

/**
 * Con el modo de prueba, el email elegido en "Entrar como…" queda en esta cookie de sesión (no en localStorage:
 * así no depende del almacenamiento de datos de la demo, que se puede bloquear o borrar sin cerrar la sesión).
 * Solo vale si el servidor tiene el modo de prueba activo; en producción `/api/sesion` ignora el header.
 */
export const COOKIE_PRUEBA = "lh-auth-prueba";

type Resultado = { estado: EstadoSesion; sesion: SesionCliente | null };

function leerPrueba(): string | null {
  for (const parte of document.cookie.split(";")) {
    const [nombre, ...valor] = parte.trim().split("=");
    if (nombre === COOKIE_PRUEBA && valor.length > 0) {
      try {
        return decodeURIComponent(valor.join("=")) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function Nucleo({ privy, children }: { privy: PrivyMinimo | null; children: ReactNode }) {
  // undefined = todavía no se leyó el almacenamiento del navegador.
  const [prueba, setPrueba] = useState<string | null | undefined>(undefined);
  const [resultado, setResultado] = useState<Resultado>({ estado: "cargando", sesion: null });

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setPrueba(leerPrueba());
  }, []);

  const privyListo = privy?.ready ?? true;
  const privyAutenticado = privy?.authenticated ?? false;
  // La función de Privy puede cambiar de identidad en cada render: se guarda en una ref para no repetir la verificación.
  const obtenerToken = useRef(privy?.getAccessToken);
  useEffect(() => {
    obtenerToken.current = privy?.getAccessToken;
  });

  // En modo de prueba la sesión no depende de Privy: que Privy termine de inicializarse no tiene que volver a verificar.
  const privyListoEfectivo = prueba ? true : privyListo;
  const privyAutenticadoEfectivo = prueba ? false : privyAutenticado;

  useEffect(() => {
    if (prueba === undefined) return;
    let vigente = true;
    const poner = (r: Resultado) => {
      if (vigente) setResultado(r);
    };

    async function resolver() {
      const cabeceras: Record<string, string> = {};
      if (prueba) {
        cabeceras["x-lh-prueba"] = prueba;
      } else {
        if (!privyListoEfectivo) return;
        const pedirToken = obtenerToken.current;
        if (!privyAutenticadoEfectivo || !pedirToken) return poner({ estado: "sin-sesion", sesion: null });
        const token = await pedirToken();
        if (!token) return poner({ estado: "sin-sesion", sesion: null });
        cabeceras.Authorization = `Bearer ${token}`;
      }
      try {
        const res = await fetch("/api/sesion", { headers: cabeceras, cache: "no-store" });
        if (res.status === 200) {
          const datos = (await res.json()) as SesionCliente;
          return poner({ estado: "ok", sesion: datos });
        }
        if (res.status === 403) return poner({ estado: "sin-acceso", sesion: null });
        if (res.status === 401 && prueba) {
          // El servidor ya no acepta el modo de prueba: se borra la cookie y se vuelve a resolver (con Privy si hay).
          document.cookie = `${COOKIE_PRUEBA}=; path=/; max-age=0; SameSite=Lax`;
          if (vigente) setPrueba(null);
          return;
        }
        return poner({ estado: "error", sesion: null });
      } catch {
        return poner({ estado: "error", sesion: null });
      }
    }

    // La verificación pasa por el servidor; mientras tanto la app no muestra nada personal. Si ya había una sesión
    // válida, se revalida sin ocultar la app: ocultarla desmonta todo (se pierden el foco y lo que se estaba haciendo).
    setResultado((r) => (r.estado === "cargando" || r.estado === "ok" ? r : { estado: "cargando", sesion: null }));
    void resolver();
    return () => {
      vigente = false;
    };
  }, [prueba, privyListoEfectivo, privyAutenticadoEfectivo]);

  // Se fija antes de dibujar la app: todas las claves del navegador salen con el prefijo de esta persona.
  const idPersona = resultado.estado === "ok" ? (resultado.sesion?.idPersona ?? null) : null;
  establecerPersona(idPersona);

  useEffect(() => {
    try {
      if (idPersona) window.localStorage.setItem(CLAVE_ULTIMA_PERSONA, idPersona);
    } catch {
      // Sin almacenamiento no se recuerda la última persona; el tema se aplica al hidratar igual.
    }
  }, [idPersona]);

  // Lo que la persona eligió en Sumarte define su nivel. Se lee del navegador (con el prefijo de la persona) al entrar y
  // cada vez que Sumarte avisa un cambio. `id` dice de qué persona es lo leído, para no usar lo de la anterior.
  const [guardado, setGuardado] = useState<{ id: string; estado: EstadoSumarte } | null>(null);
  useEffect(() => {
    if (!idPersona) {
      setGuardado(null);
      return;
    }
    const cargar = () => {
      let estado = INICIAL;
      try {
        estado = leerEstadoGuardado(window.localStorage);
      } catch {
        // Sin almacenamiento queda el nivel mínimo.
      }
      setGuardado({ id: idPersona, estado });
    };
    cargar();
    window.addEventListener(EVENTO_NIVEL, cargar);
    window.addEventListener("storage", cargar);
    return () => {
      window.removeEventListener(EVENTO_NIVEL, cargar);
      window.removeEventListener("storage", cargar);
    };
  }, [idPersona]);

  const nivelListo = resultado.estado !== "ok" || (guardado !== null && guardado.id === idPersona);
  const { nivel, tribuLider } = calcularNivel(
    guardado && guardado.id === idPersona ? guardado.estado : INICIAL,
    resultado.estado === "ok" && resultado.sesion ? resultado.sesion : null,
  );

  // Qué aceptó la persona de la política de privacidad: sin eso no usa la app con sesión (lo aplica la puerta).
  const { estado: consentimiento } = useConsentimiento(idPersona);

  const router = useRouter();
  const ruta = usePathname();

  const entrarComo = useCallback((email: string) => {
    document.cookie = `${COOKIE_PRUEBA}=${encodeURIComponent(email)}; path=/; SameSite=Lax`;
    setPrueba(email);
  }, []);

  const logout = privy?.logout;
  const salir = useCallback(async () => {
    document.cookie = `${COOKIE_PRUEBA}=; path=/; max-age=0; SameSite=Lax`;
    setPrueba(null);
    setResultado({ estado: "sin-sesion", sesion: null });
    try {
      // Sin persona recordada, el script de tema no pinta con las preferencias de quien acaba de salir.
      window.localStorage.removeItem(CLAVE_ULTIMA_PERSONA);
    } catch {
      // Sin almacenamiento no hay nada que olvidar.
    }
    try {
      await logout?.();
    } catch {
      // Si Privy falla al salir, la sesión de la app igual quedó cerrada.
    }
  }, [logout]);

  const cabeceras = useCallback(async (): Promise<Record<string, string>> => {
    if (prueba) return { "x-lh-prueba": prueba };
    const pedirToken = obtenerToken.current;
    const token = pedirToken ? await pedirToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [prueba]);

  const login = privy?.login;
  const valor = useMemo<ValorSesion>(
    () => ({
      estado: resultado.estado,
      sesion: resultado.sesion,
      emailIntento: prueba ?? privy?.email ?? null,
      nombre: privy?.nombre ?? null,
      billetera: privy?.billetera ?? null,
      privyDisponible: privy !== null,
      // Sin Privy no hay ventana de login: se lleva a Sumarte, que ofrece "Entrar como…" (modo de prueba). Desde Sumarte el
      // botón no navega: avisa y se queda (el panel ya está en la página).
      entrar: () => {
        if (login) return login();
        if (ruta === "/sumarte") {
          document.getElementById("entrar-como")?.scrollIntoView?.({ block: "center" });
          document.getElementById("entrar-como")?.focus();
          return;
        }
        router.push(`/sumarte?volver=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}#entrar-como`);
      },
      entrarComo,
      nivel,
      nivelListo,
      consentimiento,
      tribuLider,
      salir,
      cabeceras,
    }),
    [resultado, prueba, privy, login, ruta, router, entrarComo, nivel, nivelListo, consentimiento, tribuLider, salir, cabeceras],
  );

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}

const PuentePrivy = lazy(() => import("./privy-puente"));

/** Sesión de la app: Privy (si está configurado) más la verificación en `/api/sesion`. Sin Privy solo funciona el modo de prueba. */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) return <Nucleo privy={null}>{children}</Nucleo>;
  return (
    <Suspense fallback={null}>
      <PuentePrivy appId={appId} hijo={(privy) => <Nucleo privy={privy}>{children}</Nucleo>} />
    </Suspense>
  );
}
