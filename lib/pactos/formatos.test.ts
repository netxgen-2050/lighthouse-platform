import { describe, expect, it } from "vitest";
import { aceptaFormato, formatosDe } from "./formatos";
import { listarTribusBilingues } from "@/lib/tribus/datos";

describe("formatos de pacto por comunidad", () => {
  it("Valle Solar acepta fijo y puntual", () => {
    expect(formatosDe("valle")).toEqual(["fijo", "puntual"]);
  });
  it("Barda Productiva y el Lighthouse solo aceptan fijo", () => {
    expect(formatosDe("barda")).toEqual(["fijo"]);
    expect(formatosDe("lighthouse")).toEqual(["fijo"]);
    expect(aceptaFormato("barda", "puntual")).toBe(false);
  });
  it("una comunidad desconocida (o un id raro) es solo fijo", () => {
    expect(formatosDe("no-existe")).toEqual(["fijo"]);
    expect(formatosDe("__proto__")).toEqual(["fijo"]);
    expect(formatosDe("constructor")).toEqual(["fijo"]);
  });
  it("todas las comunidades con necesidades aceptan fijo", () => {
    for (const t of listarTribusBilingues().filter((x) => x.estado !== "vacante")) {
      expect(aceptaFormato(t.id, "fijo"), t.id).toBe(true);
    }
  });
});
