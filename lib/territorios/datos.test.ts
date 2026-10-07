import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listarTribus } from "../tribus/datos";
import {
  buscarTerritorio,
  listarTerritorios,
  resumenDeTerritorio,
  textoSuperficie,
  tribusDeTerritorio,
} from "./datos";
import type { Territorio } from "./tipos";

describe("territorios", () => {
  it("lista un solo territorio: lighthouse, con sus cuatro bienes comunes", () => {
    const lista = listarTerritorios();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe("lighthouse");
    expect(lista[0].bienesComunes).toEqual([
      "Agua: toma, cisterna y riego",
      "Energía: parque solar comunitario",
      "Núcleo común: bioquincho y cocina",
      "Vivero y banco de semillas",
    ]);
  });

  it("buscar un territorio inexistente devuelve undefined", () => {
    expect(buscarTerritorio("no-existe")).toBeUndefined();
    expect(buscarTerritorio("lighthouse")?.nombre).toBe("Lighthouse");
  });

  it("las tribus del Lighthouse son 12, ordenadas por barrio", () => {
    const tribus = tribusDeTerritorio("lighthouse");
    expect(tribus.map((t) => t.barrio)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("cada tribu apunta a un territorio existente", () => {
    const ids = listarTerritorios().map((t) => t.id);
    for (const t of listarTribus()) expect(ids).toContain(t.territorioId);
  });

  it("territorio desconocido: lista vacía", () => {
    expect(tribusDeTerritorio("no-existe")).toEqual([]);
  });

  it("el resumen suma 12 y coincide con contar los estados", () => {
    const r = resumenDeTerritorio("lighthouse");
    expect(r).toBeDefined();
    const tribus = listarTribus();
    const contar = (e: string) => tribus.filter((t) => t.estado === e).length;
    expect(r).toEqual({
      activa: contar("activa"),
      formacion: contar("formacion"),
      vacante: contar("vacante"),
      total: 12,
    });
    expect(r!.activa + r!.formacion + r!.vacante).toBe(12);
  });

  it("el resumen de un territorio inexistente es undefined", () => {
    expect(resumenDeTerritorio("no-existe")).toBeUndefined();
  });

  it("lo que se muestra sin superficie es 'sin dato', nunca 0 ni vacío", () => {
    expect(textoSuperficie({})).toBe("sin dato");
    expect(textoSuperficie({ superficie: "" })).toBe("sin dato");
    expect(textoSuperficie({ superficie: "~1.000 ha" })).toBe("~1.000 ha");
    expect(textoSuperficie(buscarTerritorio("lighthouse")!)).not.toBe("sin dato");
  });

  it("la superficie ausente es undefined, no 0", () => {
    const sinSuperficie: Territorio = {
      id: "prueba",
      nombre: "Prueba",
      ubicacion: "Ninguna",
      descripcion: "Solo para el test",
      bienesComunes: [],
    };
    expect(sinSuperficie.superficie).toBeUndefined();
    for (const t of listarTerritorios()) {
      expect(t.superficie).not.toBe("");
      expect(t.superficie).not.toBe(0);
    }
  });
});

describe("guarda de plata y lotes", () => {
  it("datos.ts no menciona USD, $, lote ni parcela", () => {
    const fuente = readFileSync(join(__dirname, "datos.ts"), "utf8");
    expect(fuente).not.toMatch(/USD/);
    expect(fuente).not.toMatch(/\$/);
    expect(fuente).not.toMatch(/lote/i);
    expect(fuente).not.toMatch(/parcela/i);
  });
});
