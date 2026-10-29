import { describe, expect, it } from "vitest";
import { HOUR_REF_USD } from "@/lib/pactos/datos";
import { listarTribusBilingues } from "./datos";
import {
  administradorDe,
  aplicarTope,
  AVALES_DE_EJEMPLO,
  avalDe,
  buscarNecesidad,
  circuloDeNecesidad,
  etiquetasSinNecesidad,
  holonDe,
  idDeHolon,
  necesidadesBilingues,
  necesidadesDe,
  repartirConTopeTotal,
  tomable,
  validarNecesidades,
  type NecesidadBilingue,
} from "./necesidades";

const V = HOUR_REF_USD;
const todas = necesidadesBilingues();
const base = (o: Partial<NecesidadBilingue>): NecesidadBilingue => ({
  ...todas.find((n) => n.id === "valle-bioconstruccion")!,
  ...o,
});

describe("datos de las necesidades", () => {
  it("son válidos", () => expect(validarNecesidades()).toEqual([]));
  it("una necesidad por etiqueta de busca, en los dos idiomas", () => {
    expect(etiquetasSinNecesidad()).toEqual([]);
    for (const t of listarTribusBilingues().filter((x) => x.estado !== "vacante")) {
      const n = todas.filter((x) => x.tribuId === t.id);
      expect(n.map((x) => x.titulo)).toEqual(t.busca);
    }
  });
  it("ninguna en los vacantes", () => {
    for (const t of listarTribusBilingues().filter((x) => x.estado === "vacante")) expect(necesidadesDe(t.id)).toEqual([]);
  });
  it("valle tiene tres", () =>
    expect(necesidadesDe("valle").map((n) => n.titulo)).toEqual(["Energía solar", "Bioconstrucción", "Eventos y comunidad"]));
  it("ids únicos y todo con inglés", () => {
    expect(new Set(todas.map((n) => n.id)).size).toBe(todas.length);
    for (const n of todas) expect(n.que.en?.trim(), n.id).toBeTruthy();
  });
  it("círculo de otra tribu: error", () => {
    expect(validarNecesidades([base({ id: "x", tribuId: "semilla", circuloId: "valle-3" })], [])).not.toEqual([]);
  });
  it("nombre del círculo en cada idioma", () => {
    expect(circuloDeNecesidad(buscarNecesidad("valle-eventos")!, "es")).toBe("Comunicación del común");
    expect(circuloDeNecesidad(buscarNecesidad("semilla-riego")!, "en")).toBe("Intensive garden");
  });
});

describe("holón y aval", () => {
  it("con círculo y sin círculo", () => {
    expect(idDeHolon(holonDe(buscarNecesidad("semilla-riego")!))).toBe("circulo:semilla-1");
    expect(idDeHolon(holonDe({ tribuId: "valle" }))).toBe("tribu:valle");
  });
  it("puerto-marketing no es tomable; valle-solar sí sin aval; semilla-riego sí", () => {
    expect(tomable(buscarNecesidad("puerto-marketing")!)).toBe(false);
    expect(tomable(buscarNecesidad("valle-solar")!)).toBe(true);
    expect(tomable(buscarNecesidad("semilla-riego")!)).toBe(true);
  });
  it("un aval de otro holón no cuenta y da error", () => {
    const mal = [{ ...AVALES_DE_EJEMPLO[0], afirma: "tribu:valle" }];
    const n = buscarNecesidad("semilla-riego")!;
    expect(avalDe(n, mal)).toBeNull();
    expect(validarNecesidades(todas, mal)).not.toEqual([]);
  });
  it("de diseño tomada o hecha sin aval da error", () => {
    expect(validarNecesidades([base({ id: "d", tipo: "diseno", estado: "tomada" })], [])).not.toEqual([]);
    expect(validarNecesidades([base({ id: "d", tipo: "diseno", estado: "hecha" })], [])).not.toEqual([]);
  });
  it("los avales tienen forma de registro y no llevan datos personales", () => {
    for (const a of AVALES_DE_EJEMPLO) {
      expect(a.esquema).toBe("avala-necesidad");
      expect(JSON.stringify(a)).not.toMatch(/@|nombre/);
    }
  });
  it("el círculo transversal lo administra Hifa (experimental) con respaldo del super admin; el resto, personas", () => {
    expect(administradorDe(holonDe(buscarNecesidad("valle-eventos")!))).toEqual({
      tipo: "hifa",
      experimental: true,
      respaldo: "super-admin",
    });
    expect(administradorDe(holonDe(buscarNecesidad("valle-solar")!))).toEqual({ tipo: "personas" });
    expect(administradorDe({ tipo: "tribu", id: "valle" })).toEqual({ tipo: "personas" });
  });
});

