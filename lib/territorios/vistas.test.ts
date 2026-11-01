import { describe, expect, it } from "vitest";
import { listarFrentes } from "@/lib/equipos/frentes";
import { buscarElemento } from "./biopueblo";
import {
  FUENTES_PLAN,
  VISTAS,
  elegibles,
  esDeHoy,
  frentesEn,
  leerEntrada,
  leerFase,
  leerFuentePlan,
  leerVista,
  numeroDeFrente,
} from "./vistas";

const url = (s: string) => new URLSearchParams(s);

describe("vistas", () => {
  it("el orden de la barra es ahora, plan, vision", () => {
    expect(VISTAS.map((v) => v.id)).toEqual(["ahora", "plan", "vision"]);
  });

  it("leerVista: por defecto, desconocida y alias viejo", () => {
    expect(leerVista(null)).toBe("ahora");
    expect(leerVista("red")).toBe("ahora");
    expect(leerVista("vision")).toBe("vision");
    expect(leerVista("permacultura")).toBe("plan");
  });

  it("leerFase: válida, inválida y ausente", () => {
    expect(leerFase("1")).toBe(1);
    expect(leerFase("7")).toBe(0);
    expect(leerFase("x")).toBe(0);
    expect(leerFase("1.5")).toBe(0);
    expect(leerFase("")).toBe(0);
    expect(leerFase(null)).toBe(0);
  });

  it("el número de un frente es el mismo en las tres fases y los frentes sin lugar no tienen", () => {
    const n = numeroDeFrente("primer-obrador");
    expect(n).toBe(5);
    for (const fase of [0, 1, 2] as const) {
      const f = [...frentesEn(fase).conLugar, ...frentesEn(fase).despues].find((x) => x.id === "primer-obrador");
      expect(f).toBeDefined();
      expect(numeroDeFrente(f!.id)).toBe(n);
    }
    expect(numeroDeFrente("agua-cuenca")).toBe(1);
    expect(numeroDeFrente("comunicacion")).toBeNull();
    expect(numeroDeFrente("no-existe")).toBeNull();
  });

  it("frentesEn separa con lugar, sin lugar y los que vienen", () => {
    const f0 = frentesEn(0);
    expect(f0.despues.map((f) => f.id)).toEqual(["primer-obrador", "parque-agrovoltaico"]);
    expect(f0.sinLugar.map((f) => f.id)).toEqual(["papeles-fideicomiso", "comunicacion"]);
    expect(f0.conLugar.map((f) => f.id)).not.toContain("primer-obrador");
    const f1 = frentesEn(1);
    expect(f1.despues).toEqual([]);
    expect(f1.conLugar.map((f) => f.id)).toContain("primer-obrador");
    // Todo frente aparece en un solo grupo.
    const total = listarFrentes("es").length;
    expect(f0.conLugar.length + f0.sinLugar.length + f0.despues.length).toBe(total);
  });

  it("elegibles por vista: plan no incluye barrios ni frentes; vision sí barrios", () => {
    const plan = elegibles("plan", 0);
    expect(plan.some((id) => id.startsWith("barrio-"))).toBe(false);
    expect(plan).toContain("comun");
    expect(plan).not.toContain("agua-cuenca");
    expect(elegibles("vision", 0)).toContain("barrio-6");
    expect(elegibles("ahora", 0)).toContain("agua-cuenca");
    expect(elegibles("ahora", 0)).not.toContain("primer-obrador");
    expect(elegibles("ahora", 1)).toContain("primer-obrador");
    expect(elegibles("ahora", 0)).not.toContain("barrio-6");
  });

  it("el común, una finca y un lugar son elegibles en las tres vistas", () => {
    const finca = buscarElemento("finca-502") ? "finca-502" : null;
    for (const v of VISTAS) {
      expect(v.elegibles(0)).toContain("comun");
      if (finca) expect(v.elegibles(0)).toContain(finca);
    }
  });

  it("esDeHoy: Primer obrador no, Agua y cuenca sí", () => {
    const todos = listarFrentes("es");
    expect(esDeHoy(todos.find((f) => f.id === "primer-obrador")!)).toBe(false);
    expect(esDeHoy(todos.find((f) => f.id === "agua-cuenca")!)).toBe(true);
  });

  it("leerFuentePlan: sin permacultura disponible cae en la ilustrativa", () => {
    expect(leerFuentePlan(url("vista=permacultura"))).toBe("ilustrativa");
    expect(leerFuentePlan(url("vista=plan&plan=permacultura"))).toBe("ilustrativa");
    expect(leerFuentePlan(url("plan=martin"))).toBe("ilustrativa");
    expect(leerFuentePlan(url(""))).toBe("ilustrativa");
  });

  it("leerFuentePlan: con permacultura disponible la respeta, también por el alias", () => {
    const fuentes = [...FUENTES_PLAN, { id: "permacultura" as const, estado: "disponible" as const }];
    expect(leerFuentePlan(url("vista=plan&plan=permacultura"), fuentes)).toBe("permacultura");
    expect(leerFuentePlan(url("vista=permacultura"), fuentes)).toBe("permacultura");
    expect(leerFuentePlan(url("plan=otra"), fuentes)).toBe("ilustrativa");
  });
});

describe("leerEntrada (compatibilidad de ?sel=)", () => {
  it("sel=barrio-6 sin vista abre vision", () => {
    expect(leerEntrada(url("sel=barrio-6"))).toMatchObject({ vista: "vision", sel: "barrio-6" });
  });

  it("vista=ahora&sel=barrio-6 abre ahora sin selección", () => {
    expect(leerEntrada(url("vista=ahora&sel=barrio-6"))).toMatchObject({ vista: "ahora", sel: null });
  });

  it("sel=comun sin vista se queda en ahora", () => {
    expect(leerEntrada(url("sel=comun"))).toMatchObject({ vista: "ahora", sel: "comun" });
  });

  it("sel de frente sin vista abre ahora; en una fase donde no está se limpia", () => {
    expect(leerEntrada(url("sel=agua-cuenca"))).toMatchObject({ vista: "ahora", sel: "agua-cuenca" });
    expect(leerEntrada(url("sel=primer-obrador"))).toMatchObject({ vista: "ahora", sel: null });
    expect(leerEntrada(url("sel=primer-obrador&fase=1"))).toMatchObject({ vista: "ahora", fase: 1, sel: "primer-obrador" });
  });

  it("vista desconocida, fase inválida y sel inexistente", () => {
    expect(leerEntrada(url("vista=red&fase=9&sel=nada"))).toEqual({ vista: "ahora", fase: 0, sel: null, fuente: "ilustrativa" });
  });

  it("vista=permacultura abre plan", () => {
    expect(leerEntrada(url("vista=permacultura")).vista).toBe("plan");
  });
});
