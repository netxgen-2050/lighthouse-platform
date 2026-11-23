import { describe, expect, it } from "vitest";
import {
  RESGUARDOS,
  RUBROS,
  VERSION_HIBRIDO,
  apartadoDeResguardo,
  costoDeRubro,
  estadoDeResguardo,
  lineasDelResumen,
  nombreDeRubro,
  rubrosComunes,
  rubrosPrivados,
  textoQuienCuida,
  textoQuienPaga,
  textoTipo,
} from "./hibrido";
import { MODELO_LOTES, precioCasa } from "./modelo";
import { usd } from "@/lib/series/formato";

describe("tabla de lo privado y lo común", () => {
  it("hay 7 rubros comunes, entre ellos aguas grises y negras, y 2 privados", () => {
    expect(rubrosComunes()).toHaveLength(7);
    expect(rubrosPrivados()).toHaveLength(2);
    expect(rubrosComunes().map((r) => nombreDeRubro(r, "es"))).toContain("Aguas grises y negras");
    expect(rubrosComunes().map((r) => nombreDeRubro(r, "en"))).toContain("Grey and black water");
  });

  it("cada rubro dice Privado o Común en texto, en los dos idiomas", () => {
    for (const r of RUBROS) {
      expect(textoTipo(r, "es")).toBe(r.tipo === "privado" ? "Privado" : "Común");
      expect(textoTipo(r, "en")).toBe(r.tipo === "privado" ? "Private" : "Common");
    }
  });

  it("todo rubro común sin valor dice sin dato, nunca cero", () => {
    for (const r of rubrosComunes()) {
      expect(costoDeRubro(r, "es")).toBe("sin dato");
      expect(costoDeRubro(r, "en")).toBe("no data");
    }
  });

  it("el lote y la casa leen su rango del módulo", () => {
    const lote = RUBROS.find((r) => r.id === "lote")!;
    const casa = RUBROS.find((r) => r.id === "casa")!;
    expect(costoDeRubro(lote, "es")).toContain(usd(MODELO_LOTES.precioLote.min));
    expect(costoDeRubro(lote, "es")).toContain(usd(MODELO_LOTES.precioLote.max));
    expect(costoDeRubro(casa, "es")).toContain(usd(precioCasa("modular")));
    expect(costoDeRubro(casa, "es")).toContain(usd(precioCasa("amplia")));
  });

  it("quién paga: quien compra lo privado y el presupuesto común lo común", () => {
    for (const r of rubrosPrivados()) expect(textoQuienPaga(r, "es")).toBe("Quien compra");
    for (const r of rubrosComunes()) expect(textoQuienPaga(r, "es")).toBe("Presupuesto común");
  });

  it("quién cuida: consorcio para caminos, agua, aguas y basura; Fundación para el resto, y dice que no existe", () => {
    const de = (id: string) => textoQuienCuida(RUBROS.find((r) => r.id === id)!, "es");
    for (const id of ["caminos", "agua", "aguas", "basura"]) expect(de(id)).toBe("Consorcio de propietarios");
    for (const id of ["escuela", "restauracion", "produccion"]) expect(de(id)).toBe("Fundación (todavía no existe)");
  });

  it("ningún texto visible dice procomún", () => {
    expect(JSON.stringify([RUBROS, RESGUARDOS]).toLowerCase()).not.toContain("procomún");
  });
});

describe("resguardos", () => {
  it("son cuatro y todos dicen que todavía no están hechos", () => {
    expect(RESGUARDOS.map((r) => r.id)).toEqual(["servidumbres", "reglamento", "reventa", "rio"]);
    for (const r of RESGUARDOS) {
      expect(estadoDeResguardo(r, "es")).toBe("Todavía no está hecho");
      expect(estadoDeResguardo(r, "en")).toBe("Not done yet");
    }
  });

  it("el de la franja del río dice que el loteo no considera la costa y que es sin dato", () => {
    const rio = RESGUARDOS.find((r) => r.id === "rio")!;
    expect(apartadoDeResguardo(rio, "es")).toContain("no considera la costa ni la línea de inundación");
    expect(apartadoDeResguardo(rio, "es")).toContain("sin dato");
    expect(apartadoDeResguardo(rio, "en")).toContain("no data");
  });
});

describe("resumen de la ficha", () => {
  it("son tres líneas y la segunda lleva los valores que llegan", () => {
    const l = lineasDelResumen("es", { aporte: "USD 1", expensa: "USD 2" });
    expect(l).toHaveLength(3);
    expect(l[1]).toContain("USD 1");
    expect(l[1]).toContain("USD 2");
    expect(l[0]).toContain("son tuyos");
    expect(l[2]).toContain("el mismo reglamento");
    expect(lineasDelResumen("en", { aporte: "USD 1", expensa: "USD 2" })[1]).toContain("USD 2");
  });

  it("la versión del texto aceptado existe", () => {
    expect(VERSION_HIBRIDO.trim()).toBeTruthy();
  });
});
