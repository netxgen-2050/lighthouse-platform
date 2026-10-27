import { describe, expect, it } from "vitest";
import { entraElNombre, etiquetaPersona, interpolar, suavizar, vistaPara } from "./zoom";

describe("etiquetaPersona", () => {
  it("25 → nada, 30 → nombre, 40 → nombre y rol (con textos cortos)", () => {
    expect(etiquetaPersona(25, "Ana", "Memoria")).toBe("nada");
    expect(etiquetaPersona(30, "Ana", "Memoria")).toBe("nombre");
    expect(etiquetaPersona(40, "Ana", "Memoria")).toBe("nombre-y-rol");
  });

  it("los bordes: 26 ya rotula el nombre y 34 también el rol", () => {
    expect(etiquetaPersona(25.9, "Ana", "Memoria")).toBe("nada");
    expect(etiquetaPersona(26, "Ana", "Memoria")).toBe("nombre");
    expect(etiquetaPersona(33.9, "Ana", "Memoria")).toBe("nombre");
    expect(etiquetaPersona(34, "Ana", "Memoria")).toBe("nombre-y-rol");
  });

  it("un radio de cero no rotula nada", () => {
    expect(etiquetaPersona(0, "Ana", "Memoria")).toBe("nada");
  });

  it("un rol largo no se dibuja si no entra en el círculo, aunque el radio pase el umbral", () => {
    expect(etiquetaPersona(34, "Ana", "Enlace del nivel de arriba")).toBe("nombre");
    expect(etiquetaPersona(120, "Ana", "Enlace del nivel de arriba")).toBe("nombre-y-rol");
  });

  it("un nombre largo no se dibuja si no entra, aunque el radio pase el umbral", () => {
    expect(etiquetaPersona(26, "Joaquín G.", "Memoria")).toBe("nada");
    expect(etiquetaPersona(40, "Joaquín G.", "Memoria")).toBe("nombre-y-rol");
  });
});

describe("zoom", () => {
  it("el suavizado arranca en 0, termina en 1 y es monótono", () => {
    expect(suavizar(0)).toBe(0);
    expect(suavizar(1)).toBe(1);
    expect(suavizar(0.5)).toBeCloseTo(0.5);
    expect(suavizar(0.25)).toBeLessThan(suavizar(0.75));
    expect(suavizar(-3)).toBe(0);
    expect(suavizar(7)).toBe(1);
  });

  it("interpolar llega a los dos extremos", () => {
    const a = [0, 0, 100] as const;
    const b = [10, 20, 40] as const;
    expect(interpolar(a, b, 0)).toEqual([0, 0, 100]);
    expect(interpolar(a, b, 1)).toEqual([10, 20, 40]);
  });

  it("la vista deja aire alrededor del círculo", () => {
    const [x, y, ancho] = vistaPara({ x: 5, y: 6, r: 50 });
    expect([x, y]).toEqual([5, 6]);
    expect(ancho).toBeGreaterThan(100);
  });

  it("un nombre entra solo si cabe", () => {
    expect(entraElNombre("Valle Solar", 60)).toBe(true);
    expect(entraElNombre("Comunicación del común", 20)).toBe(false);
  });
});
