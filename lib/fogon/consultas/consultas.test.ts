import { describe, expect, test } from "vitest";
import { validarReparto } from "@/lib/cuadratico/motor";
import { CONSULTAS, PADRON, PADRON_EJEMPLO, REPARTOS_EJEMPLO, buscarConsulta } from "./ejemplo";
import { estado, formatoPlata, reglasDe, resultadoVisible, textoCierre, textoVoto } from "./reglas";

const u1 = buscarConsulta("u1")!;
const u2 = buscarConsulta("u2")!;

describe("datos de ejemplo", () => {
  test("hay U1 a U4", () => {
    expect(CONSULTAS.map((c) => c.id)).toEqual(["u1", "u2", "u3", "u4"]);
    expect(CONSULTAS.map((c) => c.modo)).toEqual(["prioridades", "prioridades", "prioridades", "presupuesto"]);
  });
  test("todo reparto de ejemplo es válido según el motor", () => {
    for (const c of CONSULTAS) {
      const repartos = Object.values(REPARTOS_EJEMPLO[c.id]);
      expect(repartos).toHaveLength(5);
      for (const r of repartos) expect(validarReparto(reglasDe(c), r).ok).toBe(true);
    }
  });
  test("la persona 6 no votó y hay seis personas más quien mira", () => {
    expect(PADRON_EJEMPLO).toHaveLength(6);
    expect(PADRON).toHaveLength(7);
    for (const c of CONSULTAS) expect(REPARTOS_EJEMPLO[c.id]["p6"]).toBeUndefined();
  });
  test("ninguna consulta tiene créditos distintos de 100", () => {
    for (const c of CONSULTAS) expect(reglasDe(c).creditos).toBe(100);
  });
  test("las de Equipo quedan con voto abierto salvo la que lo pide secreto (U3)", () => {
    for (const c of CONSULTAS.filter((x) => x.ambito === "equipo" && x.id !== "u3")) expect(c.voto).toBe("abierto");
    expect(buscarConsulta("u3")!.voto).toBe("secreto");
  });
  test("U4 trae USD 20.000 sugeridos por el equipo, lo decide Franz", () => {
    const p = buscarConsulta("u4")!.presupuesto!;
    expect(p.montoCentavos).toBe(2_000_000);
    expect(p.moneda).toBe("USD");
    expect(p.nota).toBe("Sugerencia del equipo: lo decide Franz");
    expect(buscarConsulta("u4")!.opciones.map((o) => o.etiqueta)).toEqual([
      "Estudio hidrológico",
      "Obras de piedra a mano en el cauce",
      "Vivero de nativas",
      "Línea de base y monitoreo",
      "Diseño de permacultura profesional",
    ]);
  });
});

describe("reglas", () => {
  const antes = new Date("2026-10-20T12:00:00-03:00");
  const despues = new Date("2026-11-16T12:00:00-03:00");
  test("estado según la fecha y el cierre manual", () => {
    expect(estado(u1, null, antes)).toBe("abierta");
    expect(estado(u1, null, despues)).toBe("cerrada");
    expect(estado(u1, "2026-10-20T13:00:00.000Z", antes)).toBe("cerrada");
  });
  test("resultado al votar: solo después de guardar", () => {
    expect(resultadoVisible(u2, "abierta", false)).toBe(false);
    expect(resultadoVisible(u2, "abierta", true)).toBe(true);
  });
  test("resultado al cierre: solo cerrada", () => {
    expect(resultadoVisible(u1, "abierta", false)).toBe(false);
    expect(resultadoVisible(u1, "abierta", true)).toBe(false);
    expect(resultadoVisible(u1, "cerrada", false)).toBe(true);
  });
  test("textos de cierre y de voto", () => {
    expect(textoCierre(u1, "abierta")).toBe("Cierra el 15 de noviembre de 2026");
    expect(textoVoto(u1)).toContain("Voto abierto");
    expect(textoVoto(buscarConsulta("u3")!)).toContain("Voto secreto");
  });
  test("formato de plata: centavos solo si no son cero, y sin dato", () => {
    expect(formatoPlata(1_500_000, "USD")).toBe("USD 15.000");
    expect(formatoPlata(533_333, "USD")).toBe("USD 5.333,33");
    expect(formatoPlata(0, "USD")).toBe("USD 0");
    expect(formatoPlata(null, "USD")).toBe("sin dato");
  });
});
