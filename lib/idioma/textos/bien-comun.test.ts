import { describe, expect, it } from "vitest";
import { POLITICA } from "@/lib/bien-comun/modelo";
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
    expect(biencomun.es.abogado.items).toHaveLength(6);
    expect(biencomun.es.cambios.titulo).toBe("Qué cambió");
  });

  it("conserva el enlace que usan otras pantallas", () => {
    expect(biencomun.es.enlace.trim()).not.toBe("");
    expect(biencomun.en.enlace.trim()).not.toBe("");
  });

  it("las fuentes de la política salen del módulo, no del diccionario, y las cantidades se reciben por parámetro", () => {
    expect(biencomun.es.politica).not.toHaveProperty("fuentes");
    expect(biencomun.en.politica).not.toHaveProperty("fuentes");
    for (const p of Object.values(POLITICA)) expect(p.fuente.trim()).not.toBe("");
    expect(biencomun.es.decisiones.intro("8")).toContain("8");
    expect(biencomun.en.decisiones.caption("8")).toContain("8");
    expect(biencomun.es.politica.intro("6")).toContain("6");
  });

  it("la decisión abierta se dice con palabras", () => {
    expect(biencomun.es.decisiones.abierta).toBe("abierta");
    expect(biencomun.en.decisiones.abierta).toBe("open");
  });
});
