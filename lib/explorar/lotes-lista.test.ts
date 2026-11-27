import { describe, expect, it } from "vitest";
import type { Lote } from "@/lib/territorios/loteo";
import type { EstadoLote } from "@/lib/territorios/loteo-estados";
import { aplicarFiltro, contarPorEstado, escribirFiltro, estadoBase, leerFiltro, type LoteConEstado } from "./lotes-lista";

const lote = (numero: number, superficieM2: number | undefined, estado: EstadoLote): LoteConEstado => ({
  lote: { id: `lote-${numero}`, numero, grupo: "norte", nombre: `Lote ${numero}`, superficieM2, anillo: [] } as Lote,
  estado,
});

const lotes = [lote(3, 900, "disponible"), lote(1, 1500, "reservado"), lote(2, undefined, "disponible"), lote(4, 1200, "vendido")];

describe("leerFiltro y escribirFiltro", () => {
  it("lee estados y orden, e ignora lo desconocido", () => {
    const f = leerFiltro(new URLSearchParams("estado=reservado,raro,disponible&orden=superficie"));
    expect(f).toEqual({ estados: ["disponible", "reservado"], orden: "superficie" });
    expect(leerFiltro(new URLSearchParams("orden=xx"))).toEqual({ estados: [], orden: "numero" });
  });

  it("conserva vista, fase y sel y no escribe los valores por defecto", () => {
    const base = new URLSearchParams("vista=lotes&sel=lote-5&estado=vendido");
    const p = escribirFiltro(base, { estados: ["disponible"], orden: "superficie-desc" });
    expect(p.get("vista")).toBe("lotes");
    expect(p.get("sel")).toBe("lote-5");
    expect(p.get("estado")).toBe("disponible");
    expect(p.get("orden")).toBe("superficie-desc");
    const limpio = escribirFiltro(p, { estados: [], orden: "numero" });
    expect(limpio.has("estado")).toBe(false);
    expect(limpio.has("orden")).toBe(false);
    expect(limpio.get("sel")).toBe("lote-5");
  });
});

describe("aplicarFiltro", () => {
  it("filtra por estado", () => {
    const r = aplicarFiltro(lotes, { estados: ["reservado"], orden: "numero" });
    expect(r.map((l) => l.lote.numero)).toEqual([1]);
  });

  it("ordena por superficie y deja sin dato al final", () => {
    expect(aplicarFiltro(lotes, { estados: [], orden: "superficie" }).map((l) => l.lote.numero)).toEqual([3, 4, 1, 2]);
    expect(aplicarFiltro(lotes, { estados: [], orden: "superficie-desc" }).map((l) => l.lote.numero)).toEqual([1, 4, 3, 2]);
    // "Número" respeta el orden en que llega el loteo (primeros 4, después el norte por número).
    expect(aplicarFiltro(lotes, { estados: [], orden: "numero" }).map((l) => l.lote.numero)).toEqual([3, 1, 2, 4]);
  });
});

describe("conteos y estado base", () => {
  it("cuenta por estado", () => {
    expect(contarPorEstado(lotes)).toEqual({ disponible: 2, reservado: 1, vendido: 1 });
  });

  it("lo de la persona cuenta como reservado o vendido", () => {
    expect(estadoBase("reservado-por-vos")).toBe("reservado");
    expect(estadoBase("vendido-a-vos")).toBe("vendido");
    expect(estadoBase("en-cuotas-tuyo")).toBe("vendido");
    expect(estadoBase("disponible")).toBe("disponible");
  });
});
