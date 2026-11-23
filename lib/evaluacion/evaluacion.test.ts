import { describe, expect, it } from "vitest";
import { calcularFactorEvaluacion, mediaRecortada, mediana, redondearFactor } from "./calculo";
import { constanciasDeRonda } from "./constancias";
import {
  EQUIPO_EJEMPLO,
  evaluacionesDeEjemplo,
  MOTIVOS_DE_EJEMPLO,
  PERSONA_EJEMPLO,
  RESUMEN_FEEDBACK_EJEMPLO,
} from "./ejemplo";
import { GUIA } from "./guia";
import type { Evaluacion } from "./tipos";

const EQ = ["p", "a", "b", "c", "d", "e"];
const ev = (de: string, rol: number, cultura = rol, motivo = "porque sí"): Evaluacion[] => [
  { de, a: "p", dimension: "rol", nota: rol, motivo },
  { de, a: "p", dimension: "cultura", nota: cultura, motivo },
];
const rondaDe = (notas: number[], cultura?: number[]): Evaluacion[] =>
  notas.flatMap((n, i) => ev(["a", "b", "c", "d", "e"][i], n, cultura ? cultura[i] : n));

describe("helpers", () => {
  it("mediana par e impar", () => {
    expect(mediana([3, 1, 2])).toBe(2);
    expect(mediana([3, 3, 4, 5])).toBe(3.5);
  });
  it("media recortada", () => {
    expect(mediaRecortada([1, 4, 4, 4, 5])).toBe(4);
  });
  it("redondeo sin error de coma flotante", () => {
    expect(redondearFactor(1.025)).toBe(1.03);
  });
});

describe("calcularFactorEvaluacion", () => {
  it("tres estrellas es neutro", () => {
    expect(calcularFactorEvaluacion(EQ, rondaDe([3, 3, 3]), "p").factor).toBe(1);
  });
  it("rol 3 y cultura 5 pesan igual", () => {
    const r = calcularFactorEvaluacion(EQ, rondaDe([3, 3, 3], [5, 5, 5]), "p");
    expect(r.factor).toBe(1.1);
  });
  it("extremos", () => {
    expect(calcularFactorEvaluacion(EQ, rondaDe([5, 5, 5]), "p").factor).toBe(1.2);
    expect(calcularFactorEvaluacion(EQ, rondaDe([1, 1, 1]), "p").factor).toBe(0.8);
  });
  it("fuerza 0 y fuerza fuera de rango", () => {
    expect(calcularFactorEvaluacion(EQ, rondaDe([5, 5, 5]), "p", { fuerza: 0 }).factor).toBe(1);
    expect(calcularFactorEvaluacion(EQ, rondaDe([5, 5, 5]), "p", { fuerza: 0.9 }).factor).toBe(1.2);
    expect(calcularFactorEvaluacion(EQ, rondaDe([5, 5, 5]), "p", { fuerza: -1 }).factor).toBe(1);
  });
  it("redondea 1,025 a 1,03", () => {
    const r = calcularFactorEvaluacion(EQ, [...rondaDe([3, 3, 3]).map((e) => (e.dimension === "rol" ? { ...e, nota: 4 } : e))], "p", {
      fuerza: 0.1,
      pesoRol: 0.5,
    });
    // rol 4, cultura 3 → 3,5; 1 + 0,1 × 0,5 / 2 = 1,025
    expect(r.factor).toBe(1.03);
  });
  it("descarta autoevaluación, fuera del equipo, sin motivo y nota inválida", () => {
    const base = rondaDe([3, 3, 3]);
    const extra: Evaluacion[] = [
      { de: "p", a: "p", dimension: "rol", nota: 5, motivo: "yo" },
      { de: "zz", a: "p", dimension: "rol", nota: 5, motivo: "x" },
      { de: "d", a: "p", dimension: "rol", nota: 4, motivo: "  " },
      { de: "e", a: "p", dimension: "rol", nota: 0, motivo: "x" },
      { de: "e", a: "p", dimension: "rol", nota: 6, motivo: "x" },
      { de: "e", a: "p", dimension: "rol", nota: 3.5, motivo: "x" },
    ];
    const r = calcularFactorEvaluacion(EQ, [...base, ...extra], "p");
    expect(r.descartes).toEqual({
      autoevaluacion: 1,
      "fuera-del-equipo": 1,
      "sin-motivo": 1,
      "nota-invalida": 3,
      reciprocidad: 0,
    });
    expect(r.dimensiones.rol.evaluadores).toBe(3);
  });
  it("dos evaluadores: 1,00 y sin resumen", () => {
    const r = calcularFactorEvaluacion(EQ, rondaDe([5, 5]), "p");
    expect(r.factor).toBe(1);
    expect(r.resumenDisponible).toBe(false);
    expect(r.dimensiones.rol.suficiente).toBe(false);
  });
  it("sin ninguna nota: sin dato", () => {
    expect(calcularFactorEvaluacion(EQ, [], "p").dimensiones.rol.nota).toBeNull();
  });
  it("el descuento deja menos de 3: dimensión neutra", () => {
    const ronda = [...rondaDe([5, 5]), ...ev("c", 5, 5, "")];
    const r = calcularFactorEvaluacion(EQ, ronda, "p");
    expect(r.dimensiones.rol.suficiente).toBe(false);
    expect(r.factor).toBe(1);
  });
  it("mínimo 4 con 3 evaluadores", () => {
    expect(calcularFactorEvaluacion(EQ, rondaDe([5, 5, 5]), "p", { minimoEvaluadores: 4 }).factor).toBe(1);
  });
  it("mediana: un extremo no arrastra", () => {
    const r = calcularFactorEvaluacion(EQ, rondaDe([3, 3, 4, 5]), "p", { topePorEvaluador: 4 });
    expect(r.dimensiones.rol.nota).toBe(3.5);
  });
});

