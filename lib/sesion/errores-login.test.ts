import { describe, expect, it } from "vitest";
import { ERROR_CODIGO, ERROR_GENERAL, ERROR_NO_DISPONIBLE, loginElegido, mensajeDeError } from "./errores-login";

describe("loginElegido", () => {
  it("neon-auth solo con ese valor; si no, privy", () => {
    expect(loginElegido("neon-auth")).toBe("neon-auth");
    expect(loginElegido(" neon-auth ")).toBe("neon-auth");
    expect(loginElegido(undefined)).toBe("privy");
    expect(loginElegido("")).toBe("privy");
    expect(loginElegido("otra")).toBe("privy");
    expect(loginElegido("privy")).toBe("privy");
  });
});

describe("mensajeDeError", () => {
  it("código equivocado o vencido al escribirlo", () => {
    for (const e of [400, 401, 403, 422]) expect(mensajeDeError(e, "entrar")).toBe(ERROR_CODIGO);
  });
  it("al pedir el código un 4xx es un error general", () => {
    expect(mensajeDeError(400, "pedir")).toBe(ERROR_GENERAL);
  });
  it("5xx y sin estado (sin red): error general", () => {
    expect(mensajeDeError(500, "pedir")).toBe(ERROR_GENERAL);
    expect(mensajeDeError(502, "entrar")).toBe(ERROR_GENERAL);
    expect(mensajeDeError(undefined, "entrar")).toBe(ERROR_GENERAL);
  });
  it("503: no disponible, en las dos etapas", () => {
    expect(mensajeDeError(503, "pedir")).toBe(ERROR_NO_DISPONIBLE);
    expect(mensajeDeError(503, "entrar")).toBe(ERROR_NO_DISPONIBLE);
  });
});
