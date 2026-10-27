import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cookieAdmin, cookieAdminBorrada, cookieAdminSegunSesion, debeEscribirCookieAdmin } from "./cookie-admin";

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
    expect(cookieAdminBorrada(true)).toContain("; Secure");
  });
  it("salir() (components/sesion/proveedor-sesion.tsx) escribe la cookie borrada de /admin", () => {
    const src = readFileSync(join(__dirname, "../../components/sesion/proveedor-sesion.tsx"), "utf8");
    const salir = src.slice(src.indexOf("const salir = useCallback"), src.indexOf("const cabeceras = useCallback"));
    expect(salir).toContain('document.cookie = cookieAdminBorrada(window.location.protocol === "https:")');
  });
  it("al cambiar de rol: se escribe, se renueva con el token nuevo y se borra", () => {
    const sa = { prueba: null, estado: "ok", rol: "superadmin" };
    expect(cookieAdminSegunSesion(sa, "t1", true)).toContain("lh-sesion-admin=t1");
    expect(cookieAdminSegunSesion(sa, "t2", true)).toContain("lh-sesion-admin=t2");
    expect(cookieAdminSegunSesion({ ...sa, rol: "persona" }, "t2", true)).toContain("max-age=0");
    expect(cookieAdminSegunSesion({ ...sa, estado: "sin-sesion", rol: undefined }, "t2", true)).toContain("max-age=0");
    expect(cookieAdminSegunSesion({ ...sa, prueba: "x@y.test" }, "t2", true)).toContain("max-age=0");
  });
  it("superadmin sin token (o con error al pedirlo) borra en vez de dejar una cookie vieja", () => {
    const sa = { prueba: null, estado: "ok", rol: "superadmin" };
    expect(cookieAdminSegunSesion(sa, null, false)).toContain("max-age=0");
    expect(cookieAdminSegunSesion(sa, undefined, false)).toContain("max-age=0");
  });
});
