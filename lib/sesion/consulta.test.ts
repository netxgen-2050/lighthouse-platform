import { describe, expect, it } from "vitest";
import { accionAlEntrar, decidirConsulta, loginAAbrir } from "./consulta";

describe("decidirConsulta (convivencia de Privy y Neon Auth)", () => {
  const base = { prueba: null, privyListo: true, tokenPrivy: null, conNeonAuth: true };

  it("con el entorno en neon-auth y una sesión de Privy abierta, el token de Privy se sigue mandando", () => {
    expect(decidirConsulta({ ...base, tokenPrivy: "tok" })).toEqual({
      tipo: "preguntar",
      cabeceras: { Authorization: "Bearer tok" },
      porCookie: false,
    });
  });

  it("tras salir de Privy, con neon-auth se pregunta por la cookie (sin Authorization)", () => {
    expect(decidirConsulta(base)).toEqual({ tipo: "preguntar", cabeceras: {}, porCookie: true });
  });

  it("sin neon-auth y sin token, no hay sesión y no se pregunta", () => {
    expect(decidirConsulta({ ...base, conNeonAuth: false })).toEqual({ tipo: "sin-sesion" });
  });

  it("mientras Privy no está listo no se pregunta nada", () => {
    expect(decidirConsulta({ ...base, privyListo: false })).toEqual({ tipo: "esperar" });
  });

  it("el modo de prueba manda sobre todo lo demás", () => {
    expect(decidirConsulta({ ...base, prueba: "a@prueba.test", tokenPrivy: "tok", privyListo: false })).toEqual({
      tipo: "preguntar",
      cabeceras: { "x-lh-prueba": "a@prueba.test" },
      porCookie: false,
    });
  });
});

describe("loginAAbrir", () => {
  it("con neon-auth abre el formulario propio, haya o no Privy (al salir y volver a entrar)", () => {
    expect(loginAAbrir({ conNeonAuth: true, hayPrivy: true })).toBe("formulario");
    expect(loginAAbrir({ conNeonAuth: true, hayPrivy: false })).toBe("formulario");
  });
  it("sin neon-auth: Privy si está, si no 'Entrar como…'", () => {
    expect(loginAAbrir({ conNeonAuth: false, hayPrivy: true })).toBe("privy");
    expect(loginAAbrir({ conNeonAuth: false, hayPrivy: false })).toBe("entrar-como");
  });
});

describe("accionAlEntrar (casillas-una-sola-vez)", () => {
  it("el modo alta muestra las casillas antes del login y no descarta nada", () => {
    expect(accionAlEntrar("alta")).toEqual({ destino: "casillas", descartarAceptacionPrevia: false });
  });
  it("entrar, o sin modo, va directo al login y descarta una aceptación previa de la pestaña", () => {
    expect(accionAlEntrar("entrar")).toEqual({ destino: "login-directo", descartarAceptacionPrevia: true });
    expect(accionAlEntrar(undefined)).toEqual({ destino: "login-directo", descartarAceptacionPrevia: true });
  });
});
