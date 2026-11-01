import { describe, expect, it } from "vitest";
import { macrolote7 } from "@/lib/territorios/biopueblo";
import { frentesBilingues, frentesDe, validarFrentes, type FrenteBilingue } from "./frentes";

const base: FrenteBilingue = {
  id: "a",
  nombre: { es: "A" },
  circuloId: "comun-agua",
  necesidad: { es: "x" },
  faltan: { es: "y" },
  paraCuando: null,
  desde: 0,
  lugar: null,
  ejemplo: true,
};
const circulos = [{ id: "comun-agua" }];
const contorno = macrolote7().anillo;
const dentro = frentesBilingues().find((f) => f.lugar)!.lugar!;

describe("frentes de ejemplo", () => {
  it("validarFrentes() no devuelve errores", () => expect(validarFrentes()).toEqual([]));

  it("son los 8 del boceto, todos de ejemplo", () => {
    expect(frentesBilingues().map((f) => f.id)).toEqual([
      "agua-cuenca",
      "acceso-camino",
      "vivero-suelo",
      "linea-de-base",
      "primer-obrador",
      "parque-agrovoltaico",
      "papeles-fideicomiso",
      "comunicacion",
    ]);
    expect(frentesBilingues().every((f) => f.ejemplo)).toBe(true);
  });

  it("Legal y Comunicación no tienen lugar; los otros seis sí", () => {
    expect(frentesBilingues().filter((f) => f.lugar === null).map((f) => f.id)).toEqual(["papeles-fideicomiso", "comunicacion"]);
  });

  it("Línea de base no tiene a quién falta (sin dato, no vacío)", () => {
    expect(frentesBilingues().find((f) => f.id === "linea-de-base")!.faltan).toBeNull();
    expect(frentesDe("comun-permacultura", "es").find((f) => f.id === "linea-de-base")!.faltan).toBeNull();
  });

  it("primer obrador y agrovoltaico son de la fase 1", () => {
    const fase1 = frentesBilingues().filter((f) => f.desde === 1).map((f) => f.id);
    expect(fase1).toEqual(["primer-obrador", "parque-agrovoltaico"]);
  });

  it("frentesDe filtra por círculo y respeta el idioma", () => {
    expect(frentesDe("comun-agua", "es").map((f) => f.nombre)).toEqual(["Agua y cuenca"]);
    expect(frentesDe("comun-agua", "en").map((f) => f.nombre)).toEqual(["Water and watershed"]);
    expect(frentesDe("comun-contratistas", "es")).toHaveLength(3);
    expect(frentesDe("comun-token", "es")).toEqual([]);
  });
});

describe("validarFrentes", () => {
  it("una lista válida no da errores", () => expect(validarFrentes([base], circulos, contorno)).toEqual([]));

  it("círculo inexistente", () => {
    const e = validarFrentes([{ ...base, circuloId: "comun-nada" }], circulos, contorno);
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("comun-nada");
  });

  it("id repetido", () => {
    const e = validarFrentes([base, { ...base }], circulos, contorno);
    expect(e).toEqual(["a: id repetido"]);
  });

  it("punto fuera del Macrolote 7", () => {
    const e = validarFrentes([{ ...base, lugar: [0, 0] }], circulos, contorno);
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("fuera del Macrolote 7");
  });

  it("texto vacío en faltan o en paraCuando", () => {
    expect(validarFrentes([{ ...base, faltan: { es: "  " } }], circulos, contorno)).toHaveLength(1);
    expect(validarFrentes([{ ...base, paraCuando: { es: "" } }], circulos, contorno)).toHaveLength(1);
    // También en inglés.
    expect(validarFrentes([{ ...base, faltan: { es: "y", en: " " } }], circulos, contorno)).toHaveLength(1);
    expect(validarFrentes([{ ...base, paraCuando: { es: "enero", en: "" } }], circulos, contorno)).toHaveLength(1);
  });

  it("puntos a menos de 300 m", () => {
    const cerca: FrenteBilingue = { ...base, id: "b", lugar: [dentro[0] + 0.0005, dentro[1]] };
    const e = validarFrentes([{ ...base, lugar: dentro }, cerca], circulos, contorno);
    expect(e).toHaveLength(1);
    expect(e[0]).toContain("a y b");
  });

  it("reporta cada error por separado", () => {
    const e = validarFrentes(
      [
        { ...base, circuloId: "x", faltan: { es: "" } },
        { ...base, lugar: [0, 0] },
      ],
      circulos,
      contorno,
    );
    expect(e.length).toBeGreaterThanOrEqual(4);
  });
});
