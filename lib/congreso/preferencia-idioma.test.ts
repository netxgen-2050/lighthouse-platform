import { afterEach, describe, expect, it } from "vitest";
import { establecerPersona } from "@/lib/demo/claves";
import { guardarPreferenciaIdioma, idiomaGuardado, leerPreferenciaIdioma } from "./preferencia-idioma";

describe("idiomaGuardado", () => {
  it("acepta es y en, y ignora todo lo demás", () => {
    expect(idiomaGuardado("es")).toBe("es");
    expect(idiomaGuardado("en")).toBe("en");
    for (const x of ["fr", "EN", "", " en", null, undefined]) expect(idiomaGuardado(x)).toBeNull();
  });
});

describe("guardar y leer", () => {
  afterEach(() => {
    establecerPersona(null);
    delete (globalThis as { window?: unknown }).window;
  });

  function almacenFalso() {
    const datos = new Map<string, string>();
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => datos.get(k) ?? null,
        setItem: (k: string, v: string) => void datos.set(k, v),
      },
    };
    return datos;
  }

  it("sin sesión guarda por navegador y con sesión con el prefijo de la persona", () => {
    const datos = almacenFalso();
    guardarPreferenciaIdioma("en");
    expect([...datos.keys()]).toEqual(["lh-congreso-idioma"]);
    establecerPersona("ana");
    expect(leerPreferenciaIdioma()).toBeNull();
    guardarPreferenciaIdioma("es");
    expect(datos.get("u:ana:lh-congreso-idioma")).toBe("es");
    expect(leerPreferenciaIdioma()).toBe("es");
  });

  it("un valor raro guardado se ignora", () => {
    const datos = almacenFalso();
    datos.set("lh-congreso-idioma", "fr");
    expect(leerPreferenciaIdioma()).toBeNull();
  });

  it("si el almacenamiento falla no rompe", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => {
          throw new Error("no");
        },
        setItem: () => {
          throw new Error("no");
        },
      },
    };
    expect(leerPreferenciaIdioma()).toBeNull();
    expect(() => guardarPreferenciaIdioma("en")).not.toThrow();
  });
});
