import { describe, expect, it } from "vitest";
import { copiaParaElConsejo, DECISIONES_BASE, DECISIONES_CON_CAMINO } from "./datos";
import { formatearFechaCierre, formatearMonto } from "./parametros";

const porId = (id: string) => DECISIONES_BASE.find((d) => d.id === id)!;

describe("parámetros opcionales de una decisión", () => {
  it("la bomba solar del consejo tiene plazo y monto pero no acuerdo", () => {
    const d = porId("consejo-bomba");
    expect(d.plazo?.cierra).toBe("2026-11-15");
    expect(d.monto).toMatchObject({ cantidad: 4800, fuente: "fondo-comun" });
    expect(d.acuerdo).toBeUndefined();
  });

  it("la cisterna compartida tiene el monto sin cifra (null), nunca 0", () => {
    const d = porId("cisterna-compartida");
    expect(d.monto?.cantidad).toBeNull();
    expect(formatearMonto(d.monto?.cantidad, "es")).toBeNull();
  });

  it("las decisiones nuevas tienen su inglés y el español como original", () => {
    for (const d of DECISIONES_CON_CAMINO) {
      expect(d.titulo.en.trim()).not.toBe("");
      expect(d.titulo.original).toBe("es");
    }
  });

  it("las que no traen parámetros no los inventan", () => {
    const d = porId("facilitador");
    expect(d.plazo ?? d.acuerdo ?? d.monto).toBeUndefined();
  });

  it("una copia para el consejo sin parámetros sigue sin ellos", () => {
    const copia = copiaParaElConsejo(porId("cisterna"));
    expect(copia.plazo ?? copia.acuerdo ?? copia.monto).toBeUndefined();
  });
});

describe("formato de fecha y monto", () => {
  it("la fecha de cierre dice el mismo día escrito, sin correrse por la zona horaria", () => {
    expect(formatearFechaCierre("2026-11-15", "es")).toBe("15 de noviembre de 2026");
    expect(formatearFechaCierre("2026-11-15", "en")).toBe("November 15, 2026");
    expect(formatearFechaCierre("2026-12-01", "es")).toBe("1 de diciembre de 2026");
  });

  it("una fecha rota da null", () => {
    expect(formatearFechaCierre("15/11/2026", "es")).toBeNull();
    expect(formatearFechaCierre("2026-02-31", "es")).toBeNull();
  });

  it("el monto con cifra lleva el dólar; lo que no es un número es sin dato", () => {
    expect(formatearMonto(4800, "en")).toBe("$4,800");
    expect(formatearMonto(Number.NaN, "es")).toBeNull();
    expect(formatearMonto(Infinity, "es")).toBeNull();
    expect(formatearMonto(null, "es")).toBeNull();
    expect(formatearMonto(undefined, "es")).toBeNull();
  });

  it("un monto de cero explícito se muestra como 0, porque es una cifra", () => {
    expect(formatearMonto(0, "en")).toBe("$0");
  });
});
