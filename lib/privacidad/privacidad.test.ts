import { afterEach, describe, expect, it, vi } from "vitest";
import { NOMBRES_BASE } from "@/lib/demo/claves";
import {
  aceptarEnServidor,
  borrarSensibles,
  cambiarNovedadesEnServidor,
  canalAlEntrar,
  consentimientoVigente,
  EVENTO_CONSENTIMIENTO,
  guardarAceptacionPrevia,
  intentarLogin,
  leerSensibles,
  limpiarRegistroAnterior,
  pedirConsentimiento,
  puedeAbrirLogin,
  registrarConsentimientoSensible,
  registroDeEstado,
  retirarEnServidor,
  rutaPideConsentimiento,
  sensiblesVigente,
  tomarAceptacionPrevia,
  VERSION_POLITICA,
  type Almacen,
} from "./consentimiento";
import type { EstadoServidor } from "./estado";
import { exportarMisDatos, nombreArchivoDatos } from "./exportar";
import { DATOS_POR_PANTALLA, ENCARGADOS, FINALIDADES, RESUMEN, VERSIONES_POLITICA } from "./politica";

function almacen(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

const AHORA = new Date("2026-10-14T15:30:00.000Z");
const CABECERAS = async () => ({ "x-lh-prueba": "ana@prueba.test" });

const VIGENTE: EstadoServidor = {
  general: "vigente",
  version: VERSION_POLITICA,
  registradoAt: "2026-11-23T10:00:00.000Z",
  canal: "alta",
  novedades: false,
  novedadesRegistro: null,
};

afterEach(() => vi.unstubAllGlobals());

/** Un `fetch` falso que guarda lo que le pidieron y responde con lo que se le diga. */
function fetchFalso(respuesta: () => Response | Promise<Response>) {
  const llamadas: { url: string; init: RequestInit | undefined }[] = [];
  const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    llamadas.push({ url: String(url), init });
    return respuesta();
  });
  return { f: f as unknown as typeof fetch, llamadas };
}
const ok = (estado: EstadoServidor) => () => new Response(JSON.stringify({ ok: true, estado }), { status: 200 });

describe("el consentimiento según el servidor", () => {
  it("sin estado, o retirado, no hay registro; vigente o con otra versión, sí", () => {
    expect(registroDeEstado(null, null)).toBeNull();
    expect(registroDeEstado({ ...VIGENTE, general: "retirado" }, null)).toBeNull();
    expect(registroDeEstado({ ...VIGENTE, general: "pendiente", version: null, registradoAt: null }, null)).toBeNull();
    const c = registroDeEstado(VIGENTE, null);
    expect(c).toEqual({
      version: VERSION_POLITICA,
      aceptadoEn: "2026-11-23T10:00:00.000Z",
      aceptado: { politica: true, terminos: true },
      canal: "alta",
      sensibles: null,
    });
    expect(consentimientoVigente(c)).toBe(true);
    const vieja = registroDeEstado({ ...VIGENTE, general: "pendiente", version: "2025-vieja" }, null);
    expect(vieja?.version).toBe("2025-vieja");
    expect(consentimientoVigente(vieja)).toBe(false);
    expect(consentimientoVigente(null)).toBe(false);
  });

  it("canalAlEntrar: nueva-version si había una versión vieja, al-entrar si no había nada", () => {
    expect(canalAlEntrar(null)).toBe("al-entrar");
    expect(canalAlEntrar({ version: "2025-vieja" })).toBe("nueva-version");
    expect(canalAlEntrar({ version: VERSION_POLITICA })).toBe("al-entrar");
  });

  it("pedirConsentimiento pide el estado (con las filas si se piden) y manda las cabeceras de la sesión", async () => {
    const { f, llamadas } = fetchFalso(() => new Response(JSON.stringify({ ok: true, estado: VIGENTE, filas: [] }), { status: 200 }));
    expect(await pedirConsentimiento(CABECERAS, {}, f)).toMatchObject({ estado: VIGENTE });
    await pedirConsentimiento(CABECERAS, { filas: true }, f);
    expect(llamadas.map((l) => l.url)).toEqual(["/api/consentimientos", "/api/consentimientos?filas=1"]);
    expect(llamadas[0]!.init?.headers).toEqual({ "x-lh-prueba": "ana@prueba.test" });
  });

  it("si el servidor no responde o responde mal, devuelve null (la persona sigue anónima)", async () => {
    expect(await pedirConsentimiento(CABECERAS, {}, fetchFalso(() => new Response("{}", { status: 503 })).f)).toBeNull();
    expect(await pedirConsentimiento(CABECERAS, {}, fetchFalso(() => new Response("{}", { status: 200 })).f)).toBeNull();
    expect(await pedirConsentimiento(CABECERAS, {}, fetchFalso(() => Promise.reject(new Error("sin red"))).f)).toBeNull();
  });
});

