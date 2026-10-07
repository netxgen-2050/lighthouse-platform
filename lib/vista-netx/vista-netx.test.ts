import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "@/lib/legal/terminos";
import { anchoBarra, conversiones, formatear, porcentaje } from "./calculos";
import { ALERTAS, EMBUDO, TRIBUS_POR_PROYECTO } from "./datos";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");

describe("conversión del embudo", () => {
  it("de 412 perfiles a 186 en una tribu es 45 %", () => {
    expect(porcentaje(186, 412)).toBe(45);
  });
  it("calcula cada etapa contra la anterior", () => {
    expect(conversiones(EMBUDO)).toEqual([null, 13, 45, 31, 64]);
  });
  it("sin etapa anterior con datos no hay conversión (no es 0)", () => {
    expect(porcentaje(5, 0)).toBeNull();
    expect(conversiones([{ valor: 0 }, { valor: 3 }])).toEqual([null, null]);
  });
});

describe("barras y formato", () => {
  it("la barra mayor ocupa todo y ninguna desaparece", () => {
    expect(anchoBarra(3240, 3240)).toBe(100);
    expect(anchoBarra(0, 3240)).toBe(1.5);
  });
  it("el dato que falta dice sin dato", () => {
    expect(formatear(null)).toBe("sin dato");
    expect(formatear(3240)).toBe((3240).toLocaleString("es-AR"));
  });
});

describe("datos", () => {
  it("el embudo y las tribus coinciden con el mock-up", () => {
    for (const e of EMBUDO) expect(mock).toContain(`["${e.etiqueta}",${e.valor}]`);
    expect(TRIBUS_POR_PROYECTO).toHaveLength(12);
    for (const t of TRIBUS_POR_PROYECTO) {
      expect(mock).toContain(`name:"${t.nombre}"`);
      expect(mock).toContain(`cap:[${t.plata[0]},${t.plata[1]}]`);
      expect(mock).toContain(`hum:[${t.roles[0]},${t.roles[1]}]`);
    }
  });
  it("los ⚖ de las alertas existen en el catálogo", () => {
    for (const a of ALERTAS) if (a.termino) expect(TERMINOS[a.termino]).toBeDefined();
  });
});
