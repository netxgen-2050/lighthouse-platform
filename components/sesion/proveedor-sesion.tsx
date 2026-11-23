"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CLAVE_ULTIMA_PERSONA, establecerPersona } from "@/lib/demo/claves";
import {
  aceptarEnServidor,
  canalAlEntrar,
  descartarAceptacionPrevia,
  guardarAceptacionPrevia,
  intentarLogin,
  puedeAbrirLogin,
  tomarAceptacionPrevia,
  type CanalConsentimiento,
  type ModoAlta,
} from "@/lib/privacidad/consentimiento";
import { useConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import { cookieAdminBorrada, cookieAdminSegunSesion, debeEscribirCookieAdmin } from "@/lib/sesion/cookie-admin";
import { COOKIE_PRUEBA } from "@/lib/sesion/cookies";
import { calcularNivel, EVENTO_NIVEL, leerEstadoGuardado } from "@/lib/sesion/nivel";
import { INICIAL, type EstadoSumarte } from "@/lib/sumarte/estado";
import { copiarClavesAnteriores } from "@/lib/demo/importar";
import { decidirConsulta, loginAAbrir } from "@/lib/sesion/consulta";
import { loginElegido } from "@/lib/sesion/errores-login";
import { ContextoSesion, type EstadoSesion, type IdentidadMinima, type SesionCliente, type ValorSesion } from "./contexto";
import { PasoAlta } from "./paso-alta";

// El SDK de Neon Auth del navegador se carga solo cuando hace falta (al abrir el formulario o al salir): al importarse toca el
// almacenamiento del navegador, y con el almacenamiento bloqueado rompería toda la app, también con Privy.
const FormularioLogin = lazy(() => import("./formulario-login").then((m) => ({ default: m.FormularioLogin })));

/**
 * Con el modo de prueba, el email elegido en "Entrar como…" queda en esta cookie de sesión (no en localStorage:
 * así no depende del almacenamiento de datos de la demo, que se puede bloquear o borrar sin cerrar la sesión).
 * Solo vale si el servidor tiene el modo de prueba activo; en producción `/api/sesion` ignora el header.
 */
export { COOKIE_PRUEBA };

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

function Nucleo({ privy, children }: { privy: IdentidadMinima | null; children: ReactNode }) {
  // Qué login abre el paso en este entorno (login-neon-auth): con `neon-auth` la sesión también puede venir de una cookie.
  const conNeonAuth = loginElegido() === "neon-auth";
  // undefined = todavía no se leyó el almacenamiento del navegador.
  const [prueba, setPrueba] = useState<string | null | undefined>(undefined);
  const [resultado, setResultado] = useState<Resultado>({ estado: "cargando", sesion: null });
  // Sube cuando se abre una sesión de Neon Auth (código aceptado): hay que volver a preguntar al servidor.
  const [versionSesion, setVersionSesion] = useState(0);
  // De qué proveedor es la sesión en uso (para que "Salir" cierre la correcta).
  const sesionPorCookie = useRef(false);

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

  // Cabeceras que acreditan la sesión (token de Privy o modo de prueba) para pedir a las rutas `/api`.
  const cabeceras = useCallback(async (): Promise<Record<string, string>> => {
    if (prueba) return { "x-lh-prueba": prueba };
    const pedirToken = obtenerToken.current;
    const token = pedirToken ? await pedirToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [prueba]);

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
      const pedirToken = obtenerToken.current;
      const tokenPrivy = !prueba && privyListoEfectivo && privyAutenticadoEfectivo && pedirToken ? await pedirToken() : null;
      // Sin sesión de Privy, en un entorno con Neon Auth se pregunta con la cookie (no se puede leer desde acá).
      const consulta = decidirConsulta({ prueba: prueba ?? null, privyListo: privyListoEfectivo, tokenPrivy, conNeonAuth });
      if (consulta.tipo === "esperar") return;
      if (consulta.tipo === "sin-sesion") return poner({ estado: "sin-sesion", sesion: null });
      const { cabeceras, porCookie } = consulta;
      try {
        const res = await fetch("/api/sesion", { headers: cabeceras, cache: "no-store", credentials: "same-origin" });
        if (res.status === 200) {
          const datos = (await res.json()) as SesionCliente;
          sesionPorCookie.current = porCookie;
          return poner({ estado: "ok", sesion: datos });
        }
        // Por cookie, 401 es "no hay sesión" (lo normal para quien no entró) y 503 es "Neon Auth sin configurar": las páginas públicas siguen.
        if (porCookie && (res.status === 401 || res.status === 503)) return poner({ estado: "sin-sesion", sesion: null });
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
  }, [prueba, privyListoEfectivo, privyAutenticadoEfectivo, conNeonAuth, versionSesion]);

  // Quién es según la sesión. Mientras no tenga consentimiento vigente es una persona anónima para todo lo que se guarda.
  const idSesion = resultado.estado === "ok" ? (resultado.sesion?.idPersona ?? null) : null;
  // Cambio de proveedor (design §4): lo guardado con las claves anteriores se copia una vez a la nueva, antes de leer nada de la persona.
  const copiadoPara = useRef<string | null>(null);
  if (idSesion === null) {
    copiadoPara.current = null;
  } else if (copiadoPara.current !== idSesion && resultado.sesion?.clavesAnteriores) {
    copiadoPara.current = idSesion;
    try {
      copiarClavesAnteriores(window.localStorage, idSesion, resultado.sesion.clavesAnteriores);
    } catch {
      // Sin almacenamiento no hay nada que copiar.
    }
  }
  // El consentimiento sale del servidor (`consentimiento-en-la-base`): sin su confirmación la persona sigue anónima.
  const { estado: consentimiento, registro, novedades, sensibles } = useConsentimiento(idSesion, cabeceras);
  const detalleConsentimiento = useMemo(() => ({ registro, novedades, sensibles }), [registro, novedades, sensibles]);
  const [falloAceptacionPrevia, setFalloAceptacionPrevia] = useState(false);
  // Se fija antes de dibujar la app: todas las claves del navegador salen con el prefijo de esta persona, pero solo con
  // consentimiento vigente (si no, quedan sin prefijo, como sin sesión: nada se guarda a su nombre).
  const idPersona = consentimiento === "vigente" ? idSesion : null;
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

  // Sin consentimiento vigente no se lee nada de la persona (es anónima): no hay nivel que esperar, la puerta pide aceptar.
  const nivelListo = resultado.estado !== "ok" || consentimiento !== "vigente" || (guardado !== null && guardado.id === idPersona);
  const { nivel, tribuLider } = calcularNivel(
    guardado && guardado.id === idPersona ? guardado.estado : INICIAL,
    resultado.estado === "ok" && resultado.sesion ? resultado.sesion : null,
  );

  const router = useRouter();
  const ruta = usePathname();

  // Aceptación dada en el paso previo al login: se toma (y se borra) en todo inicio de sesión, la haya usado o no, para que no
  // le quede a la persona siguiente de esta pestaña (design §2). Una vez por sesión.
  const aceptacionTomada = useRef<string | null>(null);
  useEffect(() => {
    if (!idSesion) {
      aceptacionTomada.current = null;
      return;
    }
    if (consentimiento === "cargando" || aceptacionTomada.current === idSesion) return;
    aceptacionTomada.current = idSesion;
    let previa = null;
    try {
      previa = tomarAceptacionPrevia(window.sessionStorage, new Date());
    } catch {
      previa = null;
    }
    if (!previa) return;
    let canal: CanalConsentimiento = previa.modo === "alta" ? "alta" : "al-entrar";
    if (consentimiento === "pendiente" && previa.modo !== "alta") canal = canalAlEntrar(registro);
    // Una sola llamada al servidor: registra el general (si hace falta) y la elección de novedades, que él mismo no deja pisar
    // una anterior. La persona pasa a activa recién con su 200; si falla, sigue anónima y la pantalla avisa.
    setFalloAceptacionPrevia(false);
    void aceptarEnServidor(cabeceras, idSesion, { canal, novedades: previa.novedades, aceptadoEn: new Date(previa.aceptadoEn) }).then((estado) => {
      if (estado === null) setFalloAceptacionPrevia(true);
    });
  }, [idSesion, consentimiento, registro, cabeceras]);

  const [paso, setPaso] = useState<{ modo: ModoAlta; alAceptar?: () => void; continuar?: () => void } | null>(null);
  const focoAlAbrir = useRef<HTMLElement | null>(null);

  const entrarComo = useCallback((email: string) => {
    document.cookie = `${COOKIE_PRUEBA}=${encodeURIComponent(email)}; path=/; SameSite=Lax`;
    setPrueba(email);
  }, []);

  // Con Neon Auth, el formulario propio se muestra dentro del diálogo del paso, después de aceptar.
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  const login = privy?.login;
  /**
   * ÚNICA llamada al login (el formulario propio con Neon Auth; Privy; o, sin Privy, "Entrar como…" de Sumarte). Es privada:
   * solo la usa el paso al aceptar, y solo abre con una aceptación previa vigente (design §1). Nada fuera de este archivo
   * llama a `login` de Privy ni monta el formulario.
   */
  const abrirLogin = useCallback(() => {
    let almacen: Storage | null = null;
    try {
      almacen = window.sessionStorage;
    } catch {
      almacen = null;
    }
    intentarLogin(almacen, new Date(), () => {
      const cual = loginAAbrir({ conNeonAuth, hayPrivy: Boolean(login) });
      if (cual === "formulario") return setFormularioAbierto(true);
      if (cual === "privy") return login?.();
      // Sin Privy no hay ventana de login: se lleva a Sumarte, que ofrece "Entrar como…" (modo de prueba). Desde Sumarte no
      // navega: avisa y se queda (el panel ya está en la página).
      if (ruta === "/sumarte") {
        document.getElementById("entrar-como")?.scrollIntoView?.({ block: "center" });
        document.getElementById("entrar-como")?.focus();
        return;
      }
      router.push(`/sumarte?volver=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}#entrar-como`);
    });
  }, [conNeonAuth, login, ruta, router]);

  const entrar = useCallback((opciones?: { modo?: ModoAlta; alAceptar?: () => void }) => {
    focoAlAbrir.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPaso({ modo: opciones?.modo ?? "entrar", alAceptar: opciones?.alAceptar });
  }, []);

  // Elegir un email del panel "Entrar como…": sin aceptación previa vigente, primero se pasa por el paso.
  const entrarComoConPaso = useCallback(
    (email: string) => {
      let puede = false;
      try {
        puede = puedeAbrirLogin(window.sessionStorage, new Date());
      } catch {
        puede = false;
      }
      if (puede) return entrarComo(email);
      focoAlAbrir.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPaso({ modo: "entrar", continuar: () => entrarComo(email) });
    },
    [entrarComo],
  );

  const cancelarPaso = useCallback(() => {
    setPaso(null);
    setFormularioAbierto(false);
    const volver = focoAlAbrir.current;
    setTimeout(() => volver?.focus(), 0);
  }, []);

  const aceptarPaso = useCallback(
    (datos: { novedades: boolean }): boolean => {
      if (!paso) return false;
      let guardado = false;
      try {
        guardado = guardarAceptacionPrevia(window.sessionStorage, new Date(), { modo: paso.modo, novedades: datos.novedades });
      } catch {
        guardado = false;
      }
      if (!guardado) return false;
      paso.alAceptar?.();
      // Con el formulario propio el diálogo sigue abierto: las casillas dejan lugar al formulario.
      if (!(conNeonAuth && !paso.continuar)) setPaso(null);
      (paso.continuar ?? abrirLogin)();
      return true;
    },
    [paso, abrirLogin, conNeonAuth],
  );

  // Código aceptado: la cookie de sesión ya está puesta; se cierra el paso y se vuelve a preguntar quién es.
  const alEntrarConNeon = useCallback(() => {
    sesionPorCookie.current = true;
    setFormularioAbierto(false);
    setPaso(null);
    setVersionSesion((v) => v + 1);
  }, []);

  // Cookie de /admin (ADR-016): solo la sesión de Privy de un super admin verificado; se renueva en cada cambio de ruta y se
  // borra al salir, al cambiar de persona o si el rol deja de ser super admin.
  const rolActual = resultado.estado === "ok" ? resultado.sesion?.rol : undefined;
  useEffect(() => {
    if (prueba === undefined) return;
    const https = window.location.protocol === "https:";
    const p = { prueba, estado: resultado.estado, rol: rolActual };
    if (!debeEscribirCookieAdmin(p)) {
      document.cookie = cookieAdminSegunSesion(p, null, https);
      return;
    }
    let vigente = true;
    void (async () => {
      try {
        const token = await obtenerToken.current?.();
        if (!vigente) return;
        document.cookie = cookieAdminSegunSesion(p, token, https);
      } catch {
        if (vigente) document.cookie = cookieAdminBorrada(https);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [prueba, resultado.estado, rolActual, idPersona, ruta]);

  const logout = privy?.logout;
  const salir = useCallback(async () => {
    document.cookie = cookieAdminBorrada(window.location.protocol === "https:");
    document.cookie = `${COOKIE_PRUEBA}=; path=/; max-age=0; SameSite=Lax`;
    setPrueba(null);
    setResultado({ estado: "sin-sesion", sesion: null });
    // La aceptación del paso no queda en la pestaña para la persona siguiente.
    try {
      descartarAceptacionPrevia(window.sessionStorage);
    } catch {
      // Sin almacenamiento de la pestaña no hay nada que borrar.
    }
    try {
      // Sin persona recordada, el script de tema no pinta con las preferencias de quien acaba de salir.
      window.localStorage.removeItem(CLAVE_ULTIMA_PERSONA);
    } catch {
      // Sin almacenamiento no hay nada que olvidar.
    }
    // Se cierra la sesión del proveedor en uso (si quedara la otra, la persona sigue con esa: solo pasa durante la convivencia).
    const eraPorCookie = sesionPorCookie.current;
    sesionPorCookie.current = false;
    try {
      if (eraPorCookie) await (await import("./neon-auth-cliente")).clienteNeonAuth().signOut();
      else await logout?.();
    } catch {
      // Si el proveedor falla al salir, la sesión de la app igual quedó cerrada.
    }
  }, [logout]);

  const valor = useMemo<ValorSesion>(
    () => ({
      estado: resultado.estado,
      sesion: resultado.sesion,
      emailIntento: prueba ?? privy?.email ?? null,
      nombre: privy?.nombre ?? resultado.sesion?.nombre ?? null,
      billetera: privy?.billetera ?? null,
      loginDisponible: privy !== null || conNeonAuth,
      entrar,
      entrarComo: entrarComoConPaso,
      nivel,
      nivelListo,
      consentimiento,
      detalleConsentimiento,
      falloAceptacionPrevia,
      tribuLider,
      salir,
      cabeceras,
    }),
    [
      resultado,
      prueba,
      privy,
      conNeonAuth,
      entrar,
      entrarComoConPaso,
      nivel,
      nivelListo,
      consentimiento,
      detalleConsentimiento,
      falloAceptacionPrevia,
      tribuLider,
      salir,
      cabeceras,
    ],
  );

  return (
    <ContextoSesion.Provider value={valor}>
      {children}
      <PasoAlta
        abierto={paso !== null}
        modo={paso?.modo ?? "entrar"}
        alAceptar={aceptarPaso}
        alCancelar={cancelarPaso}
        formulario={
          formularioAbierto ? (
            <Suspense fallback={null}>
              <FormularioLogin alEntrar={alEntrarConNeon} alCancelar={cancelarPaso} />
            </Suspense>
          ) : undefined
        }
      />
    </ContextoSesion.Provider>
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
