import { describe, expect, it } from "vitest";
import {
  alcanza,
  avisoDeRuta,
  ayudaDeRuta,
  capacidadDeRuta,
  esRutaInterna,
  nivelMinimoDeRuta,
  puedeCapacidad,
  puedeRuta,
} from "./niveles";

describe("alcanza", () => {
  it("cada nivel incluye los anteriores", () => {
    expect(alcanza("miembro", "explorador")).toBe(true);
    expect(alcanza("lider", "miembro")).toBe(true);
    expect(alcanza("superadmin", "lider")).toBe(true);
    expect(alcanza("explorador", "miembro")).toBe(false);
    expect(alcanza("sin-cuenta", "explorador")).toBe(false);
  });
});

describe("capacidades por nivel", () => {
  it("sin cuenta solo descubre y se suma", () => {
    expect(puedeCapacidad("sin-cuenta", "descubrir")).toBe(true);
    expect(puedeCapacidad("sin-cuenta", "sumarte")).toBe(true);
    for (const c of ["hifa", "congreso", "personal", "reportar", "participar", "adherir", "admin-tribu", "netx"] as const) {
      expect(puedeCapacidad("sin-cuenta", c)).toBe(false);
    }
  });
  it("Explorador suma Hifa, Congreso, espacio personal y Reportar, pero no participa", () => {
    for (const c of ["hifa", "congreso", "personal", "reportar"] as const) expect(puedeCapacidad("explorador", c)).toBe(true);
    for (const c of ["participar", "adherir", "admin-tribu", "netx"] as const) expect(puedeCapacidad("explorador", c)).toBe(false);
  });
  it("Miembro participa y adhiere; Líder suma la administración de su tribu; NetX es solo del super admin", () => {
    expect(puedeCapacidad("miembro", "participar")).toBe(true);
    expect(puedeCapacidad("miembro", "adherir")).toBe(true);
    expect(puedeCapacidad("miembro", "admin-tribu")).toBe(false);
    expect(puedeCapacidad("lider", "admin-tribu")).toBe(true);
    expect(puedeCapacidad("lider", "netx")).toBe(false);
    expect(puedeCapacidad("superadmin", "netx")).toBe(true);
  });
});

describe("rutas", () => {
  it.each([
    ["/", "descubrir"],
    ["/tribus/valle", "descubrir"],
    ["/sumarte", "sumarte"],
    ["/sumarte?volver=/pactos", "sumarte"],
    ["/pactos", "participar"],
    ["/semillas/", "participar"],
    ["/fogon", "participar"],
    ["/compromisos", "participar"],
    ["/congreso", "congreso"],
    ["/perfil", "personal"],
    ["/pasaporte", "personal"],
    ["/panel/bitacora", "personal"],
    ["/tribus/grano/postular", "personal"],
    ["/netx", "netx"],
  ])("%s pide %s", (ruta, capacidad) => expect(capacidadDeRuta(ruta)).toBe(capacidad));

  it("puedeRuta cruza nivel y ruta", () => {
    expect(puedeRuta("sin-cuenta", "/pactos")).toBe(false);
    expect(puedeRuta("explorador", "/pactos")).toBe(false);
    expect(puedeRuta("miembro", "/pactos")).toBe(true);
    expect(puedeRuta("explorador", "/congreso")).toBe(true);
    expect(puedeRuta("sin-cuenta", "/")).toBe(true);
    expect(nivelMinimoDeRuta("/netx")).toBe("superadmin");
  });

  it("el aviso dice qué plan habilita la página", () => {
    expect(avisoDeRuta("/pactos")).toBe("Pactos se habilita con el plan Miembro.");
    expect(avisoDeRuta("/congreso")).toBe("Congreso se habilita al sumarte gratis como Explorador.");
    expect(avisoDeRuta("/netx")).toContain("super admin");
  });

  it("la ayuda del rail distingue lo gratis de lo de Miembro", () => {
    expect(ayudaDeRuta("/congreso")).toBe("Sumate gratis para usar esto");
    expect(ayudaDeRuta("/pactos")).toBe("Sumate para participar");
  });
});

describe("esRutaInterna", () => {
  it("acepta solo rutas del propio sitio", () => {
    expect(esRutaInterna("/pactos")).toBe(true);
    expect(esRutaInterna("//malo.com")).toBe(false);
    expect(esRutaInterna("https://malo.com")).toBe(false);
    expect(esRutaInterna("/\\malo.com")).toBe(false);
    expect(esRutaInterna(null)).toBe(false);
  });
});
