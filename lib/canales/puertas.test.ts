import { describe, expect, it } from "vitest";
import { leer } from "@/lib/sumarte/estado";
import type { Persona } from "@/lib/permisos/tipos";
import { filasDePuertas, personaDesdeSumarte } from "./puertas";

const VALLE = { id: "valle", nombre: "Valle Solar" };
const base: Persona = personaDesdeSumarte(leer(null));
const con = (c: Partial<Persona>): Persona => ({ ...base, ...c });
const buscar = (filas: ReturnType<typeof filasDePuertas>, nombre: string) => {
  const f = filas.find((x) => x.nombre === nombre);
  if (!f) throw new Error(`No hay fila "${nombre}"`);
  return f;
};

describe("personaDesdeSumarte", () => {
  it("sin nada guardado: Explorador sin pase, sin tribu, sin presencia, no residente", () => {
    expect(base).toEqual({ plan: "explorador", pase: null, tribus: [], presenciaGenesis: false, residente: false });
  });

  it("toma plan y pase de Sumarte", () => {
    const estado = leer(JSON.stringify({ plan: "miembro", pase: "brote" }));
    expect(personaDesdeSumarte(estado)).toMatchObject({ plan: "miembro", pase: "brote", tribus: [] });
  });
});

describe("filasDePuertas", () => {
  it("persona mínima: diez filas y solo dos abiertas", () => {
    const filas = filasDePuertas(base);
    expect(filas).toHaveLength(10);
    expect(filas.filter((f) => f.abierta).map((f) => f.nombre)).toEqual([
      "Mapa, tribus y eventos abiertos",
      "Registrar tu ticket del Congreso",
    ]);
    expect(filas.every((f) => /^(Abierta|Cerrada)/.test(f.estado))).toBe(true);
  });

  it("Brote: canal de fundadores abierto por el pase", () => {
    const f = buscar(filasDePuertas(con({ plan: "miembro", pase: "brote" })), "Canal de fundadores");
    expect(f.estado).toBe("Abierta");
    expect(f.motivos).toEqual(["por tu pase"]);
  });

  it("voto en el Fideicomiso: solo con el Pase, igual en los tres niveles, y con su ⚖", () => {
    for (const pase of ["semilla", "brote", "raiz"] as const) {
      const f = buscar(filasDePuertas(con({ plan: "miembro", pase })), "Voto en el Fideicomiso");
      expect(f.estado).toBe("Abierta");
      expect(f.motivos).toEqual(["por tu pase"]);
      expect(f.termino).toBe("gobernanzafideicomiso");
    }
    const sin = buscar(filasDePuertas(con({ plan: "miembro" })), "Voto en el Fideicomiso");
    expect(sin.estado).toBe("Cerrada");
    expect(sin.abreCon).toBe("Pase Fundador");
  });

  it("dos motivos: foros por plan y por pase", () => {
    const f = buscar(filasDePuertas(con({ plan: "miembro", pase: "brote" })), "Foros de la red");
    expect(f.motivos).toEqual(["por tu plan", "por tu pase"]);
  });

  it("cerrada con pista: dice qué la abre", () => {
    const filas = filasDePuertas(base);
    const fundadores = buscar(filas, "Canal de fundadores");
    expect(fundadores.estado).toBe("Cerrada");
    expect(fundadores.motivos).toEqual([]);
    expect(fundadores.abreCon).toBe("Pase Fundador");
    expect(buscar(filas, "Voto en la Asamblea de residentes").abreCon).toBe("ser residente");
  });

  it("la pista sale de la tabla y no incluye lo que solo refuerza", () => {
    expect(buscar(filasDePuertas(base), "Voz en el Fondo Común").abreCon).toBe("Pase Fundador");
    expect(buscar(filasDePuertas(base), "Foros de la red").abreCon).toBe(
      "plan Miembro, Pase Fundador, ser aceptado en una tribu, presencia Genesis o ser residente",
    );
  });

  it("Miembro entra a las salas de tribu como visita", () => {
    const f = buscar(filasDePuertas(con({ plan: "miembro" })), "Salas de tribu");
    expect(f.estado).toBe("Abierta como visita");
  });

  it("tribu aceptada: sala propia abierta por la tribu y otras tribus cerradas", () => {
    const filas = filasDePuertas(con({ tribus: ["valle"] }), [VALLE]);
    const propia = buscar(filas, "Sala de Valle Solar");
    expect(propia.estado).toBe("Abierta");
    expect(propia.motivos).toEqual(["por tu tribu"]);
    expect(buscar(filas, "Salas de otras tribus").estado).toBe("Cerrada");
    expect(buscar(filas, "Voz en Valle Solar").estado).toBe("Abierta · según estatuto");
    expect(buscar(filas, "Voz en otras tribus").estado).toBe("Cerrada");
    expect(filas).toHaveLength(12);
  });

  it("las filas de otras tribus hablan de otra tribu, no de esa", () => {
    const filas = filasDePuertas(con({ tribus: ["valle"] }), [VALLE]);
    expect(buscar(filas, "Voz en otras tribus").abreCon).toBe("ser aceptado en otra tribu");
    expect(buscar(filas, "Salas de otras tribus").abreCon).toBe(
      "plan Miembro (como visita), Pase Fundador (como visita) o ser aceptado en otra tribu",
    );
    expect(JSON.stringify(filas)).not.toContain("esa tribu");
  });

  it("una tribu que no es de la persona no aparece", () => {
    expect(filasDePuertas(base, [VALLE])).toHaveLength(10);
  });

  it("pase con presencia: refuerzo a decidir, sin número", () => {
    const filas = filasDePuertas(con({ plan: "miembro", pase: "raiz", presenciaGenesis: true }));
    const voz = buscar(filas, "Voz en el Fondo Común");
    expect(voz.estado).toBe("Abierta · 1 voz");
    expect(voz.refuerzo).toBe("Refuerzo por presencia: a decidir");
    expect(JSON.stringify(filas)).not.toMatch(/×/);
  });

  it("presencia sin pase no abre la voz ni muestra refuerzo", () => {
    const voz = buscar(filasDePuertas(con({ presenciaGenesis: true })), "Voz en el Fondo Común");
    expect(voz.abierta).toBe(false);
    expect(voz.refuerzo).toBeUndefined();
  });

  it("residente: abre el voto por el rol", () => {
    const f = buscar(filasDePuertas(con({ residente: true })), "Voto en la Asamblea de residentes");
    expect(f.estado).toBe("Abierta · 1 persona = 1 voto");
    expect(f.motivos).toEqual(["por tu rol"]);
  });

  it("sin presencia ninguna fila dice por tu presencia", () => {
    const filas = filasDePuertas(con({ plan: "miembro", pase: "brote" }));
    expect(filas.some((f) => f.motivos.includes("por tu presencia"))).toBe(false);
  });
});
