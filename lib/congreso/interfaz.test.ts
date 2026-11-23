import { describe, expect, it } from "vitest";
import { esNeutro } from "./idioma";
import { DICCIONARIOS_EVENTO, textosEvento } from "./interfaz";

describe("textos fijos del evento", () => {
  it("el inglés tiene exactamente las mismas claves que el español", () => {
    expect(Object.keys(DICCIONARIOS_EVENTO.en).sort()).toEqual(Object.keys(DICCIONARIOS_EVENTO.es).sort());
  });

  it("ningún texto está vacío", () => {
    for (const d of Object.values(DICCIONARIOS_EVENTO)) for (const v of Object.values(d)) expect(v.trim()).not.toBe("");
  });

  it("ningún texto en inglés es igual al español, salvo neutros", () => {
    const iguales = Object.keys(DICCIONARIOS_EVENTO.es).filter((k) => {
      const clave = k as keyof typeof DICCIONARIOS_EVENTO.es;
      return DICCIONARIOS_EVENTO.en[clave] === DICCIONARIOS_EVENTO.es[clave] && !esNeutro(DICCIONARIOS_EVENTO.es[clave]);
    });
    expect(iguales).toEqual([]);
  });

  it("sin idioma devuelve el español", () => {
    expect(textosEvento().quieroIr).toBe("Quiero ir");
    expect(textosEvento("en").quieroIr).toBe("I want to go");
  });
});
