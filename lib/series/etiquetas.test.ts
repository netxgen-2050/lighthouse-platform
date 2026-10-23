import { describe, expect, test } from "vitest";
import { ESCENARIOS } from "./escenarios";
import { numeroCorto, textoPartida, textoValor } from "./etiquetas";

describe("etiquetas de los controles", () => {
  test("números cortos", () => {
    expect(numeroCorto(5.5)).toBe("5,5");
    expect(numeroCorto(5)).toBe("5");
    expect(numeroCorto(0.25)).toBe("0,25");
    expect(numeroCorto(220000)).toBe("220.000");
  });
  test("el valor con su unidad", () => {
    const { decididos, medidos, supuestos } = ESCENARIOS.vinedo;
    expect(textoValor(decididos.regalia, 5.5)).toBe("5,5 % de los ingresos brutos");
    expect(textoValor(decididos.canonPorHa, 100)).toBe("USD 100 por ha por año");
    expect(textoValor(medidos.precioVinoUsd, 6)).toBe("USD 6 por botella (neto para la serie)");
    expect(textoValor(supuestos.multiploSalida!, 6)).toBe("6 veces");
    expect(textoValor(supuestos.reservaUsd!, 220000)).toBe("USD 220.000");
  });
  test("el valor de partida", () => {
    const { decididos, medidos } = ESCENARIOS.vinedo;
    expect(textoPartida(decididos.regalia)).toBe("5 %");
    expect(textoPartida(medidos.precioVinoUsd)).toBe("USD 6");
    expect(textoPartida(medidos.rendimientoMadurezTHa)).toBe("7 t por ha");
  });
});
