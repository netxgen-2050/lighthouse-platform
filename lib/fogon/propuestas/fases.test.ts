import { describe, expect, it } from "vitest";
import { accionesDeFase, accionesDisponibles, RECORRIDOS } from "./fases";
import type { Accion, EstadoPropuesta, Fase, NivelImplicacion, Propuesta } from "./tipos";

const FASES: Fase[] = ["borrador", "presentacion", "preguntas", "discusion", "concerns", "resolver", "llamado", "objetar", "cierre"];
const importante: Pick<Propuesta, "recorrido" | "materia"> = { recorrido: "importante" };
const simple: Pick<Propuesta, "recorrido" | "materia"> = { recorrido: "simple" };

const estado = (fase: Fase, resultado: EstadoPropuesta["resultado"] = null): Pick<EstadoPropuesta, "fase" | "resultado"> => ({ fase, resultado });
const acciones = (p: Pick<Propuesta, "recorrido" | "materia">, fase: Fase, niveles: NivelImplicacion[], resultado: EstadoPropuesta["resultado"] = null): Accion[] =>
  accionesDisponibles(p, estado(fase, resultado), niveles, "consejo").map((a) => a.accion);

describe("RECORRIDOS (B1)", () => {
  it("el simple tiene presentación, objetar y cierre; el importante tiene ocho fases", () => {
    expect(RECORRIDOS.simple).toEqual(["presentacion", "objetar", "cierre"]);
    expect(RECORRIDOS.importante).toHaveLength(8);
  });
});

describe("acciones por fase", () => {
  it("en preguntas, el ámbito pregunta y firma el acuse, y no levanta concerns", () => {
    const a = acciones(importante, "preguntas", ["ambito"]);
    expect(a).toContain("preguntar");
    expect(a).toContain("acusar-conformidad");
    expect(a).not.toContain("levantar-concern");
  });

  it("en objetar, el ámbito levanta concerns, bloquea y firma el acuse", () => {
    const a = acciones(simple, "objetar", ["ambito"]);
    expect(a).toEqual(expect.arrayContaining(["levantar-concern", "bloquear", "acusar-conformidad"]));
  });

  it("agrupar-concerns solo en concerns y objetar", () => {
    for (const f of FASES) {
      expect(accionesDeFase(f, "importante").includes("agrupar-concerns"), f).toBe(f === "concerns" || f === "objetar");
    }
  });

  it("sugerir-mecanismo en discusión, concerns, resolver y objetar", () => {
    for (const f of FASES) {
      expect(accionesDeFase(f, "importante").includes("sugerir-mecanismo"), f).toBe(["discusion", "concerns", "resolver", "objetar"].includes(f));
    }
  });

  it("acusar-conformidad nunca en borrador ni en cierre", () => {
    expect(accionesDeFase("borrador", "importante")).not.toContain("acusar-conformidad");
    expect(accionesDeFase("cierre", "importante")).not.toContain("acusar-conformidad");
    expect(accionesDeFase("llamado", "importante")).toContain("acusar-conformidad");
  });

  it("marcar-urgente solo en borrador, presentación, preguntas y objetar", () => {
    for (const f of FASES) {
      expect(accionesDeFase(f, "importante").includes("marcar-urgente"), f).toBe(["borrador", "presentacion", "preguntas", "objetar"].includes(f));
    }
  });

  it("respaldar-urgencia nunca desde llamado en adelante (salvo el plazo para objetar de la simple)", () => {
    expect(accionesDeFase("llamado", "importante")).not.toContain("respaldar-urgencia");
    expect(accionesDeFase("cierre", "importante")).not.toContain("respaldar-urgencia");
    expect(accionesDeFase("objetar", "simple")).toContain("respaldar-urgencia");
  });

  it("sacar-propio-del-grupo y objetar-urgencia en cualquier fase menos cierre", () => {
    for (const f of FASES) {
      for (const a of ["sacar-propio-del-grupo", "objetar-urgencia"] as const) {
        expect(accionesDeFase(f, "importante").includes(a), `${a} en ${f}`).toBe(f !== "cierre");
      }
    }
  });

  it("en cierre solo leer, acta y evaluar (D3)", () => {
    expect(acciones(importante, "cierre", ["proceso"])).toEqual(expect.arrayContaining(["leer-propuesta", "escribir-acta", "evaluar"]));
    expect(acciones(importante, "cierre", ["proceso"])).not.toContain("editar");
    expect(acciones(importante, "cierre", ["proceso"])).not.toContain("abrir-revision");
  });

  it("en cierre con medida provisoria, el rol de proceso ve abrir-revision; la revisión ya abierta no", () => {
    const provisoria: Extract<NonNullable<EstadoPropuesta["resultado"]>, { tipo: "provisoria" }> = {
      tipo: "provisoria",
      revisarAntesDe: "2026-12-08",
      concernsQueObligan: [],
      enRevision: false,
    };
    expect(acciones(importante, "cierre", ["proceso"], provisoria)).toContain("abrir-revision");
    expect(acciones(importante, "cierre", ["ambito"], provisoria)).not.toContain("abrir-revision");
    expect(acciones(importante, "cierre", ["proceso"], { ...provisoria, enRevision: true })).not.toContain("abrir-revision");
  });

  it("una materia sin urgencia no ofrece marcar-urgente", () => {
    expect(acciones({ recorrido: "importante", materia: "tierra" }, "preguntas", ["presenta"])).not.toContain("marcar-urgente");
    expect(acciones(importante, "preguntas", ["presenta"])).toContain("marcar-urgente");
  });

  it("la visita no tiene ninguna acción, ni leer", () => {
    for (const f of FASES) expect(acciones(importante, f, ["visita"]), f).toEqual([]);
  });

  it("preguntar en la presentación solo vale para la simple", () => {
    expect(accionesDeFase("presentacion", "importante")).not.toContain("preguntar");
    expect(accionesDeFase("presentacion", "simple")).toContain("preguntar");
  });
});
