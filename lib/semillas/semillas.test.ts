import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { estadoMedidor, FACTOR_EVALUACION, faltantes, mensajeFaltante, rondaCompleta, semillasTiempo, totalConDato } from "./calculo";
import { COMPANEROS, DIMENSIONES, META_SEMBRADOR } from "./datos";
import {
  enviarRonda,
  guardarRondas,
  leerRondas,
  paseActivo,
  ponerNota,
  ponerRazon,
  RONDA_INICIAL,
  rondaDe,
  semillasDeComunidad,
} from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");

describe("datos del mock-up", () => {
  it("la meta y los compañeros salen de V.semillas", () => {
    expect(META_SEMBRADOR).toBe(120);
    expect(mock).toContain('meter("Semillas de tiempo en 3 meses",tot,120,"gold")');
    for (const c of COMPANEROS) expect(mock).toContain(`["${c.nombre}","${c.rol}"]`);
  });
  it("los criterios son Rol y Aporte al grupo, con su explicación", () => {
    expect(DIMENSIONES.map((d) => d[1])).toEqual(["Rol", "Aporte al grupo"]);
    expect(DIMENSIONES[0][2]).toBe("Cómo cumple con las responsabilidades de su trabajo.");
    expect(DIMENSIONES[1][2]).toContain("cultura del grupo");
  });
});

describe("medidor", () => {
  it("20 h/mes al 50 % son 150 semillas en 3 meses: lista", () => {
    expect(semillasTiempo(20, 50)).toBe(150);
    expect(estadoMedidor(150)).toBe("Lista");
  });
  it("10 h/mes al 50 % son 75: en camino", () => {
    expect(semillasTiempo(10, 50)).toBe(75);
    expect(estadoMedidor(75)).toBe("En camino");
  });
  it("el factor de evaluación multiplica", () => {
    expect(semillasTiempo(20, 50, 0.5)).toBe(75);
  });
});

describe("total", () => {
  it("suma solo lo que tiene dato y sin ningún dato queda sin dato, no 0", () => {
    expect(totalConDato([null, null, null])).toBeNull();
    expect(totalConDato([303, null, null])).toBe(303);
    expect(totalConDato([303, 200, null])).toBe(503);
  });
});

describe("ronda de reconocimiento", () => {
  const notas = (n: number) => ({ "0|rol": n, "0|cultura": n, "1|rol": n, "1|cultura": n });
  const razones = { "0|rol": "a", "0|cultura": "b", "1|rol": "c", "1|cultura": "d" };
  it("sin las cuatro notas o sin una explicación no está completa", () => {
    expect(rondaCompleta({ "0|rol": 3 }, razones, 2)).toBe(false);
    expect(rondaCompleta(notas(5), { ...razones, "1|cultura": "   " }, 2)).toBe(false);
    expect(faltantes(notas(5), { ...razones, "1|cultura": "" }, 2)).toEqual([{ clave: "1|cultura", falta: "razon" }]);
    expect(faltantes({}, {}, 1)).toEqual([
      { clave: "0|rol", falta: "nota" },
      { clave: "0|cultura", falta: "nota" },
    ]);
  });
  it("el aviso dice qué falta y concuerda en número", () => {
    expect(mensajeFaltante([{ clave: "0|rol", falta: "nota" }])).toBe("Error: la ronda no se envió. Falta 1 puntuación.");
    expect(mensajeFaltante([{ clave: "0|rol", falta: "razon" }])).toBe("Error: la ronda no se envió. Falta 1 explicación.");
    expect(mensajeFaltante(faltantes({}, {}, 2))).toBe("Error: la ronda no se envió. Faltan 4 puntuaciones.");
    expect(
      mensajeFaltante([
        { clave: "0|rol", falta: "nota" },
        { clave: "0|cultura", falta: "razon" },
        { clave: "1|cultura", falta: "razon" },
      ]),
    ).toBe("Error: la ronda no se envió. Faltan 1 puntuación y 2 explicaciones.");
  });
  it("el aviso también sale en inglés, con el mismo conteo", () => {
    expect(mensajeFaltante([{ clave: "0|rol", falta: "nota" }], "en")).toBe("Error: the round was not sent. Missing: 1 score.");
    expect(
      mensajeFaltante(
        [
          { clave: "0|rol", falta: "nota" },
          { clave: "0|cultura", falta: "razon" },
          { clave: "1|cultura", falta: "razon" },
        ],
        "en",
      ),
    ).toBe("Error: the round was not sent. Missing: 1 score and 2 explanations.");
  });
  it("con notas y explicaciones se puede enviar, y el factor sigue fijo en 1,0", () => {
    expect(rondaCompleta(notas(5), razones, 2)).toBe(true);
    expect(FACTOR_EVALUACION).toBe(1);
    expect(semillasTiempo(20, 50, FACTOR_EVALUACION)).toBe(150);
  });
  it("sin explicación la ronda no se envía", () => {
    const sin = { ...RONDA_INICIAL, notas: notas(4) };
    expect(enviarRonda(sin, 2)).toBe(sin);
    expect(enviarRonda({ ...sin, razones }, 2).enviada).toBe(true);
  });
  it("las notas fuera de 1 a 5 se ignoran y enviada no se edita", () => {
    expect(ponerNota(RONDA_INICIAL, 0, "rol", 6)).toBe(RONDA_INICIAL);
    const enviada = { ...RONDA_INICIAL, enviada: true };
    expect(ponerNota(enviada, 0, "rol", 3)).toBe(enviada);
    expect(ponerRazon(enviada, 0, "rol", "x")).toBe(enviada);
    expect(ponerNota(RONDA_INICIAL, 0, "rol", 4).notas).toEqual({ "0|rol": 4 });
    expect(ponerRazon(RONDA_INICIAL, 0, "rol", "porque sí").razones).toEqual({ "0|rol": "porque sí" });
  });
  it("cada comunidad tiene su ronda", () => {
    expect(rondaDe({}, "lighthouse")).toBe(RONDA_INICIAL);
    expect(rondaDe({}, "__proto__")).toBe(RONDA_INICIAL);
  });
  it("leer descarta lo raro y el formato anterior", () => {
    expect(leerRondas("no es json")).toEqual({});
    expect(leerRondas(JSON.stringify({ notas: { "0|rol": 3 }, enviada: true }))).toEqual({});
    const crudo = JSON.stringify({
      comunidades: { valle: { notas: { "0|rol": 9, x: 3, "1|cultura": 2 }, razones: { "1|cultura": "ok", y: "no", "0|rol": 5 }, enviada: true } },
    });
    expect(leerRondas(crudo)).toEqual({ valle: { notas: { "1|cultura": 2 }, razones: { "1|cultura": "ok" }, enviada: true } });
  });
  it("guardar y leer dan lo mismo", () => {
    const r = { valle: { notas: { "0|rol": 3 }, razones: { "0|rol": "bien" }, enviada: false } };
    expect(leerRondas(guardarRondas(r))).toEqual(r);
  });
});

