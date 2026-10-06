import { describe, expect, it } from "vitest";
import { calcularPermisos, puede } from "./calcular";
import type { Persona } from "./tipos";

const base: Persona = {
  plan: "explorador",
  pase: null,
  tribus: [],
  presenciaGenesis: false,
  residente: false,
};
const con = (c: Partial<Persona>): Persona => ({ ...base, ...c });

describe("servicio de permisos", () => {
  it("persona mínima: solo mapa y ticket", () => {
    const r = calcularPermisos(base);
    const abiertas = Object.entries(r)
      .filter(([, v]) => v.abierta)
      .map(([k]) => k);
    expect(abiertas).toEqual(["mapa-tribus-eventos", "registrar-ticket"]);
  });

  it("miembro sin tribu visita salas de tribu", () => {
    const r = puede(con({ plan: "miembro" }), "sala-tribu");
    expect(r.abierta).toBe(true);
    expect(r.grado).toBe("visita");
  });

  it("aceptado en valle: completa en valle, visita en otras si el plan lo permite", () => {
    const p = con({ plan: "miembro", tribus: ["valle"] });
    expect(puede(p, "sala-tribu", "valle")).toMatchObject({ abierta: true, grado: "completa" });
    expect(puede(p, "sala-tribu", "rio")).toMatchObject({ abierta: true, grado: "visita" });
  });

  it("aceptado en valle sin plan ni pase: cerrada en otras tribus", () => {
    const p = con({ tribus: ["valle"] });
    expect(puede(p, "sala-tribu", "valle").grado).toBe("completa");
    expect(puede(p, "sala-tribu", "rio").abierta).toBe(false);
  });

  it("canal de fundadores: solo con pase", () => {
    expect(puede(con({ pase: "semilla" }), "canal-fundadores")).toMatchObject({
      abierta: true,
      motivos: ["pase"],
    });
    const sinPase = [
      base,
      con({ plan: "miembro" }),
      con({ tribus: ["valle"] }),
      con({ presenciaGenesis: true }),
      con({ residente: true }),
    ];
    for (const p of sinPase) {
      expect(puede(p, "canal-fundadores").abierta).toBe(false);
    }
  });

  it("voto en la asamblea: solo residentes, por rol", () => {
    expect(puede(con({ residente: true }), "voto-asamblea-residentes")).toMatchObject({
      abierta: true,
      grado: "1 persona = 1 voto",
      motivos: ["rol"],
    });
    const todoMenosRol = con({
      plan: "miembro",
      pase: "raiz",
      tribus: ["valle"],
      presenciaGenesis: true,
    });
    expect(puede(todoMenosRol, "voto-asamblea-residentes").abierta).toBe(false);
  });

  it("presencia sin pase no da voz en el Fondo Común", () => {
    expect(puede(con({ presenciaGenesis: true }), "voz-fondo-comun").abierta).toBe(false);
  });

  it("miembro con pase brote en foros: motivos plan y pase", () => {
    const r = puede(con({ plan: "miembro", pase: "brote" }), "foros-red");
    expect(r.abierta).toBe(true);
    expect(r.motivos).toEqual(["plan", "pase"]);
  });

  it("pase raiz con presencia: 1 voz y refuerzo a decidir, sin número", () => {
    const r = puede(con({ pase: "raiz", presenciaGenesis: true }), "voz-fondo-comun");
    expect(r).toMatchObject({ abierta: true, grado: "1 voz", refuerzoPresencia: "a decidir" });
    expect(JSON.stringify(r)).not.toMatch(/[x×]\s*\d|\d\s*[x×]/);
  });

  it("pase sin presencia: sin refuerzo", () => {
    expect(puede(con({ pase: "semilla" }), "voz-fondo-comun").refuerzoPresencia).toBeUndefined();
  });

  it("es pura: no muta la persona", () => {
    const p = con({ tribus: ["valle"] });
    const copia = structuredClone(p);
    calcularPermisos(p);
    expect(p).toEqual(copia);
  });
});