describe("colusión", () => {
  const ana: Evaluacion[] = [
    { de: "a", a: "b", dimension: "rol", nota: 5, motivo: "x" },
    { de: "b", a: "a", dimension: "rol", nota: 5, motivo: "x" },
  ];
  const resto = (persona: string) =>
    ["c", "d", "e"].flatMap((de) => [{ de, a: persona, dimension: "rol" as const, nota: 3, motivo: "x" }]);
  const otros = (los: string[]) => [...ana, ...los.flatMap((l) => resto(l))];

  it("(a) apagada por defecto: no descarta y la nota cuenta como 4", () => {
    const r = calcularFactorEvaluacion(EQ, otros(["b"]), "b");
    expect(r.descartes.reciprocidad).toBe(0);
    expect(r.dimensiones.rol.evaluadores).toBe(4);
    // 3, 3, 3 y el 5 de a acotado a 4: mediana 3
    expect(r.dimensiones.rol.nota).toBe(3);
  });
  it("(b) activa: la pareja que se infla no cuenta", () => {
    const r = calcularFactorEvaluacion(EQ, otros(["b"]), "b", { reciprocidadActiva: true });
    expect(r.descartes.reciprocidad).toBe(1);
    expect(r.dimensiones.rol.evaluadores).toBe(3);
  });
  it("(c) activa: pareja que coincide con el resto cuenta", () => {
    const e: Evaluacion[] = [
      { de: "a", a: "b", dimension: "rol", nota: 4, motivo: "x" },
      { de: "b", a: "a", dimension: "rol", nota: 4, motivo: "x" },
      ...["c", "d", "e"].map((de) => ({ de, a: "b", dimension: "rol" as const, nota: 4, motivo: "x" })),
    ];
    const r = calcularFactorEvaluacion(EQ, e, "b", { reciprocidadActiva: true });
    expect(r.descartes.reciprocidad).toBe(0);
  });
  it("(d) activa: nota alta sin reciprocidad no se descarta y se acota", () => {
    const e: Evaluacion[] = [
      { de: "a", a: "b", dimension: "rol", nota: 5, motivo: "x" },
      ...["c", "d", "e"].map((de) => ({ de, a: "b", dimension: "rol" as const, nota: 3, motivo: "x" })),
    ];
    const r = calcularFactorEvaluacion(EQ, e, "b", { reciprocidadActiva: true });
    expect(r.descartes.reciprocidad).toBe(0);
    // El 5 se acota a 4 (mediana de las demás 3 + tope 1); con la mediana como agregado no mueve la nota.
    expect(r.dimensiones.rol.nota).toBe(3);
    const media = calcularFactorEvaluacion(EQ, e, "b", { reciprocidadActiva: true, agregado: "media-recortada" });
    expect(media.dimensiones.rol.nota).toBe(3);
  });
  it("(e) anillo de dos en equipo de 6: ambos en 1,00, con la defensa apagada y activa", () => {
    const eq = ["a", "b", "c", "d", "e", "f"];
    const e: Evaluacion[] = [];
    for (const [x, y] of [["a", "b"], ["b", "a"]]) {
      for (const d of ["rol", "cultura"] as const) e.push({ de: x, a: y, dimension: d, nota: 5, motivo: "x" });
    }
    for (const p of ["a", "b"]) {
      for (const de of ["c", "d", "e", "f"]) {
        for (const d of ["rol", "cultura"] as const) e.push({ de, a: p, dimension: d, nota: 3, motivo: "x" });
      }
    }
    for (const reciprocidadActiva of [false, true]) {
      for (const p of ["a", "b"]) expect(calcularFactorEvaluacion(eq, e, p, { reciprocidadActiva }).factor).toBe(1);
    }
  });
  it("(f) anillo de tres en equipo de 7: los tres en 1,00", () => {
    const eq = ["a", "b", "c", "d", "e", "f", "g"];
    const anillo = ["a", "b", "c"];
    const e: Evaluacion[] = [];
    for (const p of anillo) {
      for (const de of eq.filter((x) => x !== p)) {
        const nota = anillo.includes(de) ? 5 : 3;
        for (const d of ["rol", "cultura"] as const) e.push({ de, a: p, dimension: d, nota, motivo: "x" });
      }
    }
    for (const reciprocidadActiva of [false, true]) {
      for (const p of anillo) expect(calcularFactorEvaluacion(eq, e, p, { reciprocidadActiva }).factor).toBe(1);
    }
  });
});