describe("aceptar, retirar y novedades contra el servidor", () => {
  it("aceptarEnServidor manda el camino, la versión, las dos horas del navegador y la casilla de novedades", async () => {
    const { f, llamadas } = fetchFalso(ok(VIGENTE));
    const cuando = new Date("2026-11-23T10:00:00.000Z");
    const ahora = new Date("2026-11-23T10:01:00.000Z");
    const r = await aceptarEnServidor(CABECERAS, "A", { canal: "alta", novedades: true, aceptadoEn: cuando, ahora }, f);
    expect(r).toEqual(VIGENTE);
    expect(llamadas[0]!.init?.method).toBe("POST");
    expect(llamadas[0]!.init?.headers).toMatchObject({ "Content-Type": "application/json", "x-lh-prueba": "ana@prueba.test" });
    expect(JSON.parse(String(llamadas[0]!.init?.body))).toEqual({
      accion: "acepta",
      canal: "alta",
      version: VERSION_POLITICA,
      aceptadoEnCliente: "2026-11-23T10:00:00.000Z",
      enviadoEnCliente: "2026-11-23T10:01:00.000Z",
      novedades: "acepta",
    });
  });

  it("la casilla sin marcar manda retira, y sin casilla a la vista manda sin-cambio", async () => {
    const { f, llamadas } = fetchFalso(ok(VIGENTE));
    await aceptarEnServidor(CABECERAS, "A", { canal: "al-entrar", novedades: false }, f);
    await aceptarEnServidor(CABECERAS, "A", { canal: "al-entrar" }, f);
    const cuerpos = llamadas.map((l) => JSON.parse(String(l.init?.body)) as { novedades: string });
    expect(cuerpos.map((c) => c.novedades)).toEqual(["retira", "sin-cambio"]);
  });

  it("si el servidor falla (500) o no responde, devuelve null y no avisa a la app", async () => {
    const escucha = vi.fn();
    const ventana = new EventTarget();
    ventana.addEventListener(EVENTO_CONSENTIMIENTO, escucha);
    vi.stubGlobal("window", ventana);
    expect(await aceptarEnServidor(CABECERAS, "A", { canal: "alta" }, fetchFalso(() => new Response("{}", { status: 500 })).f)).toBeNull();
    expect(await aceptarEnServidor(CABECERAS, "A", { canal: "alta" }, fetchFalso(() => Promise.reject(new Error("sin red"))).f)).toBeNull();
    expect(escucha).not.toHaveBeenCalled();
  });

  it("al confirmar el servidor avisa a la app con el estado nuevo", async () => {
    const escucha = vi.fn();
    const ventana = new EventTarget();
    ventana.addEventListener(EVENTO_CONSENTIMIENTO, (e) => escucha((e as CustomEvent).detail));
    vi.stubGlobal("window", ventana);
    await aceptarEnServidor(CABECERAS, "A", { canal: "alta" }, fetchFalso(ok(VIGENTE)).f);
    expect(escucha).toHaveBeenCalledWith({ id: "A", estado: VIGENTE });
  });

  it("retirarEnServidor pide el retiro desde Mis datos y no avisa a la app (quien retira borra y sale)", async () => {
    const escucha = vi.fn();
    const ventana = new EventTarget();
    ventana.addEventListener(EVENTO_CONSENTIMIENTO, escucha);
    vi.stubGlobal("window", ventana);
    const { f, llamadas } = fetchFalso(ok({ ...VIGENTE, general: "retirado" }));
    expect(await retirarEnServidor(CABECERAS, "A", f)).toMatchObject({ general: "retirado" });
    expect(JSON.parse(String(llamadas[0]!.init?.body))).toEqual({ accion: "retira", canal: "mis-datos", version: VERSION_POLITICA });
    expect(escucha).not.toHaveBeenCalled();
  });

  it("cambiarNovedadesEnServidor da o retira desde Mis datos", async () => {
    const { f, llamadas } = fetchFalso(ok(VIGENTE));
    await cambiarNovedadesEnServidor(CABECERAS, "A", true, f);
    await cambiarNovedadesEnServidor(CABECERAS, "A", false, f);
    const cuerpos = llamadas.map((l) => JSON.parse(String(l.init?.body)) as Record<string, unknown>);
    expect(cuerpos).toEqual([
      { accion: "acepta", canal: "mis-datos", version: VERSION_POLITICA, novedades: "acepta" },
      { accion: "acepta", canal: "mis-datos", version: VERSION_POLITICA, novedades: "retira" },
    ]);
  });
});

