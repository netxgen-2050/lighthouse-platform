import { afterEach, describe, expect, it } from "vitest";
import { CLAVES, clave, establecerPersona, NOMBRES_BASE } from "./claves";

afterEach(() => establecerPersona(null));

describe("CLAVES", () => {
  it("conserva los valores que ya están guardados en los navegadores", () => {
    expect(CLAVES.perfil).toBe("lh-perfil-entrevista");
    expect(CLAVES.perfilDatos).toBe("lh-perfil");
    expect(CLAVES.compromisos).toBe("lighthouse.compromisos.v1");
    expect(CLAVES.congreso).toBe("lh-congreso-ticket");
    expect(CLAVES.pactos).toBe("lh-pactos");
    expect(CLAVES.semillasRonda).toBe("lh-semillas-ronda");
    expect(CLAVES.sumarte).toBe("lh-sumarte");
    expect(CLAVES.pasaporte).toBe("lh-pasaporte");
    expect(CLAVES.contactos).toBe("lh-contactos");
    expect(CLAVES.origen).toBe("lh-origen");
    expect(CLAVES.bitacora).toBe("lh-bitacora");
    expect(CLAVES.membresia).toBe("lh-membresia");
    expect(CLAVES.postulaciones).toBe("lh-postulaciones");
    expect(CLAVES.kyc).toBe("lh-kyc");
    expect(CLAVES.sellos).toBe("lh-sellos");
    expect(CLAVES.fogon).toBe("lh-fogon");
  });
});

describe("prefijo por persona", () => {
  it("con una persona en sesión antepone u:<id>: a cada clave", () => {
    establecerPersona("did:privy:abc");
    expect(clave("lh-pactos")).toBe("u:did:privy:abc:lh-pactos");
    expect(CLAVES.pactos).toBe("u:did:privy:abc:lh-pactos");
  });

  it("cada persona tiene claves distintas", () => {
    establecerPersona("A");
    const a = CLAVES.membresia;
    establecerPersona("B");
    expect(CLAVES.membresia).not.toBe(a);
  });

  it("no prefija dos veces", () => {
    establecerPersona("A");
    expect(clave(clave("lh-kyc"))).toBe("u:A:lh-kyc");
  });

  it("al salir vuelve a los nombres sin prefijo", () => {
    establecerPersona("A");
    establecerPersona(null);
    expect(CLAVES.kyc).toBe("lh-kyc");
  });

  it("Object.values(CLAVES) sigue la persona activa (así borra solo lo suyo)", () => {
    establecerPersona("A");
    expect(Object.values(CLAVES).every((c) => c.startsWith("u:A:"))).toBe(true);
    expect(Object.values(CLAVES)).toHaveLength(Object.keys(NOMBRES_BASE).length);
  });
});
