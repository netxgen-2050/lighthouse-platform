import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fuentePrincipios, principioPorId, principiosDeEjemplo } from "./principios";

describe("principios del Lighthouse (C2)", () => {
  it("son 16, con nombre y explicación en es y en", () => {
    const lista = fuentePrincipios.principios();
    expect(lista).toHaveLength(16);
    expect(new Set(lista.map((p) => p.id)).size).toBe(16);
    for (const p of lista) {
      for (const t of [p.nombre.es, p.nombre.en, p.explicacion.es, p.explicacion.en]) expect(t.trim().length).toBeGreaterThan(0);
    }
  });

  it("es una lista de ejemplo en borrador", () => {
    expect(principiosDeEjemplo.estado).toBe("borrador");
    expect(principiosDeEjemplo.origen).toBe("ejemplo");
    expect(fuentePrincipios).toBe(principiosDeEjemplo);
  });

  it("no nombra a las comunidades de referencia", () => {
    const todo = JSON.stringify(fuentePrincipios.principios());
    for (const prohibido of ["TDF", "Traditional Dream Factory", "OASA"]) expect(todo).not.toContain(prohibido);
  });

  it("principioPorId de un id que no existe → null", () => {
    expect(principioPorId("no-existe")).toBeNull();
    expect(principioPorId("agua-viva")?.nombre.es).toBe("Agua viva");
  });

  it("ningún otro archivo de la lógica ni de la página declara una lista de principios", () => {
    const dir = __dirname;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts") && !x.endsWith(".test.ts") && x !== "principios.ts")) {
      const src = readFileSync(join(dir, f), "utf8");
      expect(src, f).not.toContain("Suelo vivo");
      expect(src, f).not.toContain("Living soil");
    }
  });
});
