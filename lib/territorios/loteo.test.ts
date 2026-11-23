import { describe, expect, it } from "vitest";
import { FINCAS_PRIMEROS_LOTES, listarFincas, macrolote7 } from "./biopueblo";
import { anilloDentro } from "./geometria";
import { ESTADOS_EJEMPLO, estadoDeLote } from "./loteo-estados";
import { fuenteDelLoteo, listarLotes, lotesDelGrupo, loteoDe, rangoDeSuperficies, sectorNorte, zonasDelLoteo } from "./loteo";
import { parcelasPorUso, resumenDePrimeros, resumenDelLoteo } from "./loteo-textos";

describe("loteo (siempre, con cualquier archivo)", () => {
  it("los ids de los lotes son únicos y tienen formato lote-<número>", () => {
    const ids = listarLotes().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of listarLotes()) expect(l.id).toBe(`lote-${l.numero}`);
  });

  it("los primeros que se venden van primero y cada grupo sale ordenado por número", () => {
    const grupos = listarLotes().map((l) => l.grupo);
    expect(grupos).toEqual([...grupos].sort((a) => (a === "primeros" ? -1 : 1)));
    for (const grupo of ["primeros", "norte"] as const) {
      const n = lotesDelGrupo(grupo).map((l) => l.numero);
      expect(n).toEqual([...n].sort((a, b) => a - b));
    }
  });

  it("sin sector, sectorNorte() es null y no se cae; sin fuenteId la fuente es el boceto", () => {
    const sinSector = loteoDe({ features: [] });
    expect(sinSector.sectorNorte()).toBeNull();
    expect(sinSector.zonasDelLoteo()).toEqual([]);
    expect(sinSector.listarLotes()).toEqual([]);
    expect(sinSector.fuenteDelLoteo()).toBe("ilustrativa");
    expect(loteoDe({ features: [], metadata: { fuenteId: "martin" } }).fuenteDelLoteo()).toBe("martin");
  });

  it("el resumen dice sin dato cuando faltan el sector o las superficies, nunca 0", () => {
    const l = { id: "lote-1", numero: 1, grupo: "norte" as const, nombre: "Lote 1", anillo: [] };
    expect(rangoDeSuperficies([l])).toBeNull();
  });

  it("un id de estado de ejemplo sin lote se ignora (es un aviso del importador, no un error)", () => {
    expect(estadoDeLote("lote-9999")).toBe("disponible");
    expect(estadoDeLote("constructor")).toBe("disponible");
  });

  it("el rango de superficies ignora los lotes sin dato y es null si ninguno la tiene", () => {
    const base = { id: "lote-1", numero: 1, grupo: "norte" as const, nombre: "Lote 1", anillo: [] };
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

});

describe("loteo (cualquier archivo)", () => {
  it("cada id de ESTADOS_EJEMPLO existe en el loteo", () => {
    const ids = listarLotes().map((l) => l.id);
    for (const id of Object.keys(ESTADOS_EJEMPLO)) expect(ids).toContain(id);
  });
});

describe.runIf(fuenteDelLoteo() === "martin")("loteo: plano de Martín del 3-nov", () => {
  it("21 lotes de 1.680 a 2.798 m² y un sector de 32,3 ha", () => {
    const lotes = lotesDelGrupo("norte");
    expect(lotes.map((l) => l.id)).toEqual(Array.from({ length: 21 }, (_, i) => `lote-${i + 1}`));
    expect(rangoDeSuperficies(lotes)).toEqual({ min: 1680, max: 2798 });
    expect(sectorNorte()?.areaHa).toBe(32.3);
    expect(resumenDelLoteo("es")).toBe("21 lotes de 1.680 a 2.798 m² en un sector de 32,3 ha");
  });

  it("los primeros 4 son las fincas 535 a 538, ya no están en la vitrina y quedan fuera del 7A a propósito", () => {
    const primeros = lotesDelGrupo("primeros");
    expect(primeros.map((l) => l.id)).toEqual(["lote-535", "lote-536", "lote-537", "lote-538"]);
    expect(primeros.map((l) => l.id.replace("lote", "finca"))).toEqual(FINCAS_PRIMEROS_LOTES);
    for (const id of FINCAS_PRIMEROS_LOTES) expect(listarFincas().some((f) => f.id === id), id).toBe(false);
    expect(rangoDeSuperficies(primeros)).toEqual({ min: 1430, max: 2061 });
    expect(rangoDeSuperficies()).toEqual({ min: 1430, max: 2798 });
    expect(resumenDePrimeros("es")).toContain("de 1.430 a 2.061 m²");
    for (const l of primeros) expect(anilloDentro(l.anillo, macrolote7().anillo), l.id).toBe(false);
  });

  it("las demás parcelas no son lotes y cada una dice su uso, en los dos idiomas", () => {
    const parcelas = zonasDelLoteo().filter((z) => z.tipo === "parcela");
    expect(parcelas).toHaveLength(28);
    for (const idioma of ["es", "en"] as const) {
      const usos = parcelasPorUso(idioma);
      expect(usos.map((u) => u.uso)).not.toContain(idioma === "es" ? "sin dato" : "no data");
      expect(usos.flatMap((u) => u.codigos)).toEqual(expect.arrayContaining(["CH-01", "RF", "LPE-04", "CP", "LR-DM"]));
    }
  });

  it("los 21 lotes del sector norte quedan dentro del 7A", () => {
    for (const l of lotesDelGrupo("norte")) expect(anilloDentro(l.anillo, macrolote7().anillo), l.id).toBe(true);
  });
});
