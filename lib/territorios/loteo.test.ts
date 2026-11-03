import { describe, expect, it } from "vitest";
import { ESTADOS_EJEMPLO, estadoDeLote } from "./loteo-estados";
import { fuenteDelLoteo, listarLotes, rangoDeSuperficies, sectorNorte, zonasDelLoteo } from "./loteo";

describe("loteo (siempre, con cualquier archivo)", () => {
  it("los ids de los lotes son únicos y tienen formato lote-<número>", () => {
    const ids = listarLotes().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of listarLotes()) expect(l.id).toBe(`lote-${l.numero}`);
  });

  it("los lotes vienen ordenados por número", () => {
    const n = listarLotes().map((l) => l.numero);
    expect(n).toEqual([...n].sort((a, b) => a - b));
  });

  it("sectorNorte() es null si el plano no trae sector", () => {
    const s = sectorNorte();
    if (s === null) expect(s).toBeNull();
    else expect(s.tipo).toBe("sector");
  });

  it("un id de estado de ejemplo sin lote se ignora (es un aviso del importador, no un error)", () => {
    expect(estadoDeLote("lote-9999")).toBe("disponible");
    expect(estadoDeLote("constructor")).toBe("disponible");
  });

  it("el rango de superficies ignora los lotes sin dato y es null si ninguno la tiene", () => {
    const base = { id: "lote-1", numero: 1, nombre: "Lote 1", anillo: [] };
    expect(rangoDeSuperficies([])).toBeNull();
    expect(rangoDeSuperficies([base])).toBeNull();
    expect(rangoDeSuperficies([base, { ...base, id: "lote-2", numero: 2, superficieM2: 1500 }])).toEqual({ min: 1500, max: 1500 });
  });
});

// Solo mientras el archivo sea el boceto: reemplazarlo por el plano de Martín no tiene que romper estos tests.
describe.runIf(fuenteDelLoteo() === "ilustrativa")("loteo: boceto", () => {
  it("25 lotes de 1.344 a 2.200 m², lote-1 a lote-25", () => {
    const lotes = listarLotes();
    expect(lotes).toHaveLength(25);
    expect(lotes.map((l) => l.id)).toEqual(Array.from({ length: 25 }, (_, i) => `lote-${i + 1}`));
    expect(rangoDeSuperficies()).toEqual({ min: 1344, max: 2200 });
  });

  it("sector de 102 ha y una zona de cada tipo", () => {
    expect(sectorNorte()?.areaHa).toBe(102);
    expect(zonasDelLoteo().map((z) => z.tipo).sort()).toEqual(["calle", "produccion", "uso-comun"]);
  });

  it("estados de ejemplo: lote-5 reservado, lote-13 vendido, lote-1 disponible", () => {
    expect(estadoDeLote("lote-5")).toBe("reservado");
    expect(estadoDeLote("lote-13")).toBe("vendido");
    expect(estadoDeLote("lote-1")).toBe("disponible");
  });

  it("cada id de ESTADOS_EJEMPLO existe en el loteo", () => {
    const ids = listarLotes().map((l) => l.id);
    for (const id of Object.keys(ESTADOS_EJEMPLO)) expect(ids).toContain(id);
  });
});