describe("semillas por comunidad, desde lo guardado por /pactos", () => {
  const tiempo = (paso: number, horas: number) => ({
    tiempo: { rol: "facilitacion", descripcion: "Facilito las asambleas", horas, paso },
    aportes: [],
  });
  const guardado = (comunidades: object) => JSON.stringify({ pestana: "tiempo", comunidades });
  it("sin nada guardado todo es sin dato", () => {
    expect(semillasDeComunidad(null, "lighthouse")).toEqual({
      horas: null,
      tiempo: null,
      variable: null,
      variableAnterior: null,
      plata: null,
      presencia: null,
      puntual: null,
      constancias: [],
      total: null,
      pactoAceptado: false,
    });
  });
  it("el pacto cuenta solo si está aceptado", () => {
    expect(semillasDeComunidad(guardado({ lighthouse: tiempo(1, 20) }), "lighthouse").pactoAceptado).toBe(false);
    const a = semillasDeComunidad(guardado({ lighthouse: tiempo(2, 20) }), "lighthouse");
    expect(a).toMatchObject({ horas: 20, tiempo: 303, total: 303, pactoAceptado: true });
    expect(semillasDeComunidad("{", "lighthouse").tiempo).toBeNull();
  });
  it("cada comunidad suma lo suyo y los aportes en plata son Semillas de plata", () => {
    const crudo = guardado({
      lighthouse: { ...tiempo(2, 10), aportes: [200] },
      valle: { ...tiempo(0, 40), aportes: [50, 25] },
    });
    expect(semillasDeComunidad(crudo, "lighthouse")).toMatchObject({ tiempo: 150, plata: 200, total: 350 });
    expect(semillasDeComunidad(crudo, "valle")).toMatchObject({ tiempo: null, plata: 75, total: 75, pactoAceptado: false });
    expect(semillasDeComunidad(crudo, "agua").total).toBeNull();
  });
  it("las horas fuera de rango se acotan y el formato anterior ya no cuenta", () => {
    expect(semillasDeComunidad(JSON.stringify({ paso: 2, horas: 20, parteSemilla: 50 }), "lighthouse").pactoAceptado).toBe(false);
    const enorme = { tiempo: { rol: "facilitacion", descripcion: "x", horas: 1e9, paso: 2 }, aportes: [] };
    expect(semillasDeComunidad(guardado({ lighthouse: enorme }), "lighthouse").horas).toBe(80);
  });
  it("el pase", () => {
    expect(paseActivo(JSON.stringify({ pase: "brote" }))).toBe("brote");
    expect(paseActivo(JSON.stringify({ pase: null }))).toBeNull();
    expect(paseActivo("x")).toBeNull();
  });
});
