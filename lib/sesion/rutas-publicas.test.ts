import { describe, expect, it } from "vitest";
import { esPublica } from "./rutas-publicas";

describe("esPublica", () => {
  it.each(["/", "/explorar", "/explorar#lotes", "/territorios/lighthouse", "/participa", "/participa/", "/participa?ver=vision", "/participa?equipo=agua", "/tribus","/tribus/valle", "/tribus/valle/manifiesto", "/lotes", "/lotes/", "/lotes/lote-7", "/lotes/lote-7?x=1", "/invertir", "/invertir/", "/mi-tierra", "/mi-tierra/", "/mi-tierra?x=1", "/tribus/","/tribus?x=1", "/sumarte", "/sumarte?volver=/pactos", "/privacidad", "/congreso", "/congreso/", "/congreso?utm_source=x", "/congreso#ticket", "/congreso/en", "/congreso/en/", "/congreso/en?utm_source=pagina-oficial#entradas"])(
    "%s es pública",
    (ruta) => expect(esPublica(ruta)).toBe(true),
  );

  it.each([
    "/pactos",
    "/semillas",
    "/sumarte/otro",
    "/perfil",
    "/mis-datos",
    "/privacidad/otro",
    "/congreso/otra",
    "/congreso/fr",
    "/congreso/en/otra",
    "/netx",
    "/participa/otra",
    "/tribus/valle/postular",
    "/territorios",
    "/territorios/lighthouse/otro",
    "/lotes/lote-7/otro",
    "/mi-tierra/otro",
    "/api/sesion",
    "",
  ])("%s pide sesión", (ruta) => expect(esPublica(ruta)).toBe(false));

  it("sin ruta no es pública", () => {
    expect(esPublica(null)).toBe(false);
    expect(esPublica(undefined)).toBe(false);
  });
});
