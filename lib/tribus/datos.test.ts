import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { esNeutro } from "@/lib/idioma/neutros";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import { agruparPorEstado, buscarTribu, listarTribus, listarTribusBilingues, rutaProponerComunidad } from "./datos";

describe("datos de tribus", () => {
  const tribus = listarTribus();
  it("son 12", () => expect(tribus).toHaveLength(12));
  it("ids únicos", () => expect(new Set(tribus.map((t) => t.id)).size).toBe(12));
  it("barrios 1..12 sin repetir y en orden", () =>
    expect(tribus.map((t) => t.barrio)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
  it("ninguna vacante tiene declaración ni pozo", () => {
    const vacantes = tribus.filter((t) => t.estado === "vacante");
    expect(vacantes.length).toBeGreaterThan(0);
    for (const v of vacantes) {
      expect(v.declaracion).toBeUndefined();
      expect(v.pozo).toBeUndefined();
    }
  });
  it("distribución 3 activas, 5 en formación y 4 vacantes (3, 8, 9 y 12)", () => {
    const ids = (e: string) => tribus.filter((t) => t.estado === e).map((t) => t.barrio);
    expect(ids("activa")).toEqual([1, 6, 7]);
    expect(ids("formacion")).toEqual([2, 4, 5, 10, 11]);
    expect(ids("vacante")).toEqual([3, 8, 9, 12]);
  });
  it("plata, roles y avales coinciden con el mock-up v6 (las 12)", () => {
    const mock = readFileSync(
      path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"),
      "utf8",
    );
    for (const t of tribus) {
      const m = mock.match(
        new RegExp(`id:"${t.id}",[\\s\\S]*?cap:\\[(\\d+),(\\d+)\\], hum:\\[(\\d+),(\\d+)\\][\\s\\S]*?avales:(\\d+)`),
      );
      expect(m, t.id).not.toBeNull();
      // Barrios 9 y 12 pasaron a vacantes el 8-oct-2026: conservan meta y roles necesarios, sin lo comprometido.
      const vacanteNueva = t.id === "escuela" || t.id === "guardia";
      expect(t.plata, t.id).toEqual({ comprometida: vacanteNueva ? 0 : Number(m![1]), meta: Number(m![2]) });
      expect(t.roles, t.id).toEqual({ cubiertos: vacanteNueva ? 0 : Number(m![3]), necesarios: Number(m![4]) });
      expect(t.avales, t.id).toBe(vacanteNueva ? 0 : Number(m![5]));
    }
  });
  it("valle, avelan y grano con los valores esperados", () => {
    expect(buscarTribu("valle")).toMatchObject({ plata: { comprometida: 310000, meta: 480000 }, roles: { cubiertos: 9, necesarios: 14 }, avales: 5 });
    expect(buscarTribu("avelan")?.plata).toEqual({ comprometida: 140000, meta: 650000 });
    expect(buscarTribu("grano")).toMatchObject({ plata: { comprometida: 0, meta: 260000 }, avales: 0 });
  });
  it("comprometida <= meta y cubiertos <= necesarios", () => {
    for (const t of tribus) {
      expect(t.plata.comprometida, t.id).toBeLessThanOrEqual(t.plata.meta);
      expect(t.roles.cubiertos, t.id).toBeLessThanOrEqual(t.roles.necesarios);
    }
  });
  it("agruparPorEstado: 3, 5 y 4, y solo las en formación tienen etapa", () => {
    const g = agruparPorEstado();
    expect([g.activas.length, g.formacion.length, g.vacantes.length]).toEqual([3, 5, 4]);
    for (const t of g.formacion) expect(t.etapa, t.id).toBeTruthy();
    for (const t of [...g.activas, ...g.vacantes]) expect(t.etapa, t.id).toBeUndefined();
    expect(buscarTribu("monte")?.etapa).toBe("Armando su propuesta");
  });
  it("rutaProponerComunidad apunta al formulario de postulación del barrio", () => {
    expect(rutaProponerComunidad("grano")).toBe("/tribus/grano/postular");
  });
  it("buscarTribu", () => {
    expect(buscarTribu("valle")?.nombre).toBe("Valle Solar");
    expect(buscarTribu("no-existe")).toBeUndefined();
  });
});

describe("textos de tribus en inglés", () => {
  const CAMPOS_TEXTO = ["foco", "hogares", "subtitulo", "declaracion", "ritual", "formaJuridica", "etapa"] as const;
  const CAMPOS_LISTA = ["tiene", "busca", "areas", "areasAbiertas", "pozo"] as const;

  // Cada texto descriptivo tiene `es` y `en` no vacíos y distintos (salvo números y siglas).
  function revisar(ruta: string, v: BilingueConOriginal | undefined) {
    if (v === undefined) return;
    expect(v.es.trim(), `${ruta}.es`).not.toBe("");
    expect(v.en?.trim(), `${ruta}.en`).toBeTruthy();
    if (!esNeutro(v.es)) expect(v.en, `${ruta}: el inglés es igual al español`).not.toBe(v.es);
  }

  it("todo campo descriptivo tiene español e inglés, no vacíos y distintos", () => {
    for (const t of listarTribusBilingues()) {
      for (const c of CAMPOS_TEXTO) revisar(`${t.id}.${c}`, t[c]);
      for (const c of CAMPOS_LISTA) (t[c] ?? []).forEach((x, i) => revisar(`${t.id}.${c}.${i}`, x));
    }
  });

  it("la declaración es la voz de la tribu: original en español", () => {
    const conDeclaracion = listarTribusBilingues().filter((t) => t.declaracion);
    expect(conDeclaracion.length).toBeGreaterThan(0);
    for (const t of conDeclaracion) expect(t.declaracion?.original, t.id).toBe("es");
  });

  it("las áreas abiertas son áreas de la tribu", () => {
    for (const t of listarTribusBilingues()) {
      const areas = (t.areas ?? []).map((a) => a.es);
      for (const a of t.areasAbiertas ?? []) expect(areas, t.id).toContain(a.es);
    }
  });

  it("en inglés se leen los campos en inglés y el nombre sigue igual", () => {
    const v = buscarTribu("valle", "en")!;
    expect(v.nombre).toBe("Valle Solar");
    expect(v.tiene).toEqual(["Vegetable garden", "Carpentry", "Shared parenting"]);
    expect(v.busca).toContain("Solar energy");
    expect(v.ritual).toMatch(/weekend/);
    expect(buscarTribu("monte", "en")?.etapa).toBe("Putting together its proposal");
  });

  it("en español no cambia nada", () => {
    const v = buscarTribu("valle")!;
    expect(v.tiene).toEqual(["Huerta", "Carpintería", "Crianza compartida"]);
    expect(v.declaracion).toBe("Familias que quieren criar en comunidad, con energía y agua propias.");
    expect(v.pozo).toEqual(["Energía solar para el núcleo común", "30 noches de hospedaje por año"]);
  });
});
