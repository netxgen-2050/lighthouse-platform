import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS } from "@/lib/legal/terminos";
import { anchoBarra, anchoMedidor, conversiones, formatear, porcentaje } from "./calculos";
import { ALERTAS, armarFilas, EMBUDO, TRIBUS_POR_PROYECTO } from "./datos";

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
  it("el medidor nunca pasa del 100 % ni baja de 0", () => {
    expect(anchoMedidor(porcentaje(37, 35))).toBe(100);
    expect(anchoMedidor(63)).toBe(63);
    expect(anchoMedidor(null)).toBe(0);
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
      // Los barrios 9 y 12 pasaron a vacantes el 8-oct-2026: el mock-up todavía los trae como tribus con nombre.
      if (t.fincas === 9 || t.fincas === 12) continue;
      expect(mock).toContain(`name:"${t.nombre}"`);
      expect(mock).toContain(`cap:[${t.plata![0]},${t.plata![1]}]`);
      expect(mock).toContain(`hum:[${t.roles![0]},${t.roles![1]}]`);
    }
  });
  it("una tribu sin avance queda con plata y roles en null (sin dato), sin romper", () => {
    const nueva = { id: "nueva", nombre: "Nueva", barrio: 13, formaJuridica: "A definir" };
    const filas = armarFilas([nueva], {});
    expect(filas).toEqual([{ nombre: "Nueva", fincas: 13, plata: null, roles: null, ritual: "A definir" }]);
    expect(armarFilas([{ ...nueva, id: "toString" }], {})[0].plata).toBeNull();
  });
  it("todas las tribus de lib/tribus tienen avance", () => {
    for (const f of TRIBUS_POR_PROYECTO) {
      expect(f.plata).not.toBeNull();
      expect(f.roles).not.toBeNull();
    }
  });
  it("los ⚖ de las alertas existen en el catálogo", () => {
    for (const a of ALERTAS) if (a.termino) expect(TERMINOS[a.termino]).toBeDefined();
  });
});