describe("tope por evaluador", () => {
  // Se prueba la implementación real (`calcularFactorEvaluacion`), sin copia de la lógica del tope.
  const equipo = ["p", "e0", "e1", "e2", "e3", "e4", "e5"];
  const notaRol = (notas: number[], agregado: "mediana" | "media-recortada") => {
    const e: Evaluacion[] = notas.map((nota, i) => ({ de: `e${i}`, a: "p", dimension: "rol", nota, motivo: "x" }));
    const r = calcularFactorEvaluacion(equipo, e, "p", { agregado });
    return r.dimensiones.rol.nota as number;
  };
  const conjuntos = [
    [3, 3, 3, 5],
    [3, 4, 4, 5, 2],
    [4, 4, 4, 4, 1],
    [2, 3, 3, 3, 3, 4],
    [1, 2, 3, 4, 5],
    // equipo polarizado (1, 1, 5, 5) con una quinta nota
    ...[1, 2, 3, 4, 5].map((q) => [1, 1, 5, 5, q]),
  ];
  for (const agregado of ["mediana", "media-recortada"] as const) {
    it(`reemplazar una nota por la mediana de las demás mueve el agregado como mucho el tope (${agregado})`, () => {
      for (const c of conjuntos) {
        const antes = notaRol(c, agregado);
        c.forEach((_, i) => {
          const otros = c.filter((__, j) => j !== i);
          const nuevo = c.map((n, j) => (j === i ? mediana(otros) : n));
          expect(Math.abs(notaRol(nuevo, agregado) - antes)).toBeLessThanOrEqual(1);
        });
      }
    });
  }
  it("caracterización de equipos divididos", () => {
    expect(notaRol([1, 1, 5, 5], "mediana")).toBe(3);
    expect(notaRol([5, 5, 5, 1, 1], "mediana")).toBe(4);
    expect(notaRol([5, 5, 5, 1, 1], "media-recortada")).toBe(4);
  });
});

