import { describe, expect, it } from "vitest";
import { CIRCULOS_DEL_COMUN } from "@/lib/gobernanza/datos";
import { circuloDeIdCorto, idCortoDeEquipo, POSICIONES, posicionesDe } from "./posiciones";

// Copia que una posición de ejemplo no puede usar: nada de pago, sueldo, prioridad, token ni inversión.
const PROHIBIDAS = /\b(token\w*|inversi\w+|invest\w*|pago\w*|paga\w*|pay\w*|sueldo\w*|salari\w*|salary|wage\w*|remunera\w*|honorario\w*|prioridad|priority|empleo|job)\b/i;

describe("posiciones abiertas de ejemplo", () => {
  it("hay posiciones solo para los círculos del común", () => {
    const ids = CIRCULOS_DEL_COMUN.map((c) => c.id).sort();
    expect(Object.keys(POSICIONES).sort()).toEqual(ids);
  });

  it.each(CIRCULOS_DEL_COMUN.map((c) => c.id))("%s tiene entre 2 y 4 posiciones con textos en los dos idiomas", (id) => {
    const lista = POSICIONES[id];
    expect(lista.length).toBeGreaterThanOrEqual(2);
    expect(lista.length).toBeLessThanOrEqual(4);
    expect(new Set(lista.map((x) => x.id)).size).toBe(lista.length);
    for (const x of lista) {
      for (const t of [x.titulo, x.dedicacion, ...x.busca]) {
        expect(t.es.trim(), `${id}/${x.id} es`).not.toBe("");
        expect((t.en ?? "").trim(), `${id}/${x.id} en`).not.toBe("");
      }
      expect(x.busca.length).toBeGreaterThanOrEqual(2);
      expect(x.busca.length).toBeLessThanOrEqual(3);
    }
  });

  it("ninguna promete pago, sueldo, prioridad ni habla de tokens o inversión", () => {
    for (const idioma of ["es", "en"] as const) {
      for (const id of Object.keys(POSICIONES)) {
        for (const x of posicionesDe(id, idioma)) {
          for (const t of [x.titulo, x.dedicacion, ...x.busca]) expect(t, `${id}/${x.id} ${idioma}`).not.toMatch(PROHIBIDAS);
        }
      }
    }
  });

  it("posicionesDe devuelve [] para un id que no es de un equipo (incluye __proto__)", () => {
    expect(posicionesDe("comun-nada", "es")).toEqual([]);
    expect(posicionesDe("__proto__", "es")).toEqual([]);
  });

  it("el id corto de la URL va y vuelve", () => {
    expect(idCortoDeEquipo("comun-agua")).toBe("agua");
    expect(circuloDeIdCorto("agua")).toBe("comun-agua");
  });
});
