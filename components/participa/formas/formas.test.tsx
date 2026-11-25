import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CIRCULOS_DEL_COMUN } from "@/lib/gobernanza/datos";
import { FORMAS, ParcelaNueva, formaDe } from "./index";
import { UBICACIONES } from "../ubicaciones";

describe("formas de los equipos", () => {
  it("hay una forma por cada círculo del común y ninguna de más", () => {
    expect(Object.keys(FORMAS).sort()).toEqual(CIRCULOS_DEL_COMUN.map((c) => c.id).sort());
    expect(Object.keys(UBICACIONES).sort()).toEqual(CIRCULOS_DEL_COMUN.map((c) => c.id).sort());
  });

  it.each(CIRCULOS_DEL_COMUN.map((c) => c.id))("%s se dibuja con suelo, cuerpo y solo tokens del tema", (id) => {
    const Forma = formaDe(id);
    expect(Forma).not.toBe(ParcelaNueva);
    const html = renderToStaticMarkup(<Forma />);
    expect(html).toContain("forma-suelo");
    expect(html).toContain("forma-cuerpo");
    // Nada de colores sueltos: todo color sale de un token.
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toMatch(/(?:fill|stroke)="(?:rgb|hsl)/);
    expect(html).not.toContain("NaN");
  });

  it("un círculo nuevo sin forma propia se dibuja como parcela nueva", () => {
    expect(formaDe("comun-nuevo")).toBe(ParcelaNueva);
    expect(formaDe("__proto__")).toBe(ParcelaNueva);
  });
});
