import { describe, expect, it } from "vitest";
import { cookieAdmin, cookieAdminBorrada, debeEscribirCookieAdmin } from "./cookie-admin";

describe("cookie de /admin", () => {
  it("con rol persona no se escribe; con superadmin sí", () => {
    expect(debeEscribirCookieAdmin({ prueba: null, estado: "ok", rol: "persona" })).toBe(false);
    expect(debeEscribirCookieAdmin({ prueba: null, estado: "ok", rol: "superadmin" })).toBe(true);
  });
  it("en modo de prueba o sin sesión verificada no se escribe", () => {
    expect(debeEscribirCookieAdmin({ prueba: "super@prueba.test", estado: "ok", rol: "superadmin" })).toBe(false);
    expect(debeEscribirCookieAdmin({ prueba: null, estado: "cargando", rol: "superadmin" })).toBe(false);
    expect(debeEscribirCookieAdmin({ prueba: null, estado: "sin-sesion", rol: undefined })).toBe(false);
  });
  it("lleva path=/admin, SameSite=Strict, 3300 segundos y Secure solo con https", () => {
    const http = cookieAdmin("abc", false);
    expect(http).toContain("lh-sesion-admin=abc");
    expect(http).toContain("path=/admin");
    expect(http).toContain("SameSite=Strict");
    expect(http).toContain("max-age=3300");
    expect(http).not.toContain("Secure");
    expect(cookieAdmin("abc", true)).toContain("; Secure");
  });
  it("salir la borra", () => {
    expect(cookieAdminBorrada(false)).toContain("max-age=0");
    expect(cookieAdminBorrada(false)).toContain("path=/admin");
  });
});