describe("lo que el navegador guardaba antes", () => {
  it("se ignora y se borra; el consentimiento de sensibles pasa a su propia clave", () => {
    const a = almacen({
      "u:A:lh-consentimiento": JSON.stringify({
        version: VERSION_POLITICA,
        aceptadoEn: "2026-10-01T00:00:00.000Z",
        aceptado: { politica: true, terminos: true },
        sensibles: { version: VERSION_POLITICA, aceptadoEn: "2026-10-02T00:00:00.000Z" },
      }),
      "u:A:lh-novedades": JSON.stringify({ evento: "acepta" }),
      "u:B:lh-consentimiento": "de otra persona",
    });
    limpiarRegistroAnterior(a, "A");
    expect([...a.datos.keys()].sort()).toEqual(["u:A:lh-consentimiento-sensibles", "u:B:lh-consentimiento"]);
    expect(sensiblesVigente(leerSensibles(a, "A"))).toBe(true);
    expect(leerSensibles(a, "A")?.aceptadoEn).toBe("2026-10-02T00:00:00.000Z");
  });

  it("no pisa un consentimiento de sensibles ya guardado aparte y tolera un registro dañado", () => {
    const a = almacen({
      "u:A:lh-consentimiento": "no es json",
      "u:A:lh-consentimiento-sensibles": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "2026-10-05T00:00:00.000Z" }),
    });
    limpiarRegistroAnterior(a, "A");
    expect(a.datos.has("u:A:lh-consentimiento")).toBe(false);
    expect(leerSensibles(a, "A")?.aceptadoEn).toBe("2026-10-05T00:00:00.000Z");
  });

  it("sin almacenamiento no rompe", () => {
    const roto = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(() => limpiarRegistroAnterior(roto, "A")).not.toThrow();
  });
});

