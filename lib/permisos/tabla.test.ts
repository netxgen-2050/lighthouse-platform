import { describe, expect, it } from "vitest";
import { calcularPermisos, puede } from "./calcular";
import { COLUMNAS, MOTIVO_DE_COLUMNA, PUERTAS, TABLA } from "./tabla";
import type { Columna, Pase, Persona, Puerta } from "./tipos";

const base: Persona = {
  plan: "explorador",
  pase: null,
  tribus: [],
  presenciaGenesis: false,
  residente: false,
};

// Una persona que tiene solo esa fuente (el Explorador es el mínimo).
function solo(col: Columna, pase: Pase = "semilla"): Persona {
  switch (col) {
    case "explorador":
      return base;
    case "miembro":
      return { ...base, plan: "miembro" };
    case "pase":
      return { ...base, pase };
    case "tribu":
      return { ...base, tribus: ["valle"] };
    case "presencia":
      return { ...base, presenciaGenesis: true };
    case "residente":
      return { ...base, residente: true };
  }
}

const N = null;
// Escrito a mano desde la nota 18 §3, con la decisión de Gus del 7-oct-2026 sobre residentes.
// Orden de columnas:
// explorador, miembro, pase, tribu, presencia, residente.
const ESPERADO: Record<Puerta, Array<string | null>> = {
  "mapa-tribus-eventos": ["abierta", "abierta", "abierta", "abierta", "abierta", "abierta"],
  "registrar-ticket": ["abierta", "abierta", "abierta", "abierta", N, "abierta"],
  "foros-red": [N, "abierta", "abierta", "abierta", "abierta", "abierta"],
  "sala-tribu": [N, "visita", "visita", "completa", N, N],
  "canal-fundadores": [N, N, "abierta", N, N, N],
  "voz-tribu": [N, N, N, "segun estatuto", N, N],
  "voz-fondo-comun": [N, N, "1 voz", N, N, N],
  "voto-asamblea-residentes": [N, N, N, N, N, "1 persona = 1 voto"],
  "voto-fideicomiso": [N, N, "abierta", N, N, N],
  creditos: [N, N, "abierta", N, N, N],
};

describe("tabla de la nota 18 §3", () => {
  it("tiene 10 puertas y 6 columnas", () => {
    expect(PUERTAS).toHaveLength(10);
    expect(COLUMNAS).toHaveLength(6);
  });

  for (const puerta of PUERTAS) {
    COLUMNAS.forEach((col, i) => {
      it(`celda cruda ${puerta} x ${col}`, () => {
        const celda = TABLA[puerta][col];
        if (puerta === "voz-fondo-comun" && col === "presencia") {
          expect(celda).toEqual({ grado: "abierta", soloRefuerzo: true });
        } else {
          expect(celda?.grado ?? null).toBe(ESPERADO[puerta][i]);
        }
      });
      // Todos parten del plan Explorador (mínimo): su celda también cuenta.
      const propia = ESPERADO[puerta][i];
      const esperado = propia ?? ESPERADO[puerta][0];
      it(`${puerta} x ${col}`, () => {
        // La celda "su tribu" necesita la tribu consultada (la persona está en "valle").
        const r = puede(solo(col), puerta, "valle");
        expect(r.grado).toBe(esperado);
        // Columnas activas: el plan (Explorador salvo que la columna sea Miembro) y la propia.
        const activas: number[] = col === "miembro" ? [1] : [0, i];
        const motivosEsperados = new Set(
          activas.filter((j) => ESPERADO[puerta][j] !== null).map((j) => MOTIVO_DE_COLUMNA[COLUMNAS[j]]),
        );
        expect(new Set(r.motivos)).toEqual(motivosEsperados);
        expect(r.abierta).toBe(esperado !== null);
      });
    });
  }

  it("voz-fondo-comun x presencia solo refuerza: no abre y marca refuerzo a decidir", () => {
    const r = calcularPermisos(solo("presencia"))["voz-fondo-comun"];
    expect(r.abierta).toBe(false);
    const conPase = calcularPermisos({ ...base, pase: "semilla", presenciaGenesis: true })["voz-fondo-comun"];
    expect(conPase.grado).toBe("1 voz");
    expect(conPase.refuerzoPresencia).toBe("a decidir");
  });

  for (const pase of ["semilla", "brote", "raiz"] as const) {
    it(`el pase ${pase} abre lo mismo que la columna de pase`, () => {
      const r = calcularPermisos(solo("pase", pase));
      for (const puerta of PUERTAS) {
        expect(r[puerta].grado).toBe(ESPERADO[puerta][2]);
      }
    });
  }
});
