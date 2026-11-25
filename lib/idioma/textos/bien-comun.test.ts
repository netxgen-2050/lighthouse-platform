import { describe, expect, it } from "vitest";
import { POLITICA, PREGUNTAS_ABOGADO } from "@/lib/bien-comun/modelo";
import { TERMINOS } from "@/lib/legal/terminos";
import { biencomun } from "./bien-comun";

// Todas las rutas de claves de un diccionario, con las funciones como hojas.
function rutas(valor: unknown, base = ""): string[] {
  if (Array.isArray(valor)) return valor.flatMap((v, i) => rutas(v, `${base}[${i}]`));
  if (valor !== null && typeof valor === "object") {
    return Object.entries(valor).flatMap(([k, v]) => rutas(v, base ? `${base}.${k}` : k));
  }
  return [base];
}

describe("diccionario del bien común", () => {
  it("el español y el inglés tienen las mismas claves", () => {
    expect(rutas(biencomun.en)).toEqual(rutas(biencomun.es));
  });

  it("tiene las secciones de la propuesta", () => {
    for (const k of ["sello", "frase", "carriles", "puentes", "puertas", "queDa", "queNoTiene", "politica", "decisiones", "cambios", "abogado"]) {
      expect(biencomun.es, k).toHaveProperty(k);
    }
    expect(Object.keys(biencomun.es.abogado.items)).toHaveLength(6);
    expect(biencomun.es.cambios.titulo).toBe("Qué cambió");
  });

  it("conserva el enlace que usan otras pantallas", () => {
    expect(biencomun.es.enlace.trim()).not.toBe("");
    expect(biencomun.en.enlace.trim()).not.toBe("");
  });

  it("las fuentes de la política salen del módulo, no del diccionario, y las cantidades se reciben por parámetro", () => {
    expect(biencomun.es.politica).not.toHaveProperty("fuentes");
    expect(biencomun.en.politica).not.toHaveProperty("fuentes");
    for (const p of Object.values(POLITICA)) {
      expect(p.fuente.es.trim()).not.toBe("");
      expect(p.fuente.en.trim()).not.toBe("");
    }
    expect(biencomun.es.decisiones.intro("8")).toContain("8");
    expect(biencomun.en.decisiones.caption("8")).toContain("8");
    expect(biencomun.es.politica.intro("6")).toContain("6");
  });

  it("la fuente de cada regla de la política está traducida: en inglés no repite la del español ni tiene español suelto", () => {
    const suelto = /\b(lámina|opción|Objeción|Regla|quema por tarifas|suavizado|oferta atada|sin circulación|precio que defender|en la call)\b/i;
    for (const [id, p] of Object.entries(POLITICA)) {
      expect(p.fuente.en, id).not.toBe(p.fuente.es);
      expect(p.fuente.en, id).not.toMatch(suelto);
    }
  });

  it("cada pregunta para el abogado tiene su texto en los dos idiomas y el ⚖ va por id, no por posición", () => {
    expect(PREGUNTAS_ABOGADO.map((q) => q.id).sort()).toEqual(Object.keys(biencomun.es.abogado.items).sort());
    expect(PREGUNTAS_ABOGADO.map((q) => q.id).sort()).toEqual(Object.keys(biencomun.en.abogado.items).sort());
    const con = Object.fromEntries(PREGUNTAS_ABOGADO.map((q) => [q.id, q.termino]));
    expect(con.boleto).toBe("boletocompraventa");
    expect(con.valorNegociable).toBe("valornegociable");
    expect(PREGUNTAS_ABOGADO.filter((q) => q.termino)).toHaveLength(2);
    // El término legal tiene que existir en el catálogo.
    for (const q of PREGUNTAS_ABOGADO) if (q.termino) expect(TERMINOS).toHaveProperty(q.termino);
  });

  it("la decisión abierta se dice con palabras", () => {
    expect(biencomun.es.decisiones.abierta).toBe("abierta");
    expect(biencomun.en.decisiones.abierta).toBe("open");
  });
});