describe("consentimiento para datos sensibles (sigue en el navegador)", () => {
  it("queda registrado aparte, con su fecha, y vale solo para la versión vigente", () => {
    const a = almacen();
    expect(sensiblesVigente(leerSensibles(a, "A"))).toBe(false);
    expect(registrarConsentimientoSensible(a, "A", new Date("2026-10-15T10:00:00.000Z"))).toBe(true);
    expect(a.datos.has("u:A:lh-consentimiento-sensibles")).toBe(true);
    const s = leerSensibles(a, "A");
    expect(sensiblesVigente(s)).toBe(true);
    expect(s?.aceptadoEn).toBe("2026-10-15T10:00:00.000Z");
    expect(sensiblesVigente({ version: "2025-vieja", aceptadoEn: "x" })).toBe(false);
  });

  it("no depende de la persona activa ni se mezcla con otra, y se puede borrar", () => {
    const a = almacen();
    registrarConsentimientoSensible(a, "A", AHORA);
    expect(leerSensibles(a, "B")).toBeNull();
    expect(borrarSensibles(a, "A")).toBe(true);
    expect(leerSensibles(a, "A")).toBeNull();
  });

  it("si el navegador no deja guardar, devuelve false; un registro dañado se lee como sin dato", () => {
    const roto = { setItem: () => { throw new Error("lleno"); } };
    expect(registrarConsentimientoSensible(roto, "A")).toBe(false);
    expect(leerSensibles(almacen({ "u:A:lh-consentimiento-sensibles": "no es json" }), "A")).toBeNull();
  });
});

describe("aceptación previa al login", () => {
  const T0 = new Date("2026-11-23T10:00:00.000Z");
  const minutos = (n: number) => new Date(T0.getTime() + n * 60_000);

  it("dentro del plazo devuelve la fecha, el modo y las novedades, y la borra", () => {
    const a = almacen();
    guardarAceptacionPrevia(a, T0, { modo: "alta", novedades: true });
    expect(tomarAceptacionPrevia(a, minutos(2))).toEqual({ aceptadoEn: T0.toISOString(), modo: "alta", novedades: true });
    expect(a.datos.size).toBe(0);
    expect(tomarAceptacionPrevia(a, minutos(2))).toBeNull();
  });

  it("a los 6 minutos devuelve null y igual la borra", () => {
    const a = almacen();
    guardarAceptacionPrevia(a, T0, { modo: "entrar", novedades: false });
    expect(tomarAceptacionPrevia(a, minutos(6))).toBeNull();
    expect(a.datos.size).toBe(0);
  });

  it("de otra versión devuelve null", () => {
    const a = almacen({
      "lh-consentimiento-previo": JSON.stringify({ version: "2025-vieja", aceptadoEn: T0.toISOString(), modo: "alta", novedades: false }),
    });
    expect(puedeAbrirLogin(a, T0)).toBe(false);
    expect(tomarAceptacionPrevia(a, T0)).toBeNull();
  });

  it("sin almacenamiento no rompe", () => {
    expect(tomarAceptacionPrevia(null, T0)).toBeNull();
    expect(puedeAbrirLogin(null, T0)).toBe(false);
    const roto = { setItem: () => { throw new Error("lleno"); } };
    expect(guardarAceptacionPrevia(roto, T0, { modo: "alta", novedades: false })).toBe(false);
  });

  it("puedeAbrirLogin: false sin aceptación o vencida, true dentro del plazo, y no borra", () => {
    const a = almacen();
    expect(puedeAbrirLogin(a, T0)).toBe(false);
    guardarAceptacionPrevia(a, T0, { modo: "entrar", novedades: false });
    expect(puedeAbrirLogin(a, minutos(4))).toBe(true);
    expect(puedeAbrirLogin(a, minutos(4))).toBe(true);
    expect(a.datos.size).toBe(1);
    expect(puedeAbrirLogin(a, minutos(6))).toBe(false);
  });

  it("intentarLogin con un login falso: sin aceptación no se llama; vigente, una vez; vencida o de otra versión, no", () => {
    let llamadas = 0;
    const login = () => void (llamadas += 1);
    const a = almacen();
    expect(intentarLogin(a, T0, login)).toBe(false);
    expect(llamadas).toBe(0);
    guardarAceptacionPrevia(a, T0, { modo: "alta", novedades: false });
    expect(intentarLogin(a, minutos(1), login)).toBe(true);
    expect(llamadas).toBe(1);
    expect(intentarLogin(a, minutos(6), login)).toBe(false);
    expect(llamadas).toBe(1);
    const otra = almacen({
      "lh-consentimiento-previo": JSON.stringify({ version: "2025-vieja", aceptadoEn: T0.toISOString(), modo: "alta", novedades: false }),
    });
    expect(intentarLogin(otra, T0, login)).toBe(false);
    expect(intentarLogin(null, T0, login)).toBe(false);
    expect(llamadas).toBe(1);
  });
});

