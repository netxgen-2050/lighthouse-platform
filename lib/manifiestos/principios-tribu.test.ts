import { describe, expect, it } from "vitest";
import { idsConManifiesto, buscarManifiestoBilingue } from "./datos";
import { TEXTO_ERROR_PRINCIPIO, validarPrincipiosDeTribu, type PrincipioDeTribu } from "./principios-tribu";

const bien = (id: string, extra: Partial<PrincipioDeTribu> = {}): PrincipioDeTribu => ({
  id,
  nombre: { es: "Nombre", en: "Name", original: "es" },
  practica: { es: "Práctica", en: "Practice", original: "es" },
  profundiza: ["suelo-vivo"],
  ...extra,
});

function errores(lista: PrincipioDeTribu[]) {
  const r = validarPrincipiosDeTribu(lista);
  return r.ok ? [] : r.errores;
}

describe("validarPrincipiosDeTribu", () => {
  it("acepta una lista válida, y una lista vacía", () => {
    expect(validarPrincipiosDeTribu([bien("semilla-libre")])).toEqual({ ok: true });
    expect(validarPrincipiosDeTribu([])).toEqual({ ok: true });
  });

  it("rechaza el id de un principio de Lighthouse VRN", () => {
    expect(errores([bien("suelo-vivo")])).toEqual([{ id: "suelo-vivo", error: "id-de-vrn" }]);
  });

  it("rechaza una excepción con el motivo 'contradice un principio de Lighthouse VRN'", () => {
    const e = errores([bien("sin-suelo", { excepcionA: "suelo-vivo" })]);
    expect(e).toEqual([{ id: "sin-suelo", error: "contradice" }]);
    expect(TEXTO_ERROR_PRINCIPIO.contradice).toBe("contradice un principio de Lighthouse VRN");
  });

  it("rechaza un principio profundizado que no existe", () => {
    expect(errores([bien("uno", { profundiza: ["inventado"] })])).toEqual([{ id: "uno", error: "profundiza-inexistente" }]);
  });

  it("rechaza un texto vacío", () => {
    expect(errores([bien("uno", { nombre: { es: "  ", en: "x", original: "es" } })])).toEqual([{ id: "uno", error: "texto-vacio" }]);
    expect(errores([bien("dos", { practica: { es: "x", en: "", original: "es" } })])).toEqual([{ id: "dos", error: "texto-vacio" }]);
  });

  it("rechaza un id repetido", () => {
    expect(errores([bien("uno"), bien("uno")])).toEqual([{ id: "uno", error: "id-repetido" }]);
  });
});

describe("principios propios de las tribus de ejemplo", () => {
  it("todas pasan la validación y ninguna se declara excepción", () => {
    for (const id of idsConManifiesto()) {
      const propios = buscarManifiestoBilingue(id)?.principiosPropios ?? [];
      expect(validarPrincipiosDeTribu(propios), id).toEqual({ ok: true });
      const texto = propios.flatMap((p) => [p.nombre.es, p.nombre.en, p.practica.es, p.practica.en]).join(" ").toLowerCase();
      expect(texto, id).not.toMatch(/excepto|salvo|except/);
    }
  });

  it("Semilla Viva suma dos y Agua Clara uno; Taller Común ninguno; el común no suma", () => {
    expect(buscarManifiestoBilingue("semilla")?.principiosPropios).toHaveLength(2);
    expect(buscarManifiestoBilingue("agua")?.principiosPropios).toHaveLength(1);
    expect(buscarManifiestoBilingue("taller")?.principiosPropios ?? []).toHaveLength(0);
    expect(buscarManifiestoBilingue("lighthouse")?.principiosPropios).toBeUndefined();
  });
});
