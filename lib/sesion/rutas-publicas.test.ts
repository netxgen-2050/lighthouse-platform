import { describe, expect, it } from "vitest";
import { esPublica } from "./rutas-publicas";

describe("esPublica", () => {
  it.each(["/", "/territorios/lighthouse", "/tribus", "/tribus/valle", "/tribus/valle/manifiesto", "/tribus/", "/tribus?x=1"])(
    "%s es pública",
    (ruta) => expect(esPublica(ruta)).toBe(true),
  );

  it.each([
    "/pactos",
    "/semillas",
    "/sumarte",
    "/perfil",
    "/netx",
    "/tribus/valle/postular",
    "/territorios",
    "/territorios/lighthouse/otro",
    "/api/sesion",
    "",
  ])("%s pide sesión", (ruta) => expect(esPublica(ruta)).toBe(false));

  it("sin ruta no es pública", () => {
    expect(esPublica(null)).toBe(false);
    expect(esPublica(undefined)).toBe(false);
  });
});