describe("novedades por email", () => {
  it("la descarga las trae de las filas del servidor y no entran en NOMBRES_BASE", () => {
    const filas = [
      { tipo: "politica", evento: "acepta", version: VERSION_POLITICA, canal: "alta", idioma: null, registradoAt: "2026-11-23T10:00:00.000Z", aceptadoEnCliente: null },
      { tipo: "novedades", evento: "acepta", version: VERSION_POLITICA, canal: "alta", idioma: null, registradoAt: "2026-11-23T10:00:00.000Z", aceptadoEnCliente: null },
    ];
    const datos = exportarMisDatos({ almacen: almacen(), idPersona: "A", email: null, billetera: null, filas }).datos as Record<string, unknown>;
    expect(datos.novedades).toEqual([filas[1]]);
    expect(datos.consentimiento).toEqual([filas[0]]);
    expect(Object.values(NOMBRES_BASE)).not.toContain("lh-novedades");
    expect(Object.keys(NOMBRES_BASE)).not.toContain("novedades");
  });
});

describe("versiones de la política", () => {
  it("la última es la vigente y toda versión después de la primera tiene cambios", () => {
    expect(VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!.version).toBe(VERSION_POLITICA);
    for (const v of VERSIONES_POLITICA.slice(1)) expect(v.cambios.length).toBeGreaterThan(0);
  });

  it("la vigente (lotes-en-la-base) informa su cambio: las reservas pasan a la base", () => {
    const vigente = VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!;
    expect(vigente.version).toBe(VERSION_POLITICA);
    expect(vigente.cambios).toEqual([
      "Las reservas de lotes simulados ya no quedan solo en tu navegador: se guardan en la base de la plataforma para que un lote reservado se vea reservado para todos.",
      "Las casillas se marcan una sola vez: si ya aceptaste esta versión, entrás directo.",
    ]);
    expect(VERSIONES_POLITICA.find((v) => v.version === "2026-11-24-borrador")!.cambios).toEqual([
      "El login pasa a hacerse con Neon (Neon Auth); Privy se va a retirar.",
    ]);
  });

  it("la versión del alta (tres cambios) sigue en el historial", () => {
    expect(VERSIONES_POLITICA.find((v) => v.version === "2026-11-23-borrador")!.cambios).toHaveLength(3);
  });

  it("Neon figura como encargado del login, en uso, y Privy hasta que se retire; la fila del login nombra a los dos", () => {
    const neon = ENCARGADOS.find((e) => e.nombre === "Neon");
    expect(neon).toMatchObject({ para: "Base de datos y login (Neon Auth)", estado: "En uso" });
    expect(ENCARGADOS.find((e) => e.nombre === "Privy")?.para).toBe("Login y billetera, hasta que se retire");
    expect(DATOS_POR_PANTALLA.find((d) => d.pantalla === "Entrar (login)")?.donde).toContain("Privy o Neon (Neon Auth), según cómo entraste");
  });

  it("la tabla tiene la cookie de idioma", () => {
    expect(DATOS_POR_PANTALLA.some((d) => d.datos.includes("lh-idioma"))).toBe(true);
  });
});

