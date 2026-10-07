import { describe, expect, it } from "vitest";
import {
  buscarElemento,
  contarTribusPorEstado,
  listarBarrios,
  listarContexto,
  listarFincas,
  listarLugares,
  macrolote7,
  terrenoComun,
  textoHectareas,
  textoSuperficieM2,
  tribuDeBarrio,
} from "./biopueblo";

describe("biopueblo", () => {
  it("12 barrios, cada uno con su tribu", () => {
    const barrios = listarBarrios();
    expect(barrios.map((b) => b.barrio)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const b of barrios) expect(tribuDeBarrio(b)?.barrio).toBe(b.barrio);
  });

  it("175 fincas: 167 disponibles, 7 reservadas, 1 cantera", () => {
    const fincas = listarFincas();
    expect(fincas).toHaveLength(175);
    const n = (e: string) => fincas.filter((f) => f.estado === e).length;
    expect([n("disponible"), n("reservada"), n("cantera")]).toEqual([167, 7, 1]);
  });

  it("macrolote, común, lugares y contexto", () => {
    expect(macrolote7().id).toBe("macrolote-7");
    expect(terrenoComun().nombre).toBe("Terreno común del Lighthouse");
    expect(listarLugares()).toHaveLength(5);
    expect(listarContexto().length).toBeGreaterThan(0);
  });

  it("conteo de tribus por estado: 5 activas, 5 en formación, 2 vacantes", () => {
    expect(contarTribusPorEstado()).toEqual({ activa: 5, formacion: 5, vacante: 2, total: 12 });
  });

  it("buscar por id", () => {
    expect(buscarElemento("barrio-6")?.tipo).toBe("barrio");
    expect(buscarElemento("comun")?.tipo).toBe("comun");
    expect(buscarElemento("finca-502")?.tipo).toBe("finca");
    expect(buscarElemento("lugar-olivos")?.tipo).toBe("lugar");
    expect(buscarElemento("nada")).toBeUndefined();
  });

  it("textos de superficie; sin dato no es 0", () => {
    expect(textoSuperficieM2(9130)).toBe("9.130 m²");
    expect(textoSuperficieM2(1450)).toBe("1.450 m²");
    expect(textoSuperficieM2(undefined)).toBe("sin dato");
    expect(textoHectareas(118.8)).toBe("118,8 ha");
    expect(textoHectareas(undefined)).toBe("sin dato");
  });
});
