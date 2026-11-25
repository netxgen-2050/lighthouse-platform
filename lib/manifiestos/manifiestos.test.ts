import { describe, expect, it } from "vitest";
import { listarTribus } from "@/lib/tribus/datos";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import { buscarManifiesto, buscarManifiestoBilingue, idsConManifiesto } from "./datos";

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
    }
  });

  it("el del Lighthouse es el Manifiesto de Lighthouse VRN, con su manifiesto completo", () => {
    expect(buscarManifiesto("lighthouse")?.titulo).toBe("Manifiesto de Lighthouse VRN");
    expect(buscarManifiesto("lighthouse", "en")?.titulo).toBe("Lighthouse VRN Manifesto");
    expect(buscarManifiestoBilingue("lighthouse")?.vrn?.principios.length).toBeGreaterThanOrEqual(10);
    expect(buscarManifiestoBilingue("semilla")?.vrn).toBeUndefined();
  });

  it("ya no queda el Pacto de convivencia", () => {
    expect(JSON.stringify(buscarManifiestoBilingue("lighthouse"))).not.toMatch(/Pacto de convivencia|Coexistence Pact/);
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

  it("cada texto tiene su inglés, no vacío y distinto, y el original es el español", () => {
    const revisar = (ruta: string, t: BilingueConOriginal) => {
      expect(t.original, `${ruta}: original`).toBe("es");
      expect(t.es.trim(), `${ruta}.es`).not.toBe("");
      expect(t.en?.trim(), `${ruta}.en`).toBeTruthy();
      expect(t.en, `${ruta}: el inglés es igual al español`).not.toBe(t.es);
    };
    for (const id of idsConManifiesto()) {
      const m = buscarManifiestoBilingue(id)!;
      revisar(`${id}.titulo`, m.titulo);
      revisar(`${id}.introduccion`, m.introduccion);
      revisar(`${id}.version`, m.version);
      m.compromisos.forEach((c, i) => {
        revisar(`${id}.compromisos.${i}.titulo`, c.titulo);
        revisar(`${id}.compromisos.${i}.texto`, c.texto);
      });
    }
  });

  it("el nombre de la comunidad no se traduce y el idioma elige el texto", () => {
    const en = buscarManifiesto("valle", "en")!;
    expect(en.comunidad).toBe("Valle Solar");
    expect(en.titulo).toBe("Valle Solar Manifesto");
    expect(en.version).toBe("October 8, 2026");
    expect(en.compromisos).toHaveLength(buscarManifiesto("valle")!.compromisos.length);
    expect(buscarManifiesto("valle", "es")?.version).toBe("8 de octubre de 2026");
  });
});
