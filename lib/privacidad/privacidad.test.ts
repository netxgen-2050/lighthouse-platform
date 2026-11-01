import { afterEach, describe, expect, it } from "vitest";
import { establecerPersona } from "@/lib/demo/claves";
import {
  consentimientoVigente,
  leerConsentimiento,
  registrarConsentimiento,
  registrarConsentimientoSensible,
  retirarConsentimiento,
  rutaPideConsentimiento,
  sensiblesVigente,
  VERSION_POLITICA,
  type Almacen,
} from "./consentimiento";
import { exportarMisDatos, nombreArchivoDatos } from "./exportar";
import { DATOS_POR_PANTALLA, FINALIDADES, RESUMEN } from "./politica";

function almacen(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

afterEach(() => establecerPersona(null));

const AHORA = new Date("2026-10-14T15:30:00.000Z");

describe("registro del consentimiento", () => {
  it("sin registro no hay consentimiento vigente", () => {
    expect(consentimientoVigente(leerConsentimiento(almacen()))).toBe(false);
  });

  it("registra la versión, la fecha y qué se aceptó, con el prefijo de la persona", () => {
    establecerPersona("A");
    const a = almacen();
    expect(registrarConsentimiento(a, { politica: true, terminos: true }, AHORA)).toBe(true);
    expect(a.datos.has("u:A:lh-consentimiento")).toBe(true);
    const c = leerConsentimiento(a);
    expect(c).toMatchObject({
      version: VERSION_POLITICA,
      aceptadoEn: "2026-10-14T15:30:00.000Z",
      aceptado: { politica: true, terminos: true },
      sensibles: null,
    });
    expect(consentimientoVigente(c)).toBe(true);
  });

  it("las dos casillas son obligatorias: con una sola no se registra nada", () => {
    const a = almacen();
    expect(registrarConsentimiento(a, { politica: true, terminos: false }, AHORA)).toBe(false);
    expect(registrarConsentimiento(a, { politica: false, terminos: true }, AHORA)).toBe(false);
    expect(a.datos.size).toBe(0);
  });

  it("con otra versión de la política hay que volver a aceptar", () => {
    const a = almacen({
      "lh-consentimiento": JSON.stringify({
        version: "2025-vieja",
        aceptadoEn: "2025-01-01T00:00:00.000Z",
        aceptado: { politica: true, terminos: true },
        sensibles: null,
      }),
    });
    const c = leerConsentimiento(a);
    expect(c).not.toBeNull();
    expect(consentimientoVigente(c)).toBe(false);
  });

  it("un registro dañado o incompleto cuenta como sin consentimiento", () => {
    expect(leerConsentimiento(almacen({ "lh-consentimiento": "no es json" }))).toBeNull();
    expect(leerConsentimiento(almacen({ "lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA }) }))).toBeNull();
    expect(
      leerConsentimiento(
        almacen({
          "lh-consentimiento": JSON.stringify({ version: VERSION_POLITICA, aceptadoEn: "x", aceptado: { politica: true, terminos: false } }),
        }),
      ),
    ).toBeNull();
  });

  it("si el navegador no deja guardar, devuelve false", () => {
    const roto = { getItem: () => null, setItem: () => { throw new Error("lleno"); } };
    expect(registrarConsentimiento(roto, { politica: true, terminos: true }, AHORA)).toBe(false);
  });

  it("retirar borra el registro", () => {
    const a = almacen();
    registrarConsentimiento(a, { politica: true, terminos: true }, AHORA);
    expect(retirarConsentimiento(a)).toBe(true);
    expect(leerConsentimiento(a)).toBeNull();
  });
});

describe("consentimiento para datos sensibles", () => {
  it("pide haber aceptado antes la política", () => {
    const a = almacen();
    expect(registrarConsentimientoSensible(a, AHORA)).toBe(false);
    expect(sensiblesVigente(leerConsentimiento(a))).toBe(false);
  });

  it("queda registrado aparte, con su fecha", () => {
    const a = almacen();
    registrarConsentimiento(a, { politica: true, terminos: true }, AHORA);
    expect(sensiblesVigente(leerConsentimiento(a))).toBe(false);
    expect(registrarConsentimientoSensible(a, new Date("2026-10-15T10:00:00.000Z"))).toBe(true);
    const c = leerConsentimiento(a);
    expect(sensiblesVigente(c)).toBe(true);
    expect(c?.sensibles?.aceptadoEn).toBe("2026-10-15T10:00:00.000Z");
  });

  it("aceptar de nuevo la misma versión no pierde el consentimiento sensible", () => {
    const a = almacen();
    registrarConsentimiento(a, { politica: true, terminos: true }, AHORA);
    registrarConsentimientoSensible(a, AHORA);
    registrarConsentimiento(a, { politica: true, terminos: true }, AHORA);
    expect(sensiblesVigente(leerConsentimiento(a))).toBe(true);
  });
});

describe("qué rutas piden el consentimiento", () => {
  it.each(["/sumarte", "/sumarte?volver=/pactos", "/pactos", "/perfil", "/mis-datos", "/netx", "/tribus/valle/postular"])(
    "%s lo pide",
    (ruta) => expect(rutaPideConsentimiento(ruta)).toBe(true),
  );
  it.each(["/", "/tribus", "/tribus/valle", "/territorios/lighthouse", "/privacidad", "/congreso"])("%s sigue abierta", (ruta) =>
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

  it("la versión no cambia: la edición solo redujo lo descrito", () => {
    expect(VERSION_POLITICA).toBe("2026-10-14-borrador");
  });
});
