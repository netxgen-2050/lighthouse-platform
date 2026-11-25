import { describe, expect, it } from "vitest";
import { entradasDeDiscusion } from "./discusion";
import { propuestaDe } from "./ejemplos";
import { derivarEstado } from "./estado";
import { fuentePrincipios } from "./principios";

const AHORA = new Date("2026-10-30T12:00:00Z");

describe("entradasDeDiscusion", () => {
  const p = propuestaDe("consejo-bomba")!;
  const e = derivarEstado(p, [], AHORA);
  const entradas = entradasDeDiscusion(p, e, p.registros);

  it("un grupo de concerns es una sola entrada y adentro están los dos originales", () => {
    const grupos = entradas.filter((x) => x.tipo === "grupo");
    expect(grupos).toHaveLength(1);
    expect(entradas.filter((x) => x.tipo === "concern").map((x) => (x.tipo === "concern" ? x.concern.quien : ""))).toEqual(["ines"]);
  });

  it("las sugerencias del Guardián son entradas con su tipo", () => {
    expect(entradas.filter((x) => x.tipo === "guardian")).toHaveLength(2);
  });

  it("va en orden de hora", () => {
    const horas = entradas.map((x) => Date.parse(x.cuando));
    expect([...horas].sort((a, b) => a - b)).toEqual(horas);
  });

  it("toda razón de concern cita un principio que existe en la fuente", () => {
    const ids = new Set(fuentePrincipios.principios().map((x) => x.id));
    for (const x of entradas) if (x.tipo === "concern" && x.concern.principio) expect(ids.has(x.concern.principio)).toBe(true);
  });
});
