import { describe, expect, it } from "vitest";
import { CLAVES } from "./claves";

describe("CLAVES", () => {
  it("conserva los valores que ya están guardados en los navegadores", () => {
    expect(CLAVES.perfil).toBe("lh-perfil-entrevista");
    expect(CLAVES.compromisos).toBe("lighthouse.compromisos.v1");
    expect(CLAVES.congreso).toBe("lh-congreso-ticket");
    expect(CLAVES.pactos).toBe("lh-pactos");
    expect(CLAVES.semillasRonda).toBe("lh-semillas-ronda");
    expect(CLAVES.sumarte).toBe("lh-sumarte");
    expect(CLAVES.pasaporte).toBe("lh-pasaporte");
    expect(CLAVES.contactos).toBe("lh-contactos");
    expect(CLAVES.bitacora).toBe("lh-bitacora");
    expect(CLAVES.membresia).toBe("lh-membresia");
  });
});