describe("máximo por persona", () => {
  it("sin máximo", () => expect(aplicarTope(12, null, V)).toEqual({ horasConSemillas: 12, horasSinSemillas: 0, semillas: 60 }));
  it("máximo 10 h con 12 h", () =>
    expect(aplicarTope(12, { unidad: "horas", valor: 10 }, V)).toEqual({ horasConSemillas: 10, horasSinSemillas: 2, semillas: 50 }));
  it("máximo 10 h con 8 h", () =>
    expect(aplicarTope(8, { unidad: "horas", valor: 10 }, V)).toEqual({ horasConSemillas: 8, horasSinSemillas: 0, semillas: 40 }));
  it("máximo 60 Semillas con 16 h", () =>
    expect(aplicarTope(16, { unidad: "semillas", valor: 60 }, V)).toEqual({ horasConSemillas: 11, horasSinSemillas: 5, semillas: 60 }));
  it("rechaza máximos 0, negativos o no enteros", () => {
    for (const valor of [0, -3, 2.5]) {
      expect(validarNecesidades([base({ id: "t", tope: { unidad: "horas", valor } })], [])).not.toEqual([]);
      expect(validarNecesidades([base({ id: "t", topeTotal: { unidad: "semillas", valor } })], [])).not.toEqual([]);
    }
  });
});

describe("máximo total de la tarea", () => {
  it("los datos de ejemplo", () => {
    expect(buscarNecesidad("valle-solar")!.topeTotal).toEqual({ unidad: "horas", valor: 20 });
    expect(buscarNecesidad("agua-plomeria")!.topeTotal).toEqual({ unidad: "semillas", valor: 150 });
    expect(buscarNecesidad("semilla-riego")!.topeTotal).toBeNull();
  });
  it("el orden de la lista cambia quién se queda con el total", () => {
    const a = { persona: "a", horas: 12 };
    const b = { persona: "b", horas: 6 };
    const total = { unidad: "horas", valor: 15 } as const;
    const ab = repartirConTopeTotal([a, b], null, total, V);
    const ba = repartirConTopeTotal([b, a], null, total, V);
    expect(ab.personas.map((p) => [p.persona, p.horasConSemillas])).toEqual([["a", 12], ["b", 3]]);
    expect(ba.personas.map((p) => [p.persona, p.horasConSemillas])).toEqual([["b", 6], ["a", 9]]);
    expect(ab.horasConSemillas).toBe(15);
    expect(ba.horasConSemillas).toBe(15);
  });
  it("sin máximo total, cada persona suma lo suyo", () => {
    const r = repartirConTopeTotal([{ persona: "a", horas: 8 }, { persona: "b", horas: 8 }], null, null, V);
    expect(r.horasConSemillas).toBe(16);
    expect(r.semillas).toBe(80);
  });
  it("en horas: 10 h por persona y 20 h en total entre tres personas", () => {
    const r = repartirConTopeTotal(
      [{ persona: "a", horas: 12 }, { persona: "b", horas: 10 }, { persona: "c", horas: 6 }],
      { unidad: "horas", valor: 10 },
      { unidad: "horas", valor: 20 },
      V,
    );
    expect(r.personas.map((p) => p.horasConSemillas)).toEqual([10, 10, 0]);
    expect(r.personas.map((p) => p.horasSinSemillas)).toEqual([2, 0, 6]);
    expect(r.semillas).toBe(100);
  });
  it("en Semillas: 150 en total y 60 por persona", () => {
    const r = repartirConTopeTotal(
      [{ persona: "a", horas: 16 }, { persona: "b", horas: 16 }, { persona: "c", horas: 16 }],
      { unidad: "semillas", valor: 60 },
      { unidad: "semillas", valor: 150 },
      V,
    );
    expect(r.personas.map((p) => p.semillas)).toEqual([60, 60, 30]);
    expect(r.semillas).toBe(150);
    expect(r.personas[2].horasConSemillas).toBe(5);
  });
  it("nunca supera el total", () => {
    const r = repartirConTopeTotal([{ persona: "a", horas: 30 }], null, { unidad: "horas", valor: 7 }, V);
    expect(r.horasConSemillas).toBe(7);
  });
  it("un total menor que el máximo por persona, en la misma unidad, da error", () => {
    expect(
      validarNecesidades([base({ id: "t", tope: { unidad: "horas", valor: 10 }, topeTotal: { unidad: "horas", valor: 5 } })], []),
    ).not.toEqual([]);
  });
});

describe("nombres de las Semillas", () => {
  it("el módulo no usa 'brotes' ni 'germinar'", async () => {
    const { readFileSync } = await import("node:fs");
    for (const ruta of [`${__dirname}/necesidades.ts`, `${__dirname}/../idioma/textos/tribus.ts`]) {
      expect(readFileSync(ruta, "utf8")).not.toMatch(/brotes|germin/i);
    }
  });
});