describe("privacidad y ejemplo", () => {
  it("el resultado no lleva ids ni motivos", () => {
    const r = calcularFactorEvaluacion(EQUIPO_EJEMPLO, evaluacionesDeEjemplo(), PERSONA_EJEMPLO);
    const s = JSON.stringify(r);
    for (const id of ["lucia", "tomas", "martina", "joaquin", "bruno"]) expect(s).not.toContain(id);
    for (const m of MOTIVOS_DE_EJEMPLO) expect(s).not.toContain(m);
  });
  it("ningún motivo de ejemplo lleva un id del equipo", () => {
    for (const m of MOTIVOS_DE_EJEMPLO) for (const id of ["lucia", "tomas", "martina", "joaquin", "bruno"]) expect(m.toLowerCase()).not.toContain(id);
  });
  it("ronda de ejemplo con los parámetros de partida", () => {
    const r = calcularFactorEvaluacion(EQUIPO_EJEMPLO, evaluacionesDeEjemplo(), PERSONA_EJEMPLO);
    expect(r.factor).toBe(1.08);
    expect(r.dimensiones.rol).toEqual({ nota: 3.5, evaluadores: 4, suficiente: true });
    expect(r.dimensiones.cultura).toEqual({ nota: 4, evaluadores: 4, suficiente: true });
    expect(r.descartes["fuera-del-equipo"]).toBe(2);
    expect(r.descartes.reciprocidad).toBe(0);
    expect(r.resumenDisponible).toBe(true);
  });
  it("fuerza 0,1 → 1,04", () => {
    expect(calcularFactorEvaluacion(EQUIPO_EJEMPLO, evaluacionesDeEjemplo(), PERSONA_EJEMPLO, { fuerza: 0.1 }).factor).toBe(1.04);
  });
  it("el resumen no copia ningún motivo", () => {
    for (const m of MOTIVOS_DE_EJEMPLO) {
      expect(RESUMEN_FEEDBACK_EJEMPLO.es).not.toContain(m);
      expect(RESUMEN_FEEDBACK_EJEMPLO.en).not.toContain(m);
    }
  });
  it("ningún texto dice brotes ni germinar", () => {
    const todo = JSON.stringify([RESUMEN_FEEDBACK_EJEMPLO, GUIA]);
    expect(todo).not.toMatch(/brotes|germin/i);
  });
});

describe("constancias", () => {
  const entrada = (factor: number, fuerza = 0.2) => ({
    comunidad: "lighthouse",
    periodo: "2026-10",
    pacto: "pacto-1",
    horas: 10,
    resultado: { ...calcularFactorEvaluacion(EQUIPO_EJEMPLO, evaluacionesDeEjemplo(), PERSONA_EJEMPLO, { fuerza }), factor },
  });
  it("base 50 y ajuste 54 que apunta a la base", () => {
    const { base, ajuste } = constanciasDeRonda(entrada(1.08));
    expect(base.datos.semillas).toBe(50);
    expect(ajuste.datos.semillas).toBe(54);
    expect(ajuste.apunta_a).toBe(base.uid);
    expect(base.afirma).toBe("netx");
    expect(ajuste.afirma).toBe("netx");
  });
  it("52,5 redondea para arriba", () => {
    expect(constanciasDeRonda(entrada(1.05)).ajuste.datos.semillas).toBe(53);
  });
  it("otra fuerza: otro uid, misma base, determinista", () => {
    const a = constanciasDeRonda(entrada(1.08, 0.2));
    const b = constanciasDeRonda(entrada(1.04, 0.1));
    expect(b.ajuste.uid).not.toBe(a.ajuste.uid);
    expect(b.ajuste.apunta_a).toBe(a.ajuste.apunta_a);
    expect(b.base).toEqual(a.base);
    expect(constanciasDeRonda(entrada(1.08))).toEqual(a);
    expect(a.ajuste.datos.version_evaluacion).toBe(1);
    expect(a.ajuste.datos.reciprocidad_activa).toBe("no");
  });
  it("no lleva ids de evaluadores", () => {
    const s = JSON.stringify(constanciasDeRonda(entrada(1.08)));
    for (const id of ["lucia", "tomas", "martina", "joaquin", "bruno"]) expect(s).not.toContain(id);
  });
});

describe("guía", () => {
  it("5 niveles × 2 dimensiones × 2 idiomas, sin vacíos", () => {
    for (const d of ["rol", "cultura"] as const) {
      for (const i of ["es", "en"] as const) {
        expect(GUIA[d][i]).toHaveLength(5);
        for (const t of GUIA[d][i]) expect(t.trim()).not.toBe("");
      }
    }
  });
});