describe("qué rutas piden el consentimiento", () => {
  it.each(["/sumarte", "/sumarte?volver=/pactos", "/pactos", "/perfil", "/mis-datos", "/netx", "/tribus/valle/postular", "/", "/tribus", "/territorios/lighthouse", "/congreso"])(
    "%s lo pide",
    (ruta) => expect(rutaPideConsentimiento(ruta)).toBe(true),
  );
  it.each(["/privacidad", "/privacidad#terminos", "/privacidad/"])("%s se puede leer sin aceptar", (ruta) =>
    expect(rutaPideConsentimiento(ruta)).toBe(false),
  );
});

describe("exportar mis datos", () => {
  it("incluye los equipos a los que la persona pidió sumarse", () => {
    const a = almacen({ "u:A:lh-equipos": JSON.stringify({ "comun-agua": "pedido" }) });
    const datos = exportarMisDatos({ almacen: a, idPersona: "A", email: null, billetera: null }).datos as Record<string, unknown>;
    expect(datos.equipos).toEqual({ "comun-agua": "pedido" });
    const sin = exportarMisDatos({ almacen: almacen({}), idPersona: "A", email: null, billetera: null }).datos as Record<string, unknown>;
    expect(sin.equipos).toBeNull();
  });

  it("incluye los datos de la persona, el consentimiento y marca lo que falta como null", () => {
    const a = almacen({
      "u:A:lh-perfil": JSON.stringify({ nombre: "Ana" }),
      "u:A:lh-pactos": JSON.stringify({ comunidades: {} }),
      "u:A:lh-consentimiento-sensibles": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "2026-10-02T00:00:00.000Z" }),
    });
    const fila = { tipo: "politica", evento: "acepta", version: VERSION_POLITICA, canal: "alta", idioma: null, registradoAt: "2026-10-01T00:00:00.000Z", aceptadoEnCliente: null };
    const r = exportarMisDatos({ almacen: a, idPersona: "A", email: "ana@prueba.test", billetera: null, filas: [fila], ahora: AHORA });
    expect(r.exportadoEn).toBe("2026-10-14T15:30:00.000Z");
    expect(r.persona).toEqual({ email: "ana@prueba.test", billetera: null });
    const datos = r.datos as Record<string, unknown>;
    expect(datos.perfilDatos).toEqual({ nombre: "Ana" });
    expect(datos.pactos).toEqual({ comunidades: {} });
    expect(datos.consentimiento).toEqual([fila]);
    expect(datos.novedades).toEqual([]);
    expect(datos.consentimientoSensibles).toEqual({ version: VERSION_POLITICA, aceptadoEn: "2026-10-02T00:00:00.000Z" });
    // El dato que falta no es cero ni vacío.
    expect(datos.kyc).toBeNull();
    expect(datos.semillasRonda).toBeNull();
  });

  it("si el servidor no respondió, el consentimiento sale como null (sin dato), no como lista vacía", () => {
    const datos = exportarMisDatos({ almacen: almacen(), idPersona: "A", email: null, billetera: null }).datos as Record<string, unknown>;
    expect(datos.consentimiento).toBeNull();
    expect(datos.novedades).toBeNull();
  });

  it("no incluye nada de otra persona ni de antes del login", () => {
    const a = almacen({
      "u:A:lh-perfil": JSON.stringify({ nombre: "Ana" }),
      "u:B:lh-perfil": JSON.stringify({ nombre: "Beto" }),
      "u:B:lh-kyc": JSON.stringify({ estado: "aprobado" }),
      "lh-perfil": JSON.stringify({ nombre: "Anónimo" }),
    });
    const texto = JSON.stringify(exportarMisDatos({ almacen: a, idPersona: "A", email: "ana@prueba.test", billetera: null }));
    expect(texto).toContain("Ana");
    expect(texto).not.toContain("Beto");
    expect(texto).not.toContain("Anónimo");
    expect(texto).not.toContain("aprobado");
  });

  it("incluye solo las constancias de los pactos de la persona, y null si el registro no se puede leer", () => {
    const base = { esquema: "pacto-propone", afirma: "x", por: "x", version: 1, apuntaA: null, cuando: "2026-10-28T10:00:00.000Z", revocable: true, datos: {} };
    const a = almacen({
      "compartido:pactos-constancias": JSON.stringify([
        { ...base, id: "p1-pacto-propone", sobre: "pacto:valle:A" },
        { ...base, id: "p2-pacto-propone", sobre: "pacto:valle:B" },
      ]),
    });
    const r = exportarMisDatos({ almacen: a, idPersona: "A", email: null, billetera: null });
    const lista = (r.datos as Record<string, unknown>).pactosConstancias as { sobre: string }[];
    expect(lista.map((c) => c.sobre)).toEqual(["pacto:valle:A"]);
    const roto = { getItem: () => { throw new Error("no"); } };
    expect((exportarMisDatos({ almacen: roto, idPersona: "A", email: null, billetera: null }).datos as Record<string, unknown>).pactosConstancias).toBeNull();
  });

  it("un valor que no es JSON se entrega tal cual", () => {
    const a = almacen({ "u:A:lh-origen": "newsletter" });
    const r = exportarMisDatos({ almacen: a, idPersona: "A", email: null, billetera: null });
    expect((r.datos as Record<string, unknown>).origen).toBe("newsletter");
  });

  it("el nombre del archivo lleva la fecha", () => {
    expect(nombreArchivoDatos(AHORA)).toBe("mis-datos-lighthouse-2026-10-14.json");
  });
});

