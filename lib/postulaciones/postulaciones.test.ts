import { describe, expect, it } from "vitest";
import {
  BORRADOR_VACIO,
  ENLACE_LLAMADA,
  REQUISITOS,
  agregar,
  aEntero,
  crearPostulacion,
  leerPostulaciones,
  validar,
} from "./postulaciones";
import type { Borrador } from "./tipos";

const completo: Borrador = {
  ...BORRADOR_VACIO,
  nombreComunidad: "  Los Álamos ",
  lider: "Ana",
  contacto: "ana@ejemplo.org",
  personas: "12",
  hogares: "4",
  foco: "Granos",
  pozo: "Harina para el núcleo común",
  formaJuridica: "cooperativa",
  decisiones: "Consenso",
  ritual: "Una minga",
  compromisoTiempo: "10 horas por semana",
};

describe("validar", () => {
  it("un borrador vacío marca todos los obligatorios", () => {
    const e = validar(BORRADOR_VACIO);
    expect(Object.keys(e).sort()).toEqual(
      ["nombreComunidad", "lider", "contacto", "personas", "hogares", "foco", "pozo", "formaJuridica", "decisiones", "ritual", "compromisoTiempo"].sort(),
    );
  });
  it("un borrador completo no tiene errores y los opcionales pueden faltar", () => {
    expect(validar(completo)).toEqual({});
  });
  it("el nombre solo con espacios cuenta como faltante", () => {
    expect(validar({ ...completo, nombreComunidad: "   " }).nombreComunidad).toBeTruthy();
  });
  it("personas y hogares: 0, negativos, decimales y texto no son cantidades", () => {
    for (const malo of ["0", "-3", "2,5", "abc", ""]) {
      expect(validar({ ...completo, personas: malo }).personas, malo).toBeTruthy();
      expect(validar({ ...completo, hogares: malo }).hogares, malo).toBeTruthy();
    }
    expect(aEntero(" 7 ")).toBe(7);
  });
  it("un texto demasiado largo da error", () => {
    expect(validar({ ...completo, tierra: "x".repeat(1001) }).tierra).toBeTruthy();
  });
  it("los mensajes salen en español por defecto, idénticos a los de siempre", () => {
    const e = validar(BORRADOR_VACIO);
    expect(e.nombreComunidad).toBe("Escribí el nombre de la comunidad");
    expect(e.personas).toBe("Escribí cuántas personas son (un número mayor que cero)");
    expect(e.formaJuridica).toBe("Elegí la forma jurídica actual o prevista");
    expect(validar({ ...completo, tierra: "x".repeat(1001) }).tierra).toBe("Puede tener hasta 1000 caracteres");
  });
  it("en inglés, los mismos campos con los mensajes en inglés", () => {
    const es = validar(BORRADOR_VACIO);
    const en = validar(BORRADOR_VACIO, "en");
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    expect(en.nombreComunidad).toBe("Write the name of the community");
    expect(en.formaJuridica).toBe("Choose the current or planned legal form");
    for (const campo of Object.keys(en) as (keyof typeof en)[]) expect(en[campo], campo).not.toBe(es[campo]);
    expect(validar({ ...completo, tierra: "x".repeat(1001) }, "en").tierra).toBe("It can be up to 1000 characters long");
  });
});

describe("crearPostulacion", () => {
  it("recorta textos, convierte cantidades y omite los opcionales vacíos", () => {
    const p = crearPostulacion(completo, { tribuId: "grano", barrio: 3 }, new Date("2026-10-08T12:00:00Z"), "a1");
    expect(p).toMatchObject({ id: "a1", tribuId: "grano", barrio: 3, nombreComunidad: "Los Álamos", personas: 12, hogares: 4 });
    expect(p.fecha).toBe("2026-10-08T12:00:00.000Z");
    expect("tierra" in p).toBe(false);
    expect("desdeCuando" in p).toBe(false);
  });
  it("se niega a armar un borrador sin validar", () => {
    expect(() => crearPostulacion(BORRADOR_VACIO, { tribuId: "grano", barrio: 3 }, new Date(), "x")).toThrow();
  });
});

describe("guardado", () => {
  const p = crearPostulacion(completo, { tribuId: "grano", barrio: 3 }, new Date(), "a1");
  it("lee lo que se guardó y descarta lo dañado", () => {
    expect(leerPostulaciones(JSON.stringify([p, { id: 1 }, null]))).toEqual([p]);
    expect(leerPostulaciones("no es json")).toEqual([]);
    expect(leerPostulaciones('{"a":1}')).toEqual([]);
    expect(leerPostulaciones(null)).toEqual([]);
  });
  it("agrega la más nueva primero y no duplica un reintento", () => {
    const q = { ...p, id: "a2" };
    expect(agregar([p], q).map((x) => x.id)).toEqual(["a2", "a1"]);
    expect(agregar([p], p)).toHaveLength(1);
  });
});

describe("textos fijos", () => {
  it("hay cuatro requisitos y el enlace de ejemplo", () => {
    expect(REQUISITOS).toHaveLength(4);
    expect(REQUISITOS.find((r) => r.texto.includes("Pacto de convivencia"))?.legal).toBe("pacto");
    expect(ENLACE_LLAMADA).toBe("https://calendly.com/netx-ejemplo/postulacion");
  });
});
