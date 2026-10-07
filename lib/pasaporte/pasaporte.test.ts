import { describe, expect, it } from "vitest";
import { EMISION } from "@/lib/sumarte/datos";
import { caminos } from "./caminos";
import { leerDatos, type DatosPersona } from "./datos";

const emision = EMISION;

const argentino: DatosPersona = {
  nacionalidad: "argentina",
  residencia: "argentina",
  inversor: "no-calificado",
  modalidad: "obra",
  horas: 60,
};
const noruega: DatosPersona = {
  nacionalidad: "otra",
  paisNacionalidad: "Noruega",
  residencia: "exterior",
  paisResidencia: "Noruega",
  inversor: "no-calificado",
  modalidad: "remoto",
};

function por(d: DatosPersona) {
  return Object.fromEntries(caminos(d, emision).map((c) => [c.id, c]));
}

describe("caminos", () => {
  it("siempre son cinco", () => {
    expect(caminos({}, emision)).toHaveLength(5);
    expect(caminos(argentino, emision)).toHaveLength(5);
  });

  it("residente argentino en obra", () => {
    const c = por(argentino);
    expect(c.sumarte.estado).toBe("abierto");
    expect(c.sumarte.texto).toContain("15 lugares");
    expect(c.sumarte.texto).toContain("quedan 4");
    expect(c.chacra.estado).toBe("abierto");
    expect(c.aporte.titulo).toBe("Horas de obra");
    expect(c.aporte.estado).toBe("condiciones");
    expect(c.aporte.texto).toContain("60 h/mes");
  });

  it("residente en el exterior y remoto", () => {
    const c = por(noruega);
    expect(c.sumarte.estado).toBe("no");
    expect(c.sumarte.texto).toContain("residencia fiscal es del exterior");
    expect(c.chacra.estado).toBe("condiciones");
    expect(c.chacra.legalTexto).toEqual(["ribera"]);
    expect(c.aporte.titulo).toBe("Aporte remoto");
    expect(c.aporte.estado).toBe("condiciones");
  });

  it("sin datos: lo que depende de ellos dice completar, no un estado inventado", () => {
    const c = por({});
    expect(c.sumarte.estado).toBe("completar");
    expect(c.chacra.estado).toBe("completar");
    expect(c.aporte.estado).toBe("completar");
    expect(c.membresia.estado).toBe("abierto");
    expect(c.tribus.estado).toBe("abierto");
  });

  it("residencia argentina sin tipo de inversor pide completarlo", () => {
    const c = por({ ...argentino, inversor: undefined });
    expect(c.sumarte.estado).toBe("completar");
    expect(c.sumarte.texto).toContain("tipo de inversor");
    expect(c.sumarte.texto).not.toContain("Abierto");
    expect(por({ ...argentino, inversor: "calificado" }).sumarte.estado).toBe("abierto");
  });

  it("lleva el ⚖ de Sumarte con residencia en el exterior y el de chacra con nacionalidad extranjera", () => {
    const c = por(noruega);
    expect(c.sumarte.legalTitulo).toEqual(["sumarte"]);
    expect(c.chacra.legalTitulo).toEqual(["chacra"]);
  });

  it("obra sin horas pide completar, no inventa un cero", () => {
    const c = por({ ...argentino, horas: undefined });
    expect(c.aporte.estado).toBe("completar");
    expect(c.aporte.texto).not.toContain("0 h/mes");
  });
});

describe("leerDatos", () => {
  it("vacío o roto vuelve a vacío", () => {
    expect(leerDatos(null)).toEqual({});
    expect(leerDatos("no es json")).toEqual({});
  });
  it("descarta valores raros campo por campo", () => {
    const d = leerDatos(JSON.stringify({ nacionalidad: "marte", residencia: "exterior", horas: -3, origenFondos: "  " }));
    expect(d.nacionalidad).toBeUndefined();
    expect(d.residencia).toBe("exterior");
    expect(d.horas).toBeUndefined();
    expect(d.origenFondos).toBeUndefined();
  });
});