describe("la política sin Compromisos", () => {
  it("ni el resumen, ni la tabla, ni las finalidades nombran los compromisos", () => {
    const textos = [...RESUMEN, ...DATOS_POR_PANTALLA.flatMap((d) => [d.pantalla, d.datos, d.donde]), ...FINALIDADES];
    expect(textos.filter((t) => /compromiso/i.test(t))).toEqual([]);
  });

  it("la versión de los lotes simulados (ADR-017) sigue en el historial y la vigente es la de las reservas en la base", () => {
    expect(VERSIONES_POLITICA.map((v) => v.version)).toContain("2026-11-03-borrador");
    expect(VERSION_POLITICA).toBe("2026-11-25-borrador");
  });
});

describe("la política con lotes simulados", () => {
  it("la tabla tiene la pantalla Lotes (simulado), sin datos de pago ni de identidad", () => {
    const fila = DATOS_POR_PANTALLA.find((d) => d.pantalla === "Lotes (simulado)");
    expect(fila).toBeDefined();
    expect(fila!.datos).toContain("Nunca datos de pago ni de identidad");
    expect(fila!.donde).toContain("Neon");
    expect(fila!.donde).not.toMatch(/solo en tu navegador/i);
  });

  it("el resumen y las finalidades nombran los lotes simulados", () => {
    expect(RESUMEN.some((t) => t.includes("lotes simulados"))).toBe(true);
    expect(FINALIDADES.some((t) => t.includes("simular la reserva y la compra de un lote"))).toBe(true);
  });

  it("la descarga de Mis datos trae las reservas del servidor, y null (sin dato) si no se pudieron pedir", () => {
    const entrada = { almacen: almacen({}), idPersona: "A", email: null, billetera: null };
    const con = exportarMisDatos({ ...entrada, actividad: { reservas: [{ loteId: "x", evento: "reserva" }], origen: { fuente: "mail" } } }).datos as Record<string, unknown>;
    expect(con.reservas).toEqual([{ loteId: "x", evento: "reserva" }]);
    expect(con.origenPrimeraVisita).toEqual({ fuente: "mail" });
    const sin = exportarMisDatos({ ...entrada, actividad: null }).datos as Record<string, unknown>;
    expect(sin.reservas).toBeNull();
    expect(sin.origenPrimeraVisita).toBeNull();
    // Lo que el navegador tenía de lotes ya no se exporta: no es una clave de la app.
    expect("lotes" in sin).toBe(false);
  });
});
