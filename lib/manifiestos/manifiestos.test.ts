import { describe, expect, it } from "vitest";
import { listarTribus } from "@/lib/tribus/datos";
import { buscarManifiesto, idsConManifiesto, tieneManifiesto, tribusConManifiesto } from "./datos";

describe("manifiestos de ejemplo", () => {
  it("hay uno por cada tribu activa o en formación y uno del Lighthouse", () => {
    const esperados = listarTribus()
      .filter((t) => t.estado !== "vacante")
      .map((t) => t.id);
    expect(idsConManifiesto().sort()).toEqual([...esperados, "lighthouse"].sort());
  });

  it("las tribus vacantes no tienen manifiesto", () => {
    for (const t of listarTribus().filter((t) => t.estado === "vacante")) {
      expect(buscarManifiesto(t.id)).toBeUndefined();
      expect(tieneManifiesto(t.id)).toBe(false);
    }
    expect(tribusConManifiesto().every((t) => t.estado !== "vacante")).toBe(true);
  });

  it("el del Lighthouse es el Pacto de convivencia", () => {
    expect(buscarManifiesto("lighthouse")?.titulo).toBe("Pacto de convivencia del Lighthouse");
  });

  it("cada uno trae título, introducción, 5 a 7 compromisos completos, versión y marca de ejemplo", () => {
    for (const id of idsConManifiesto()) {
      const m = buscarManifiesto(id)!;
      expect(m.titulo.length, id).toBeGreaterThan(0);
      expect(m.introduccion.length, id).toBeGreaterThan(40);
      expect(m.compromisos.length, id).toBeGreaterThanOrEqual(5);
      expect(m.compromisos.length, id).toBeLessThanOrEqual(7);
      for (const c of m.compromisos) {
        expect(c.titulo.length, id).toBeGreaterThan(0);
        expect(c.texto.length, id).toBeGreaterThan(30);
      }
      expect(m.version, id).toMatch(/\d{4}/);
      expect(m.ejemplo, id).toBe(true);
    }
  });

  it("el de Valle Solar es el de Valle Solar", () => {
    expect(buscarManifiesto("valle")?.titulo).toBe("Manifiesto de Valle Solar");
    expect(buscarManifiesto("valle")?.comunidad).toBe("Valle Solar");
  });
});
