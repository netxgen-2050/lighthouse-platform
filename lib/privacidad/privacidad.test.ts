import { describe, expect, it } from "vitest";
import { establecerPersona, NOMBRES_BASE } from "@/lib/demo/claves";
import {
  consentimientoVigente,
  guardarAceptacionPrevia,
  intentarLogin,
  leerConsentimiento,
  puedeAbrirLogin,
  registrarConsentimiento,
  registrarConsentimientoSensible,
  retirarConsentimiento,
  rutaPideConsentimiento,
  sensiblesVigente,
  tomarAceptacionPrevia,
  VERSION_POLITICA,
  type Almacen,
} from "./consentimiento";
import { exportarMisDatos, nombreArchivoDatos } from "./exportar";
import { darNovedades, leerNovedades, registrarEleccionNovedades, retirarNovedades } from "./novedades";
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
const TODO = { politica: true, terminos: true };

describe("registro del consentimiento", () => {
  it("sin registro no hay consentimiento vigente", () => {
    expect(consentimientoVigente(leerConsentimiento(almacen(), "A"))).toBe(false);
  });

  it("registra la versión, la fecha y qué se aceptó, con el id explícito de la persona", () => {
    const a = almacen();
    expect(registrarConsentimiento(a, "A", TODO, { aceptadoEn: AHORA })).toBe(true);
    expect(a.datos.has("u:A:lh-consentimiento")).toBe(true);
    const c = leerConsentimiento(a, "A");
    expect(c).toMatchObject({
      version: VERSION_POLITICA,
      aceptadoEn: "2026-10-14T15:30:00.000Z",
      aceptado: { politica: true, terminos: true },
      sensibles: null,
    });
    expect(consentimientoVigente(c)).toBe(true);
  });

  it("la clave no depende de la persona activa", () => {
    establecerPersona("B");
    const a = almacen();
    registrarConsentimiento(a, "A", TODO);
    establecerPersona(null);
    expect([...a.datos.keys()]).toEqual(["u:A:lh-consentimiento"]);
    expect(leerConsentimiento(a, "B")).toBeNull();
  });

  it.each(["alta", "al-entrar", "nueva-version"] as const)("guarda el camino %s", (canal) => {
    const a = almacen();
    registrarConsentimiento(a, "A", TODO, { canal });
    expect(leerConsentimiento(a, "A")?.canal).toBe(canal);
  });

  it("un registro viejo sin camino sigue valiendo", () => {
    const a = almacen({
      "u:A:lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "2026-10-01T00:00:00.000Z", aceptado: TODO, sensibles: null }),
    });
    const c = leerConsentimiento(a, "A");
    expect(consentimientoVigente(c)).toBe(true);
    expect(c?.canal).toBeUndefined();
  });

  it("un camino desconocido (como otro) descarta el registro", () => {
    const a = almacen({
      "u:A:lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "x", aceptado: TODO, canal: "otro", sensibles: null }),
    });
    expect(leerConsentimiento(a, "A")).toBeNull();
  });

  it("las dos casillas son obligatorias: con una sola no se registra nada", () => {
    const a = almacen();
    expect(registrarConsentimiento(a, "A", { politica: true, terminos: false })).toBe(false);
    expect(registrarConsentimiento(a, "A", { politica: false, terminos: true })).toBe(false);
    expect(a.datos.size).toBe(0);
  });

  it("con otra versión de la política hay que volver a aceptar", () => {
    const a = almacen({
      "u:A:lh-consentimiento": JSON.stringify({
        version: "2025-vieja",
        aceptadoEn: "2025-01-01T00:00:00.000Z",
        aceptado: { politica: true, terminos: true },
        sensibles: null,
      }),
    });
    const c = leerConsentimiento(a, "A");
    expect(c).not.toBeNull();
    expect(consentimientoVigente(c)).toBe(false);
  });

  it("un registro dañado o incompleto cuenta como sin consentimiento", () => {
    expect(leerConsentimiento(almacen({ "u:A:lh-consentimiento": "no es json" }), "A")).toBeNull();
    expect(leerConsentimiento(almacen({ "u:A:lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA }) }), "A")).toBeNull();
    expect(
      leerConsentimiento(
        almacen({
          "u:A:lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "x", aceptado: { politica: true, terminos: false } }),
        }),
        "A",
      ),
    ).toBeNull();
  });

  it("si el navegador no deja guardar, devuelve false", () => {
    const roto = { getItem: () => null, setItem: () => { throw new Error("lleno"); } };
    expect(registrarConsentimiento(roto, "A", TODO)).toBe(false);
  });

  it("retirar borra el registro", () => {
    const a = almacen();
    registrarConsentimiento(a, "A", TODO);
    expect(retirarConsentimiento(a, "A")).toBe(true);
    expect(leerConsentimiento(a, "A")).toBeNull();
  });
});

describe("consentimiento para datos sensibles", () => {
  it("pide haber aceptado antes la política", () => {
    const a = almacen();
    expect(registrarConsentimientoSensible(a, "A", AHORA)).toBe(false);
    expect(sensiblesVigente(leerConsentimiento(a, "A"))).toBe(false);
  });

  it("queda registrado aparte, con su fecha", () => {
    const a = almacen();
    registrarConsentimiento(a, "A", TODO);
    expect(sensiblesVigente(leerConsentimiento(a, "A"))).toBe(false);
    expect(registrarConsentimientoSensible(a, "A", new Date("2026-10-15T10:00:00.000Z"))).toBe(true);
    const c = leerConsentimiento(a, "A");
    expect(sensiblesVigente(c)).toBe(true);
    expect(c?.sensibles?.aceptadoEn).toBe("2026-10-15T10:00:00.000Z");
  });

  it("aceptar de nuevo la misma versión no pierde el consentimiento sensible", () => {
    const a = almacen();
    registrarConsentimiento(a, "A", TODO);
    registrarConsentimientoSensible(a, "A", AHORA);
    registrarConsentimiento(a, "A", TODO);
    expect(sensiblesVigente(leerConsentimiento(a, "A"))).toBe(true);
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
  it("dar y retirar guardan versión, fecha y camino", () => {
    const a = almacen();
    expect(darNovedades(a, "A", { canal: "alta", ahora: AHORA })).toBe(true);
    expect(leerNovedades(a, "A")).toEqual({ evento: "acepta", version: VERSION_POLITICA, registradoEn: AHORA.toISOString(), canal: "alta" });
    retirarNovedades(a, "A", { canal: "mis-datos", ahora: AHORA });
    expect(leerNovedades(a, "A")).toMatchObject({ evento: "retira", canal: "mis-datos" });
  });

  it("sin registro o con un camino desconocido se lee como que no las recibe", () => {
    expect(leerNovedades(almacen(), "A")).toBeNull();
    const a = almacen({
      "u:A:lh-novedades": JSON.stringify({ evento: "acepta", version: VERSION_POLITICA, registradoEn: AHORA.toISOString(), canal: "otro" }),
    });
    expect(leerNovedades(a, "A")).toBeNull();
  });

  it("la casilla sin marcar escribe retira si no había elección, y no pisa una anterior", () => {
    const a = almacen();
    registrarEleccionNovedades(a, "A", false, { canal: "alta" });
    expect(leerNovedades(a, "A")?.evento).toBe("retira");
    registrarEleccionNovedades(a, "A", true, { canal: "al-entrar" });
    expect(leerNovedades(a, "A")).toMatchObject({ evento: "acepta", canal: "al-entrar" });
    registrarEleccionNovedades(a, "A", false, { canal: "nueva-version" });
    expect(leerNovedades(a, "A")).toMatchObject({ evento: "acepta", canal: "al-entrar" });
  });

  it("la exportación lo incluye y no entra en NOMBRES_BASE", () => {
    const a = almacen();
    darNovedades(a, "A", { canal: "alta", ahora: AHORA });
    const datos = exportarMisDatos({ almacen: a, idPersona: "A", email: null, billetera: null }).datos as Record<string, unknown>;
    expect(datos.novedades).toMatchObject({ evento: "acepta" });
    expect(Object.values(NOMBRES_BASE)).not.toContain("lh-novedades");
    expect(Object.keys(NOMBRES_BASE)).not.toContain("novedades");
  });
});

describe("versiones de la política", () => {
  it("la última es la vigente y toda versión después de la primera tiene cambios", () => {
    expect(VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!.version).toBe(VERSION_POLITICA);
    for (const v of VERSIONES_POLITICA.slice(1)) expect(v.cambios.length).toBeGreaterThan(0);
  });

  it("la vigente (login-neon-auth) informa su cambio: el login pasa a Neon Auth y Privy se retira", () => {
    const vigente = VERSIONES_POLITICA[VERSIONES_POLITICA.length - 1]!;
    expect(vigente.version).toBe(VERSION_POLITICA);
    expect(vigente.cambios).toEqual(["El login pasa a hacerse con Neon (Neon Auth); Privy se va a retirar."]);
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
      "u:A:lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA }),
    });
    const r = exportarMisDatos({ almacen: a, idPersona: "A", email: "ana@prueba.test", billetera: null, ahora: AHORA });
    expect(r.exportadoEn).toBe("2026-10-14T15:30:00.000Z");
    expect(r.persona).toEqual({ email: "ana@prueba.test", billetera: null });
    const datos = r.datos as Record<string, unknown>;
    expect(datos.perfilDatos).toEqual({ nombre: "Ana" });
    expect(datos.pactos).toEqual({ comunidades: {} });
    expect(datos.consentimiento).toEqual({ version: VERSION_POLITICA });
    // El dato que falta no es cero ni vacío.
    expect(datos.kyc).toBeNull();
    expect(datos.semillasRonda).toBeNull();
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

  it("la versión de los lotes simulados (ADR-017) sigue en el historial y la vigente es la del login con Neon Auth", () => {
    expect(VERSIONES_POLITICA.map((v) => v.version)).toContain("2026-11-03-borrador");
    expect(VERSION_POLITICA).toBe("2026-11-24-borrador");
  });
});

describe("la política con lotes simulados", () => {
  it("la tabla tiene la pantalla Lotes (simulado), sin datos de pago ni de identidad", () => {
    const fila = DATOS_POR_PANTALLA.find((d) => d.pantalla === "Lotes (simulado)");
    expect(fila).toBeDefined();
    expect(fila!.datos).toContain("Nunca datos de pago ni de identidad");
    expect(fila!.donde).toContain("Solo en tu navegador");
  });

  it("el resumen y las finalidades nombran los lotes simulados", () => {
    expect(RESUMEN.some((t) => t.includes("lotes simulados"))).toBe(true);
    expect(FINALIDADES.some((t) => t.includes("simular la reserva y la compra de un lote"))).toBe(true);
  });

  it("la descarga de Mis datos trae lo de los lotes", () => {
    const datos = exportarMisDatos({
      almacen: almacen({ "u:A:lh-lotes": JSON.stringify([{ loteId: "x" }]) }),
      idPersona: "A",
      email: null,
      billetera: null,
    }).datos as Record<string, unknown>;
    expect(datos.lotes).toEqual([{ loteId: "x" }]);
  });
});
