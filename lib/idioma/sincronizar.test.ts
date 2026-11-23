import { describe, expect, test } from "vitest";
import { debeRecargar, decidirSincronizacion } from "./sincronizar";

const base = { cookie: null, persona: null, viejo: null, mostrado: "es", conPersona: true } as const;

describe("decidirSincronizacion", () => {
  test("la cookie manda y se guarda en la persona si difiere", () => {
    expect(decidirSincronizacion({ ...base, cookie: "es", persona: "en" })).toEqual({
      guardarEnPersona: "es",
      refrescar: false,
    });
  });

  test("cookie y persona iguales: no hace nada", () => {
    expect(decidirSincronizacion({ ...base, cookie: "en", persona: "en", mostrado: "en" })).toEqual({
      guardarEnPersona: undefined,
      refrescar: false,
    });
  });

  test("sin cookie y con inglés guardado: escribe la cookie y refresca", () => {
    expect(decidirSincronizacion({ ...base, persona: "en", mostrado: "es" })).toEqual({
      escribirCookie: "en",
      guardarEnPersona: undefined,
      refrescar: true,
    });
  });

  test("sin cookie y con la elección ya mostrada: escribe la cookie sin refrescar", () => {
    expect(decidirSincronizacion({ ...base, persona: "en", mostrado: "en" }).refrescar).toBe(false);
  });

  test("sin cookie y sin elección: no guarda nada (sigue lo detectado)", () => {
    expect(decidirSincronizacion(base)).toEqual({ refrescar: false });
  });

  test("sin persona, la cookie no toca las preferencias", () => {
    expect(decidirSincronizacion({ ...base, conPersona: false, cookie: "en", persona: "es" }).guardarEnPersona).toBeUndefined();
    expect(decidirSincronizacion({ ...base, conPersona: false, persona: "en" })).toEqual({ refrescar: false });
  });

  test("migra una vez la preferencia vieja del Congreso", () => {
    expect(decidirSincronizacion({ ...base, conPersona: false, viejo: "en" })).toEqual({
      escribirCookie: "en",
      guardarEnPersona: undefined,
      refrescar: true,
    });
    expect(decidirSincronizacion({ ...base, viejo: "en" }).guardarEnPersona).toBe("en");
  });

  test("la elección de la persona gana sobre la vieja del Congreso", () => {
    expect(decidirSincronizacion({ ...base, persona: "es", viejo: "en" }).escribirCookie).toBe("es");
  });
});

describe("debeRecargar", () => {
  const pide = { escribirCookie: "en", refrescar: true } as const;

  test("recarga cuando la cookie quedó escrita con el idioma pedido", () => {
    expect(debeRecargar(pide, "en")).toBe(true);
  });

  test("no recarga con las cookies bloqueadas (no se lee nada) para no entrar en un bucle", () => {
    expect(debeRecargar(pide, null)).toBe(false);
  });

  test("no recarga si la cookie leída es otra", () => {
    expect(debeRecargar(pide, "es")).toBe(false);
  });

  test("no recarga si la decisión no lo pide o no escribe cookie", () => {
    expect(debeRecargar({ escribirCookie: "en", refrescar: false }, "en")).toBe(false);
    expect(debeRecargar({ refrescar: true }, "en")).toBe(false);
  });
});
